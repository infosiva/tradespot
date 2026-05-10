/**
 * POST /api/leads/respond
 * Body: { leadId, businessName, responseText, businessEmail }
 * Called when a business responds to a quote request (via email link or portal)
 * Updates lead status to 'responded' + saves response text
 * Notifies the customer via email
 */
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { leadId, businessName, responseText, businessEmail } = body

  if (!leadId || !businessName || !responseText) {
    return NextResponse.json({ error: 'leadId, businessName, responseText required' }, { status: 400 })
  }

  if (!supabase) return NextResponse.json({ error: 'not configured' }, { status: 503 })

  // Fetch lead to get customer email
  const { data: lead, error: fetchErr } = await supabase
    .from('leads')
    .select('id, name, email, job_description')
    .eq('id', leadId)
    .single()

  if (fetchErr || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
  }

  // Update lead with response
  const { error: updateErr } = await supabase
    .from('leads')
    .update({
      status:       'responded',
      response:     responseText,
      response_from: businessName,
      responded_at:  new Date().toISOString(),
    })
    .eq('id', leadId)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // Email customer to notify them
  if (resend) {
    await resend.emails.send({
      from:    'AnyLocal <leads@anylocal.app>',
      to:      lead.email,
      subject: `${businessName} responded to your quote request`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#080712;color:#f0eeff;">
          <div style="text-align:center;margin-bottom:32px;">
            <h1 style="color:#f97316;font-size:28px;margin:0;">AnyLocal</h1>
          </div>
          <h2 style="color:#ffffff;">Good news, ${lead.name}!</h2>
          <p style="color:#aaa;line-height:1.6;"><strong style="color:#fff;">${businessName}</strong> has responded to your quote request.</p>
          <div style="background:#1a1030;border:1px solid rgba(249,115,22,0.25);border-radius:12px;padding:20px;margin:24px 0;">
            <h3 style="color:#f97316;margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Their message</h3>
            <p style="color:#fff;line-height:1.6;margin:0;">${responseText}</p>
          </div>
          <div style="text-align:center;margin:32px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://anylocal.app'}/portal?email=${encodeURIComponent(lead.email)}"
               style="background:#f97316;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
              View in your portal →
            </a>
          </div>
          <p style="color:#555;font-size:12px;text-align:center;margin-top:32px;">AnyLocal · anylocal.app</p>
        </div>
      `,
    }).catch(e => console.error('[leads/respond] Notify email failed:', e.message))
  }

  return NextResponse.json({ ok: true })
}
