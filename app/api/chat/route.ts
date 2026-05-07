import { NextRequest, NextResponse } from 'next/server'
import { aiChat } from '@/lib/ai'

export const dynamic = 'force-dynamic'

const PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY

const FIELD_MASK = [
  'places.id', 'places.displayName', 'places.formattedAddress',
  'places.rating', 'places.userRatingCount', 'places.internationalPhoneNumber',
  'places.websiteUri', 'places.businessStatus', 'places.location',
].join(',')

async function searchPlaces(query: string, lat?: number, lng?: number): Promise<any[]> {
  if (!PLACES_KEY) return []
  const body: Record<string, unknown> = { textQuery: query, maxResultCount: 5, languageCode: 'en' }
  if (lat && lng) {
    body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius: 50000 } }
  }
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': PLACES_KEY, 'X-Goog-FieldMask': FIELD_MASK },
    body: JSON.stringify(body),
  })
  if (!res.ok) return []
  const data = await res.json()
  return (data.places ?? []).map((p: any) => ({
    name: p.displayName?.text ?? '',
    address: p.formattedAddress ?? '',
    rating: p.rating ?? 0,
    reviews: p.userRatingCount ?? 0,
    phone: p.internationalPhoneNumber ?? null,
    website: p.websiteUri ?? null,
    lat: p.location?.latitude ?? null,
    lng: p.location?.longitude ?? null,
  }))
}

// Detect if the last user message is a local search intent
function extractSearchIntent(text: string): { query: string } | null {
  const lower = text.toLowerCase()
  const patterns = [
    /find\s+(.+?)(?:\s+near(?:by)?|\s+in\s+\w+|$)/i,
    /(?:best|good|top|cheap|nearest?)\s+(.+?)(?:\s+near(?:by)?|\s+in\s+.+|$)/i,
    /(?:where(?:'s| is)(?: the| a)?)\s+(.+?)(?:\s+near(?:by)?|\s+in\s+.+|\?|$)/i,
    /(.+?)\s+near(?:by| me)/i,
    /(.+?)\s+in\s+([a-zA-Z\s,]+)$/i,
  ]
  if (
    /\b(find|search|near(?:by)?|restaurant|cafe|hotel|plumber|electrician|dentist|doctor|mechanic|gym|salon|lawyer|pharmacy|vet|pub|bar|cleaner|builder)\b/.test(lower)
  ) {
    return { query: text.trim() }
  }
  for (const p of patterns) {
    if (p.test(text)) return { query: text.trim() }
  }
  return null
}

function formatPlacesForChat(places: any[]): string {
  if (!places.length) return '\n\n_No results found — try being more specific or adding a city name._'
  return '\n\n' + places.map((p, i) => {
    const rating = p.rating ? `⭐ ${p.rating.toFixed(1)} (${p.reviews} reviews)` : ''
    const phone = p.phone ? `📞 ${p.phone}` : ''
    const web = p.website ? `🌐 [Website](${p.website})` : ''
    const maps = p.lat && p.lng
      ? `📍 [Map](https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng})`
      : `📍 ${p.address}`
    return `**${i + 1}. ${p.name}**\n${[rating, maps, phone, web].filter(Boolean).join(' · ')}`
  }).join('\n\n')
}

export async function POST(req: NextRequest) {
  try {
    const { messages, lat, lng } = await req.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages required' }, { status: 400 })
    }

    const lastMsg = messages[messages.length - 1]?.content ?? ''
    const intent = extractSearchIntent(lastMsg)

    if (intent) {
      // Run Places search in parallel with AI response
      const [places, aiReply] = await Promise.all([
        searchPlaces(intent.query, lat, lng),
        aiChat(messages, `You are a helpful local search assistant for AnyLocal.
When the user asks to find a place or service, give a short 1-2 sentence intro, then say "Here are the top results:" — the actual business listings will be appended automatically after your response.
Keep your response brief. Do not list businesses yourself.`),
      ])

      const placesBlock = formatPlacesForChat(places)
      return NextResponse.json({ reply: aiReply + placesBlock, places })
    }

    // Non-search message — regular AI chat
    const reply = await aiChat(messages, `You are a helpful assistant for AnyLocal, a local business search platform.
Help users find what they need. If they describe something to find, suggest they type it in the chat and you'll search for it.
Keep responses short and helpful.`)
    return NextResponse.json({ reply })
  } catch (err) {
    console.error('/api/chat error:', err)
    return NextResponse.json({ reply: 'Sorry, I had trouble with that. Please try again.' }, { status: 200 })
  }
}
