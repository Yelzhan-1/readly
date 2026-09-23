# Readly — Adaptive AI Tutor for Literacy

**Live demo:** https://yelzhan-1.github.io/readly/

Readly is a hackathon-ready web app that adapts reading and writing practice to each child's level, mistakes, and interests. Children explore worlds, complete daily quests, and earn stars; parents unlock a calm dashboard with honest, non-clinical insights.

- **Languages:** English · Русский · Қазақша (full UI/instructions/feedback)
- **Child mode:** diagnostic → adaptive quest sessions → reading → writing → AI-generated stories → progress
- **Parent mode:** PIN gate (`1234`) → overview, progress, skills, history, settings
- **On-device by default:** `localStorage` key `readly.state.v1` and parent PIN `1234`. If `VITE_SUPABASE_URL` and the anon key are set, a parent can sign in on the settings page and sync under RLS. `VITE_READLY_CLOUD=0` keeps data on the device even then. Never put `service_role` in the frontend.

## Known limitations

- Handwriting on the canvas is graded from the typed answer, not from OCR.
- Readly Coach shows **LIVE** only after the deployed `coach` edge function answers. Without that, the badge stays **DEMO**. No model API key is shipped in the browser.
- The parent “daily reminder” control is labeled Coming soon and does not send notifications.
- Supabase is optional. The public site is the on-device demo (Ayan, PIN 1234). Never put a `service_role` key in the frontend.

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
npm run check:i18n  # locale key parity + t() usage check
```

## Demo

- Demo child **Ayan** (7, dinosaurs + space, realistic 2-week history with b/d + missing-letter patterns) is seeded automatically.
- Parent PIN: **1234**.
- New profiles run a friendly 6-step diagnostic, then unlock Dino World.

## Jury path (about 5 minutes)

1. Open the app and tap **Jury path: Ayan, then parent PIN 1234**.
2. Choose **Ayan**. Home shows today’s quest, stars, and interest world (original mascots only).
3. Continue the quest. Miss a word on purpose: Readly Coach shows a **DEMO** tip. With `VITE_SUPABASE_URL` and the anon key set, the same panel shows **LIVE** after the `coach` edge function answers.
4. Open **Stories** and generate one. The story helper stays inside the chosen interest.
5. Open a story and tap at least one word, then finish.
6. Settings → **For parents** asks for PIN **1234** (it does not unlock by itself). Overview shows a plain-language Coach note. Settings can shorten the session or shift difficulty; **Reset demo** also clears the parent unlock.

Readly is a practice tool. The dashboard numbers are app learning signals, not a clinical assessment.

## Architecture

```
src/
  locales/         en · ru · kk (mirror keys exactly)
  i18n/            I18nProvider + t(path, vars)
  store/           AppContext reducer + persistence
  services/        adaptiveEngine · profileService · errorAnalyzer · srs ·
                   storyGenerator · feedbackService · speechService ·
                   handwritingService · aiService · aiCoach · cloudSync · insights
  lib/             supabase client (anon key, dual-mode)
supabase/          migration matching project readly + coach edge function
  data/            words · stories · worlds · badges · interests · demoSeed
  hooks/           useLearning · useNotify · useSpeech
  components/      ui/ · child/ · parent/
  pages/           Landing, profiles, onboarding, diagnostic, child/*, parent/*
```

**OBSERVE → UNDERSTAND → ADAPT:** every graded answer runs through `errorAnalyzer` (14 error patterns) → `profileService.applyExerciseResult` (skills, SRS, difficulty, history) → `adaptiveEngine` picks the next task (interests wrap the pedagogical goal).

### AI / speech notes

- Default **DEMO MODE**: local deterministic engines; set `VITE_READLY_AI_URL` (server-side key!) to enable a real LLM with automatic fallback.
- **Readly Coach** is DEMO without Supabase env. With the anon key it calls the `coach` edge function and badges the answer **LIVE**, falling back to **DEMO** if the call fails.
- Read-aloud uses Web Speech API when available, tap-to-read mode otherwise, plus an explicitly labelled demo simulation.
- Handwriting is a real drawing canvas; grading falls back to typed input (labelled honestly in the UI).

### Accessibility

Text size (sm/md/lg/xl), reduced motion, tap mode, keyboard-focusable controls, aria labels, never colour-only status.

_Readly is a practice tool. Metrics are app-generated learning signals — not a clinical or medical assessment._
