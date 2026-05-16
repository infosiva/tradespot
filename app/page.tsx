'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowRight, Star, Shield, Zap, MapPin, Mic, MicOff, Phone, Clock, CheckCircle } from 'lucide-react'

// ── Trades shown prominently on homepage ─────────────────
const TRADE_CATEGORIES = [
  { id: 'plumber',     label: 'Plumber',          icon: '🔧', q: 'plumber near me' },
  { id: 'electrician', label: 'Electrician',       icon: '⚡', q: 'electrician near me' },
  { id: 'ac-hvac',     label: 'AC & HVAC',         icon: '❄️', q: 'AC repair near me' },
  { id: 'builder',     label: 'Builder',           icon: '🏗️', q: 'builder near me' },
  { id: 'cleaner',     label: 'Deep Cleaning',     icon: '🧹', q: 'deep cleaning near me' },
  { id: 'handyman',    label: 'Handyman',          icon: '🛠️', q: 'handyman near me' },
  { id: 'painter',     label: 'Painter',           icon: '🖌️', q: 'painter decorator near me' },
  { id: 'locksmith',   label: 'Locksmith',         icon: '🔑', q: 'locksmith near me' },
  { id: 'gardener',    label: 'Gardener',          icon: '🌿', q: 'gardener near me' },
  { id: 'cctv',        label: 'CCTV & Security',   icon: '📷', q: 'CCTV installation near me' },
]

// ── Other local services ──────────────────────────────────
const OTHER_CATEGORIES = [
  { id: 'restaurant',   label: 'Restaurants',    icon: '🍽️', q: 'restaurants' },
  { id: 'cafe',         label: 'Cafes',          icon: '☕', q: 'cafes' },
  { id: 'hotel',        label: 'Hotels',         icon: '🏨', q: 'hotels' },
  { id: 'dentist',      label: 'Dentist',        icon: '🦷', q: 'dentist near me' },
  { id: 'doctor',       label: 'Doctor / GP',    icon: '🩺', q: 'doctor near me' },
  { id: 'gym',          label: 'Gym',            icon: '🏋️', q: 'gym near me' },
  { id: 'salon',        label: 'Hair Salon',     icon: '💇', q: 'hair salon near me' },
  { id: 'mechanic',     label: 'Mechanic',       icon: '🚗', q: 'mechanic near me' },
  { id: 'lawyer',       label: 'Lawyer',         icon: '⚖️', q: 'solicitor near me' },
  { id: 'vet',          label: 'Vet',            icon: '🐾', q: 'vet near me' },
]

const POPULAR = [
  'Plumber in London',
  'Electrician near me',
  'Best Italian restaurant in Manchester',
  'Dentist in Birmingham',
  'Boiler repair near me',
  'Hotel in Edinburgh',
]

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery]       = useState('')
  const [listening, setListening] = useState(false)
  const [locating, setLocating] = useState<string | null>(null)
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

  function searchNearMe(q: string, categoryId: string) {
    setLocating(categoryId)
    navigator.geolocation.getCurrentPosition(
      pos => {
        gpsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocating(null)
        router.push(`/search?q=${encodeURIComponent(q)}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
      },
      () => {
        setLocating(null)
        router.push(`/search?q=${encodeURIComponent(q)}`)
      },
      { timeout: 6000 }
    )
  }

  function startVoice() {
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Voice not supported in this browser'); return }
    const rec = new SpeechRecognition()
    rec.lang = 'en-GB'; rec.continuous = false; rec.interimResults = false
    rec.onstart  = () => setListening(true)
    rec.onend    = () => setListening(false)
    rec.onerror  = () => setListening(false)
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      setQuery(t)
      router.push(`/search?q=${encodeURIComponent(t)}`)
    }
    recognitionRef.current = rec
    rec.start()
  }

  function stopVoice() { recognitionRef.current?.stop(); setListening(false) }

  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative px-6 pt-16 pb-10 max-w-5xl mx-auto text-center">
        {/* Glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-15 blur-3xl -z-10 bg-gradient-to-br from-orange-600 to-amber-400 pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 text-orange-300 border border-orange-500/25 text-xs font-semibold mb-5">
          <Zap size={11} /> AI-powered · Google reviews · Free to search
        </div>

        <h1 className="font-display text-4xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-4" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
          <span className="text-white">Find trusted </span>
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">local services</span>
          <br className="hidden md:block" />
          <span className="text-white"> near you</span>
        </h1>

        <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          Search plumbers, electricians, restaurants, dentists — anywhere.
          AI reads real reviews so you can choose with confidence.
        </p>

        {/* ── Search bar ── */}
        <div className="relative max-w-2xl mx-auto mb-5">
          <div className={`search-bar flex items-center gap-2 bg-white/[0.06] border rounded-2xl px-4 py-3.5 transition-all shadow-2xl shadow-black/40 ${
            listening ? 'border-red-500/50 bg-red-500/[0.04]' : 'border-white/[0.14]'
          }`}>
            <Search size={18} className="text-white/35 flex-shrink-0 ml-1" />
            <input
              type="text"
              value={listening ? '🎤 Listening…' : query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder='e.g. "plumber nearby" or "best Thai restaurant in Leeds"'
              className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-base"
              readOnly={listening}
              autoFocus
            />
            <button
              onClick={listening ? stopVoice : startVoice}
              className={`flex-shrink-0 p-2 rounded-xl transition-all ${listening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'text-white/35 hover:text-white/60 hover:bg-white/[0.08]'}`}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={() => handleSearch()}
              disabled={listening}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 text-sm"
            >
              Search <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* Popular */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="text-white/30 text-xs mr-1">Try:</span>
          {POPULAR.map(s => (
            <button key={s} onClick={() => handleSearch(s)}
              className="text-xs px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/45 hover:text-white/75 hover:border-white/18 transition-colors">
              {s}
            </button>
          ))}
        </div>

        {/* Trust pills */}
        <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-white/35 mb-8">
          <span className="flex items-center gap-1.5"><Shield size={13} className="text-orange-400/70" /> Real Google reviews</span>
          <span className="flex items-center gap-1.5"><Star size={13} className="text-orange-400/70" /> Honest AI analysis</span>
          <span className="flex items-center gap-1.5"><Phone size={13} className="text-orange-400/70" /> Direct contact — no fees</span>
          <span className="flex items-center gap-1.5"><MapPin size={13} className="text-orange-400/70" /> Works worldwide</span>
        </div>

        {/* ── Instant Quote CTA — like Bark.com ── */}
        <div className="max-w-xl mx-auto bg-white/[0.04] border border-orange-500/25 rounded-2xl p-5 text-left">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-orange-400" />
            <span className="text-orange-300 text-xs font-bold uppercase tracking-widest">Get quotes in 2 hours</span>
            <span className="ml-auto text-[10px] text-green-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"/> Tradespeople online now
            </span>
          </div>
          <form onSubmit={e => { e.preventDefault(); const f = e.currentTarget; const job = (f.elements.namedItem('job') as HTMLInputElement).value; const loc = (f.elements.namedItem('loc') as HTMLInputElement).value; if (job && loc) handleSearch(`${job} in ${loc}`) }} className="flex flex-col gap-2.5">
            <input name="job" required placeholder="What do you need? e.g. boiler repair, bathroom tiles..."
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition" />
            <input name="loc" required placeholder="Your postcode or city"
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 transition" />
            <button type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #f97316, #d97706)' }}>
              Get Free Quotes →
            </button>
          </form>
          <p className="text-white/25 text-[10px] mt-2 text-center">Free · No obligation · Up to 5 quotes from local tradespeople</p>
        </div>
      </section>

      {/* ── TRADESPERSON BANNER ───────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <Link href="/for-businesses" className="flex items-center justify-between gap-4 bg-orange-500/8 border border-orange-500/22 rounded-2xl px-6 py-4 hover:bg-orange-500/12 transition-all group">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔧</span>
            <div>
              <p className="text-white font-semibold text-sm">Are you a tradesperson or local business?</p>
              <p className="text-white/40 text-xs mt-0.5">30 days free listing · 0% commission · £15/month after — less than one call-out</p>
            </div>
          </div>
          <span className="text-orange-400 text-sm font-semibold flex items-center gap-1 flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
            List free <ArrowRight size={14} />
          </span>
        </Link>
      </div>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.05] py-8 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { n: '200M+', l: 'Businesses worldwide' },
            { n: '50+',   l: 'Countries' },
            { n: '< 10s', l: 'To get AI results' },
            { n: '£0',    l: 'Free to search' },
          ].map(s => (
            <div key={s.l}>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">{s.n}</div>
              <div className="text-white/40 text-xs mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRADES ────────────────────────────────────────────── */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Home trades</h2>
            <p className="text-white/40 text-sm mt-1">Click to find verified tradespeople near you</p>
          </div>
          <Link href="/search?q=tradesperson near me" className="text-orange-400 text-sm hover:text-orange-300 transition-colors flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {TRADE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => searchNearMe(cat.q, cat.id)}
              disabled={locating === cat.id}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl hover:border-orange-500/35 hover:bg-orange-500/[0.06] transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10 p-4 flex flex-col items-center gap-2.5 group relative"
            >
              {locating === cat.id && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/30">
                  <div className="w-4 h-4 rounded-full border-2 border-orange-400/60 border-t-orange-400 animate-spin" />
                </div>
              )}
              <span className="text-3xl">{cat.icon}</span>
              <span className="font-medium text-white/75 text-xs text-center leading-snug group-hover:text-white transition-colors">{cat.label}</span>
              <span className="text-orange-400/0 group-hover:text-orange-400/70 text-[10px] transition-all flex items-center gap-0.5">
                <MapPin size={9} /> Near me
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white/[0.015] border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">How AnyLocal works</h2>
            <p className="text-white/40 text-sm">Not just star ratings — AI reads what customers actually experienced</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🔍', n: '1', t: 'Search', d: 'Type what you need and where. Any trade, restaurant, service — any city, any country.' },
              { icon: '🤖', n: '2', t: 'AI analyses', d: 'We fetch live Google reviews. AI summarises honestly — good and bad — not just star counts.' },
              { icon: '📨', n: '3', t: 'Request a quote', d: 'Found someone you like? One form sends your job details to up to 3 businesses at once.' },
              { icon: '📞', n: '4', t: 'They contact you', d: 'Businesses get your lead and call or email you directly. No platform fee on your job.' },
            ].map((s, i) => (
              <div key={s.n} className="text-center relative">
                {i < 3 && <div className="hidden md:block absolute top-7 left-[calc(50%+32px)] right-0 h-px bg-gradient-to-r from-orange-500/30 to-transparent" />}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-400 flex items-center justify-center text-2xl mx-auto mb-4 relative z-10">
                  {s.icon}
                </div>
                <div className="text-xs font-bold text-orange-400/70 mb-1 uppercase tracking-widest">Step {s.n}</div>
                <h4 className="font-bold text-white mb-1.5 text-sm">{s.t}</h4>
                <p className="text-white/45 text-xs leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OTHER CATEGORIES ─────────────────────────────────── */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">More local services</h2>
          <p className="text-white/40 text-sm mt-1">Restaurants, health, beauty, professional — all with AI review analysis</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {OTHER_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => searchNearMe(cat.q, cat.id)}
              disabled={locating === cat.id}
              className="bg-white/[0.025] border border-white/[0.05] rounded-2xl hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-200 p-4 flex flex-col items-center gap-2.5 group relative"
            >
              {locating === cat.id && (
                <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/30">
                  <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                </div>
              )}
              <span className="text-2xl">{cat.icon}</span>
              <span className="font-medium text-white/55 text-xs text-center leading-snug group-hover:text-white/80 transition-colors">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── WHY ANYLOCAL ─────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white/[0.015] border-y border-white/[0.05]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Why AnyLocal?</h2>
            <p className="text-white/40 text-sm">Google shows results. We tell you what they&apos;re actually like.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: '🧠', t: 'AI reads reviews honestly', d: 'We summarise what customers actually said — food quality, response times, value, reliability. Good and bad.' },
              { icon: '🔒', t: 'No paid rankings', d: 'Ranked purely by trust score (rating × review volume). Zero sponsored placements. Ever.' },
              { icon: '⚡', t: 'Live Google data', d: 'Fresh from Google Places every search. No stale listings, no closed businesses shown as open.' },
              { icon: '🌍', t: 'Works everywhere', d: 'Any city, any country with Google Maps data. London, Dubai, New York, Sydney — same experience.' },
              { icon: '📞', t: 'Direct contact only', d: 'Phone numbers, websites, addresses shown immediately. No booking wall, no platform commission.' },
              { icon: '💬', t: 'Get quotes in one form', d: 'For trades — one form sends your job to multiple businesses at once. They come to you.' },
            ].map(f => (
              <div key={f.t} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-lg">{f.icon}</div>
                <div>
                  <h4 className="font-semibold text-white text-sm mb-1">{f.t}</h4>
                  <p className="text-white/45 text-xs leading-relaxed">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BUSINESS CTA ─────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Customer CTA */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-500 opacity-4 rounded-3xl pointer-events-none" />
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-white font-extrabold text-xl mb-2">Need a local service?</h3>
            <p className="text-white/45 text-sm mb-6 leading-relaxed">Search anything local — trades, food, health, professional. AI finds and analyses the best options near you.</p>
            <button onClick={() => handleSearch('plumber near me')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20 text-sm">
              Search now <ArrowRight size={15} />
            </button>
            <div className="flex justify-center gap-4 mt-5">
              {['Free to search', 'No account needed', 'Instant results'].map(t => (
                <span key={t} className="text-white/30 text-xs flex items-center gap-1"><CheckCircle size={10} className="text-orange-400/50" />{t}</span>
              ))}
            </div>
          </div>

          {/* Business CTA */}
          <div className="bg-gradient-to-br from-orange-600/12 to-amber-500/8 border border-orange-500/25 rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">30 days free</span>
            </div>
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-white font-extrabold text-xl mb-2">Own a trade business?</h3>
            <p className="text-white/45 text-sm mb-6 leading-relaxed">List your trade on AnyLocal. Get local leads direct to your inbox. Zero commission — ever. Just £15/month after trial.</p>
            <Link href="/for-businesses"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20 text-sm">
              List your trade free <ArrowRight size={15} />
            </Link>
            <div className="flex justify-center gap-4 mt-5">
              {['0% commission', '£15/mo after trial', 'Cancel any time'].map(t => (
                <span key={t} className="text-white/30 text-xs flex items-center gap-1"><CheckCircle size={10} className="text-orange-400/50" />{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
