/* AI service layer.
   ---------------------------------------------------------------
   DEMO MODE (default): every function is served by the local,
   deterministic engines in this app — no API key, no network.

   To connect a real LLM later:
     1. put your key on a *server* (never in this frontend)
     2. set VITE_READLY_AI_URL to your endpoint
     3. the functions below will call it and fall back to demo
        automatically if the call fails.

   Safety: children's data stays local unless you explicitly
   enable your own endpoint. No third-party calls by default.
   --------------------------------------------------------------- */

import { classify } from './errorAnalyzer.js';
import { generateExercise, generateSet, buildDiagnostic } from './adaptiveEngine.js';
import { generateStory } from './storyGenerator.js';
import { buildFeedback, starsForResult } from './feedbackService.js';

const AI_URL = import.meta.env.VITE_READLY_AI_URL || '';
export const DEMO_MODE = !AI_URL;

async function tryAI(path, payload, fallback) {
  if (DEMO_MODE) return fallback();
  try {
    const res = await fetch(`${AI_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`AI ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[aiService] falling back to demo mode:', err.message);
    return fallback();
  }
}

/** Classify an answer (error taxonomy lives locally — it must be instant + private). */
export function analyzeAnswer({ expected, actual, kind = 'word' }) {
  return classify(expected, actual, kind);
}

export async function generateExerciseAsync(profile, module) {
  return tryAI('/exercise', { profile: publicProfile(profile), module }, () =>
    generateExercise(profile, module)
  );
}

export async function generateSetAsync(profile, module, size) {
  return tryAI('/set', { profile: publicProfile(profile), module, size }, () =>
    generateSet(profile, module, size)
  );
}

export async function generateStoryAsync(profile, seedMix = 0) {
  return tryAI('/story', { profile: publicProfile(profile), seedMix }, () =>
    generateStory(profile, seedMix)
  );
}

export function generateFeedback(analysis, opts) {
  return buildFeedback(analysis, opts);
}

export { buildDiagnostic, starsForResult };

/** Strip anything not needed if a remote endpoint is ever enabled. */
function publicProfile(profile) {
  return {
    name: profile.name,
    age: profile.age,
    interests: profile.interests,
    difficulty: profile.learning.difficulty,
    masteredWords: profile.learning.masteredWords.slice(-20),
    commonErrors: (profile.learning.errorLog || []).slice(-30).map((e) => e.type),
  };
}
