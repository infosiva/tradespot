'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Business {
  id:    string
  name:  string
  phone: string | null
}

interface Lead {
  id:            string
  name:          string
  job_description: string
  postcode:      string
  businesses:    string // JSON string
  status:        string | null
  response:      string | null
  response_from: string | null
  responded_at:  string | null
  tag:           string | null
  created_at:    string
}

const TAGS = ['urgent', 'booked', 'pending', 'declined', 'archive']

const TAG_COLORS: Record<string, string> = {
  urgent:   'bg-red-500/20 text-red-300 border-red-500/30',
  booked:   'bg-green-500/20 text-green-300 border-green-500/30',
  pending:  'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  declined: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  archive:  'bg-white/5 text-white/40 border-white/10',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function Portal() {
  const params    = useSearchParams()
  const router    = useRouter()
  const [email, setEmail]   = useState(params.get('email') ?? '')
  const [input, setInput]   = useState(params.get('email') ?? '')
  const [leads, setLeads]   = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [tagging, setTagging] = useState<string | null>(null)

  const fetchLeads = useCallback(async (e: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/my-leads?email=${encodeURIComponent(e)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      setLeads(data.leads)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (email) fetchLeads(email)
  }, [email, fetchLeads])

  function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = input.trim().toLowerCase()
    if (!trimmed) return
    setEmail(trimmed)
    router.replace(`/portal?email=${encodeURIComponent(trimmed)}`)
  }

  async function setTag(leadId: string, tag: string) {
    setTagging(leadId)
    try {
      await fetch('/api/my-leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, email, tag }),
      })
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, tag } : l))
    } finally {
      setTagging(null)
    }
  }

  const responded = leads.filter(l => l.status === 'responded')
  const pending   = leads.filter(l => l.status !== 'responded')

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">My Quote Portal</h1>
        <p className="text-white/50 text-sm">Track your quote requests and business responses</p>
      </div>

      {/* Email lookup */}
      <form onSubmit={handleLookup} className="mb-10">
        <div className="flex gap-3">
          <input
            type="email"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Your email address"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-orange-500/50 text-sm"
            required
          />
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            View my quotes
          </button>
        </div>
      </form>

      {loading && (
        <div className="text-center py-16 text-white/40">Loading your quotes…</div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm mb-6">{error}</div>
      )}

      {!loading && email && leads.length === 0 && !error && (
        <div className="text-center py-16 text-white/40">
          <div className="text-4xl mb-4">📋</div>
          <p>No quote requests found for <strong className="text-white/60">{email}</strong></p>
          <p className="text-sm mt-2">Try searching for a local business and submit a quote request.</p>
        </div>
      )}

      {/* Responses section */}
      {responded.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
            Responses received ({responded.length})
          </h2>
          <div className="flex flex-col gap-4">
            {responded.map(lead => (
              <LeadCard key={lead.id} lead={lead} onTag={setTag} tagging={tagging} />
            ))}
          </div>
        </section>
      )}

      {/* Pending section */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />
            Awaiting response ({pending.length})
          </h2>
          <div className="flex flex-col gap-4">
            {pending.map(lead => (
              <LeadCard key={lead.id} lead={lead} onTag={setTag} tagging={tagging} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function LeadCard({ lead, onTag, tagging }: {
  lead:    Lead
  onTag:   (id: string, tag: string) => void
  tagging: string | null
}) {
  const [showTags, setShowTags] = useState(false)
  let businesses: Business[] = []
  try { businesses = JSON.parse(lead.businesses ?? '[]') } catch {}

  const hasResponse = lead.status === 'responded'

  return (
    <div className={`
      rounded-2xl border p-5 transition-colors
      ${hasResponse
        ? 'bg-green-500/5 border-green-500/20'
        : 'bg-white/[0.02] border-white/[0.06]'
      }
    `}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm leading-relaxed">{lead.job_description}</p>
          {lead.postcode && (
            <p className="text-white/40 text-xs mt-1">📍 {lead.postcode}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lead.tag && (
            <span className={`text-xs px-2 py-0.5 rounded-full border ${TAG_COLORS[lead.tag] ?? 'bg-white/5 text-white/40 border-white/10'}`}>
              {lead.tag}
            </span>
          )}
          <span className="text-white/30 text-xs">{timeAgo(lead.created_at)}</span>
        </div>
      </div>

      {/* Businesses contacted */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {businesses.map(b => (
          <span key={b.id} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-white/60">
            {b.name}
          </span>
        ))}
      </div>

      {/* Response block */}
      {hasResponse && lead.response && (
        <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          <div className="text-xs text-green-400 font-medium mb-1.5">
            {lead.response_from} replied {lead.responded_at ? timeAgo(lead.responded_at) : ''}
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{lead.response}</p>
        </div>
      )}

      {!hasResponse && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-white/30">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400/60 inline-block" />
          Waiting for response
        </div>
      )}

      {/* Tag control */}
      <div className="mt-4 flex items-center justify-between">
        <div className="relative">
          <button
            onClick={() => setShowTags(v => !v)}
            disabled={tagging === lead.id}
            className="text-xs text-white/30 hover:text-white/60 transition-colors flex items-center gap-1"
          >
            🏷 Tag this
          </button>
          {showTags && (
            <div className="absolute bottom-full left-0 mb-2 bg-[#1a1030] border border-white/10 rounded-xl p-2 flex flex-wrap gap-1.5 z-10 min-w-[200px]">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => { onTag(lead.id, tag); setShowTags(false) }}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors hover:opacity-80 ${TAG_COLORS[tag] ?? 'bg-white/5 text-white/40 border-white/10'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        {hasResponse && (
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`Hi, I got your quote response on AnyLocal for: ${lead.job_description}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
          >
            Share response →
          </a>
        )}
      </div>
    </div>
  )
}
