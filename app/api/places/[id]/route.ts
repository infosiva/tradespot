/**
 * GET /api/places/[id] — Place Details + AI review summary
 *
 * Fetches up to 5 reviews from Google Places, then uses Groq/AI to
 * generate an honest summary covering: quality, punctuality, value, reliability.
 *
 * Cache: 1h in-memory to avoid duplicate AI + Places calls.
 */
import { NextRequest, NextResponse } from 'next/server'
import { callAI } from '@/lib/ai'

const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY

const FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'rating',
  'userRatingCount',
  'internationalPhoneNumber',
  'websiteUri',
  'regularOpeningHours',
  'reviews',
].join(',')

// 1-hour in-memory cache
const _cache = new Map<string, { data: unknown; ts: number }>()
const TTL = 60 * 60 * 1000

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  if (!PLACES_KEY) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
  }

  // Cache hit
  const cached = _cache.get(id)
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data)
  }

  try {
    // ── 1. Fetch place details + reviews ─────────────────────────────
    const res = await fetch(`https://places.googleapis.com/v1/places/${id}`, {
      headers: {
        'X-Goog-Api-Key': PLACES_KEY,
        'X-Goog-FieldMask': FIELD_MASK,
      },
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: 'Places API error', detail: err.slice(0, 200) }, { status: 502 })
    }

    const place = await res.json() as PlaceDetail

    // ── 2. AI review summary ─────────────────────────────────────────
    let aiSummary: string | null = null
    const reviews = place.reviews ?? []

    if (reviews.length > 0) {
      const reviewText = reviews
        .slice(0, 5)
        .map((r, i) => `Review ${i + 1} (${r.rating}/5): ${r.text?.text ?? ''}`)
        .join('\n\n')

      try {
        const { text } = await callAI(
          `You are an expert at analysing customer reviews for tradespeople and home service businesses.
Be honest, balanced, and concise. Always cover: quality of work, punctuality/reliability, value for money, communication.
If reviews mention negatives, include them. Do not make up information not in the reviews.`,
          [{
            role: 'user',
            content: `Summarise these reviews for "${place.displayName?.text ?? 'this business'}" in 2-3 sentences. Be honest about both positives and negatives.\n\nReviews:\n${reviewText}`,
          }],
          300,
          'fast',
        )
        aiSummary = text
      } catch (e) {
        console.warn('[Places/AI] Summary failed:', e)
      }
    }

    // ── 3. Build response ────────────────────────────────────────────
    const result = {
      id:        place.id,
      name:      place.displayName?.text ?? 'Unknown',
      address:   place.formattedAddress ?? '',
      rating:    place.rating ?? 0,
      reviews:   place.userRatingCount ?? 0,
      phone:     place.internationalPhoneNumber ?? null,
      website:   place.websiteUri ?? null,
      open:      place.regularOpeningHours?.openNow ?? null,
      rawReviews: reviews.slice(0, 5).map(r => ({
        rating:  r.rating,
        text:    r.text?.text ?? '',
        author:  r.authorAttribution?.displayName ?? 'Anonymous',
        time:    r.relativePublishTimeDescription ?? '',
      })),
      aiSummary,
    }

    _cache.set(id, { data: result, ts: Date.now() })
    return NextResponse.json(result)

  } catch (e: any) {
    console.error('[Places/[id]] Error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Types
interface PlaceDetail {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
  internationalPhoneNumber?: string
  websiteUri?: string
  regularOpeningHours?: { openNow?: boolean }
  reviews?: Array<{
    rating: number
    text?: { text: string }
    authorAttribution?: { displayName: string }
    relativePublishTimeDescription?: string
  }>
}
