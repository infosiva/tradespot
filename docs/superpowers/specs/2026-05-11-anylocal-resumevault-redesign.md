# AnyLocal Search + ResumeVault Redesign

**Date:** 2026-05-11  
**Products:** AnyLocal (tradespot) + ResumeVault (ai-resume-builder)  
**Status:** Approved for implementation

---

## 1. AnyLocal Search Page Redesign

### Goal
Replace the toggle-between-list-and-map layout with a persistent split-pane that surfaces AI summaries inline and shows distance, trust signals, and quick actions without extra clicks.

### Architecture

**Layout (desktop):**
- Sticky top bar: search input + filter pills (Open Now / ⭐ 4+ / Distance / Trades only) + result count
- Left column: 420px fixed, scrollable results list
- Right column: remaining width, sticky Leaflet map — always visible, never toggled away
- Mobile: map collapses to a small strip (160px) above results, pills scroll horizontally

**Result Card anatomy:**
1. Rank badge (#1–#5, orange for #1, slate for rest)
2. Business name + trust badge pill (Excellent ≥ 4.5 / Good ≥ 4.0 / Fair < 4.0)
3. Star rating + review count + distance (mi, derived from GPS coords already captured) + open/closed pill
4. Action row: Call · Website · Quote · ▾ AI Summary
5. AI Summary panel (inline expand, purple-tinted glass card): 3 positive bullets + optional warning bullet, model attribution footer

**Map panel:**
- Orange pin #1, gray numbered pins for rest
- Click pin → card scrolls into view and highlights (ring glow)
- Click card → map flies to pin + shows popup
- Popup: name / address / rating / phone / website / "Get Quote" button
- Overlay bottom-left: location pill + "12 results" count

**Filters:**
- `openNowOnly` (already exists) → pill UI
- `minRating` state: off / 4.0+ / 4.5+ — pill cycle
- `sortBy`: relevance / distance / rating — dropdown
- All filters are URL-searchParams-backed so share/back-button works

**AI Summary fetch:**
- Lazy: fires only when user clicks ▾ AI Summary
- Calls new `app/api/ai-summary/route.ts` with `{ name, reviews: rawReviews[0..4] }`
- Streamed response, shown word-by-word in the panel
- Cached in component state — no re-fetch on collapse/expand

**Data flow:**
```
GPS → Places API → PlaceResult[] → ResultCard list
                ↓
           Leaflet pins (MapView)
                ↓         ↑ click sync
           card ←→ map via activeId state
```

**New/changed files:**
| File | Change |
|------|--------|
| `app/search/page.tsx` | Split layout, filter state, activeId, URL params |
| `components/MapView.tsx` | Accept `activeId` prop, emit `onPinClick`, fly-to on change |
| `components/ResultCard.tsx` | New component extracted from page — card anatomy above |
| `components/AISummaryPanel.tsx` | Streaming summary, purple glass card |
| `app/api/ai-summary/route.ts` | POST handler, Groq→Gemini fallback, 5-review context |

**No changes to:** QuoteModal, portal/page.tsx, vertical.config.ts, lib/ai.ts, lib/theme.ts

---

## 2. ResumeVault Redesign

### Goal
Transform single-column form + raw text output into a two-column live preview experience modelled on career-ops (Space Grotesk + DM Sans, ATS-optimised paper, keyword gap analysis, AI bullet suggestions with approve/reject).

### Architecture

**Layout (desktop):**
- Left panel: 380px — input form
- Right panel: remaining — live resume paper preview + output tabs
- Mobile: stacked, preview below form

**Left panel sections:**
1. Session restore banner (if localStorage has prior data)
2. Name + Current Title (2-col grid)
3. JD paste textarea — on blur, call `/api/parse-jd` → extract company, role, top-10 keywords → show below
4. JD parse result: "Company: Acme · Role: Senior Engineer" + keyword chip row (hit=green ✓, miss=red ✗, based on skills/experience text)
5. Experience textarea (auto-grow)
6. Skills input (comma-separated)
7. 4 AI action tiles (2×2 grid):
   - Build Resume
   - Cover Letter
   - ATS Score
   - Interview Prep
8. "Generate All" CTA — fires all 4 in parallel

**Right panel:**
- Tabs: Resume Preview / Cover Letter / Interview Prep
- **Resume Preview tab:**
  - A4 white paper card with drop shadow
  - Header: name in Space Grotesk 28px, title in DM Sans, cyan→purple gradient underline (3px)
  - Contact row: email · phone · location
  - Sections: Experience, Skills, Summary — DM Sans body, tight ATS margins
  - AI-added bullets shown in purple italic with ✓ Approve / ✗ Skip inline buttons
  - AI-added skill tags shown in purple with same approve/skip
  - ATS score ring: SVG circle overlay top-right of paper (score / 100, teal stroke)
  - Keywords highlighted in teal within bullet text
  - Actions: Download PDF · Regenerate
- **Cover Letter tab:** Rendered letter with same typography, Copy button
- **Interview Prep tab:** Role-specific STAR questions + salary range band

**JD keyword analysis:**
- Client-side: after `/api/parse-jd` returns keywords[], intersect with `skills + experience` text
- Hit = keyword appears in user text (case-insensitive)
- Miss = keyword absent
- Keyword match % = hits / total × 100 — shown in progress bar
- No extra API call — pure string matching

**AI bullet suggestions:**
- Part of `/api/build-resume` response: JSON `{ resume: string, suggestions: Suggestion[] }`
- `Suggestion { section: string, original?: string, replacement: string }`
- UI shows replacement in purple; approve → replaces original in preview state; skip → removes suggestion chip

**PDF generation:**
- `POST /api/export-pdf` → Playwright (server-side) renders `/resume-print?data=<base64>` → returns PDF buffer
- `/resume-print` route: plain HTML, no navbar, print-optimised CSS, same Space Grotesk + DM Sans
- Fallback: browser `window.print()` with `@media print` CSS if Playwright not available

**Fonts:**
- Load via `next/font/google`: `Space_Grotesk` (weights 400/600/700) + `DM_Sans` (weights 400/500)
- Applied only within resume paper component — no global font change

**Gate unchanged:** 3 free uses via existing `useGate("resumevault", 3)` — no change to gate logic

**New/changed files:**
| File | Change |
|------|--------|
| `src/app/page.tsx` | Two-column layout, JD parse state, suggestion state, Generate All |
| `src/components/ResumeForm.tsx` | JD parse on blur, keyword chips, 4 action tiles |
| `src/components/ResumePreview.tsx` | Paper component, Space Grotesk/DM Sans, ATS ring, AI bullet chips |
| `src/components/KeywordBar.tsx` | New — match % bar + hit/miss chips |
| `src/app/api/parse-jd/route.ts` | New — extract company, role, keywords via Groq |
| `src/app/api/build-resume/route.ts` | Updated — return `{ resume, suggestions }` JSON |
| `src/app/api/export-pdf/route.ts` | New — Playwright PDF (or print fallback) |
| `src/app/resume-print/page.tsx` | New — print-only route |

**No changes to:** gate system, Stripe checkout, ATSMeter component reuse where applicable, lib/ai.ts fallback chain

---

## 3. Shared Principles

- Free models first: Groq → Gemini → Cerebras → Anthropic for all new API routes
- No new auth surfaces — existing session/gate unchanged
- Mobile-first breakpoints: `md:` for split layout, `sm:` for 2-col grids
- Dark mesh background unchanged in AnyLocal; white paper on dark bg in ResumeVault unchanged
- No feature flags — implement directly

---

## 4. Email Marketing — Both Products

### Infrastructure
- Provider: **Resend** (free tier: 3k emails/month)
- SDK: `resend` npm package — single shared client in `lib/resend.ts`
- Email templates: React Email components (`@react-email/components`) — renders to HTML + plain text
- Trigger: API route called after gate events (sign-up / first generation / upgrade)
- Storage: email + sequence state in Supabase `email_sequences` table

### Supabase table: `email_sequences`
```sql
create table email_sequences (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  product text not null,           -- 'resumevault' | 'anylocal'
  step integer not null default 0, -- which email in sequence (0-indexed)
  subscribed_at timestamptz default now(),
  last_sent_at timestamptz,
  unsubscribed boolean default false
);
```

### ResumeVault drip (4 emails)
| Step | Delay | Subject | Trigger to advance |
|------|-------|---------|-------------------|
| 0 | immediate | "Your resume is ready — here's what ATS sees" | sent on first generation |
| 1 | +2 days | "The 3 keywords you're missing (and how to add them)" | cron job |
| 2 | +5 days | "Write a cover letter in 30 seconds" | cron job |
| 3 | +9 days | "Unlock unlimited resumes — Pro is 50% off this week" | cron job |

### AnyLocal drip (4 emails)
| Step | Delay | Subject | Trigger to advance |
|------|-------|---------|-------------------|
| 0 | immediate | "Your first quote request is in — here's what happens next" | sent on first quote submit |
| 1 | +2 days | "3 tips to get faster responses from local tradespeople" | cron job |
| 2 | +5 days | "Top-rated trades near [postcode]" | cron job |
| 3 | +10 days | "Are you a tradesperson? List for free on AnyLocal" | cron job — provider acquisition |

### API routes
| Route | Purpose |
|-------|---------|
| `POST /api/email/subscribe` | Insert row into email_sequences, send step-0 immediately via Resend |
| `POST /api/email/unsubscribe` | Set unsubscribed=true (linked from email footer) |
| `GET /api/cron/email-drip` | Vercel cron (daily 9am UTC) — find rows where next step is due, send, update last_sent_at + step |

### Email template components (React Email)
- `emails/resumevault/welcome.tsx` — step 0
- `emails/resumevault/ats-explained.tsx` — step 1
- `emails/resumevault/cover-letter.tsx` — step 2
- `emails/resumevault/pro-upsell.tsx` — step 3
- `emails/anylocal/quote-sent.tsx` — step 0
- `emails/anylocal/tips.tsx` — step 1
- `emails/anylocal/top-trades.tsx` — step 2
- `emails/anylocal/provider-acquisition.tsx` — step 3

### Unsubscribe
- One-click unsubscribe link in every footer: `/api/email/unsubscribe?id=<sequence_id>`
- CAN-SPAM compliant — physical address line in footer (use "London, UK")
- No re-subscribe mechanism needed at this stage

### Trigger integration points
- ResumeVault: call `/api/email/subscribe` in `POST /api/build-resume` when email present in form
- AnyLocal: call `/api/email/subscribe` in QuoteModal submit handler

### Vercel cron config (`vercel.json` or `vercel.ts`)
```json
{ "crons": [{ "path": "/api/cron/email-drip", "schedule": "0 9 * * *" }] }
```

---

## 5. Out of Scope

- Portal/page.tsx (quote management) — separate task
- AnyLocal onboarding flow
- ResumeVault LinkedIn import
- Multi-page resume support
- A/B testing email subjects
- Email analytics dashboard
