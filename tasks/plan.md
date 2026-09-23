# Readly — VentureHack plan (Addy: plan → align → code)

**Deadline:** 2026-09-24 12:00 Asia/Qyzylorda  
**Repo target:** https://github.com/Yelzhan-1/readly (pending first push)  
**Supabase:** project `readly` (`hrlpidapontbnrvmrqzw`, eu-central-1) — created; SilverCare untouched  
**Align gate:** no feature code until Elzhan OK on this plan

## Goals (mandatory)
1. Fix known bugs from code review  
2. Readly Coach (AI layer)  
3. UI upgrade using Refero + 21st.dev + reactbits.dev (no IP characters)  
4. Supabase Auth + Postgres + RLS (dual-mode with localStorage)  
5. GitHub + CI + CodeRabbit; verify only after checks green

## Process
- plan → **align with Elzhan (and Bob)** → code  
- Prefer local Cursor Agent + Claude Sonnet on Windows for UI (live watch)  
- Cloud Agent OK for scaffold/backend after repo exists; always surface agent card  
- No rush past CI / CodeRabbit

## Vertical slices (implementation order after align)

### Slice 0 — Ship baseline (in progress)
- [ ] Create GitHub `Yelzhan-1/readly`, push local commits  
- [x] Supabase project `readly`  
- [ ] Add GitHub Actions: `npm ci` → `npm run build` → `npm run check:i18n`  
- [ ] Enable CodeRabbit on the repo  
- [ ] Wait first CI green before calling baseline verified

### Slice 1 — Stability (bugs)
Acceptance: PIN required for parent; writing shows personal context; resetDemo clears parent unlock; difficulty wired or clearly disabled; `build` + `check:i18n` green.
- Settings: remove `setParentUnlocked(true)` bypass  
- SpellView/ChoiceView: read `ex.context.contextPath` / `contextVars`  
- `resetDemo`: clear `sessionStorage` parent unlock  
- Wire or hide parent difficulty / sessionLength  
- Medium: slowSpeech / hints / Reader ≥1 word / localize `(demo)`

### Slice 2 — Supabase foundation
Acceptance: schema + RLS applied; app runs offline without env; with env, client connects; no service_role in frontend.
- Tables: `child_profiles`, `progress_events`, `stories`, `parent_child_links` (+ auth parents)  
- RLS: parent sees only linked children  
- `src/lib/supabase.js` + `.env.example`  
- Sync layer behind feature flag / graceful fallback to localStorage

### Slice 3 — Readly Coach (AI)
Acceptance: Coach UI on child feedback + parent overview; DEMO responses without key; LIVE via Edge Function when configured; honest DEMO/LIVE badge.
- `aiCoach` service + chip/panel  
- Edge Function stub `coach` in Supabase  
- Child tip after mistake; parent plain-language insight; optional story helper

### Slice 4 — UI redesign
Acceptance: Home, Session, Stories, Parent share one visual language; motion from reactbits-style CSS; patterns informed by Refero/21st; no Disney/IP heroes — interest worlds only.
- Design tokens (radius, soft palette, type)  
- Restyle shells + key cards/buttons  
- Light motion (CSS / minimal deps)

### Slice 5 — Demo polish
Acceptance: 4–5 min happy-path documented; Ayan + PIN 1234; README for jury.
- Landing “demo path” chip  
- Jury README section

## Out of scope tonight
- Real clinical claims / dyslexia diagnosis  
- Full OCR handwriting  
- Multi-child production billing  
- Disney / third-party character IP

## Risks
- GitHub auth still needed for first push  
- Cursor Origin namespace missing (prefer GitHub path)  
- Overnight scope: slices 1–3 must land; 4 as deep as time allows

## Align checklist
- [ ] Elzhan OK on slice order and Coach/UI/Supabase scope  
- [ ] Bob OK already on process gates (2026-09-23)
