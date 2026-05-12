'use client'
import { useEffect, useState, useRef, Suspense, lazy } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Mic, MicOff } from 'lucide-react'
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels'
import QuoteModal from '@/components/QuoteModal'
import ResultCard, { PlaceResult } from '@/components/ResultCard'

const MapView = lazy(() => import('@/components/MapView'))

function SearchPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''
  const urlLat = parseFloat(searchParams.get('lat') ?? '')
  const urlLng = parseFloat(searchParams.get('lng') ?? '')
  const urlHasGps = !isNaN(urlLat) && !isNaN(urlLng)

  const [query, setQuery]           = useState(initialQuery)
  const [results, setResults]       = useState<PlaceResult[]>([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [searched, setSearched]     = useState(initialQuery)
  const [locationLabel, setLocationLabel] = useState<string | null>(null)
  const [openNowOnly, setOpenNowOnly]     = useState(searchParams.get('openNow') === '1')
  const [minRating, setMinRating]         = useState<number>(parseFloat(searchParams.get('minRating') ?? '0') || 0)
  const [sortBy, setSortBy]               = useState<'relevance' | 'distance' | 'rating'>(
    (searchParams.get('sort') as 'relevance' | 'distance' | 'rating') ?? 'relevance'
  )
  const [activeId, setActiveId]           = useState<string | null>(null)
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteTarget, setQuoteTarget]       = useState<PlaceResult | null>(null)
  const [listening, setListening]           = useState(false)
  const recognitionRef = useRef<any>(null)
  const didSearch = useRef(false)
  const cachedCoords = useRef<{ lat: number; lng: number; city: string | null } | null>(
    urlHasGps ? { lat: urlLat, lng: urlLng, city: null } : null
  )
  const coordsReady = useRef<Promise<void> | null>(null)

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
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Voice not supported in this browser'); return }
    const rec = new SpeechRecognition()
    rec.lang = 'en-GB'; rec.continuous = false; rec.interimResults = false
    rec.onstart  = () => setListening(true)
    rec.onend    = () => setListening(false)
    rec.onerror  = () => setListening(false)
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript
      setQuery(transcript)
      doSearch(transcript)
    }
    recognitionRef.current = rec; rec.start()
  }

  function stopVoice() { recognitionRef.current?.stop(); setListening(false) }

  function hasLocation(q: string): boolean {
    return /\b(in|near|at|around)\s+\w/i.test(q)
  }

  async function doSearch(q: string) {
    if (!q.trim()) return
    const finalQ = q.trim()
    setLoading(true); setError(null); setResults([]); setActiveId(null)
    setSearched(finalQ)

    let coords: { lat: number; lng: number } | null = null
    if (!hasLocation(finalQ)) {
      if (coordsReady.current) await coordsReady.current
      const detected = cachedCoords.current
      if (detected) {
        coords = { lat: detected.lat, lng: detected.lng }
        setLocationLabel(detected.city)
      }
    } else {
      setLocationLabel(null)
    }

    router.replace(`/search?q=${encodeURIComponent(finalQ)}`, { scroll: false })

    try {
      const res = await fetch('/api/places', {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync filters to URL
  useEffect(() => {
    const p = new URLSearchParams(searchParams.toString())
    openNowOnly ? p.set('openNow', '1') : p.delete('openNow')
    minRating > 0 ? p.set('minRating', String(minRating)) : p.delete('minRating')
    sortBy !== 'relevance' ? p.set('sort', sortBy) : p.delete('sort')
    router.replace(`?${p.toString()}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openNowOnly, minRating, sortBy])

  const userLat = cachedCoords.current?.lat ?? null
  const userLng = cachedCoords.current?.lng ?? null

  function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  const filteredResults = results
    .filter(r => !openNowOnly || r.open === true)
    .filter(r => minRating === 0 || r.rating >= minRating)
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'distance' && userLat !== null && userLng !== null) {
        const dA = (a.lat && a.lng) ? haversineKm(userLat, userLng, a.lat, a.lng) : 999
        const dB = (b.lat && b.lng) ? haversineKm(userLat, userLng, b.lat, b.lng) : 999
        return dA - dB
      }
      return b.score - a.score
    })

  function cycleRating() {
    setMinRating(prev => prev === 0 ? 4.0 : prev === 4.0 ? 4.5 : 0)
  }

  const ratingLabel = minRating === 4.5 ? '⭐ 4.5+' : minRating === 4.0 ? '⭐ 4.0+' : '⭐ Rating'

  return (
    <div className="min-h-screen bg-[#080712] flex flex-col">
      {/* Sticky search bar */}
      <div className="sticky top-0 z-30 bg-[#080712]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-[1400px] mx-auto space-y-3">
          {/* Search input row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && doSearch(query)}
                placeholder="Search tradespeople, services..."
                className="w-full bg-white/[0.06] border border-white/[0.10] rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/40"
              />
            </div>
            <button
              onClick={listening ? stopVoice : startVoice}
              className={`p-2.5 rounded-xl border transition-colors ${listening ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/[0.06] border-white/[0.10] text-white/50 hover:text-white/70'}`}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={() => doSearch(query)}
              disabled={loading}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'Search'}
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setOpenNowOnly(p => !p)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${openNowOnly ? 'bg-green-500/20 border-green-500/40 text-green-300' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'}`}
            >
              Open now
            </button>
            <button
              onClick={cycleRating}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${minRating > 0 ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70'}`}
            >
              {ratingLabel}
            </button>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'relevance' | 'distance' | 'rating')}
              className="text-xs px-3 py-1.5 rounded-full border bg-white/[0.04] border-white/[0.08] text-white/50 focus:outline-none focus:border-orange-500/30"
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="distance">Sort: Distance</option>
              <option value="rating">Sort: Rating</option>
            </select>
            {filteredResults.length > 0 && (
              <span className="text-xs text-white/30 ml-auto">
                {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                {locationLabel ? ` near ${locationLabel}` : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Split pane body — resizable on desktop, stacked on mobile */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full">
        {/* Mobile: stacked layout */}
        <div className="md:hidden px-4 py-4 space-y-3">
          {loading && (
            <div className="flex items-center gap-3 text-white/40 text-sm py-8 justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-orange-500/60 border-t-transparent animate-spin" />
              Searching...
            </div>
          )}
          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-4">{error}</div>
          )}
          {!loading && filteredResults.length === 0 && searched && !error && (
            <div className="text-white/40 text-sm py-8 text-center">No results for &ldquo;{searched}&rdquo;</div>
          )}
          {!loading && !searched && (
            <div className="text-white/30 text-sm py-12 text-center">
              <div className="text-3xl mb-3">🔧</div>
              Enter a trade and location above to get started
            </div>
          )}
          {filteredResults.map((place, i) => (
            <ResultCard
              key={place.id}
              place={place}
              rank={i + 1}
              userLat={userLat}
              userLng={userLng}
              active={activeId === place.id}
              onRequestQuote={p => { setQuoteTarget(p); setShowQuoteModal(true) }}
              onActivate={id => setActiveId(prev => prev === id ? null : id)}
            />
          ))}
        </div>

        {/* Desktop: resizable split pane */}
        <div className="hidden md:block h-[calc(100vh-120px)]">
          <PanelGroup orientation="horizontal" className="h-full">
            <Panel defaultSize={35} minSize={20} maxSize={60}>
              <div className="h-full overflow-y-auto px-4 py-4 space-y-3">
                {loading && (
                  <div className="flex items-center gap-3 text-white/40 text-sm py-8 justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-orange-500/60 border-t-transparent animate-spin" />
                    Searching...
                  </div>
                )}
                {error && (
                  <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-4">{error}</div>
                )}
                {!loading && filteredResults.length === 0 && searched && !error && (
                  <div className="text-white/40 text-sm py-8 text-center">No results for &ldquo;{searched}&rdquo;</div>
                )}
                {!loading && !searched && (
                  <div className="text-white/30 text-sm py-12 text-center">
                    <div className="text-3xl mb-3">🔧</div>
                    Enter a trade and location above to get started
                  </div>
                )}
                {filteredResults.map((place, i) => (
                  <ResultCard
                    key={place.id}
                    place={place}
                    rank={i + 1}
                    userLat={userLat}
                    userLng={userLng}
                    active={activeId === place.id}
                    onRequestQuote={p => { setQuoteTarget(p); setShowQuoteModal(true) }}
                    onActivate={id => setActiveId(prev => prev === id ? null : id)}
                  />
                ))}
              </div>
            </Panel>

            <PanelResizeHandle className="w-1.5 mx-0.5 flex items-center justify-center group cursor-col-resize">
              <div className="w-1 h-12 rounded-full bg-white/[0.08] group-hover:bg-orange-500/40 transition-colors" />
            </PanelResizeHandle>

            <Panel defaultSize={65} minSize={40}>
              <div className="h-full p-4">
                <Suspense fallback={<div className="h-full rounded-2xl bg-white/[0.03] border border-white/[0.06]" />}>
                  <MapView
                    results={filteredResults}
                    activeId={activeId}
                    onPinClick={id => setActiveId(prev => prev === id ? null : id)}
                  />
                </Suspense>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {showQuoteModal && results.length > 0 && (
        <QuoteModal
          businesses={
            quoteTarget
              ? [{ id: quoteTarget.id, name: quoteTarget.name, phone: quoteTarget.phone }]
              : filteredResults.slice(0, 3).map(r => ({ id: r.id, name: r.name, phone: r.phone }))
          }
          searchQuery={searched}
          onClose={() => { setShowQuoteModal(false); setQuoteTarget(null) }}
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
