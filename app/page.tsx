'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowRight, Star, Shield, Zap, MapPin, Mic, MicOff, Phone, CheckCircle, Wrench, Sparkles } from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────
const T = {
  bg:      '#07070f',
  surface: '#0d0d1a',
  s2:      '#121226',
  border:  'rgba(255,255,255,0.07)',
  border2: 'rgba(255,255,255,0.12)',
  text:    '#f0eeff',
  muted:   'rgba(255,255,255,0.38)',
  orange:  '#f97316',
  amber:   '#f59e0b',
  green:   '#4ade80',
}

// ── Categories ────────────────────────────────────────────
const TRADES = [
  { id: 'plumber',     label: 'Plumber',        icon: '🔧', q: 'plumber near me' },
  { id: 'electrician', label: 'Electrician',     icon: '⚡', q: 'electrician near me' },
  { id: 'ac-hvac',     label: 'AC & HVAC',       icon: '❄️', q: 'AC repair near me' },
  { id: 'builder',     label: 'Builder',         icon: '🏗️', q: 'builder near me' },
  { id: 'cleaner',     label: 'Cleaner',         icon: '🧹', q: 'deep cleaning near me' },
  { id: 'handyman',    label: 'Handyman',        icon: '🛠️', q: 'handyman near me' },
  { id: 'painter',     label: 'Painter',         icon: '🖌️', q: 'painter decorator near me' },
  { id: 'locksmith',   label: 'Locksmith',       icon: '🔑', q: 'locksmith near me' },
  { id: 'gardener',    label: 'Gardener',        icon: '🌿', q: 'gardener near me' },
  { id: 'cctv',        label: 'CCTV & Security', icon: '📷', q: 'CCTV installation near me' },
]

const SERVICES = [
  { id: 'restaurant', label: 'Restaurants', icon: '🍽️', q: 'restaurants' },
  { id: 'cafe',       label: 'Cafes',       icon: '☕', q: 'cafes' },
  { id: 'hotel',      label: 'Hotels',      icon: '🏨', q: 'hotels' },
  { id: 'dentist',    label: 'Dentist',     icon: '🦷', q: 'dentist near me' },
  { id: 'doctor',     label: 'Doctor / GP', icon: '🩺', q: 'doctor near me' },
  { id: 'gym',        label: 'Gym',         icon: '🏋️', q: 'gym near me' },
  { id: 'salon',      label: 'Hair Salon',  icon: '💇', q: 'hair salon near me' },
  { id: 'mechanic',   label: 'Mechanic',    icon: '🚗', q: 'mechanic near me' },
  { id: 'lawyer',     label: 'Lawyer',      icon: '⚖️', q: 'solicitor near me' },
  { id: 'vet',        label: 'Vet',         icon: '🐾', q: 'vet near me' },
]

const POPULAR = [
  'Plumber in London',
  'Electrician near me',
  'Best Italian in Manchester',
  'Dentist in Birmingham',
  'Boiler repair near me',
]

const HOW = [
  { icon: '🔍', n: '1', t: 'Search anything', d: 'Any trade, restaurant, service — any city, any country.' },
  { icon: '🤖', n: '2', t: 'AI reads reviews', d: 'Honest summary of what customers actually experienced — good and bad.' },
  { icon: '📨', n: '3', t: 'Request a quote', d: 'One form sends your job to up to 3 businesses at once.' },
  { icon: '📞', n: '4', t: 'They call you', d: 'Businesses contact you directly. No platform fee, ever.' },
]

const WHY = [
  { icon: '🧠', t: 'Honest AI analysis', d: 'We summarise what customers actually said — quality, response time, value, reliability.' },
  { icon: '🔒', t: 'No paid rankings',   d: 'Sorted by trust score only (rating × review count). Zero sponsored placements.' },
  { icon: '⚡', t: 'Live Google data',   d: 'Fresh data every search. No stale listings, no closed businesses shown as open.' },
  { icon: '🌍', t: 'Works everywhere',   d: 'London, Dubai, New York, Sydney — any city with Google Maps data.' },
  { icon: '📞', t: 'Direct contact',     d: 'Phone, website, address shown instantly. No booking wall, no commission.' },
  { icon: '💬', t: 'Quotes in 2 hours',  d: 'One form, multiple tradespeople compete for your job. Free, no obligation.' },
]

// ── Small atoms ───────────────────────────────────────────
function SH({ label, sub, href }: { label: string; sub?: string; href?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
      <div style={{ width: 3, height: 14, borderRadius: 99, background: T.orange, flexShrink: 0, alignSelf: 'center' }} />
      <span style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</span>
      {sub && <span style={{ fontSize: 11, color: T.muted }}>{sub}</span>}
      {href && (
        <Link href={href} style={{ marginLeft: 'auto', fontSize: 11, color: T.orange, textDecoration: 'none', fontWeight: 600 }}>
          View all →
        </Link>
      )}
    </div>
  )
}

function CatTile({ icon, label, onClick, loading, accent = false }: { icon: string; label: string; onClick: () => void; loading: boolean; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        background: accent ? `rgba(249,115,22,0.07)` : T.surface,
        border: `1px solid ${accent ? 'rgba(249,115,22,0.22)' : T.border}`,
        borderRadius: 14,
        padding: '14px 8px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        cursor: loading ? 'default' : 'pointer',
        transition: 'border-color 0.18s, background 0.18s, transform 0.12s',
        position: 'relative',
        outline: 'none',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = accent ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.2)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = accent ? 'rgba(249,115,22,0.22)' : T.border
        ;(e.currentTarget as HTMLElement).style.transform = 'none'
      }}
    >
      {loading && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(249,115,22,0.4)', borderTopColor: T.orange, animation: 'spin 0.7s linear infinite' }} />
        </div>
      )}
      <span style={{ fontSize: 26, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 600, color: accent ? 'rgba(253,186,116,0.85)' : T.muted, textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
    </button>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery]     = useState('')
  const [listening, setL]     = useState(false)
  const [locating, setLocating] = useState<string | null>(null)
  const recRef = useRef<any>(null)
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null)

  function go(q?: string) {
    const term = (q ?? query).trim()
    if (!term) return
    const gps = gpsRef.current
    router.push(gps ? `/search?q=${encodeURIComponent(term)}&lat=${gps.lat}&lng=${gps.lng}` : `/search?q=${encodeURIComponent(term)}`)
  }

  function nearMe(q: string, id: string) {
    setLocating(id)
    navigator.geolocation.getCurrentPosition(
      pos => {
        gpsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLocating(null)
        router.push(`/search?q=${encodeURIComponent(q)}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
      },
      () => { setLocating(null); router.push(`/search?q=${encodeURIComponent(q)}`) },
      { timeout: 6000 }
    )
  }

  function startVoice() {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice not supported in this browser'); return }
    const rec = new SR()
    rec.lang = 'en-GB'; rec.continuous = false; rec.interimResults = false
    rec.onstart = () => setL(true); rec.onend = () => setL(false); rec.onerror = () => setL(false)
    rec.onresult = (e: any) => { const t = e.results[0][0].transcript; setQuery(t); router.push(`/search?q=${encodeURIComponent(t)}`) }
    recRef.current = rec; rec.start()
  }

  function stopVoice() { recRef.current?.stop(); setL(false) }

  return (
    <div style={{ minHeight: '100vh', background: T.bg }}>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '56px 24px 44px', maxWidth: 840, margin: '0 auto', textAlign: 'center' }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(249,115,22,0.18) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 99, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.28)', fontSize: 11, fontWeight: 700, color: 'rgba(253,186,116,0.9)', marginBottom: 24, letterSpacing: '0.04em' }}>
            <Sparkles size={10} /> AI-powered · Google reviews · Free to search
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em', color: T.text, marginBottom: 16 }}>
            Find trusted{' '}
            <span style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              local services
            </span>
            <br />near you — anywhere
          </h1>

          <p style={{ fontSize: 15, color: T.muted, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 32px' }}>
            Plumbers, electricians, restaurants, dentists. AI reads real reviews so you can choose with confidence.
          </p>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto 16px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: T.surface, border: `1px solid ${listening ? 'rgba(239,68,68,0.45)' : T.border2}`,
              borderRadius: 18, padding: '12px 12px 12px 16px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              transition: 'border-color 0.2s',
            }}>
              <Search size={16} style={{ color: T.muted, flexShrink: 0 }} />
              <input
                type="text"
                value={listening ? '🎤 Listening…' : query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && go()}
                placeholder='"plumber nearby" or "best Thai in Leeds"'
                readOnly={listening}
                autoFocus
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: T.text }}
              />
              <button
                onClick={listening ? stopVoice : startVoice}
                style={{ padding: 8, borderRadius: 10, background: listening ? 'rgba(239,68,68,0.15)' : 'transparent', border: 'none', cursor: 'pointer', color: listening ? '#ef4444' : T.muted, flexShrink: 0, transition: 'all 0.2s' }}
              >
                {listening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
              <button
                onClick={() => go()}
                disabled={listening}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13, color: '#fff', background: 'linear-gradient(135deg, #ea580c, #d97706)', border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 16px rgba(249,115,22,0.3)', transition: 'opacity 0.2s' }}
              >
                Search <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Popular pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
            <span style={{ fontSize: 11, color: T.muted, alignSelf: 'center', marginRight: 2 }}>Try:</span>
            {POPULAR.map(s => (
              <button key={s} onClick={() => go(s)} style={{ fontSize: 11, padding: '5px 12px', borderRadius: 99, background: T.surface, border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLElement).style.color = T.text }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.muted }}
              >{s}</button>
            ))}
          </div>

          {/* Trust */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20, fontSize: 11, color: T.muted }}>
            {[['🛡️', 'Real Google reviews'], ['⭐', 'Honest AI analysis'], ['📞', 'Direct contact — no fees'], ['🌍', 'Works worldwide']].map(([ic, lb]) => (
              <span key={lb as string} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{ic} {lb}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE FORM + TRADESPERSON CTA ─────────────────── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 40px', display: 'grid', gridTemplateColumns: '1fr', gap: 12 }} className="grid-quote">
        {/* Quote form */}
        <div style={{ background: T.surface, border: `1px solid rgba(249,115,22,0.22)`, borderRadius: 18, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, boxShadow: `0 0 8px ${T.green}`, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: T.green, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Tradespeople online now</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'rgba(249,115,22,0.8)', fontWeight: 700 }}>Get quotes in 2 hours</span>
          </div>
          <form
            onSubmit={e => {
              e.preventDefault()
              const f = e.currentTarget
              const job = (f.elements.namedItem('job') as HTMLInputElement).value
              const loc = (f.elements.namedItem('loc') as HTMLInputElement).value
              if (job && loc) go(`${job} in ${loc}`)
            }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'end' }}
            className="quote-form"
          >
            <div>
              <label style={{ fontSize: 10, color: T.muted, fontWeight: 600, display: 'block', marginBottom: 4 }}>What do you need?</label>
              <input name="job" required placeholder="e.g. boiler repair, bathroom tiles..." style={{ width: '100%', background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 12px', fontSize: 13, color: T.text, outline: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = T.border)} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: T.muted, fontWeight: 600, display: 'block', marginBottom: 4 }}>Your location</label>
              <input name="loc" required placeholder="Postcode or city" style={{ width: '100%', background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '9px 12px', fontSize: 13, color: T.text, outline: 'none' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(249,115,22,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = T.border)} />
            </div>
            <button type="submit" style={{ padding: '9px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, color: '#fff', background: 'linear-gradient(135deg, #ea580c, #d97706)', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Get Quotes →
            </button>
          </form>
          <p style={{ fontSize: 10, color: T.muted, marginTop: 8 }}>Free · No obligation · Up to 5 quotes from local tradespeople</p>
        </div>

        {/* Tradesperson CTA */}
        <Link href="/for-businesses" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, background: `rgba(249,115,22,0.06)`, border: `1px solid rgba(249,115,22,0.2)`, borderRadius: 18, padding: '16px 20px', transition: 'background 0.2s' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(249,115,22,0.06)')}>
          <Wrench size={22} style={{ color: T.orange, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: 0 }}>Own a trade business?</p>
            <p style={{ fontSize: 11, color: T.muted, margin: '2px 0 0' }}>30 days free · 0% commission · £15/mo after — less than one call-out</p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: T.orange, flexShrink: 0 }}>List free →</span>
        </Link>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, background: T.surface }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 12 }}>
          {[['200M+', 'Businesses worldwide'], ['50+', 'Countries'], ['< 10s', 'AI results'], ['£0', 'Free to search']].map(([n, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 900, background: 'linear-gradient(135deg, #f97316, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{n}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT GRID ─────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 0' }}>

        {/* ── HOME TRADES ───────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <SH label="Home Trades" sub="Click to find verified tradespeople near you" href="/search?q=tradesperson near me" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }} className="trades-grid">
            {TRADES.map(cat => (
              <CatTile key={cat.id} icon={cat.icon} label={cat.label} accent onClick={() => nearMe(cat.q, cat.id)} loading={locating === cat.id} />
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS + OTHER SERVICES ─────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }} className="split-grid">

          {/* How it works */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
            <SH label="How It Works" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {HOW.map((s, i) => (
                <div key={s.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}>
                  {i < HOW.length - 1 && (
                    <div style={{ position: 'absolute', left: 16, top: 32, bottom: -16, width: 1, background: 'linear-gradient(to bottom, rgba(249,115,22,0.3), transparent)' }} />
                  )}
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(249,115,22,0.12)', border: `1px solid rgba(249,115,22,0.2)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                    {s.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: '4px 0 2px' }}>{s.t}</p>
                    <p style={{ fontSize: 11, color: T.muted, margin: 0, lineHeight: 1.5 }}>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other services */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 16, padding: 20 }}>
            <SH label="More Services" sub="Restaurants, health, beauty, professional" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {SERVICES.map(cat => (
                <CatTile key={cat.id} icon={cat.icon} label={cat.label} onClick={() => nearMe(cat.q, cat.id)} loading={locating === cat.id} />
              ))}
            </div>
          </div>
        </div>

        {/* ── WHY ANYLOCAL ──────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <SH label="Why AnyLocal" sub="Google shows results. We tell you what they're actually like." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }} className="why-grid">
            {WHY.map(f => (
              <div key={f.t} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 16px 14px', display: 'flex', gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(249,115,22,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>{f.t}</p>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0, lineHeight: 1.55 }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM CTA ────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 48 }} className="cta-grid">
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.07), transparent 70%)', pointerEvents: 'none' }} />
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: '0 0 8px' }}>Need a local service?</h3>
            <p style={{ fontSize: 12, color: T.muted, margin: '0 0 20px', lineHeight: 1.6 }}>Search trades, food, health, professional. AI finds and analyses the best near you.</p>
            <button onClick={() => go('plumber near me')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 12, fontWeight: 700, fontSize: 13, color: '#fff', background: 'linear-gradient(135deg, #ea580c, #d97706)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(249,115,22,0.25)' }}>
              Search now <ArrowRight size={14} />
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 14 }}>
              {['Free to search', 'No account', 'Instant results'].map(t => (
                <span key={t} style={{ fontSize: 10, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={9} style={{ color: 'rgba(249,115,22,0.5)' }} />{t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(245,158,11,0.07))', border: `1px solid rgba(249,115,22,0.28)`, borderRadius: 18, padding: '28px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 12, right: 12, fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: 'rgba(249,115,22,0.18)', color: 'rgba(253,186,116,0.9)', border: '1px solid rgba(249,115,22,0.3)' }}>30 days free</div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔧</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: T.text, margin: '0 0 8px' }}>Own a trade business?</h3>
            <p style={{ fontSize: 12, color: T.muted, margin: '0 0 20px', lineHeight: 1.6 }}>Get local leads direct to your inbox. 0% commission — ever. Just £15/mo after trial.</p>
            <Link href="/for-businesses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', borderRadius: 12, fontWeight: 700, fontSize: 13, color: '#fff', background: 'linear-gradient(135deg, #ea580c, #d97706)', textDecoration: 'none', boxShadow: '0 4px 16px rgba(249,115,22,0.25)' }}>
              List your trade free <ArrowRight size={14} />
            </Link>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 14 }}>
              {['0% commission', '£15/mo after trial', 'Cancel any time'].map(t => (
                <span key={t} style={{ fontSize: 10, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={9} style={{ color: 'rgba(249,115,22,0.5)' }} />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        @media (min-width: 640px) {
          .grid-quote { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 840px) {
          .grid-quote { grid-template-columns: 2fr 1fr !important; }
        }
        @media (max-width: 719px) {
          .split-grid { grid-template-columns: 1fr !important; }
          .cta-grid   { grid-template-columns: 1fr !important; }
          .why-grid   { grid-template-columns: 1fr 1fr !important; }
          .trades-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
        @media (max-width: 479px) {
          .trades-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .why-grid    { grid-template-columns: 1fr !important; }
          .quote-form  { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
