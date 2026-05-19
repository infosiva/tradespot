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
      <section style={{ position: 'relative', padding: '32px 24px 20px', maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 760, height: 280, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(249,115,22,0.18) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 99, background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.25)', fontSize: 10, fontWeight: 700, color: 'rgba(253,186,116,0.85)', marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <Sparkles size={9} /> AI-powered · Live Google data · Free forever
          </div>

          {/* Editorial headline */}
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', color: T.text, margin: '0 0 8px' }}>
            Find any trade or service
            <br />
            <span style={{ background: 'linear-gradient(120deg, #f97316 10%, #f59e0b 55%, #fb923c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              near you
            </span>
            {' '}
            <span style={{ color: T.muted, fontWeight: 700, fontSize: '0.75em' }}>— anywhere</span>
          </h1>

          <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.55, maxWidth: 420, margin: '0 auto 18px' }}>
            AI reads thousands of real reviews. Honest shortlists — no paid rankings, no commissions.
          </p>

          {/* Search card */}
          <div style={{ maxWidth: 640, margin: '0 auto 10px', background: T.surface, border: `1px solid ${listening ? 'rgba(239,68,68,0.45)' : T.border2}`, borderRadius: 18, padding: '6px 6px 6px 16px', boxShadow: '0 12px 48px rgba(0,0,0,0.55)', transition: 'border-color 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Search size={15} style={{ color: T.muted, flexShrink: 0 }} />
            <input
              type="text"
              value={listening ? '🎤 Listening…' : query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go()}
              placeholder='"plumber nearby" or "best Thai in Leeds"'
              readOnly={listening}
              autoFocus
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: T.text, minWidth: 0, padding: '10px 0' }}
            />
            <button
              onClick={listening ? stopVoice : startVoice}
              style={{ padding: 8, borderRadius: 9, background: listening ? 'rgba(239,68,68,0.15)' : 'transparent', border: 'none', cursor: 'pointer', color: listening ? '#ef4444' : T.muted, flexShrink: 0, transition: 'all 0.2s' }}
            >
              {listening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
            <button
              onClick={() => go()}
              disabled={listening}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 22px', borderRadius: 13, fontWeight: 700, fontSize: 13, color: '#fff', background: 'linear-gradient(135deg, #ea580c, #d97706)', border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 16px rgba(249,115,22,0.35)', minHeight: 44, transition: 'opacity 0.2s' }}
            >
              Search <ArrowRight size={13} />
            </button>
          </div>

          {/* Trust strip — minimal, inline */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 10, color: T.muted, gap: 0 }}>
            {['10,000+ reviews analysed', 'Free to use', '100+ trade types', 'Works worldwide'].map((item, i) => (
              <span key={item} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <span style={{ margin: '0 8px', opacity: 0.2 }}>·</span>}
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── POPULAR SEARCHES — horizontal scroll strip ────── */}
      <div style={{ borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`, padding: '8px 24px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, maxWidth: 960, margin: '0 auto', minWidth: 0 }}>
          <span style={{ fontSize: 10, color: T.muted, flexShrink: 0, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Try:</span>
          {POPULAR.map(s => (
            <button key={s} onClick={() => go(s)}
              style={{ fontSize: 11, padding: '5px 12px', borderRadius: 99, background: T.surface, border: `1px solid ${T.border}`, color: T.muted, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'border-color 0.15s, color 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.22)'; (e.currentTarget as HTMLElement).style.color = T.text }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.muted }}
            >{s}</button>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 0' }}>

        {/* Trades */}
        <div style={{ marginBottom: 20 }}>
          <SH label="Home Trades" sub="GPS-matched tradespeople near you" href="/search?q=tradesperson near me" />
          <div className="cat-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7 }}>
            {TRADES.map(cat => (
              <CatTile key={cat.id} icon={cat.icon} label={cat.label} accent onClick={() => nearMe(cat.q, cat.id)} loading={locating === cat.id} />
            ))}
          </div>
        </div>

        {/* Thin rule */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 20 }} />

        {/* Services */}
        <div style={{ marginBottom: 20 }}>
          <SH label="More Services" sub="Restaurants, health, beauty, professional" />
          <div className="cat-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7 }}>
            {SERVICES.map(cat => (
              <CatTile key={cat.id} icon={cat.icon} label={cat.label} onClick={() => nearMe(cat.q, cat.id)} loading={locating === cat.id} />
            ))}
          </div>
        </div>

        {/* ── THIN DIVIDER ──────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 24 }} />

        {/* ── HOW IT WORKS — horizontal 4-step ──────────────── */}
        <div style={{ marginBottom: 24 }}>
          <SH label="How It Works" />
          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, position: 'relative' }}>
            {HOW.map((s, i) => (
              <div key={s.n} style={{ position: 'relative', padding: '0 16px 0 0' }}>
                {/* Connector line */}
                {i < HOW.length - 1 && (
                  <div style={{ position: 'absolute', top: 15, right: 0, width: 16, height: 1, background: 'linear-gradient(to right, rgba(249,115,22,0.4), rgba(249,115,22,0.1))', zIndex: 1 }} />
                )}
                <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '14px 14px 12px', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{s.icon}</div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'rgba(249,115,22,0.6)', letterSpacing: '0.06em' }}>STEP {s.n}</span>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.text, margin: '0 0 4px' }}>{s.t}</p>
                  <p style={{ fontSize: 10, color: T.muted, margin: 0, lineHeight: 1.55 }}>{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── THIN DIVIDER ──────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 24 }} />

        {/* ── WHY ANYLOCAL — tight 3-col inline grid ───────── */}
        <div style={{ marginBottom: 20 }}>
          <SH label="Why AnyLocal" sub="Google shows results. We tell you what they're actually like." />
          <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {WHY.map(f => (
              <div key={f.t} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, flexShrink: 0, lineHeight: 1.4 }}>{f.icon}</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.text, margin: '0 0 2px' }}>{f.t}</p>
                  <p style={{ fontSize: 10, color: T.muted, margin: 0, lineHeight: 1.5 }}>{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── THIN DIVIDER ──────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 16 }} />

        {/* ── BOTTOM CTA — 2 col ────────────────────────────── */}
        <div className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
          {/* Search CTA */}
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.05), transparent 70%)', pointerEvents: 'none' }} />
            <h3 style={{ fontSize: 14, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Need a local service?</h3>
            <p style={{ fontSize: 11, color: T.muted, margin: '0 0 12px', lineHeight: 1.5 }}>Trades, food, health, professional. AI finds the best near you — instantly.</p>
            <button onClick={() => go('plumber near me')} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '9px 16px', minHeight: 44, borderRadius: 10, fontWeight: 700, fontSize: 12, color: '#fff', background: 'linear-gradient(135deg, #ea580c, #d97706)', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249,115,22,0.22)' }}>
              Search now <ArrowRight size={12} />
            </button>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {['Free to search', 'No account', 'Instant results'].map(t => (
                <span key={t} style={{ fontSize: 9, color: T.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <CheckCircle size={8} style={{ color: 'rgba(249,115,22,0.5)' }} />{t}
                </span>
              ))}
            </div>
          </div>

          {/* Trade listing CTA */}
          <div style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.09), rgba(245,158,11,0.05))', border: `1px solid rgba(249,115,22,0.26)`, borderRadius: 12, padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: 'rgba(249,115,22,0.15)', color: 'rgba(253,186,116,0.85)', border: '1px solid rgba(249,115,22,0.28)' }}>30 days free</div>
            <Wrench size={16} style={{ color: T.orange, marginBottom: 6 }} />
            <h3 style={{ fontSize: 14, fontWeight: 800, color: T.text, margin: '0 0 4px' }}>Own a trade business?</h3>
            <p style={{ fontSize: 11, color: T.muted, margin: '0 0 12px', lineHeight: 1.5 }}>Local leads direct to you. 0% commission — ever. Just £15/mo after trial.</p>
            <Link href="/for-businesses" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '9px 16px', minHeight: 44, borderRadius: 10, fontWeight: 700, fontSize: 12, color: '#fff', background: 'linear-gradient(135deg, #ea580c, #d97706)', textDecoration: 'none', boxShadow: '0 4px 12px rgba(249,115,22,0.22)' }}>
              List your trade free <ArrowRight size={12} />
            </Link>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {['0% commission', '£15/mo after trial', 'Cancel any time'].map(t => (
                <span key={t} style={{ fontSize: 9, color: T.muted, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <CheckCircle size={8} style={{ color: 'rgba(249,115,22,0.5)' }} />{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER — 2-col compact ────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: '16px 24px', maxWidth: 960, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.text, letterSpacing: '-0.02em' }}>
              Tradespot <span style={{ background: 'linear-gradient(120deg,#f97316,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI</span>
            </span>
            <p style={{ fontSize: 10, color: T.muted, margin: '3px 0 0', lineHeight: 1.5 }}>
              AI-powered local trade &amp; service finder. Free forever. No commissions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {[['For Businesses', '/for-businesses'], ['Privacy', '/privacy'], ['Terms', '/terms']].map(([label, href]) => (
              <Link key={href} href={href} style={{ fontSize: 10, color: T.muted, textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = T.text}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = T.muted}
              >{label}</Link>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        /* Mobile: horizontal scroll for category tiles */
        @media (max-width: 599px) {
          .cat-scroll {
            display: flex !important;
            overflow-x: auto !important;
            gap: 7px !important;
            padding-bottom: 6px;
            scrollbar-width: none;
          }
          .cat-scroll::-webkit-scrollbar { display: none; }
          .cat-scroll > * { flex: 0 0 72px !important; min-width: 72px !important; }
          .how-grid    { grid-template-columns: 1fr 1fr !important; }
          .why-grid    { grid-template-columns: 1fr 1fr !important; }
          .cta-grid    { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 479px) {
          .why-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 600px) and (max-width: 839px) {
          .how-grid { grid-template-columns: 1fr 1fr !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
