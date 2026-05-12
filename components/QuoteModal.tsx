'use client'
import { useState, useRef, useCallback } from 'react'
import { X, Send, CheckCircle, Phone, User, Mail, MapPin, FileText, Mic, MicOff } from 'lucide-react'

interface Business {
  id:    string
  name:  string
  phone: string | null
}

interface Props {
  businesses: Business[]  // pre-selected (e.g. top 3)
  searchQuery: string
  onClose: () => void
}

export default function QuoteModal({ businesses, searchQuery, onClose }: Props) {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [phone, setPhone]         = useState('')
  const [postcode, setPostcode]   = useState('')
  const [job, setJob]             = useState('')
  const [selected, setSelected]   = useState<Set<string>>(new Set(businesses.map(b => b.id)))
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const [listening, setListening] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  const toggleVoice = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SR) return
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }
    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.lang = 'en-GB'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[]).map((r: any) => r[0].transcript).join(' ')
      setJob(transcript)
    }
    rec.onend = () => setListening(false)
    rec.start()
    recognitionRef.current = rec
    setListening(true)
  }, [listening])

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected.size) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/leads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          postcode,
          jobDescription: job,
          businesses: businesses.filter(b => selected.has(b.id)),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to send')
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0f0d1a] border border-white/[0.10] rounded-3xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white font-bold text-lg">Get free quotes</h2>
            <p className="text-white/45 text-xs mt-0.5">One form → sent to {businesses.length} businesses</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors">
            <X size={18} />
          </button>
        </div>

        {done ? (
          /* Success state */
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-400" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Quotes sent!</h3>
            <p className="text-white/55 text-sm mb-1">
              Your request was sent to <strong className="text-white">{selected.size} business{selected.size > 1 ? 'es' : ''}</strong>.
            </p>
            <p className="text-white/40 text-xs mb-6">Check your email for confirmation. Businesses typically respond within 24 hours.</p>
            <div className="flex flex-col gap-3">
              <a
                href={`/portal?email=${encodeURIComponent(email)}`}
                className="block w-full text-center px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-sm transition-colors"
              >
                Track my quotes →
              </a>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/50 font-medium text-sm hover:bg-white/[0.08] transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

            {/* Business selector */}
            <div>
              <p className="text-white/50 text-xs font-medium mb-2">Send quotes to:</p>
              <div className="space-y-2">
                {businesses.map(b => (
                  <label key={b.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${selected.has(b.id) ? 'bg-orange-500/10 border-orange-500/30' : 'bg-white/[0.03] border-white/[0.06] opacity-50'}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(b.id)}
                      onChange={() => toggle(b.id)}
                      className="accent-orange-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm font-medium truncate">{b.name}</div>
                      {b.phone && <div className="text-white/40 text-xs">{b.phone}</div>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Job description */}
            <div>
              <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-1.5">
                <FileText size={12} /> Describe your job *
                <button type="button" onClick={toggleVoice} className={`ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs transition-colors ${listening ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-white/40 hover:text-white/70'}`}>
                  {listening ? <><MicOff size={10} /> Stop</> : <><Mic size={10} /> Voice</>}
                </button>
              </label>
              <textarea
                required
                value={job}
                onChange={e => setJob(e.target.value)}
                placeholder={listening ? '🎤 Listening… speak now' : `e.g. "Need a plumber to fix a leaking pipe under the kitchen sink. Urgently needed."`}
                rows={3}
                className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none resize-none transition-colors ${listening ? 'border-red-500/50 bg-red-500/5' : 'border-white/[0.10] focus:border-orange-500/50'}`}
              />
            </div>

            {/* Name + Postcode */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-1.5">
                  <User size={12} /> Your name *
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-1.5">
                  <MapPin size={12} /> Postcode
                </label>
                <input
                  type="text"
                  value={postcode}
                  onChange={e => setPostcode(e.target.value)}
                  placeholder="SW1A 1AA"
                  className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-1.5">
                  <Mail size={12} /> Email *
                </label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-medium flex items-center gap-1.5 mb-1.5">
                  <Phone size={12} /> Phone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+44 7700 000000"
                  className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-white/30 outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !selected.size}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500 transition-all duration-200 disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> Sending…</>
              ) : (
                <><Send size={16} /> Send to {selected.size} business{selected.size > 1 ? 'es' : ''} — Free</>
              )}
            </button>

            <p className="text-center text-white/25 text-xs pb-1">
              No account needed · Your details only shared with selected businesses
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
