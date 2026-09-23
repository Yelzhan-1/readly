/* Readly Coach.
   DEMO: a local tip key, no network.
   LIVE: the Supabase `coach` edge function chooses the same key.
   The badge follows the source that actually answered. */

import { supabase, supabaseConfigured } from '../lib/supabase.js';
import { getParentSession } from './cloudSync.js';

const TIP_BY_TYPE = {
  bd_confusion: 'coach.tipLetter',
  pq_confusion: 'coach.tipLetter',
  vowel_confusion: 'coach.tipLetter',
  wrong_letter: 'coach.tipLetter',
  missing_letter: 'coach.tipMissing',
  extra_letter: 'coach.tipMissing',
  letter_order: 'coach.tipOrder',
  skipped_word: 'coach.tipReading',
  word_substitution: 'coach.tipReading',
  repeated_word: 'coach.tipReading',
  extra_word: 'coach.tipReading',
  long_word: 'coach.tipReading',
  sentence_structure: 'coach.tipSentence',
  spelling: 'coach.tipGeneric',
};

export function coachLiveConfigured() {
  return supabaseConfigured && Boolean(supabase);
}

export function demoCoach({ kind = 'child', analysis, profile, topic } = {}) {
  if (kind === 'parent') {
    const hasHistory = (profile?.history || []).length > 0;
    return {
      mode: 'demo',
      key: hasHistory ? 'coach.parentBody' : 'coach.parentQuiet',
      vars: { name: profile?.name || '' },
    };
  }
  if (kind === 'story') {
    return {
      mode: 'demo',
      key: 'coach.storyBody',
      vars: { topic: topic || '', name: profile?.name || '' },
    };
  }
  const type = analysis?.primary || analysis?.types?.[0] || '';
  return {
    mode: 'demo',
    key: TIP_BY_TYPE[type] || 'coach.tipGeneric',
    vars: {},
  };
}

export async function resolveCoach(input = {}) {
  const fallback = demoCoach(input);
  if (!coachLiveConfigured()) return fallback;
  try {
    const session = await getParentSession();
    if (!session?.user) return fallback;
    const { data, error } = await supabase.functions.invoke('coach', {
      body: {
        kind: input.kind || 'child',
        errorType: input.analysis?.primary || input.analysis?.types?.[0] || null,
        name: input.profile?.name || '',
        topic: input.topic || '',
        hasHistory: Boolean(input.profile?.history?.length),
      },
    });
    if (error || !data?.key) return fallback;
    return {
      mode: 'live',
      key: data.key,
      vars: data.vars || fallback.vars,
    };
  } catch (err) {
    console.warn('[coach] using demo tip', err?.message || err);
    return fallback;
  }
}
