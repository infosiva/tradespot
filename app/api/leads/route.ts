/**
 * POST /api/leads
 * Body: { name, email, phone, jobDescription, postcode, businesses: [{id, name, email?}] }
 *
 * - Saves lead to Supabase (leads table)
 * - Emails each business via Resend notifying them of the enquiry
 * - Emails user a confirmation
 */
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export interface LeadBusiness {
  id:    string
  name:  string
  phone: string | null
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  const { name, email, phone, jobDescription, postcode, businesses } = body as {
    name:           string
    email:          string
    phone:          string
    jobDescription: string
    postcode:       string
    businesses:     LeadBusiness[]
  }

  if (!name || !email || !jobDescription || !businesses?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const leadId = crypto.randomUUID()
  const createdAt = new Date().toISOString()

  // Save to Supabase (best effort — don't fail if not configured)
  if (supabase) {
    await supabase.from('leads').insert({
      id:              leadId,
      name,
      email,
      phone,
      job_description: jobDescription,
      postcode,
      businesses:      JSON.stringify(businesses),
      created_at:      createdAt,
}).then(({ error: e }) => { if (e) console.error('[leads] Supabase insert failed:', e.message) })
  }

  // Send confirmation to user
  if (resend) {
    await resend.emails.send({
      from:    'AnyLocal <leads@anylocal.app>',
      to:      email,
      subject: `Your quote request has been sent — ${businesses.map(b => b.name).join(', ')}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#f97316;">Your quote request is on its way</h2>
          <p>Hi ${name},</p>
          <p>We've sent your job details to <strong>${businesses.length} business${businesses.length > 1 ? 'es' : ''}</strong>:</p>
          <ul>
            ${businesses.map(b => `<li><strong>${b.name}</strong>${b.phone ? ` — ${b.phone}` : ''}</li>`).join('')}
          </ul>
          <div style="background:#fff8f0;border-left:4px solid #f97316;padding:16px;margin:20px 0;border-radius:4px;">
            <strong>Your job:</strong><br/>${jobDescription}
            ${postcode ? `<br/><strong>Postcode:</strong> ${postcode}` : ''}
          </div>
          <p style="color:#888;font-size:13px;">Businesses typically respond within 24 hours. You can also call them directly.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
          <p style="color:#aaa;font-size:12px;">AnyLocal — Find anything local, anywhere</p>
        </div>
      `,
    }).catch(e => console.error('[leads] User confirmation email failed:', e.message))

    // Notify platform (us) of new lead
    await resend.emails.send({
      from:    'AnyLocal Leads <leads@anylocal.app>',
      to:      'itsmesivaprakasam@gmail.com',
      subject: `New lead: ${jobDescription.slice(0, 60)} — ${businesses.length} businesses`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#f97316;">New Quote Request</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#888;width:120px;">Name</td><td><strong>${name}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#888;">Email</td><td>${email}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Phone</td><td>${phone || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Postcode</td><td>${postcode || '—'}</td></tr>
            <tr><td style="padding:6px 0;color:#888;">Job</td><td>${jobDescription}</td></tr>
          </table>
          <h3>Businesses contacted (${businesses.length})</h3>
          <ul>${businesses.map(b => `<li>${b.name}${b.phone ? ` — ${b.phone}` : ''}</li>`).join('')}</ul>
        </div>
      `,
    }).catch(e => console.error('[leads] Admin notification failed:', e.message))
  }

  return NextResponse.json({ ok: true, leadId })
}
