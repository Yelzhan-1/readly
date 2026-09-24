# OVERNIGHT HARD QA — Readly (VentureHack) — story-card Link polish re-verify @ 64a179a

**When:** 2026-09-24 ~00:20 Asia/Qyzylorda (UTC+5)  
**Machine:** DESKTOP-V67L7S6 (`ebec45e1-aa42-43b3-ab34-edeb8c94de91`)  
**Repo:** `C:\Users\TRXpc\readly\readly`  
**Branch:** `cursor/venturehack-readly-6a18` (fast-forwarded `8ab7131` → `64a179a`)  
**HEAD:** `64a179a70f206398d22a5af4477d785b0bd8c31d`  
**HEAD message:** Make story cards real links to the reader.  
**Previous green baseline:** `8ab7131c72985e7901a852498bb2797cb2ac4a90`  
**Dev URL:** `http://127.0.0.1:5173/` (existing Vite; HTTP 200; HMR after pull)  
**Demo path:** child **Ayan**, parent PIN **1234**

---

## Verdict

**Jury-demoable tonight: YES**

No CRITICAL / HIGH / MEDIUM product bugs. Build + i18n + guards + hard E2E + supplemental exit 0. Zero console / page / network errors. Story cards as `<Link className="story-card">` **fixed** prior hard NOTE “reader :: no story links” (hard pass 28→29, notes 2→1). **No NEW product bugs vs green @ 8ab7131.**

---

## Git

| Item | Result |
|------|--------|
| `git fetch` / `git pull` | PASS. Fast-forward 1 commit. Untracked qa-* left in place. |
| New HEAD | `64a179a70f206398d22a5af4477d785b0bd8c31d` |
| Message | Make story cards real links to the reader. |
| Delta vs 8ab7131 | `Stories.jsx` / `ReadingList.jsx` → `<Link className="story-card">`; `child.css` link style |

---

## Command results

| Check | Result | Notes |
|-------|--------|-------|
| Vite `127.0.0.1:5173` | PASS | Already running; HTTP 200 |
| `npm run build` | **PASS** (exit 0) | 153 modules; chunk ~629 kB warn |
| `npm run check:i18n` | **PASS** (exit 0) | 646 keys × 3 · 424 `t()` |
| `npm run check:guards` | **PASS** (exit 0) | ok |
| Hard E2E `node qa-e2e-hard.cjs` | **PASS** (exit 0) | pass=29 fail=0 crit=0 high=0 med=0 note=1 |
| Supplemental `node qa-e2e-supplemental.cjs` | **PASS** (exit 0) | story Link open PASS; word tap PASS; write PASS; parent history PASS; parent Demo Mode PASS; 1 timing NOTE on session DEMO |

### E2E summary

- **Hard PASS:** 29 (was 28 @ 8ab7131) — **reader open story PASS** via real `<a>`/`Link` cards  
- **FAIL / CRITICAL / HIGH / MEDIUM:** 0 / 0 / 0 / 0  
- **Console / page / network:** 0 / 0 / 0  
- **Hard remaining NOTE:** Coach DEMO badge not on bare home/learn (expected; same L3)  
- **Supplemental:** open story → `/read/dino-big-day` PASS; word tap PASS; writing canvas PASS; parent history + Demo Mode chip PASS  
- **Supplemental NOTE:** Coach DEMO on `/session/reading` at `domcontentloaded`+800ms — **test timing**, not product: manual probe with `networkidle`+1.5s shows `🎮 Practice (demo)` present. Re-run still NOTE under short wait.

Artifacts under `qa-artifacts/` (logs, `e2e-hard-report.json`, `e2e-supplemental.json`, `hard-*.png`).

---

## Bugs found

### CRITICAL / HIGH / MEDIUM
_None_

### LOW / NOTES (non-blocking)

| ID | Item | vs 8ab7131 |
|----|------|------------|
| L1 | Prod JS chunk > 500 kB (~629 kB) | Same |
| L2 | Story list not real links | **FIXED** — hard “reader” now PASS |
| L3 | Coach DEMO not on bare home/learn | Same (expected) |
| L4 | Supplemental short-wait miss of Practice (demo) on `/session/reading` | Test harness timing only; product OK on longer wait |

### NEW product bugs vs @ 8ab7131
**None.** Net improvement: L2 cleared.

---

## Jury demo readiness

- **YES** — Ayan + PIN 1234; story cards are real Links; Vite up  
- Link polish improves a11y / right-click / E2E selector reliability  
- No merge / push / deploy / PC sleep

---

## Report paths

- `C:\Users\TRXpc\readly\readly\qa-artifacts\OVERNIGHT_HARD_QA.md`
- `/workspace/readly-review/OVERNIGHT_HARD_QA.md` (box copy)
