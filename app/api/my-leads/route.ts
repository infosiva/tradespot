/**
 * GET /api/my-leads?email=xxx
 * Returns all leads for a given email address + their responses
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim()
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
  if (!supabase) return NextResponse.json({ leads: [] })

  const { data, error } = await supabase
    .from('leads')
    .select('id, name, job_description, postcode, businesses, status, response, response_from, responded_at, tag, created_at')
    .eq('email', email)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[my-leads] Supabase error:', error.message)
    return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
  }

  return NextResponse.json({ leads: data ?? [] })
}

/**
 * PATCH /api/my-leads
 * Body: { leadId, tag }  — update tag on a lead
 */
export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { leadId, email, tag } = body
  if (!leadId || !email || !tag) return NextResponse.json({ error: 'leadId, email, tag required' }, { status: 400 })
  if (!supabase) return NextResponse.json({ error: 'not configured' }, { status: 503 })

  // Verify ownership — only allow tag updates on leads owned by this email
  const { data: lead } = await supabase.from('leads').select('email').eq('id', leadId).single()
  if (!lead || lead.email.toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const { error } = await supabase.from('leads').update({ tag }).eq('id', leadId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
