export type Receipt = {
  id: string
  user_id: string
  merchant: string
  purchase_date: string // ISO date
  total_amount: number
  currency: 'EUR' | 'CHF' | 'USD'
  ocr_status: 'pending' | 'processed' | 'failed'
  created_at: string
}
