import { createClient } from 'jsr:@supabase/supabase-js@2'

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return jsonResponse({ error: 'Unauthorized' }, 401)

  // Identify the calling user via their JWT
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  )
  const {
    data: { user },
  } = await userClient.auth.getUser()
  if (!user) return jsonResponse({ error: 'Unauthorized' }, 401)

  // Need service role to delete the auth row + storage objects
  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Delete all storage objects in the user's folder
  const { data: files } = await admin.storage.from('receipts').list(user.id)
  if (files && files.length > 0) {
    const paths = files.map((f) => `${user.id}/${f.name}`)
    await admin.storage.from('receipts').remove(paths)
  }

  // Deleting auth.users cascades into public.users (and onwards via FKs)
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id)
  if (deleteError) return jsonResponse({ error: deleteError.message }, 500)

  return jsonResponse({ success: true })
})
