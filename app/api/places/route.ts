/**
 * POST /api/places — Google Places Text Search
 * Body: { query: string }  e.g. "plumber in London"
 *
 * Returns top results with name, address, rating, review count, phone, website.
 * Uses field masks to minimise billing cost.
 */
import { NextRequest, NextResponse } from 'next/server'

const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY

// Fields we fetch — only pay for what we use
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.regularOpeningHours',
  'places.businessStatus',
  'places.types',
  'places.location',
].join(',')

export async function POST(req: NextRequest) {
  if (!PLACES_KEY) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const query: string = (body.query ?? '').trim()
  const lat: number | null = typeof body.lat === 'number' ? body.lat : null
  const lng: number | null = typeof body.lng === 'number' ? body.lng : null

  if (!query || query.length < 3) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 })
  }

  const placesBody: Record<string, unknown> = {
    textQuery: query,
    maxResultCount: 10,
    languageCode: 'en',
  }

  // Bias results toward user's GPS coords if provided (radius 50km)
  if (lat !== null && lng !== null) {
    placesBody.locationBias = {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: 50000,
      },
    }
  }

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_KEY,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify(placesBody),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Places] API error:', err)
      return NextResponse.json({ error: 'Places API error', detail: err.slice(0, 200) }, { status: 502 })
    }

    const data = await res.json() as { places?: PlaceResult[] }
    const places = data.places ?? []

    // Sort by a composite trust score: rating * log(review_count + 1)
    const scored = places
      .filter(p => p.businessStatus === 'OPERATIONAL' || !p.businessStatus)
      .map(p => ({
        id:       p.id,
        name:     p.displayName?.text ?? 'Unknown',
        address:  p.formattedAddress ?? '',
        rating:   p.rating ?? 0,
        reviews:  p.userRatingCount ?? 0,
        phone:    p.internationalPhoneNumber ?? null,
        website:  p.websiteUri ?? null,
        open:     p.regularOpeningHours?.openNow ?? null,
        score:    (p.rating ?? 0) * Math.log((p.userRatingCount ?? 0) + 1),
        lat:      p.location?.latitude ?? null,
        lng:      p.location?.longitude ?? null,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)

    return NextResponse.json({ results: scored, query })

  } catch (e: any) {
    console.error('[Places] Unexpected error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// Type for the Places API v1 response
interface PlaceResult {
  id: string
  displayName?: { text: string; languageCode: string }
  formattedAddress?: string
  rating?: number
  userRatingCount?: number
  internationalPhoneNumber?: string
  websiteUri?: string
  businessStatus?: string
  types?: string[]
  location?: { latitude: number; longitude: number }
  regularOpeningHours?: { openNow?: boolean }
}
