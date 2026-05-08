import { createClient } from 'jsr:@supabase/supabase-js@2'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'
const BATCH_SIZE = 100

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

type NotificationContent = {
  title: string
  body: string
  deep_link?: string
}

type ExpoMessage = {
  to: string
  title: string
  body: string
  data: Record<string, unknown>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const nowIso = new Date().toISOString()

  const { data: notifications, error: fetchError } = await supabase
    .from('notifications')
    .select('id, user_id, type, related_id, content')
    .is('sent_at', null)
    .lte('scheduled_for', nowIso)
    .limit(500)
  if (fetchError) return jsonResponse({ error: fetchError.message }, 500)

  if (!notifications || notifications.length === 0) {
    return jsonResponse({ success: true, sent: 0, skippedNoToken: 0 })
  }

  const userIds = Array.from(new Set(notifications.map((n) => n.user_id)))
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, push_token')
    .in('id', userIds)
    .not('push_token', 'is', null)
  if (usersError) return jsonResponse({ error: usersError.message }, 500)

  const tokenByUser = new Map<string, string>(
    (users ?? []).map((u) => [u.id, u.push_token as string])
  )

  const messages: ExpoMessage[] = []
  const messageNotificationIds: string[] = []
  const skippedNoToken: string[] = []

  for (const n of notifications) {
    const token = tokenByUser.get(n.user_id)
    if (!token) {
      skippedNoToken.push(n.id)
      continue
    }
    const content = n.content as NotificationContent | null
    if (!content?.title || !content?.body) {
      // Malformed content — drop it from queue so we don't retry forever
      skippedNoToken.push(n.id)
      continue
    }
    messages.push({
      to: token,
      title: content.title,
      body: content.body,
      data: {
        notification_id: n.id,
        type: n.type,
        related_id: n.related_id,
        deep_link: content.deep_link,
      },
    })
    messageNotificationIds.push(n.id)
  }

  let sentCount = 0
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE)
    const ids = messageNotificationIds.slice(i, i + BATCH_SIZE)

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(batch),
      })

      if (!response.ok) {
        console.error('Expo Push error', response.status, await response.text())
        // Don't mark as sent — will retry on next run
        continue
      }

      const sentNow = new Date().toISOString()
      const { error: updateError } = await supabase
        .from('notifications')
        .update({ sent_at: sentNow })
        .in('id', ids)
      if (updateError) {
        console.error('Failed to mark sent', updateError)
        continue
      }
      sentCount += ids.length
    } catch (e) {
      console.error('Send batch failed', e)
    }
  }

  if (skippedNoToken.length > 0) {
    // Clear them from the queue so they don't retry forever
    await supabase
      .from('notifications')
      .update({ sent_at: new Date().toISOString() })
      .in('id', skippedNoToken)
  }

  return jsonResponse({
    success: true,
    sent: sentCount,
    skippedNoToken: skippedNoToken.length,
  })
})
