export const TRACKED_PARAGRAPHS = ['437', '438', '439', '475e', '477']
export const FORBIDDEN_PHRASES = ['Wir verklagen', 'ich vertrete den Kunden']

export function detectCitedParagraphs(letter: string): string[] {
  return TRACKED_PARAGRAPHS.filter((p) => letter.includes(`§${p}`) || letter.includes(`§ ${p}`))
}

export function findWarrantyValidationErrors(
  letter: string,
  isWithinBeweislastumkehr: boolean
): string[] {
  const errors: string[] = []
  if (!letter.includes('§437') && !letter.includes('§ 437')) {
    errors.push('missing §437')
  }
  if (!letter.includes('BGB')) {
    errors.push('missing BGB reference')
  }
  if (!/14\s*(Tag|Tage|Tagen)/.test(letter)) {
    errors.push('missing 14-day deadline')
  }
  if (!letter.includes('{{SIGNATURE_PLACEHOLDER}}')) {
    errors.push('missing signature placeholder')
  }
  if (
    isWithinBeweislastumkehr &&
    !letter.includes('Beweislastumkehr') &&
    !letter.includes('§477') &&
    !letter.includes('§ 477')
  ) {
    errors.push('missing Beweislastumkehr / §477')
  }
  for (const phrase of FORBIDDEN_PHRASES) {
    if (letter.includes(phrase)) errors.push(`forbidden phrase: ${phrase}`)
  }
  return errors
}

export function findCancellationValidationErrors(letter: string): string[] {
  const errors: string[] = []
  if (!letter.includes('{{SIGNATURE_PLACEHOLDER}}')) {
    errors.push('missing signature placeholder')
  }
  if (!letter.includes('BGB') && !letter.includes('§312k') && !letter.includes('§ 312k')) {
    errors.push('missing §312k / BGB reference')
  }
  for (const phrase of FORBIDDEN_PHRASES) {
    if (letter.includes(phrase)) errors.push(`forbidden phrase: ${phrase}`)
  }
  return errors
}

export function formatGermanDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function formatGermanMoney(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function monthsSince(iso: string, now: Date): number {
  const date = new Date(iso)
  let months = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
  if (now.getDate() < date.getDate()) months -= 1
  return months
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
