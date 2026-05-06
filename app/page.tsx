'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import config from '@/vertical.config'
import { Search, ArrowRight, Star, Shield, Zap, MapPin } from 'lucide-react'

const POPULAR_SEARCHES = [
  'Plumber in London',
  'Electrician near me',
  'Builder in Manchester',
  'Cleaner in Sydney',
  'Gardener in New York',
  'HVAC in Dubai',
]

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(q?: string) {
    const term = q ?? query
    if (!term.trim()) return
    router.push(`/search?q=${encodeURIComponent(term.trim())}`)
  }

  return (
    <div className="overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative px-6 pt-20 pb-24 max-w-5xl mx-auto text-center">
        {/* Glow blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-20 blur-3xl -z-10 bg-gradient-to-br from-orange-600 to-amber-400" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-medium mb-6">
          <Zap size={12} />
          AI-ranked by real reviews — free to use
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
          <span className="text-white">Find trusted tradespeople </span>
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">near you, anywhere</span>
        </h1>

        <p className="text-white/55 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
          Type what you need and where — our AI searches Google&apos;s business database, reads hundreds of reviews,
          and gives you an honest summary. No spin, no paid placements.
        </p>

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto">
          <div className="flex items-center gap-3 bg-white/[0.06] border border-white/[0.12] rounded-2xl px-5 py-4 focus-within:border-orange-500/50 transition-colors">
            <Search size={20} className="text-white/40 flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder='e.g. "plumber in London" or "electrician near Sydney"'
              className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-base"
            />
            <button
              onClick={() => handleSearch()}
              className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all duration-200 shadow-lg shadow-orange-500/20"
            >
              Search <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Quick searches */}
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
          <span className="flex items-center gap-1.5"><Star size={14} className="text-orange-400" />AI sentiment analysis</span>
          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-orange-400" />Global coverage</span>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="border-y border-white/[0.06] py-8 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { n: '200M+', l: 'Businesses indexed' },
            { n: '50+',   l: 'Countries covered' },
            { n: '< 10s', l: 'To get results' },
            { n: '£0',    l: 'To search' },
          ].map(s => (
            <div key={s.l}>
              <div className="text-2xl font-extrabold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">{s.n}</div>
              <div className="text-white/45 text-sm mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRADE CATEGORIES ─────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Browse by trade</h2>
          <p className="text-white/45">Or search anything above — we cover all trades globally</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {config.tradeCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleSearch(cat.label)}
              className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm rounded-2xl hover:border-orange-500/30 hover:bg-white/[0.06] transition-all duration-200 hover:shadow-xl hover:shadow-orange-500/20 p-5 flex flex-col gap-2 group text-left"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="font-semibold text-white">{cat.label}</span>
              <span className="text-white/45 text-xs leading-snug">{cat.synonyms.slice(0, 2).join(', ')}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How {config.name} works</h2>
            <p className="text-white/45">Not just star ratings — AI reads what people actually said</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', step: '1', title: 'Type what you need', desc: 'Tell us the trade and your location in plain English. No forms or tick boxes.' },
              { icon: '🤖', step: '2', title: 'AI reads the reviews', desc: 'We fetch real Google reviews and use AI to summarise punctuality, quality, and value.' },
              { icon: '📞', step: '3', title: 'Call the best match', desc: 'See honest rankings and contact details. No booking fees — call them directly.' },
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

      {/* ── WHY TRADESPOT ────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Not just another directory</h2>
          <p className="text-white/45">We built what the others are missing</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🧠', title: 'AI review analysis', desc: 'We don\'t just show star ratings. AI reads every review to surface what customers actually experienced.' },
            { icon: '🌍', title: 'Global coverage', desc: 'Works in London, Sydney, New York, Dubai — anywhere Google Maps has businesses.' },
            { icon: '⚡', title: 'Real-time results', desc: 'Live data from Google Places — no stale listings, no out-of-date phone numbers.' },
            { icon: '🔒', title: 'No paid rankings', desc: 'Rankings are based purely on review sentiment and volume. We don\'t accept sponsored placements.' },
            { icon: '💬', title: 'Honest summaries', desc: 'AI gives you the good and the bad — not a curated highlight reel.' },
            { icon: '📱', title: 'Direct contact', desc: 'Get phone numbers and addresses instantly. No middleman booking fee.' },
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
            Find your tradesperson now
          </h2>
          <p className="text-white/50 mb-8 text-lg relative">Free to use. No registration. Results in seconds.</p>
          <div className="relative flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="text"
              placeholder='e.g. "plumber in Manchester"'
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
