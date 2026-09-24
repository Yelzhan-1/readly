/* Readly Coach edge function.
   Returns a locale key already shipped in the app. No model key required.
   The browser shows LIVE only when this function answers. */

const TIP_BY_TYPE: Record<string, string> = {
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

const ALLOWED = new Set([
  'coach.tipLetter',
  'coach.tipMissing',
  'coach.tipOrder',
  'coach.tipReading',
  'coach.tipSentence',
  'coach.tipGeneric',
  'coach.parentBody',
  'coach.parentQuiet',
  'coach.storyBody',
]);

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function choose(body: {
  kind?: string;
  errorType?: string | null;
  name?: string;
  topic?: string;
  hasHistory?: boolean;
}) {
  const name = String(body.name || '').slice(0, 40);
  const topic = String(body.topic || '').slice(0, 40);
  if (body.kind === 'parent') {
    return {
      key: body.hasHistory ? 'coach.parentBody' : 'coach.parentQuiet',
      vars: { name },
    };
  }
  if (body.kind === 'story') {
    return { key: 'coach.storyBody', vars: { topic, name } };
  }
  const key = TIP_BY_TYPE[String(body.errorType || '')] || 'coach.tipGeneric';
  return { key, vars: {} };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const picked = choose(body as Parameters<typeof choose>[0]);
  if (!ALLOWED.has(picked.key)) {
    picked.key = 'coach.tipGeneric';
  }

  return new Response(JSON.stringify({ ok: true, source: 'edge', ...picked }), {
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
});
