/**
 * Email drip helpers — Resend Contacts + Audiences
 *
 * Strategy (free tier compatible):
 * 1. On subscribe: add contact to Resend Audience, send email 1 immediately
 * 2. Vercel cron (daily) hits /api/drip-cron → sends emails 2/3/4 based on days since created
 *
 * Requires env vars:
 *   RESEND_API_KEY
 *   RESEND_AUDIENCE_ID  (optional — auto-fetched from first audience if not set)
 */

import { Resend } from 'resend'

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

let _audienceId: string | null = process.env.RESEND_AUDIENCE_ID ?? process.env.RESEND_AUDIENCE_ID_ANYLOCAL ?? null

async function getAudienceId(): Promise<string | null> {
  if (_audienceId) return _audienceId
  if (!resend) return null
  try {
    // @ts-expect-error Resend types incomplete
    const res = await resend.audiences.list()
    // @ts-expect-error Resend types incomplete
    const first = res.data?.data?.[0] ?? res.data?.[0]
    if (first?.id) {
      _audienceId = first.id
      console.log('[drip] auto-detected audience id:', _audienceId)
    }
  } catch (e) {
    console.error('[drip] failed to fetch audience id', e)
  }
  return _audienceId
}

export interface DripContact {
  email: string
  firstName?: string
  /** ISO string — day 0 */
  subscribedAt: string
}

/** Add contact to Resend audience. Idempotent — Resend dedupes by email. */
export async function subscribeContact(contact: DripContact): Promise<void> {
  if (!resend) {
    console.warn('[drip] Resend not configured')
    return
  }
  const audienceId = await getAudienceId()
  if (!audienceId) {
    console.warn('[drip] no audience id available')
    return
  }
  await resend.contacts.create({
    audienceId,
    email: contact.email,
    firstName: contact.firstName ?? '',
    unsubscribed: false,
  })
}

/** Fetch all contacts in audience (paginated, max 1000 for now) */
export async function listContacts(): Promise<Array<{ email: string; firstName: string; createdAt: string; id: string }>> {
  if (!resend) return []
  const audienceId = await getAudienceId()
  if (!audienceId) return []
  const res = await resend.contacts.list({ audienceId })
  // @ts-expect-error Resend types incomplete
  return (res.data?.data ?? [])
}

export const DRIP_EMAILS: Array<{
  day: number
  subject: string
  html: (firstName: string) => string
}> = [
  {
    day: 1,
    subject: 'Did your tradesperson get back to you? 🛠️',
    html: (name) => `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;">
        <div style="margin-bottom:24px;">
          <span style="font-size:13px;font-weight:700;color:#f97316;letter-spacing:0.05em;text-transform:uppercase;">AnyLocal</span>
        </div>
        <h2 style="font-size:22px;font-weight:800;color:#111;margin:0 0 12px;">Hey ${name || 'there'} — any responses yet?</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
          Businesses you contacted yesterday typically respond within 24–48 hours.
          If you haven't heard back, here are a few things to try:
        </p>
        <ul style="color:#555;font-size:15px;line-height:1.8;padding-left:20px;margin:0 0 24px;">
          <li>Call them directly — the number is in your confirmation email</li>
          <li>Send another request to 2–3 more businesses for comparison quotes</li>
          <li>Check your spam folder for their replies</li>
        </ul>
        <a href="https://anylocal.app/search" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Search more tradespeople →
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;" />
        <p style="color:#aaa;font-size:12px;">AnyLocal · <a href="{{unsubscribeUrl}}" style="color:#aaa;">Unsubscribe</a></p>
      </div>`,
  },
  {
    day: 3,
    subject: '5 tips to get faster, cheaper quotes',
    html: (name) => `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;">
        <div style="margin-bottom:24px;">
          <span style="font-size:13px;font-weight:700;color:#f97316;letter-spacing:0.05em;text-transform:uppercase;">AnyLocal</span>
        </div>
        <h2 style="font-size:22px;font-weight:800;color:#111;margin:0 0 12px;">Get better quotes faster, ${name || 'there'}</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 20px;">
          Our most successful users follow these steps every time:
        </p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
          ${[
            ['📸', 'Send photos', 'A photo of the job gets 3× more responses than text alone'],
            ['📍', 'Be specific', 'Include postcode + access details — saves the tradesperson a site visit'],
            ['📅', 'Mention your timeline', '\"Urgent\" vs \"no rush\" changes pricing significantly'],
            ['🔢', 'Contact 3–5 businesses', 'More quotes = more competition = better price for you'],
            ['⭐', 'Check reviews', 'Sort by rating on AnyLocal to shortlist top-rated locals'],
          ].map(([icon, title, desc]) => `
            <tr>
              <td style="padding:10px 12px 10px 0;vertical-align:top;font-size:20px;">${icon}</td>
              <td style="padding:10px 0;">
                <strong style="color:#111;font-size:14px;display:block;">${title}</strong>
                <span style="color:#777;font-size:13px;">${desc}</span>
              </td>
            </tr>`).join('')}
        </table>
        <a href="https://anylocal.app/search" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Find tradespeople now →
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;" />
        <p style="color:#aaa;font-size:12px;">AnyLocal · <a href="{{unsubscribeUrl}}" style="color:#aaa;">Unsubscribe</a></p>
      </div>`,
  },
  {
    day: 7,
    subject: 'Did you find your tradesperson? 🏠',
    html: (name) => `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;">
        <div style="margin-bottom:24px;">
          <span style="font-size:13px;font-weight:700;color:#f97316;letter-spacing:0.05em;text-transform:uppercase;">AnyLocal</span>
        </div>
        <h2 style="font-size:22px;font-weight:800;color:#111;margin:0 0 12px;">Hey ${name || 'there'} — job sorted?</h2>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">
          It's been a week since you searched on AnyLocal. Hope you found the right person for the job!
        </p>
        <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 24px;">
          If you're still looking — or have another job coming up — we're here:
        </p>
        <a href="https://anylocal.app/search" style="display:inline-block;background:#111;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;margin-right:12px;">
          Search tradespeople
        </a>
        <a href="https://anylocal.app" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Browse all trades
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:32px 0 16px;" />
        <p style="color:#aaa;font-size:12px;">AnyLocal · <a href="{{unsubscribeUrl}}" style="color:#aaa;">Unsubscribe</a></p>
      </div>`,
  },
]
