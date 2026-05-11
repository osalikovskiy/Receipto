import type { Database } from '@receipto/database'
import { supabase } from '@/lib/supabase'

export type SubscriptionRow = Database['public']['Tables']['subscriptions_tracked']['Row']
export type BillingCycle = 'monthly' | 'yearly'

const ZOMBIE_THRESHOLD_DAYS = 60
const MS_PER_DAY = 1000 * 60 * 60 * 24

export function isZombie(sub: SubscriptionRow): boolean {
  const referenceDate = sub.last_used ? new Date(sub.last_used) : new Date(sub.created_at)
  const daysSince = Math.floor((Date.now() - referenceDate.getTime()) / MS_PER_DAY)
  return daysSince >= ZOMBIE_THRESHOLD_DAYS
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

type CreateInput = {
  userId: string
  serviceName: string
  amount: number
  billingCycle: BillingCycle
  lastCharge: string
  hasCancellationButton: boolean
  cancellationNoticeDays: number
}

export async function createSubscription(input: CreateInput): Promise<string> {
  const { data, error } = await supabase
    .from('subscriptions_tracked')
    .insert({
      user_id: input.userId,
      service_name: input.serviceName,
      amount: input.amount,
      billing_cycle: input.billingCycle,
      last_charge: input.lastCharge,
      detected_via: 'manual',
      has_cancellation_button: input.hasCancellationButton,
      cancellation_notice_days: input.cancellationNoticeDays,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function markSubscriptionUsedToday(id: string): Promise<void> {
  const { error } = await supabase
    .from('subscriptions_tracked')
    .update({ last_used: new Date().toISOString().slice(0, 10) })
    .eq('id', id)
  if (error) throw error
}

export async function deleteSubscription(id: string): Promise<void> {
  const { error } = await supabase.from('subscriptions_tracked').delete().eq('id', id)
  if (error) throw error
}

// ─── Cancellation claim ──────────────────────────────────────────────────────

type CancellationDraftInput = {
  subscriptionId: string
  userId: string
  customerNumber?: string
}

export async function createCancellationDraft({
  subscriptionId,
  userId,
  customerNumber,
}: CancellationDraftInput): Promise<string> {
  const { data, error } = await supabase
    .from('claims')
    .insert({
      user_id: userId,
      subscription_id: subscriptionId,
      claim_type: 'kuendigung',
      status: 'draft',
      // defect_description repurposed to hold the optional customer/contract number
      defect_description: customerNumber ?? null,
    })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function generateCancellationLetter(claimId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('generate-cancellation-letter', {
    body: { claim_id: claimId },
  })
  if (error) throw error
}
