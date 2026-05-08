import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2'
import OpenAI from 'npm:openai@4'
import { withRetry } from '../_shared/retry.ts'

const SYSTEM_PROMPT = `You are a precise receipt parser. You extract structured data from German and Austrian retail receipts (Kassenbons, Quittungen).

Always return JSON matching the provided schema.

Rules:
- If you cannot parse, set confidence to "low" and items to empty array.
- Merchant name as displayed on receipt (e.g., "MediaMarkt").
- Merchant legal name from imprint if visible (e.g., "MediaMarkt Saturn Deutschland GmbH"); null if not visible.
- Use German decimal separator interpretation (1.234,56 = 1234.56).
- Date in receipts may be DD.MM.YYYY — convert to ISO YYYY-MM-DD.
- Categorize generously; default to "other".
- Do NOT invent data. If a field is illegible, use empty string for strings or 0 for numbers.`

const RECEIPT_SCHEMA = {
  type: 'object',
  properties: {
    merchant: { type: 'string' },
    merchant_legal_name: { type: ['string', 'null'] },
    purchase_date: { type: 'string' },
    total_amount: { type: 'number' },
    currency: { type: 'string', enum: ['EUR', 'CHF', 'USD'] },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: {
            type: 'string',
            enum: ['electronics', 'clothing', 'furniture', 'food', 'household', 'other'],
          },
          price: { type: 'number' },
          quantity: { type: 'number' },
        },
        required: ['name', 'category', 'price', 'quantity'],
        additionalProperties: false,
      },
    },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: [
    'merchant',
    'merchant_legal_name',
    'purchase_date',
    'total_amount',
    'currency',
    'items',
    'confidence',
  ],
  additionalProperties: false,
} as const

type Item = {
  name: string
  category: 'electronics' | 'clothing' | 'furniture' | 'food' | 'household' | 'other'
  price: number
  quantity: number
}

type OcrResult = {
  merchant: string
  merchant_legal_name: string | null
  purchase_date: string
  total_amount: number
  currency: 'EUR' | 'CHF' | 'USD'
  items: Item[]
  confidence: 'high' | 'medium' | 'low'
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function markFailed(client: SupabaseClient, receiptId: string): Promise<void> {
  await client.from('receipts').update({ ocr_status: 'failed' }).eq('id', receiptId)
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401)

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401)

  const body = await req.json().catch(() => null)
  const receiptId: unknown = body?.receipt_id
  if (typeof receiptId !== 'string') {
    return jsonResponse({ error: 'Missing receipt_id' }, 400)
  }

  const { data: receipt, error: fetchError } = await supabase
    .from('receipts')
    .select('id, image_path')
    .eq('id', receiptId)
    .single()

  if (fetchError || !receipt) {
    return jsonResponse({ error: 'Receipt not found' }, 404)
  }

  // Signed URL — 60s is enough for OpenAI to fetch the image once
  const { data: signed, error: signError } = await supabase.storage
    .from('receipts')
    .createSignedUrl(receipt.image_path, 60)

  if (signError || !signed) {
    await markFailed(supabase, receiptId)
    return jsonResponse({ error: 'Image not accessible' }, 500)
  }

  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! })

  let parsed: OcrResult
  try {
    const completion = await withRetry(() =>
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Parse this receipt image and return the JSON.' },
              { type: 'image_url', image_url: { url: signed.signedUrl, detail: 'high' } },
            ],
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'receipt_data',
            strict: true,
            schema: RECEIPT_SCHEMA,
          },
        },
        max_tokens: 1500,
      })
    )

    const content = completion.choices[0]?.message?.content
    if (!content) {
      await markFailed(supabase, receiptId)
      return jsonResponse({ error: 'OCR returned no content' }, 500)
    }
    parsed = JSON.parse(content) as OcrResult
  } catch (error) {
    console.error('OpenAI call failed:', error)
    await markFailed(supabase, receiptId)
    return jsonResponse({ error: 'OCR failed' }, 500)
  }

  const today = toIsoDate(new Date())
  if (parsed.total_amount < 0 || parsed.total_amount > 100000) {
    await markFailed(supabase, receiptId)
    return jsonResponse({ error: 'Invalid total_amount' }, 422)
  }
  if (parsed.purchase_date > today || parsed.purchase_date < '1990-01-01') {
    await markFailed(supabase, receiptId)
    return jsonResponse({ error: 'Invalid purchase_date' }, 422)
  }

  const { error: updateError } = await supabase
    .from('receipts')
    .update({
      merchant: parsed.merchant || 'Unbekannt',
      purchase_date: parsed.purchase_date,
      total_amount: parsed.total_amount,
      currency: parsed.currency,
      ocr_status: 'processed',
      ocr_raw: parsed as unknown as Record<string, unknown>,
    })
    .eq('id', receiptId)

  if (updateError) {
    console.error('Update receipt failed:', updateError)
    return jsonResponse({ error: 'Update failed' }, 500)
  }

  if (parsed.items.length > 0) {
    const purchaseDate = new Date(parsed.purchase_date)
    const warrantyEnd = toIsoDate(addMonths(purchaseDate, 24))
    const beweislastumkehrEnd = toIsoDate(addMonths(purchaseDate, 12))

    const productsToInsert = parsed.items.map((item) => ({
      receipt_id: receipt.id,
      user_id: user.id,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: item.quantity,
      warranty_start_date: parsed.purchase_date,
      warranty_end_date: warrantyEnd,
      beweislastumkehr_end: beweislastumkehrEnd,
    }))

    const { error: productsError } = await supabase.from('products').insert(productsToInsert)
    if (productsError) {
      // Receipt itself is processed; product insert failure is non-fatal
      console.error('Insert products failed:', productsError)
    }
  }

  return jsonResponse({ success: true, parsed })
})
