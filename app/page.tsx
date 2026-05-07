'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight, Star, Shield, Zap, MapPin, Mic, MicOff } from 'lucide-react'

const POPULAR_SEARCHES = [
  'Best Italian restaurant in London',
  'Plumber in Manchester',
  'Hotel in Dubai',
  'Dentist near Sydney',
  'Gym in New York',
  'Hair salon in Singapore',
  'Electrician in Birmingham',
  'Coffee shop in Paris',
]

const CATEGORIES = [
  // Food & Drink
  { id: 'restaurant',   label: 'Restaurants',    icon: '🍽️' },
  { id: 'cafe',         label: 'Cafes',          icon: '☕' },
  { id: 'pub',          label: 'Pubs & Bars',    icon: '🍺' },
  // Stays
  { id: 'hotel',        label: 'Hotels',         icon: '🏨' },
  // Home Trades
  { id: 'plumber',      label: 'Plumbers',       icon: '🔧' },
  { id: 'electrician',  label: 'Electricians',   icon: '⚡' },
  { id: 'builder',      label: 'Builders',       icon: '🏗️' },
  { id: 'cleaner',      label: 'Cleaners',       icon: '🧹' },
  // Health
  { id: 'dentist',      label: 'Dentists',       icon: '🦷' },
  { id: 'doctor',       label: 'Doctors',        icon: '🩺' },
  { id: 'gym',          label: 'Gyms',           icon: '🏋️' },
  { id: 'pharmacy',     label: 'Pharmacies',     icon: '💊' },
  // Beauty
  { id: 'salon',        label: 'Hair Salons',    icon: '💇' },
  { id: 'spa',          label: 'Spas',           icon: '💆' },
  // Professional
  { id: 'lawyer',       label: 'Lawyers',        icon: '⚖️' },
  { id: 'estate-agent', label: 'Estate Agents',  icon: '🏠' },
  // Auto
  { id: 'mechanic',     label: 'Mechanics',      icon: '🚗' },
  // Other
  { id: 'vet',          label: 'Vets',           icon: '🐾' },
  { id: 'school',       label: 'Schools',        icon: '🏫' },
  { id: 'supermarket',  label: 'Supermarkets',   icon: '🛒' },
]

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const [locating, setLocating] = useState(false)
  const recognitionRef = useRef<any>(null)
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null)

  function handleSearch(q?: string) {
    const term = (q ?? query).trim()
    if (!term) return
    const gps = gpsRef.current
    const url = gps
      ? `/search?q=${encodeURIComponent(term)}&lat=${gps.lat}&lng=${gps.lng}`
      : `/search?q=${encodeURIComponent(term)}`
    router.push(url)
  }

  function searchNearMe(category: string) {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocating(false)
        router.push(`/search?q=${encodeURIComponent(category + ' near me')}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
      },
      () => {
        setLocating(false)
        // fallback — search without GPS, user can add city
        router.push(`/search?q=${encodeURIComponent(category)}`)
      },
      { timeout: 6000 }
    )
  }

  function startVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Voice not supported in this browser'); return }
    const rec = new SpeechRecognition()
    rec.lang = 'en-GB'
    rec.continuous = false
    rec.interimResults = false
    rec.onstart  = () => setListening(true)
    rec.onend    = () => setListening(false)
    rec.onerror  = () => setListening(false)
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setQuery(transcript)
      router.push(`/search?q=${encodeURIComponent(transcript)}`)
    }
    recognitionRef.current = rec
    rec.start()
  }

  function stopVoice() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-24 max-w-5xl mx-auto text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20 blur-3xl -z-10 bg-gradient-to-br from-orange-600 to-amber-400" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-medium mb-6">
          <Zap size={12} />
          AI reads the reviews honestly — free to use
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4">
          <span className="text-white">Find </span>
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">anything local</span>
          <br />
          <span className="text-white">anywhere in the world</span>
        </h1>

        <p className="text-white/55 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Restaurants, hotels, plumbers, dentists, lawyers, gyms — search anything.
          Our AI reads the real reviews and gives you an honest summary, not just star ratings.
        </p>

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className={`flex items-center gap-3 bg-white/[0.06] border rounded-2xl px-5 py-4 transition-colors ${listening ? 'border-red-500/60 bg-red-500/[0.04]' : 'border-white/[0.12] focus-within:border-orange-500/50'}`}>
            <button
              onClick={() => searchNearMe(query || 'local businesses')}
              disabled={locating}
              title="Search near my location"
              className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${locating ? 'bg-orange-500/25 text-orange-400 animate-pulse' : 'bg-white/[0.06] text-white/40 hover:text-orange-400 hover:bg-orange-500/[0.10]'}`}
            >
              <MapPin size={18} />
            </button>
            <Search size={20} className="text-white/40 flex-shrink-0" />
            <input
              type="text"
              value={listening ? '🎤 Listening…' : query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder='e.g. "best Thai restaurant in Bangkok" or "plumber nearby"'
              className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-base"
              readOnly={listening}
              autoFocus
            />
            <button
              onClick={listening ? stopVoice : startVoice}
              title={listening ? 'Stop' : 'Search by voice'}
              className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${listening ? 'bg-red-500/25 text-red-400 animate-pulse' : 'bg-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.10]'}`}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              onClick={() => handleSearch()}
              disabled={listening}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all duration-200 shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              Search <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Popular searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
          <span className="text-white/30 text-xs">Try:</span>
          {POPULAR_SEARCHES.map(s => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-white/40">
          <span className="flex items-center gap-1.5"><Shield size={14} className="text-orange-400" />Real Google reviews</span>
          <span className="flex items-center gap-1.5"><Star size={14} className="text-orange-400" />Honest AI analysis</span>
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-400" />Works in every country</span>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] py-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: '200M+', l: 'Businesses worldwide' },
            { n: '50+',   l: 'Countries covered' },
            { n: '< 10s', l: 'To get AI results' },
            { n: '£0',    l: 'Free to search' },
          ].map(s => (
            <div key={s.l}>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">{s.n}</div>
              <div className="text-white/45 text-sm mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Browse by category</h2>
          <p className="text-white/45">Or search anything above — restaurants, hotels, services, trades and more</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => searchNearMe(cat.label)}
              className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm rounded-2xl hover:border-orange-500/30 hover:bg-white/[0.06] transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/10 p-4 flex flex-col items-center gap-2 group"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="font-medium text-white/80 text-sm text-center leading-snug">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How AnyLocal works</h2>
            <p className="text-white/45">Not just star ratings — AI reads what people actually experienced</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', step: '1', title: 'Search anything, anywhere', desc: 'Type what you need and where — restaurant, hotel, dentist, plumber. Any business, any city, any country.' },
              { icon: '🤖', step: '2', title: 'AI reads the real reviews', desc: 'We fetch live Google reviews and AI summarises what customers actually said — good and bad, honestly.' },
              { icon: '📞', step: '3', title: 'Contact them directly', desc: 'Get phone numbers and addresses. No booking fees, no middlemen — just direct contact with the best match.' },
            ].map(step => (
              <div key={step.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center text-2xl mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="text-xs font-bold text-orange-400 mb-2 uppercase tracking-widest">Step {step.step}</div>
                <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY ANYLOCAL ─────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Why AnyLocal?</h2>
          <p className="text-white/45">Google shows you results. We tell you what they&apos;re actually like.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🌍', title: 'Truly global', desc: 'Works in every country where Google Maps has data — London, Dubai, Sydney, New York, Tokyo. No region limits.' },
            { icon: '🧠', title: 'AI reads reviews', desc: 'We don\'t just show you stars. AI reads the text and tells you about food quality, wait times, value, service attitude.' },
            { icon: '🔒', title: 'No paid rankings', desc: 'Results are ranked purely by review trust score — rating × review volume. Zero sponsored placements.' },
            { icon: '⚡', title: 'Live data', desc: 'Pulled fresh from Google Places every search. No outdated listings, no closed businesses shown as open.' },
            { icon: '💬', title: 'Honest — good and bad', desc: 'If the reviews mention slow service or a rude owner, the AI summary will say so. No sugarcoating.' },
            { icon: '📱', title: 'Direct contact', desc: 'Phone numbers, addresses, websites — all surfaced immediately. No booking wall, no commission.' },
          ].map(f => (
            <div key={f.title} className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm rounded-2xl p-5 flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-xl">
                {f.icon}
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">{f.title}</h4>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center bg-white/[0.03] border border-orange-500/20 rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-400 opacity-5 rounded-3xl" />
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 relative">
            Find anything local, right now
          </h2>
          <p className="text-white/50 mb-8 text-lg relative">Free. No account. Results in seconds. Works everywhere.</p>
          <div className="relative flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="text"
              placeholder='e.g. "pizza in Rome" or "dentist in Dubai"'
              className="flex-1 bg-white/[0.06] border border-white/[0.12] rounded-xl px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-colors"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  const val = (e.target as HTMLInputElement).value
                  if (val.trim()) router.push(`/search?q=${encodeURIComponent(val.trim())}`)
                }
              }}
            />
            <button
              onClick={() => {
                const inp = document.querySelector('section:last-of-type input') as HTMLInputElement
                if (inp?.value.trim()) router.push(`/search?q=${encodeURIComponent(inp.value.trim())}`)
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all duration-200 whitespace-nowrap"
            >
              Search <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
