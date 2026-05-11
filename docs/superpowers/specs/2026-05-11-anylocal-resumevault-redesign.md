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

## 4. Out of Scope

- Portal/page.tsx (quote management) — separate task
- AnyLocal onboarding flow
- ResumeVault LinkedIn import
- Multi-page resume support
