'use client'

import { useState } from 'react'

const FEATURES = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
        />
      </svg>
    ),
    title: 'Kassenbons scannen',
    body: 'Kamera drauf, fertig. Die KI erkennt Händler, Datum, Produkte und Preise — sekundenschnell.',
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    ),
    title: 'Gewährleistung im Blick',
    body: 'Wir erinnern dich 30 Tage vor Ablauf der Beweislastumkehr (§477 BGB) und der 2-Jahres-Gewährleistung.',
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.66-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z"
        />
      </svg>
    ),
    title: 'Reklamationsschreiben per KI',
    body: 'Bei Mängeln erstellt Receipto ein rechtssicheres Schreiben mit §437 BGB-Bezug — in Sekunden, nicht Stunden.',
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
        />
      </svg>
    ),
    title: 'Zombie-Abos kündigen',
    body: 'Receipto erkennt vergessene Abonnements automatisch und erstellt den Kündigungsbrief nach §312k BGB.',
  },
]

const LEGAL_PILLS = [
  { label: '§437 BGB', sublabel: 'Mängelansprüche' },
  { label: '§477 BGB', sublabel: 'Beweislastumkehr' },
  { label: '§438 BGB', sublabel: '2-Jahres-Gewährleistung' },
  { label: '§312k BGB', sublabel: 'Kündigungsbutton' },
]

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMessage(null)
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Etwas ist schiefgelaufen.')
      }
      setStatus('success')
    } catch (error) {
      setStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unbekannter Fehler')
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-white">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-bold text-xl tracking-tight text-[#192B1B]">receipto</span>
        <a
          href="#waitlist"
          className="text-sm font-semibold text-[#192B1B] border border-[#192B1B] px-4 py-2 rounded-lg hover:bg-[#192B1B] hover:text-white transition-colors"
        >
          Früh dabei sein
        </a>
      </nav>

      {/* Hero */}
      <section className="bg-[#192B1B] text-white px-6 py-24 md:py-36 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
          Für deutsche Verbraucher
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-tight mb-6">
          Deine Rechte.
          <br />
          Dein Geld zurück.
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto mb-12">
          Receipto überwacht deine Garantiefristen, erkennt zombie Abos und erstellt rechtssichere
          Schreiben — automatisch, mit echten BGB-Paragraphen.
        </p>

        {/* Legal pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {LEGAL_PILLS.map((pill) => (
            <span
              key={pill.label}
              className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs font-medium text-white/80"
            >
              {pill.label} · {pill.sublabel}
            </span>
          ))}
        </div>

        {/* Waitlist form */}
        <div id="waitlist" className="max-w-md mx-auto">
          {status === 'success' ? (
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center">
              <p className="text-white font-semibold text-lg mb-1">Du stehst auf der Liste 🎉</p>
              <p className="text-white/70 text-sm">
                Wir schreiben dir, sobald Receipto im App Store ist.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.de"
                className="bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-white/60 transition-colors"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="bg-white text-[#192B1B] font-semibold rounded-xl px-4 py-3.5 disabled:opacity-50 hover:bg-white/90 transition-colors"
              >
                {status === 'loading' ? 'Wird gesendet…' : 'Auf die Warteliste →'}
              </button>
              {status === 'error' && errorMessage && (
                <p className="text-red-400 text-sm text-center">{errorMessage}</p>
              )}
              <p className="text-white/40 text-xs text-center">
                Kein Spam. Keine Weitergabe. Abmeldung jederzeit möglich.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 bg-[#F7F7F5]">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#192B1B]/40 text-center mb-3">
            Was Receipto für dich tut
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#192B1B] mb-14">
            Alles, was du brauchst
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 flex gap-4 items-start border border-black/5"
              >
                <div className="w-12 h-12 rounded-xl bg-[#192B1B]/8 flex items-center justify-center text-[#192B1B] shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-[#192B1B] mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#192B1B]/40 mb-3">
            So einfach geht's
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#192B1B] mb-14">Drei Schritte</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              {
                step: '01',
                title: 'Kassenbon scannen',
                body: 'Foto machen, KI extrahiert alle Daten. Fertig in 5 Sekunden.',
              },
              {
                step: '02',
                title: 'Fristen werden überwacht',
                body: 'Receipto erinnert dich rechtzeitig — damit du keine Frist verpasst.',
              },
              {
                step: '03',
                title: 'Brief auf Knopfdruck',
                body: 'Mangel beschreiben, KI schreibt das Schreiben. Du unterschreibst, sendest ab.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="text-4xl font-bold text-[#192B1B]/15">{item.step}</span>
                <h3 className="font-semibold text-[#192B1B]">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="px-6 py-20 bg-[#192B1B] text-white text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Bereit, dein Geld zurückzuholen?</h2>
        <p className="text-white/60 mb-8 text-lg">
          Trag dich in die Warteliste ein — du bekommst als Erstes Zugang.
        </p>
        <a
          href="#waitlist"
          className="inline-block bg-white text-[#192B1B] font-semibold rounded-xl px-8 py-3.5 hover:bg-white/90 transition-colors"
        >
          Jetzt auf die Warteliste →
        </a>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-[#111D12] text-white/40 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-white/60">receipto</span>
          <span>© {new Date().getFullYear()} Receipto · Made in Germany 🇩🇪</span>
          <div className="flex gap-4">
            <a href="/datenschutz" className="hover:text-white/70 transition-colors">
              Datenschutz
            </a>
            <a href="/impressum" className="hover:text-white/70 transition-colors">
              Impressum
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
