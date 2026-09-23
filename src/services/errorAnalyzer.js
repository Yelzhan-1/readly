/* Deterministic error classification.
   Goes well beyond correct/incorrect: it names the pattern it sees.
   NOTE: Readly never claims any medical or clinical meaning from these labels. */

const PAIR_BD = new Set(['bd', 'db']);
const PAIR_PQ = new Set(['pq', 'qp']);
const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

export const ERROR_TYPES = [
  'missing_letter',
  'extra_letter',
  'wrong_letter',
  'letter_order',
  'bd_confusion',
  'pq_confusion',
  'vowel_confusion',
  'spelling',
  'long_word',
  'word_substitution',
  'skipped_word',
  'repeated_word',
  'extra_word',
  'sentence_structure',
];

export function normalizeWord(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* diff expected → actual, returns coarse ops */
function diffOps(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      ops.push({ t: 'eq', ch: a[i], ai: i });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ t: 'del', ch: a[i], ai: i });
      i += 1;
    } else {
      ops.push({ t: 'ins', ch: b[j], bi: j });
      j += 1;
    }
  }
  while (i < m) {
    ops.push({ t: 'del', ch: a[i], ai: i });
    i += 1;
  }
  while ( j < n) {
    ops.push({ t: 'ins', ch: b[j], bi: j });
    j += 1;
  }
  // coalesce adjacent del+ins into replace
  const out = [];
  for (let k = 0; k < ops.length; k += 1) {
    const cur = ops[k];
    const next = ops[k + 1];
    if (cur.t === 'del' && next && next.t === 'ins') {
      out.push({ t: 'sub', from: cur.ch, to: next.ch, ai: cur.ai });
      k += 1;
    } else if (cur.t === 'ins' && next && next.t === 'del') {
      out.push({ t: 'sub', from: next.ch, to: cur.ch, ai: next.ai });
      k += 1;
    } else {
      out.push(cur);
    }
  }
  return out;
}

function classifyPair(from, to) {
  const key = `${from}${to}`;
  if (PAIR_BD.has(key)) return 'bd_confusion';
  if (PAIR_PQ.has(key)) return 'pq_confusion';
  if (VOWELS.has(from) && VOWELS.has(to)) return 'vowel_confusion';
  return 'wrong_letter';
}

/**
 * Classify a single-word spelling attempt.
 * @returns {{ok:boolean, errors:Array, types:string[], primary:string|null}}
 */
export function classifyWord(expected, actual) {
  const e = normalizeWord(expected);
  const a = normalizeWord(actual);
  const result = { ok: false, errors: [], types: [], primary: null };
  if (!e) return { ok: true, errors: [], types: [], primary: null };
  if (e === a) return { ok: true, errors: [], types: [], primary: null };

  if (e.length >= 7) result.types.push('long_word');

  const sameLetters = e.split('').sort().join('') === a.split('').sort().join('');

  if (sameLetters && e.length === a.length) {
    result.errors.push({ type: 'letter_order', index: firstOrderIndex(e, a) });
    result.types.push('letter_order');
    result.primary = 'letter_order';
    return result;
  }

  const ops = diffOps(e, a).filter((o) => o.t !== 'eq');
  const dels = ops.filter((o) => o.t === 'del');
  const inss = ops.filter((o) => o.t === 'ins');
  const subs = ops.filter((o) => o.t === 'sub');

  if (ops.length === 1) {
    const only = ops[0];
    if (only.t === 'del') {
      result.errors.push({ type: 'missing_letter', letter: only.ch, index: only.ai });
      result.types.push('missing_letter');
      result.primary = 'missing_letter';
      return result;
    }
    if (only.t === 'ins') {
      result.errors.push({ type: 'extra_letter', letter: only.ch, index: only.bi });
      result.types.push('extra_letter');
      result.primary = 'extra_letter';
      return result;
    }
    if (only.t === 'sub') {
      const type = classifyPair(only.from, only.to);
      result.errors.push({ type, from: only.from, to: only.to, index: only.ai });
      result.types.push(type);
      result.primary = type;
      return result;
    }
  }

  if (dels.length >= 1 && inss.length === 0 && subs.length === 0) {
    const first = dels[0];
    result.errors.push({
      type: 'missing_letter',
      letter: first.ch,
      index: first.ai,
      count: dels.length,
    });
    result.types.push('missing_letter');
    result.primary = 'missing_letter';
    if (dels.some((d) => VOWELS.has(d.ch))) result.types.push('vowel_confusion');
    return result;
  }

  if (inss.length >= 1 && dels.length === 0 && subs.length === 0) {
    const first = inss[0];
    result.errors.push({ type: 'extra_letter', letter: first.ch, index: first.bi, count: inss.length });
    result.types.push('extra_letter');
    result.primary = 'extra_letter';
    return result;
  }

  if (subs.length === 1 && dels.length === 0 && inss.length === 0) {
    const only = subs[0];
    const type = classifyPair(only.from, only.to);
    result.errors.push({ type, from: only.from, to: only.to, index: only.ai });
    result.types.push(type);
    result.primary = type;
    return result;
  }

  // mixed / messy attempt
  subs.forEach((s) => result.types.push(classifyPair(s.from, s.to)));
  if (dels.length) result.types.push('missing_letter');
  if (inss.length) result.types.push('extra_letter');
  result.errors.push({ type: 'spelling', detail: ops });
  result.types.push('spelling');
  result.primary = 'spelling';
  result.types = [...new Set(result.types)];
  return result;
}

function firstOrderIndex(e, a) {
  for (let i = 0; i < Math.max(e.length, a.length); i += 1) {
    if (e[i] !== a[i]) return i + 1;
  }
  return 1;
}

/**
 * Classify a sentence / reading attempt (word-by-word).
 */
export function classifySentence(expectedText, actualText) {
  const eWords = normalizeWord(expectedText).split(' ').filter(Boolean);
  const aWords = normalizeWord(actualText).split(' ').filter(Boolean);
  const result = { ok: false, errors: [], types: [], wordResults: [], primary: null };

  if (eWords.join(' ') === aWords.join(' ')) {
    result.ok = true;
    result.wordResults = eWords.map((w) => ({ word: w, ok: true }));
    return result;
  }

  let anyOk = 0;
  const max = Math.max(eWords.length, aWords.length);
  const seen = new Set();
  for (let i = 0; i < max; i += 1) {
    const ew = eWords[i];
    const aw = aWords[i];
    if (ew == null) {
      result.errors.push({ type: 'extra_word', word: aw });
      result.types.push('extra_word');
      continue;
    }
    if (aw == null) {
      result.errors.push({ type: 'skipped_word', word: ew });
      result.types.push('skipped_word');
      result.wordResults.push({ word: ew, ok: false, skipped: true });
      continue;
    }
    const w = classifyWord(ew, aw);
    if (w.ok) {
      anyOk += 1;
      result.wordResults.push({ word: ew, ok: true });
    } else {
      w.errors.forEach((er) => result.errors.push({ ...er, word: ew }));
      w.types.forEach((t) => result.types.push(t));
      result.wordResults.push({ word: ew, ok: false, types: w.types, attempt: aw });
    }
    if (seen.has(aw)) {
      result.errors.push({ type: 'repeated_word', word: aw });
      result.types.push('repeated_word');
    }
    seen.add(aw);
  }

  const allWrongish = result.wordResults.every((r) => !r.ok);
  if (result.wordResults.length && anyOk === 0 && eWords.length <= 2) {
    result.types.push('word_substitution');
    result.errors.push({ type: 'word_substitution', expected: eWords[0], actual: aWords[0] });
  }
  if (allWrongish && eWords.length >= 4) result.types.push('sentence_structure');

  result.types = [...new Set(result.types)];
  result.primary = result.types.find((t) => t !== 'long_word') || null;
  result.ok = false;
  result.correctWords = anyOk;
  result.totalWords = eWords.length;
  return result;
}

/** convenience: pick analyzer by target */
export function classify(expected, actual, kind = 'word') {
  if (kind === 'sentence') return classifySentence(expected, actual);
  return classifyWord(expected, actual);
}

export function confidenceFor(analysis, hintsUsed = 0) {
  if (!analysis.ok) return 0;
  if (hintsUsed === 0) return 2; // independent
  return 1; // solved with help
}
