# Readly — Adaptive AI Tutor for Literacy

Readly is a hackathon-ready web app that adapts reading and writing practice to each child's level, mistakes, and interests. Children explore worlds, complete daily quests, and earn stars; parents unlock a calm dashboard with honest, non-clinical insights.

- **Languages:** English · Русский · Қазақша (full UI/instructions/feedback)
- **Child mode:** diagnostic → adaptive quest sessions → reading → writing → AI-generated stories → progress
- **Parent mode:** PIN gate (`1234`) → overview, progress, skills, history, settings
- **Everything stays on-device:** `localStorage` key `readly.state.v1`, no API keys in the frontend

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

## Architecture

```
src/
  locales/         en · ru · kk (mirror keys exactly)
  i18n/            I18nProvider + t(path, vars)
  store/           AppContext reducer + persistence
  services/        adaptiveEngine · profileService · errorAnalyzer · srs ·
                   storyGenerator · feedbackService · speechService ·
                   handwritingService · aiService · insights
  data/            words · stories · worlds · badges · interests · demoSeed
  hooks/           useLearning · useNotify · useSpeech
  components/      ui/ · child/ · parent/
  pages/           Landing, profiles, onboarding, diagnostic, child/*, parent/*
```

**OBSERVE → UNDERSTAND → ADAPT:** every graded answer runs through `errorAnalyzer` (14 error patterns) → `profileService.applyExerciseResult` (skills, SRS, difficulty, history) → `adaptiveEngine` picks the next task (interests wrap the pedagogical goal).

### AI / speech notes

- Default **DEMO MODE**: local deterministic engines; set `VITE_READLY_AI_URL` (server-side key!) to enable a real LLM with automatic fallback.
- Read-aloud uses Web Speech API when available, tap-to-read mode otherwise, plus an explicitly labelled demo simulation.
- Handwriting is a real drawing canvas; grading falls back to typed input (labelled honestly in the UI).

### Accessibility

Text size (sm/md/lg), reduced motion, tap mode, keyboard-focusable controls, aria labels, never colour-only status.

_Readly is a practice tool. Metrics are app-generated learning signals — not a clinical or medical assessment._
