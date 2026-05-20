import i18n from '@/lib/i18n'

function intlLocale(): string {
  return i18n.language?.startsWith('en') ? 'en-US' : 'de-DE'
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(intlLocale(), {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(iso))
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(intlLocale(), {
    style: 'currency',
    currency,
  }).format(amount)
}
