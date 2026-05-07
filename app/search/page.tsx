'use client'
import { useEffect, useState, useRef, Suspense, lazy } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, ArrowRight, Star, Phone, Globe, MapPin, Clock, ChevronDown, ChevronUp, List, Map, Mic, MicOff, MessageSquarePlus } from 'lucide-react'
import QuoteModal from '@/components/QuoteModal'

const MapView = lazy(() => import('@/components/MapView'))

interface PlaceResult {
  id:       string
  name:     string
  address:  string
  rating:   number
  reviews:  number
  phone:    string | null
  website:  string | null
  open:     boolean | null
  score:    number
  lat:      number | null
  lng:      number | null
}

interface PlaceDetail extends PlaceResult {
  rawReviews: { rating: number; text: string; author: string; time: string }[]
  aiSummary:  string | null
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            size={12}
            className={i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
          />
        ))}
      </div>
      <span className="text-white/60 text-xs font-medium">{rating.toFixed(1)}</span>
      <span className="text-white/30 text-xs">({count.toLocaleString()} reviews)</span>
    </div>
  )
}

function TrustBadge({ score }: { score: number }) {
  const pct = Math.min(100, Math.round((score / 20) * 100))
  const label = pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : pct >= 40 ? 'Fair' : 'Limited data'
  const color = pct >= 80 ? 'text-green-400 bg-green-400/10 border-green-400/20'
              : pct >= 60 ? 'text-amber-400 bg-amber-400/10 border-amber-400/20'
              : 'text-white/40 bg-white/[0.04] border-white/10'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>
      {label}
    </span>
  )
}

function ResultCard({ place, rank }: { place: PlaceResult; rank: number }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail]     = useState<PlaceDetail | null>(null)
  const [loading, setLoading]   = useState(false)

  async function expand() {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (detail) return
    setLoading(true)
    try {
      const res = await fetch(`/api/places/${place.id}`)
      const d = await res.json()
      setDetail(d)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-orange-500/20 transition-all duration-200">
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
            ${rank === 1 ? 'bg-amber-500/20 text-amber-300' : rank === 2 ? 'bg-white/[0.08] text-white/60' : 'bg-white/[0.04] text-white/40'}`}>
            #{rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-bold text-white text-base leading-snug">{place.name}</h3>
                <div className="flex items-center gap-1.5 mt-1 text-white/40 text-xs">
                  <MapPin size={11} />
                  <span className="truncate max-w-xs">{place.address}</span>
                </div>
              </div>
              <TrustBadge score={place.score} />
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-3">
              {place.rating > 0 && <StarRating rating={place.rating} count={place.reviews} />}
              {place.open === true && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <Clock size={11} /> Open now
                </span>
              )}
              {place.open === false && (
                <span className="text-xs text-red-400/70 flex items-center gap-1">
                  <Clock size={11} /> Closed
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {place.phone && (
                <a
                  href={`tel:${place.phone}`}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-300 hover:bg-orange-500/25 transition-colors"
                >
                  <Phone size={12} /> {place.phone}
                </a>
              )}
              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.10] text-white/60 hover:text-white/80 transition-colors"
                >
                  <Globe size={12} /> Website
                </a>
              )}
              {place.reviews > 0 && (
                <button
                  onClick={expand}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/50 hover:text-white/70 transition-colors"
                >
                  {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  AI review summary
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded: AI summary + reviews */}
      {expanded && (
        <div className="border-t border-white/[0.06] px-5 py-4 bg-white/[0.02]">
          {loading && (
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <div className="w-3 h-3 rounded-full border border-orange-500/60 border-t-transparent animate-spin" />
              Loading AI review analysis...
            </div>
          )}
          {detail && (
            <div className="space-y-4">
              {detail.aiSummary && (
                <div>
                  <div className="text-xs font-semibold text-orange-400 mb-2 flex items-center gap-1.5">
                    🤖 AI summary
                  </div>
                  <p className="text-white/70 text-sm leading-relaxed">{detail.aiSummary}</p>
                </div>
              )}
              {detail.rawReviews.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-white/40 mb-2">Customer reviews</div>
                  <div className="space-y-2">
                    {detail.rawReviews.slice(0, 3).map((r, i) => (
                      <div key={i} className="text-xs text-white/50 bg-white/[0.03] rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={9} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-white/20'} />
                            ))}
                          </div>
                          <span className="font-medium text-white/60">{r.author}</span>
                          <span className="text-white/30">{r.time}</span>
                        </div>
                        <p className="leading-snug line-clamp-3">{r.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery]     = useState(initialQuery)
  const [results, setResults] = useState<PlaceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [searched, setSearched] = useState(initialQuery)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [locationLabel, setLocationLabel] = useState<string | null>(null)
  const [openNowOnly, setOpenNowOnly] = useState(false)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const didSearch = useRef(false)
  const cachedCoords = useRef<{ lat: number; lng: number; city: string | null } | null>(null)
  const coordsReady  = useRef<Promise<void> | null>(null)

  // Kick off geolocation immediately on mount — cache result for doSearch
  useEffect(() => {
    coordsReady.current = new Promise(resolve => {
      if (!navigator.geolocation) return resolve()
      navigator.geolocation.getCurrentPosition(
        async pos => {
          const { latitude: lat, longitude: lng } = pos.coords
          let city: string | null = null
          try {
            const r = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
              { headers: { 'Accept-Language': 'en' } }
            )
            const d = await r.json()
            const a = d.address ?? {}
            city = a.city ?? a.town ?? a.village ?? a.county ?? null
          } catch {}
          cachedCoords.current = { lat, lng, city }
          resolve()
        },
        () => resolve(),
        { timeout: 5000 }
      )
    })
  }, [])

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
      doSearch(transcript)
    }

    recognitionRef.current = rec
    rec.start()
  }

  function stopVoice() {
    recognitionRef.current?.stop()
    setListening(false)
  }

  // Heuristic: query already mentions a location if it contains "in", "near", "at" + a word
  function hasLocation(q: string): boolean {
    return /\b(in|near|at|around)\s+\w/i.test(q)
  }

  async function doSearch(q: string) {
    if (!q.trim()) return
    const finalQ = q.trim()

    let coords: { lat: number; lng: number } | null = null

    // Wait for cached geolocation (already requested on mount)
    if (!hasLocation(finalQ)) {
      if (coordsReady.current) await coordsReady.current
      const detected = cachedCoords.current
      if (detected) {
        coords = { lat: detected.lat, lng: detected.lng }
        setLocationLabel(detected.city)
      } else {
        setLocationLabel(null)
      }
    } else {
      setLocationLabel(null)
    }

    setLoading(true)
    setError(null)
    setResults([])
    setSearched(finalQ)
    router.replace(`/search?q=${encodeURIComponent(q.trim())}`, { scroll: false })

    try {
      const res  = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQ, ...(coords ?? {}) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      setResults(data.results ?? [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialQuery && !didSearch.current) {
      didSearch.current = true
      doSearch(initialQuery)
    }
  }, [initialQuery])

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">

      {/* Search bar */}
      <div className={`flex items-center gap-3 bg-white/[0.06] border rounded-2xl px-5 py-4 mb-8 transition-colors ${listening ? 'border-red-500/60 bg-red-500/[0.04]' : 'border-white/[0.12] focus-within:border-orange-500/50'}`}>
        <Search size={20} className="text-white/40 flex-shrink-0" />
        <input
          type="text"
          value={listening ? '🎤 Listening…' : query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch(query)}
          placeholder='e.g. "plumber nearby" or "dentist in Manchester"'
          className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-base"
          readOnly={listening}
          autoFocus
        />
        {/* Mic button */}
        <button
          onClick={listening ? stopVoice : startVoice}
          title={listening ? 'Stop listening' : 'Search by voice'}
          className={`flex-shrink-0 p-2 rounded-xl transition-all duration-200 ${listening ? 'bg-red-500/25 text-red-400 animate-pulse' : 'bg-white/[0.06] text-white/40 hover:text-white/70 hover:bg-white/[0.10]'}`}
        >
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button
          onClick={() => doSearch(query)}
          disabled={loading || listening}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'} <ArrowRight size={16} />
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center gap-4 py-20 text-white/50">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500/60 border-t-transparent animate-spin" />
          <p className="text-sm">Searching Google Places for &ldquo;{searched}&rdquo;…</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-sm flex items-center gap-2 flex-wrap">
              {results.length} result{results.length !== 1 ? 's' : ''} for <span className="text-white/80">&ldquo;{searched}&rdquo;</span>
              {locationLabel && (
                <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/25 text-orange-300">
                  <MapPin size={10} /> Auto-detected: {locationLabel}
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Open now toggle */}
              <button
                onClick={() => setOpenNowOnly(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${openNowOnly ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:text-white/60'}`}
              >
                <Clock size={12} /> Open now
              </button>
              {/* Get quotes CTA */}
              <button
                onClick={() => setShowQuoteModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30 transition-all"
              >
                <MessageSquarePlus size={12} /> Get free quotes
              </button>
              {/* List/Map toggle */}
              <div className="flex items-center gap-1 bg-white/[0.06] border border-white/[0.10] rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-orange-500/25 text-orange-300' : 'text-white/40 hover:text-white/60'}`}
                >
                  <List size={13} /> List
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${viewMode === 'map' ? 'bg-orange-500/25 text-orange-300' : 'text-white/40 hover:text-white/60'}`}
                >
                  <Map size={13} /> Map
                </button>
              </div>
            </div>
          </div>

          {(() => {
            const filtered = openNowOnly ? results.filter(r => r.open === true) : results
            return viewMode === 'list' ? (
              filtered.length > 0 ? (
                <div className="space-y-4">
                  {filtered.map((place, i) => (
                    <ResultCard key={place.id} place={place} rank={i + 1} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-white/40 text-sm">
                  No open businesses found right now. <button className="text-orange-400 underline" onClick={() => setOpenNowOnly(false)}>Show all</button>
                </div>
              )
            ) : (
              <Suspense fallback={<div className="h-96 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 text-sm">Loading map…</div>}>
                <MapView results={filtered} />
              </Suspense>
            )
          })()}

          <p className="text-center text-white/25 text-xs mt-8">
            Results from Google Places API · AI review analysis by AnyLocal
          </p>
        </>
      )}

      {/* Empty state */}
      {!loading && !error && results.length === 0 && searched && (
        <div className="text-center py-20 text-white/40">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-base mb-1">No results found for &ldquo;{searched}&rdquo;</p>
          <p className="text-sm">Try adding a city name or being more specific</p>
        </div>
      )}

      {/* Prompt if no search yet */}
      {!loading && !error && !searched && (
        <div className="text-center py-20 text-white/40">
          <div className="text-4xl mb-4">🔧</div>
          <p className="text-sm">Enter a trade and location above to get started</p>
        </div>
      )}

      {/* Quote modal */}
      {showQuoteModal && results.length > 0 && (
        <QuoteModal
          businesses={results.slice(0, 5).map(r => ({ id: r.id, name: r.name, phone: r.phone }))}
          searchQuery={searched}
          onClose={() => setShowQuoteModal(false)}
        />
      )}

    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-white/40">Loading...</div>}>
      <SearchPageInner />
    </Suspense>
  )
}
