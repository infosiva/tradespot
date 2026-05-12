/**
 * GET /api/drip-cron
 * Called daily by Vercel Cron (vercel.json).
 * Reads all contacts from Resend Audience, checks days since created,
 * sends the appropriate drip email (day 1, 3, or 7).
 *
 * Auth: CRON_SECRET header must match env var (Vercel sets this automatically for cron jobs).
 */
import { NextRequest, NextResponse } from 'next/server'
import { resend, AUDIENCE_ID, listContacts, DRIP_EMAILS } from '@/lib/drip'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!resend || !AUDIENCE_ID) {
    return NextResponse.json({ error: 'Resend not configured' }, { status: 500 })
  }

  const contacts = await listContacts()
  const now = Date.now()
  let sent = 0
  const errors: string[] = []

  for (const contact of contacts) {
    const createdAt = new Date(contact.createdAt).getTime()
    const daysSince = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))

    const drip = DRIP_EMAILS.find(d => d.day === daysSince)
    if (!drip) continue

    try {
      await resend.emails.send({
        from: 'AnyLocal <hello@anylocal.app>',
        to: contact.email,
        subject: drip.subject,
        html: drip.html(contact.firstName ?? ''),
      })
      sent++
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      errors.push(`${contact.email}: ${msg}`)
      console.error('[drip-cron] send failed', contact.email, msg)
    }
  }

  return NextResponse.json({ ok: true, sent, errors: errors.length ? errors : undefined })
}
