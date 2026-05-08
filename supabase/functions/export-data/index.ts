import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // RLS limits these queries to the caller's own rows
  const [profile, receipts, products, claims, subscriptions, savings, notifications] =
    await Promise.all([
      supabase.from('users').select('*').eq('id', user.id).single(),
      supabase.from('receipts').select('*').order('purchase_date', { ascending: false }),
      supabase.from('products').select('*'),
      supabase.from('claims').select('*'),
      supabase.from('subscriptions_tracked').select('*'),
      supabase.from('savings_log').select('*'),
      supabase.from('notifications').select('*'),
    ])

  const exportPayload = {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    receipts: receipts.data ?? [],
    products: products.data ?? [],
    claims: claims.data ?? [],
    subscriptions: subscriptions.data ?? [],
    savings_log: savings.data ?? [],
    notifications: notifications.data ?? [],
  }

  return new Response(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="receipto-export-${user.id}.json"`,
    },
  })
})
