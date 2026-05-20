import { assertEquals } from 'jsr:@std/assert@1'
import {
  addDays,
  detectCitedParagraphs,
  findCancellationValidationErrors,
  findWarrantyValidationErrors,
  formatGermanDate,
  formatGermanMoney,
  monthsSince,
} from './letter-validators.ts'

// --- formatGermanDate ---

Deno.test('formatGermanDate converts ISO to DD.MM.YYYY', () => {
  assertEquals(formatGermanDate('2024-03-05'), '05.03.2024')
  assertEquals(formatGermanDate('2023-12-31'), '31.12.2023')
  assertEquals(formatGermanDate('2026-01-01'), '01.01.2026')
})

// --- formatGermanMoney ---

Deno.test('formatGermanMoney formats with German decimal separator', () => {
  assertEquals(formatGermanMoney(1234.56), '1.234,56')
  assertEquals(formatGermanMoney(9.9), '9,90')
  assertEquals(formatGermanMoney(0), '0,00')
})

// --- monthsSince ---

Deno.test('monthsSince returns 0 for purchase on same day', () => {
  const now = new Date('2024-06-15')
  assertEquals(monthsSince('2024-06-15', now), 0)
})

Deno.test('monthsSince returns 11 for purchase 11 months ago', () => {
  const now = new Date('2024-06-15')
  assertEquals(monthsSince('2023-07-15', now), 11)
})

Deno.test('monthsSince subtracts 1 month when day not yet reached', () => {
  const now = new Date('2024-06-10')
  // Purchased 2024-03-15: day 10 < 15 → 2 full months, not 3
  assertEquals(monthsSince('2024-03-15', now), 2)
})

Deno.test('monthsSince returns 13 for purchase 13 months ago', () => {
  const now = new Date('2024-06-15')
  assertEquals(monthsSince('2023-05-15', now), 13)
})

// --- addDays ---

Deno.test('addDays adds days correctly across month boundary', () => {
  assertEquals(addDays('2024-01-30', 5), '2024-02-04')
})

Deno.test('addDays with 0 returns same date', () => {
  assertEquals(addDays('2024-06-15', 0), '2024-06-15')
})

Deno.test('addDays with 30 days for notice period', () => {
  assertEquals(addDays('2024-06-01', 30), '2024-07-01')
})

// --- detectCitedParagraphs ---

Deno.test('detectCitedParagraphs finds §437 and §477 in letter', () => {
  const letter = 'Gemäß §437 BGB verlange ich Nacherfüllung. Die §477 BGB Beweislastumkehr gilt.'
  const cited = detectCitedParagraphs(letter)
  assertEquals(cited.includes('437'), true)
  assertEquals(cited.includes('477'), true)
  assertEquals(cited.includes('438'), false)
})

Deno.test('detectCitedParagraphs handles space after §', () => {
  const letter = 'gem. § 437 Nr. 1 BGB'
  assertEquals(detectCitedParagraphs(letter).includes('437'), true)
})

Deno.test('detectCitedParagraphs returns empty for no BGB refs', () => {
  assertEquals(detectCitedParagraphs('Dies ist ein Brief ohne Paragraphen.'), [])
})

// --- findWarrantyValidationErrors ---

const VALID_WARRANTY_LETTER = `
Max Mustermann
Musterstraße 1
12345 Berlin

MediaMarkt GmbH
Händlerstraße 1
10115 Berlin

15.06.2024

Betreff: Reklamation – Sony WH-1000XM5

Sehr geehrte Damen und Herren,

hiermit reklamiere ich gemäß §437 BGB das am 15.01.2024 erworbene Produkt.
Da das Produkt weniger als 12 Monate alt ist, gilt die Beweislastumkehr nach §477 BGB.
Ich fordere Nacherfüllung (Reparatur oder Ersatzlieferung) gemäß §439 BGB.

Bitte beheben Sie den Mangel innerhalb von 14 Tagen ab Zugang dieses Schreibens.

{{SIGNATURE_PLACEHOLDER}}

Hinweis: Dieses Schreiben wurde automatisiert auf Basis Ihrer Angaben erstellt und stellt keinen Rechtsrat dar. Bitte prüfen Sie das Schreiben vor dem Versand.
`

Deno.test(
  'findWarrantyValidationErrors returns no errors for valid letter (within Beweislastumkehr)',
  () => {
    const errors = findWarrantyValidationErrors(VALID_WARRANTY_LETTER, true)
    assertEquals(errors, [])
  }
)

Deno.test('findWarrantyValidationErrors reports missing §437', () => {
  const letter = VALID_WARRANTY_LETTER.replace('§437', 'dem Gewährleistungsrecht')
  const errors = findWarrantyValidationErrors(letter, false)
  assertEquals(errors.includes('missing §437'), true)
})

Deno.test('findWarrantyValidationErrors reports missing BGB reference', () => {
  const letter = VALID_WARRANTY_LETTER.replace(/BGB/g, '')
  const errors = findWarrantyValidationErrors(letter, false)
  assertEquals(errors.includes('missing BGB reference'), true)
})

Deno.test('findWarrantyValidationErrors reports missing 14-day deadline', () => {
  const letter = VALID_WARRANTY_LETTER.replace('14 Tagen', 'einer angemessenen Frist')
  const errors = findWarrantyValidationErrors(letter, false)
  assertEquals(errors.includes('missing 14-day deadline'), true)
})

Deno.test('findWarrantyValidationErrors reports missing signature placeholder', () => {
  const letter = VALID_WARRANTY_LETTER.replace('{{SIGNATURE_PLACEHOLDER}}', '')
  const errors = findWarrantyValidationErrors(letter, false)
  assertEquals(errors.includes('missing signature placeholder'), true)
})

Deno.test(
  'findWarrantyValidationErrors reports missing Beweislastumkehr when within 12 months',
  () => {
    const letter = VALID_WARRANTY_LETTER.replace(
      'Beweislastumkehr nach §477 BGB',
      'gesetzlichen Regelungen'
    )
    const errors = findWarrantyValidationErrors(letter, true)
    assertEquals(errors.includes('missing Beweislastumkehr / §477'), true)
  }
)

Deno.test('findWarrantyValidationErrors does NOT require Beweislastumkehr after 12 months', () => {
  const letter = VALID_WARRANTY_LETTER.replace(
    'Beweislastumkehr nach §477 BGB',
    'gesetzlichen Regelungen'
  )
  const errors = findWarrantyValidationErrors(letter, false)
  assertEquals(errors.includes('missing Beweislastumkehr / §477'), false)
})

Deno.test('findWarrantyValidationErrors detects forbidden phrase', () => {
  const letter = VALID_WARRANTY_LETTER + '\nWir verklagen Sie wenn nötig.'
  const errors = findWarrantyValidationErrors(letter, false)
  assertEquals(
    errors.some((e) => e.startsWith('forbidden phrase')),
    true
  )
})

// --- findCancellationValidationErrors ---

const VALID_CANCELLATION_LETTER = `
Max Mustermann
Musterstraße 1
12345 Berlin

Netflix GmbH
Betreiberstraße 1
10115 Berlin

15.06.2024

Betreff: Kündigung meines Abonnements gemäß §312k BGB

Sehr geehrte Damen und Herren,

ich kündige hiermit außerordentlich fristlos, da kein Kündigungsbutton gemäß §312k BGB vorhanden ist.
Bitte bestätigen Sie die Kündigung schriftlich und stellen Sie alle Abbuchungen sofort ein.

{{SIGNATURE_PLACEHOLDER}}

Hinweis: Dieses Schreiben wurde automatisiert auf Basis Ihrer Angaben erstellt und stellt keinen Rechtsrat dar. Bitte prüfen Sie das Schreiben vor dem Versand.
`

Deno.test('findCancellationValidationErrors returns no errors for valid letter', () => {
  assertEquals(findCancellationValidationErrors(VALID_CANCELLATION_LETTER), [])
})

Deno.test('findCancellationValidationErrors reports missing signature placeholder', () => {
  const letter = VALID_CANCELLATION_LETTER.replace('{{SIGNATURE_PLACEHOLDER}}', '')
  const errors = findCancellationValidationErrors(letter)
  assertEquals(errors.includes('missing signature placeholder'), true)
})

Deno.test('findCancellationValidationErrors reports missing §312k / BGB reference', () => {
  const letter = VALID_CANCELLATION_LETTER.replace(/§312k BGB/g, 'den gesetzlichen Vorschriften')
  const errors = findCancellationValidationErrors(letter)
  assertEquals(errors.includes('missing §312k / BGB reference'), true)
})

Deno.test('findCancellationValidationErrors detects forbidden phrase', () => {
  const letter = VALID_CANCELLATION_LETTER + '\nWir verklagen Sie wenn nötig.'
  const errors = findCancellationValidationErrors(letter)
  assertEquals(
    errors.some((e) => e.startsWith('forbidden phrase')),
    true
  )
})
