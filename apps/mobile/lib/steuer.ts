import * as FileSystem from 'expo-file-system/legacy'
import * as Sharing from 'expo-sharing'
import { supabase } from '@/lib/supabase'

export async function toggleBeruflich(productId: string, value: boolean): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ is_beruflich: value })
    .eq('id', productId)
  if (error) throw error
}

export async function exportWerbungskostenCSV(year: number): Promise<void> {
  const { data, error } = await supabase
    .from('products')
    .select('name, price, quantity, receipts!inner(merchant, purchase_date)')
    .eq('is_beruflich', true)
    .gte('receipts.purchase_date', `${year}-01-01`)
    .lte('receipts.purchase_date', `${year}-12-31`)

  if (error) throw error

  type Row = {
    name: string
    price: number
    quantity: number
    receipts: { merchant: string | null; purchase_date: string | null }
  }

  const rows = (data as unknown as Row[]).map((p) => ({
    name: p.name,
    merchant: p.receipts?.merchant ?? '',
    date: p.receipts?.purchase_date ?? '',
    amount: p.price * p.quantity,
  }))

  const total = rows.reduce((sum, r) => sum + r.amount, 0)

  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`

  const csv = [
    'Produkt,Händler,Kaufdatum,Betrag (EUR)',
    ...rows.map(
      (r) => `${escape(r.name)},${escape(r.merchant)},${escape(r.date)},${r.amount.toFixed(2)}`
    ),
    `,,Gesamt,${total.toFixed(2)}`,
  ].join('\n')

  const path = `${FileSystem.cacheDirectory}werbungskosten_${year}.csv`
  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  })
  await Sharing.shareAsync(path, {
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
    dialogTitle: `Werbungskosten ${year}`,
  })
}
