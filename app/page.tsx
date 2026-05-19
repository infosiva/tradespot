'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, CheckCircle, Wrench, Sparkles, Mic, MicOff, MapPin, Star, TrendingUp } from 'lucide-react'
import config from '../vertical.config'

// ── Tokens ────────────────────────────────────────────────
const T = {
  bg:       '#0e0900',
  s1:       '#15100200',   // fully transparent — uses background
  s2:       'rgba(255,255,255,0.035)',
  s3:       'rgba(255,255,255,0.055)',
  border:   'rgba(255,255,255,0.07)',
  border2:  'rgba(255,255,255,0.12)',
  borderHi: 'rgba(249,115,22,0.35)',
  text:     '#faf8f4',
  sub:      'rgba(250,248,244,0.65)',
  muted:    'rgba(250,248,244,0.38)',
  orange:   '#f97316',
  amber:    '#f59e0b',
  grad:     'linear-gradient(120deg, #f97316 0%, #f59e0b 60%, #fb923c 100%)',
  btnGrad:  'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
}

const STATS = [
  { label: 'Businesses listed',  value: '2.4M+',  icon: <MapPin  size={13} /> },
  { label: 'Reviews analysed',   value: '180M+', icon: <Star    size={13} /> },
  { label: 'Searches this week', value: '94k',   icon: <TrendingUp size={13} /> },
]

const HOW = [
  { n: '01', title: 'Type what you need',     body: 'Business type + location, any language' },
  { n: '02', title: 'AI scans real reviews',  body: 'Analyses Google, Yelp + more honestly' },
  { n: '03', title: 'Find your best match',   body: 'Ranked by quality, not just star ratings' },
]

// ── Rich animated background ─────────────────────────────
function Bg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {/* Noise texture overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.6,
      }} />
      {/* Primary warm orb — top left */}
      <motion.div
        style={{ position: 'absolute', top: '-18%', left: '-5%', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.22) 0%, rgba(245,158,11,0.08) 50%, transparent 70%)',
          filter: 'blur(60px)' }}
        animate={{ x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
      />
      {/* Secondary amber orb — bottom right */}
      <motion.div
        style={{ position: 'absolute', bottom: '-10%', right: '-8%', width: 450, height: 450, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(234,88,12,0.18) 0%, rgba(249,115,22,0.06) 50%, transparent 70%)',
          filter: 'blur(70px)' }}
        animate={{ x: [0, -25, 0], y: [0, 20, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, ease: 'easeInOut', repeat: Infinity, delay: 2 }}
      />
      {/* Faint mid orb */}
      <motion.div
        style={{ position: 'absolute', top: '40%', left: '45%', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%)',
          filter: 'blur(80px)' }}
        animate={{ x: [0, 15, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, ease: 'easeInOut', repeat: Infinity, delay: 1 }}
      />
      {/* Grid lines — subtle depth */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 80%)',
      }} />
    </div>
  )
}

// ── Live pulse indicator ─────────────────────────────────
function LivePulse() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ position: 'relative', width: 7, height: 7, display: 'inline-block' }}>
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e', animation: 'ping 1.5s ease-out infinite', opacity: 0.6 }} />
        <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#22c55e' }} />
      </span>
      <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(134,239,172,0.8)', letterSpacing: '0.04em' }}>LIVE</span>
    </span>
  )
}

// ── Floating chatbot ─────────────────────────────────────
function FloatingChat() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! Tell me what local service you need and I\'ll help you find the best options 🔍' },
  ])
  const [input, setInput] = useState('')

  async function send() {
    if (!input.trim()) return
    const userMsg = input
    setMsgs(m => [...m, { role: 'user', text: userMsg }])
    setInput('')
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMsg }],
          system: 'You are TradeSpot\'s AI assistant. Help users find local businesses, trades, and services. Be concise and helpful.',
        }),
      })
      const data = await res.json()
      setMsgs(m => [...m, { role: 'bot', text: data.text || data.content || 'Let me help you find that…' }])
    } catch {
      setMsgs(m => [...m, { role: 'bot', text: 'Having trouble connecting — try the search bar above!' }])
    }
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{ position: 'fixed', bottom: 24, right: 24, width: 52, height: 52, borderRadius: '50%',
          background: T.btnGrad, border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(234,88,12,0.5)', zIndex: 1000, fontSize: 20 }}
      >
        {open ? '✕' : '💬'}
      </motion.button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          style={{ position: 'fixed', bottom: 88, right: 24, width: 320, height: 420,
            background: 'rgba(14,9,0,0.97)', border: `1px solid ${T.borderHi}`,
            borderRadius: 16, display: 'flex', flexDirection: 'column', zIndex: 1000,
            overflow: 'hidden', backdropFilter: 'blur(20px)' }}
        >
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border2}`, fontSize: 13, fontWeight: 700, color: T.text }}>
            TradeSpot Assistant
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'rgba(249,115,22,0.25)' : 'rgba(255,255,255,0.06)',
                padding: '8px 12px', borderRadius: 10, fontSize: 12, color: 'rgba(250,248,244,0.85)', maxWidth: '85%',
              }}>{m.text}</div>
            ))}
          </div>
          <div style={{ padding: '10px 12px', borderTop: `1px solid ${T.border}`, display: 'flex', gap: 8 }}>
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="What service do you need?"
              style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: `1px solid ${T.border2}`,
                borderRadius: 8, padding: '6px 10px', fontSize: 12, color: T.text, outline: 'none' }} />
            <button onClick={send}
              style={{ background: T.btnGrad, border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#fff', cursor: 'pointer' }}>→</button>
          </div>
        </motion.div>
      )}
    </>
  )
}

// ── Main ─────────────────────────────────────────────────
export default function HomePage() {
  const router      = useRouter()
  const [query, setQ]     = useState('')
  const [listening, setL] = useState(false)
  const [locating, setLoc] = useState<string | null>(null)
  const recRef = useRef<any>(null)
  const gpsRef = useRef<{ lat: number; lng: number } | null>(null)

  const allCats    = config.categories
  const mobileCats = allCats.slice(0, 8)
  const gridCats   = allCats.slice(0, 8)
  const popCats    = allCats.slice(0, 12)

  function go(q?: string) {
    const term = (q ?? query).trim()
    if (!term) return
    const gps = gpsRef.current
    router.push(gps
      ? `/search?q=${encodeURIComponent(term)}&lat=${gps.lat}&lng=${gps.lng}`
      : `/search?q=${encodeURIComponent(term)}`)
  }

  function nearMe(label: string, id: string) {
    setLoc(id)
    navigator.geolocation.getCurrentPosition(
      pos => {
        gpsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setLoc(null)
        router.push(`/search?q=${encodeURIComponent(label + ' near me')}&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
      },
      () => { setLoc(null); router.push(`/search?q=${encodeURIComponent(label + ' near me')}`) },
      { timeout: 6000 },
    )
  }

  function startVoice() {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) { alert('Voice not supported in this browser'); return }
    const rec = new SR()
    rec.lang = 'en-GB'; rec.continuous = false; rec.interimResults = false
    rec.onstart = () => setL(true)
    rec.onend   = () => setL(false)
    rec.onerror = () => setL(false)
    rec.onresult = (e: any) => {
      const t = e.results[0][0].transcript
      setQ(t)
      router.push(`/search?q=${encodeURIComponent(t)}`)
    }
    recRef.current = rec; rec.start()
  }

  function stopVoice() { recRef.current?.stop(); setL(false) }

  return (
    <div style={{ minHeight: '100vh', background: T.bg, position: 'relative', overflow: 'hidden' }}>
      <Bg />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1080, margin: '0 auto', padding: '0 20px' }}>

        {/* ── HERO ─────────────────────────────────────────── */}
        <section style={{ paddingTop: 56, paddingBottom: 0 }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 99, background: 'rgba(249,115,22,0.10)', border: '1px solid rgba(249,115,22,0.22)', fontSize: 10, fontWeight: 700, color: 'rgba(253,186,116,0.9)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              <Sparkles size={9} /> AI-powered · Free forever
            </span>
            <LivePulse />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            style={{ fontFamily: 'var(--font-display, system-ui)', fontWeight: 900, lineHeight: 1.03, letterSpacing: '-0.035em', color: T.text, margin: '0 0 16px', fontSize: 'clamp(32px, 6vw, 54px)' }}
          >
            Find anything local,{' '}
            <br className="hidden-xs" />
            <span style={{ background: T.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              AI-ranked
            </span>{' '}
            <span style={{ color: T.sub, fontWeight: 700 }}>by real reviews</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: T.sub, lineHeight: 1.65, margin: '0 0 24px', maxWidth: 500 }}
          >
            {config.metaDescription}
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="search-bar"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${listening ? 'rgba(239,68,68,0.5)' : T.border2}`,
              borderRadius: 20,
              padding: '6px 6px 6px 18px',
              boxShadow: '0 16px 56px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03) inset',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              maxWidth: 580,
              marginBottom: 14,
            }}
          >
            <Search size={15} style={{ color: T.muted, flexShrink: 0 }} />
            <input
              type="text"
              value={listening ? '🎤 Listening…' : query}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go()}
              placeholder='"plumber nearby" or "best Thai in Leeds"'
              readOnly={listening}
              autoFocus
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: T.text, minWidth: 0, padding: '10px 0', letterSpacing: '-0.01em' }}
            />
            <button
              onClick={listening ? stopVoice : startVoice}
              style={{ padding: 8, borderRadius: 10, background: listening ? 'rgba(239,68,68,0.15)' : 'transparent', border: 'none', cursor: 'pointer', color: listening ? '#ef4444' : T.muted, flexShrink: 0, transition: 'all 0.2s' }}
              aria-label="Voice search"
            >
              {listening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
            <button
              onClick={() => go()}
              disabled={listening}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 20px', borderRadius: 14, fontWeight: 700, fontSize: 13, color: '#fff', background: T.btnGrad, border: 'none', cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 20px rgba(234,88,12,0.45)', letterSpacing: '-0.01em', minHeight: 44, whiteSpace: 'nowrap', transition: 'opacity 0.2s' }}
            >
              Find <ArrowRight size={13} />
            </button>
          </motion.div>

          {/* Mobile category chips — horizontal scroll */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none', marginBottom: 32 }}
            className="cat-scroll"
          >
            {mobileCats.map(cat => (
              <button
                key={cat.id}
                onClick={() => nearMe(cat.label, cat.id)}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 13px',
                  borderRadius: 99,
                  background: T.s2,
                  border: `1px solid ${T.border}`,
                  fontSize: 12, fontWeight: 500, color: T.sub,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'border-color 0.18s, color 0.18s, background 0.18s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.borderHi; (e.currentTarget as HTMLElement).style.color = T.text; (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.07)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.sub; (e.currentTarget as HTMLElement).style.background = T.s2 }}
              >
                <span style={{ fontSize: 15 }}>{cat.icon}</span>
                <span>{cat.label}</span>
                {locating === cat.id && <span style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid rgba(249,115,22,0.4)', borderTopColor: T.orange, animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
              </button>
            ))}
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 56 }}
          >
            {STATS.map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: T.orange, opacity: 0.7 }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{s.value}</span>
                <span style={{ fontSize: 11, color: T.muted }}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: 56 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
            <div style={{ width: 3, height: 16, borderRadius: 99, background: T.grad, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: T.sub, letterSpacing: '0.08em', textTransform: 'uppercase' }}>How it works</span>
          </div>

          <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {HOW.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 16, padding: '20px 18px', position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: i === 0 ? T.grad : 'transparent', borderRadius: '16px 16px 0 0', opacity: i === 0 ? 1 : 0 }} />
                <div style={{ fontSize: 11, fontWeight: 800, color: T.orange, marginBottom: 10, letterSpacing: '0.06em' }}>{s.n}</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: '0 0 6px', lineHeight: 1.3, letterSpacing: '-0.02em' }}>{s.title}</p>
                <p style={{ fontSize: 12, color: T.muted, margin: 0, lineHeight: 1.6 }}>{s.body}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── POPULAR CATEGORIES ────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: 56 }}
        >
          <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 28 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 3, height: 16, borderRadius: 99, background: T.grad, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 800, color: T.sub, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Popular categories</span>
          </div>

          <div className="pop-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {popCats.map(cat => (
              <button
                key={cat.id}
                onClick={() => nearMe(cat.label, cat.id)}
                disabled={locating === cat.id}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: T.s2, border: `1px solid ${T.border}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.18s', position: 'relative' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.borderHi; (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.06)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.background = T.s2 }}
              >
                {locating === cat.id && (
                  <div style={{ position: 'absolute', inset: 0, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(249,115,22,0.4)', borderTopColor: T.orange, animation: 'spin 0.7s linear infinite' }} />
                  </div>
                )}
                <span style={{ fontSize: 20, lineHeight: 1 }}>{cat.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.sub, textAlign: 'left', lineHeight: 1.3 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── CTA PAIR ─────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ marginBottom: 64 }}
        >
          <div style={{ borderTop: `1px solid ${T.border}`, marginBottom: 20 }} />
          <div className="cta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

            {/* Consumer CTA */}
            <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 18, padding: '22px 22px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(249,115,22,0.06), transparent)', pointerEvents: 'none' }} />
              <h3 style={{ fontFamily: 'var(--font-display, system-ui)', fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 6px', letterSpacing: '-0.025em' }}>Need a local service?</h3>
              <p style={{ fontSize: 12, color: T.muted, margin: '0 0 16px', lineHeight: 1.6 }}>Trades, food, health, professional. AI finds the best near you — instantly.</p>
              <button onClick={() => go('plumber near me')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 18px', minHeight: 44, borderRadius: 12, fontWeight: 700, fontSize: 13, color: '#fff', background: T.btnGrad, border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(234,88,12,0.35)', letterSpacing: '-0.01em', transition: 'opacity 0.2s' }}>
                Search now <ArrowRight size={13} />
              </button>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                {['Free to search', 'No account needed', 'Instant results'].map(t => (
                  <span key={t} style={{ fontSize: 10, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={9} style={{ color: 'rgba(249,115,22,0.55)' }} />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Business CTA */}
            <div style={{ background: 'linear-gradient(140deg, rgba(249,115,22,0.09) 0%, rgba(245,158,11,0.04) 100%)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 18, padding: '22px 22px 20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 12, right: 14, fontSize: 9, fontWeight: 700, padding: '3px 9px', borderRadius: 99, background: 'rgba(249,115,22,0.15)', color: 'rgba(253,186,116,0.9)', border: '1px solid rgba(249,115,22,0.3)' }}>30 days free</div>
              <Wrench size={18} style={{ color: T.orange, marginBottom: 10 }} />
              <h3 style={{ fontFamily: 'var(--font-display, system-ui)', fontSize: 16, fontWeight: 800, color: T.text, margin: '0 0 6px', letterSpacing: '-0.025em' }}>Own a trade business?</h3>
              <p style={{ fontSize: 12, color: T.muted, margin: '0 0 16px', lineHeight: 1.6 }}>Local leads direct to you. 0% commission — ever. Just £15/mo after trial.</p>
              <Link href="/for-businesses" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '11px 18px', minHeight: 44, borderRadius: 12, fontWeight: 700, fontSize: 13, color: '#fff', background: T.btnGrad, textDecoration: 'none', boxShadow: '0 4px 16px rgba(234,88,12,0.35)', letterSpacing: '-0.01em' }}>
                List your trade free <ArrowRight size={13} />
              </Link>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 12 }}>
                {['0% commission', '£15/mo after trial', 'Cancel anytime'].map(t => (
                  <span key={t} style={{ fontSize: 10, color: T.muted, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={9} style={{ color: 'rgba(249,115,22,0.55)' }} />{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ping  { 75%, 100% { transform: scale(2); opacity: 0; } }

        .search-bar:focus-within {
          border-color: rgba(249,115,22,0.5) !important;
          box-shadow: 0 16px 56px rgba(0,0,0,0.5), 0 0 0 3px rgba(249,115,22,0.08) !important;
        }

        /* ── Mobile ──────────────────────────── */
        @media (max-width: 600px) {
          .how-grid { grid-template-columns: 1fr !important; }
          .pop-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
        }

        @media (min-width: 601px) and (max-width: 860px) {
          .pop-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
      `}</style>
      <FloatingChat />
    </div>
  )
}
