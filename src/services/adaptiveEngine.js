/* Adaptive exercise generator.
   Picks WHAT to practise from the learning profile and wraps it in
   the child's interests — educational goal fixed, context personal. */

import { normalizeWord } from './errorAnalyzer.js';
import { FOCUS_WORDS, FOCUS_LETTERS, WORDS, wordsForInterests, wordMeta } from '../data/words.js';
import { STORIES } from '../data/stories.js';
import { focusErrorType, weakestSkill, difficultyOf } from './profileService.js';
import { srsDue } from './srs.js';
import { shuffle, pick, pickN, uid } from '../utils/random.js';

const CONTEXT_TEMPLATES = 3;

const SIMILAR = {
  b: ['d', 'p', 'q'],
  d: ['b', 'p', 'q'],
  p: ['q', 'b', 'd'],
  q: ['p', 'b', 'd'],
  n: ['u', 'm', 'r'],
  u: ['n', 'v', 'a'],
  m: ['n', 'w', 'h'],
  w: ['m', 'v', 'v'],
  i: ['l', 'j', 't'],
  l: ['i', 't', 'r'],
  a: ['o', 'e', 'u'],
  e: ['o', 'a', 'c'],
  o: ['a', 'e', 'c'],
  c: ['o', 'e', 'g'],
  g: ['c', 'q', 's'],
  s: ['z', 'c', '5'],
};

const FOCUS_KEY = {
  bd_confusion: 'bd',
  pq_confusion: 'pq',
  vowel_confusion: 'vowels',
  missing_letter: null,
};

function tierForDifficulty(diff) {
  if (diff <= 1) return 1;
  if (diff === 2) return 2;
  if (diff === 3) return 2;
  return 3;
}

function personalInterest(profile) {
  const list = profile.interests && profile.interests.length ? profile.interests : ['default'];
  return pick(list);
}

export function personalContext(profile, word) {
  const interest = personalInterest(profile);
  const idx = Math.floor(Math.random() * CONTEXT_TEMPLATES);
  return {
    contextPath: `content.contexts.${interest}.${idx}`,
    contextVars: { word: String(word).toLowerCase() },
  };
}

function dueWord(profile) {
  const due = srsDue(profile.learning.difficultWords || []);
  if (!due.length) return null;
  return pick(due).word;
}

export function pickTargetWord(profile, { preferDue = false, tier = null, focus = null, exclude = [] } = {}) {
  const diff = difficultyOf(profile);
  const wantTier = tier || tierForDifficulty(diff);
  const interests = profile.interests || [];

  if (preferDue) {
    const due = dueWord(profile);
    if (due && !exclude.includes(due)) return wordMeta(due);
  }

  if (focus && FOCUS_WORDS[focus] && Math.random() < 0.65) {
    const pool = FOCUS_WORDS[focus].filter((w) => !exclude.includes(w));
    if (pool.length) return wordMeta(pick(pool));
  }

  let pool = wordsForInterests(interests, wantTier).filter((x) => !exclude.includes(x.w));
  if (!pool.length) pool = WORDS.filter((x) => !exclude.includes(x.w) && x.tier === wantTier);
  if (!pool.length) pool = WORDS.filter((x) => !exclude.includes(x.w));
  return pick(pool);
}

function letterDistractors(letter) {
  const sims = SIMILAR[letter] || [];
  const others = FOCUS_LETTERS.general.filter((l) => l !== letter && !sims.includes(l));
  const chosen = [];
  sims.slice(0, 2).forEach((s) => chosen.push(s));
  while (chosen.length < 3) {
    const cand = pick(others);
    if (!chosen.includes(cand)) chosen.push(cand);
  }
  return chosen;
}

function wordDistractors(correct, count = 2) {
  const meta = wordMeta(correct);
  const interests = new Set(meta.interests);
  let pool = WORDS.filter(
    (x) =>
      x.w !== correct &&
      x.tier === meta.tier &&
      (x.interests.some((i) => interests.has(i)) || x.interests.length === 0)
  );
  if (pool.length < count) pool = WORDS.filter((x) => x.w !== correct && x.tier === meta.tier);
  if (pool.length < count) pool = WORDS.filter((x) => x.w !== correct);
  return pickN(pool, count).map((x) => x.w);
}

function baseHints(word) {
  const w = String(word).toUpperCase();
  return [
    { key: 'exercise.hint1', vars: { letter: w[0] } },
    { key: 'exercise.hint2', vars: { letters: w.slice(0, 3).split('').join(' ') + ' …' } },
    { key: 'exercise.hint3', vars: {} },
  ];
}

function maskWord(word, blankIndex) {
  return word
    .toUpperCase()
    .split('')
    .map((ch, i) => (i === blankIndex ? '_' : ch));
}

/* ---------------- module generators ---------------- */

function genLetters(profile) {
  const focus = focusErrorType(profile);
  const focusKey = focus ? FOCUS_KEY[focus] : null;

  if (focusKey === 'bd' || focusKey === 'pq') {
    const pair = FOCUS_LETTERS[focusKey];
    const word = pick(FOCUS_WORDS[focusKey]);
    const answer = word[0];
    const blankIdx = 0;
    const other = pair.find((p) => p !== answer) || pair[0];
    return {
      uid: uid('ex'),
      type: 'choice',
      subtype: 'choosePair',
      skill: 'letterRecognition',
      instructionKey: 'exercise.completeWord',
      focusTag: focus,
      prompt: maskWord(word, blankIdx).join(' '),
      options: shuffle([answer, other]),
      answer,
      contextPath: 'content.lettersFocus',
      contextVars: { a: pair[0].toUpperCase(), b: pair[1].toUpperCase() },
      word,
      emoji: wordMeta(word).emoji,
      hints: baseHints(word),
    };
  }

  if (Math.random() < 0.45) {
    const target = focusKey === 'vowels' ? pick(FOCUS_LETTERS.vowels) : pick('bdpqnmu'.split(''));
    const options = shuffle([target, ...letterDistractors(target)]);
    return {
      uid: uid('ex'),
      type: 'choice',
      subtype: 'findLetter',
      skill: 'letterRecognition',
      instructionKey: 'exercise.findLetter',
      instructionVars: { letter: target.toUpperCase() },
      focusTag: focus,
      prompt: null,
      letter: target.toUpperCase(),
      options,
      answer: target,
      hints: [{ key: 'exercise.hint1', vars: { letter: target.toUpperCase() } }],
    };
  }

  if (Math.random() < 0.4) {
    const target = focusKey === 'vowels' ? pick(FOCUS_LETTERS.vowels) : pick(['b', 'd', 'p', 'q', 'a', 'e']);
    return {
      uid: uid('ex'),
      type: 'letterGrid',
      skill: 'letterRecognition',
      instructionKey: 'exercise.findLetters',
      instructionVars: { letter: target.toUpperCase() },
      focusTag: focus,
      answer: target,
      hints: [{ key: 'exercise.hint1', vars: { letter: target.toUpperCase() } }],
    };
  }

  const meta = pickTargetWord(profile, { focus: focusKey, tier: 1 });
  const blankIdx = meta.w.length > 3 ? 1 : 0;
  const options = shuffle([meta.w[blankIdx], ...letterDistractors(meta.w[blankIdx]).slice(0, 3)]);
  return {
    uid: uid('ex'),
    type: 'choice',
    subtype: 'clozeLetter',
    skill: 'letterRecognition',
    instructionKey: 'exercise.cloze',
    focusTag: focus,
    prompt: maskWord(meta.w, blankIdx).join(' '),
    options: shuffle(options),
    answer: meta.w[blankIdx],
    word: meta.w,
    emoji: meta.emoji,
    context: personalContext(profile, meta.w),
    hints: baseHints(meta.w),
  };
}

function genWriting(profile) {
  const focus = focusErrorType(profile);
  const focusKey = focus ? FOCUS_KEY[focus] : null;
  const diff = difficultyOf(profile);
  const missingFocus = focus === 'missing_letter';

  // missing letters → scaffold: cloze first, then full spelling, then sentence
  if (missingFocus && Math.random() < 0.55) {
    const meta = pickTargetWord(profile, { preferDue: Math.random() < 0.5, focus: focusKey });
    const blankIdx = Math.min(1, meta.w.length - 1);
    return {
      uid: uid('ex'),
      type: 'cloze',
      skill: 'spelling',
      instructionKey: 'exercise.cloze',
      focusTag: focus,
      prompt: maskWord(meta.w, blankIdx).join(' '),
      answer: meta.w,
      word: meta.w,
      emoji: meta.emoji,
      context: personalContext(profile, meta.w),
      hints: baseHints(meta.w),
      singleBlank: true,
    };
  }

  if (diff <= 1) {
    const meta = pickTargetWord(profile, { preferDue: true, tier: 1, focus: focusKey });
    const useImage = meta.emoji && Math.random() < 0.5;
    return {
      uid: uid('ex'),
      type: useImage ? 'spellImage' : 'copy',
      skill: 'spelling',
      instructionKey: useImage ? 'exercise.spell' : 'exercise.copy',
      focusTag: focus,
      answer: meta.w,
      word: meta.w,
      emoji: meta.emoji,
      context: personalContext(profile, meta.w),
      hints: baseHints(meta.w),
    };
  }

  if (diff === 2) {
    const meta = pickTargetWord(profile, { preferDue: true, focus: focusKey });
    if (meta.emoji && Math.random() < 0.5) {
      return {
        uid: uid('ex'),
        type: 'dictation',
        skill: 'spelling',
        instructionKey: 'exercise.dictation',
        focusTag: focus,
        answer: meta.w,
        word: meta.w,
        emoji: meta.emoji,
        context: personalContext(profile, meta.w),
        hints: baseHints(meta.w),
      };
    }
    const meta2 = pickTargetWord(profile, { focus: focusKey });
    return {
      uid: uid('ex'),
      type: 'spellImage',
      skill: 'spelling',
      instructionKey: 'exercise.spell',
      focusTag: focus,
      answer: meta2.w,
      word: meta2.w,
      emoji: meta2.emoji,
      context: personalContext(profile, meta2.w),
      hints: baseHints(meta2.w),
    };
  }

  if (diff === 3 && Math.random() < 0.45) {
    const meta = pickTargetWord(profile, { preferDue: true, tier: 3 });
    return {
      uid: uid('ex'),
      type: 'sentence',
      skill: 'writing',
      instructionKey: 'exercise.writeSentence',
      focusTag: focus,
      answer: meta.w,
      word: meta.w,
      emoji: meta.emoji,
      context: {
        key: 'content.sentenceAbout',
        vars: { word: meta.w },
      },
      hints: baseHints(meta.w),
      minChars: Math.max(8, meta.w.length + 5),
    };
  }

  const meta = pickTargetWord(profile, { preferDue: true, focus: focusKey });
  if (Math.random() < 0.3) {
    return {
      uid: uid('ex'),
      type: 'creative',
      skill: 'writing',
      instructionKey: 'exercise.creative',
      focusTag: focus,
      answer: meta.w,
      word: meta.w,
      emoji: meta.emoji,
      context: personalContext(profile, meta.w),
      hints: [],
      minChars: 6,
    };
  }

  return {
    uid: uid('ex'),
    type: 'spellImage',
    skill: 'spelling',
    instructionKey: 'exercise.spell',
    focusTag: focus,
    answer: meta.w,
    word: meta.w,
    emoji: meta.emoji,
    context: personalContext(profile, meta.w),
    hints: baseHints(meta.w),
  };
}

function genGame(profile) {
  const focus = focusErrorType(profile);
  const focusKey = focus ? FOCUS_KEY[focus] : null;

  if (Math.random() < 0.55) {
    const meta = pickTargetWord(profile, { preferDue: true, focus: focusKey });
    if (meta.emoji) {
      const distractors = wordDistractors(meta.w, 2);
      return {
        uid: uid('ex'),
        type: 'choice',
        subtype: 'matchWord',
        skill: 'letterRecognition',
        instructionKey: 'exercise.gameMatch',
        focusTag: focus,
        promptEmoji: meta.emoji,
        options: shuffle([meta.w, ...distractors]),
        answer: meta.w,
        word: meta.w,
        contextPath: 'content.gameIntro',
        contextVars: {},
        hints: baseHints(meta.w),
        wordOptions: true,
      };
    }
  }

  const meta = pickTargetWord(profile, { preferDue: true, tier: difficultyOf(profile) >= 3 ? 2 : 1 });
  return {
    uid: uid('ex'),
    type: 'orderLetters',
    skill: 'spelling',
    instructionKey: 'exercise.gameOrder',
    focusTag: focus,
    answer: meta.w,
    word: meta.w,
    emoji: meta.emoji,
    contextPath: 'content.orderIntro',
    contextVars: {},
    hints: baseHints(meta.w),
  };
}

function genReading(profile) {
  const focus = focusErrorType(profile);
  const diff = difficultyOf(profile);
  const interests = profile.interests || [];
  const story =
    STORIES.find((s) => s.interests.some((i) => interests.includes(i))) || pick(STORIES);

  if (Math.random() < 0.55) {
    const lines = story.sentences.filter((s) => s.split(' ').length <= (diff >= 3 ? 9 : 6));
    const sentence = pick(lines.length ? lines : story.sentences);
    return {
      uid: uid('ex'),
      type: 'readAloud',
      skill: 'reading',
      instructionKey: 'exercise.read',
      focusTag: focus,
      sentence,
      answer: sentence,
      word: null,
      storyId: story.id,
      hints: [],
    };
  }

  const q = pick(story.questions);
  return {
    uid: uid('ex'),
    type: 'choice',
    subtype: 'comprehension',
    skill: 'comprehension',
    instructionKey: q.qKey,
    instructionVars: q.qVars || {},
    questionKey: q.qKey,
    questionVars: q.qVars || {},
    focusTag: null,
    options: q.options,
    emojis: q.emojis,
    answer: q.answer,
    word: null,
    storyId: story.id,
    wordOptions: true,
    hints: [],
  };
}

/**
 * Generate the next adaptive exercise for a module.
 * modules: letters | writing | game | reading | practice
 */
export function generateExercise(profile, module = 'practice') {
  switch (module) {
    case 'letters':
      return genLetters(profile);
    case 'writing':
      return genWriting(profile);
    case 'game':
      return genGame(profile);
    case 'reading':
      return genReading(profile);
    case 'practice':
    default: {
      const weak = weakestSkill(profile);
      const map = {
        letterRecognition: 'letters',
        spelling: 'writing',
        writing: 'writing',
        reading: 'reading',
        comprehension: 'reading',
      };
      const mod = map[weak] || 'writing';
      const roll = Math.random();
      if (roll < 0.7) return generateExercise(profile, mod);
      const others = ['letters', 'writing', 'game', 'reading'].filter((m) => m !== mod);
      return generateExercise(profile, pick(others));
    }
  }
}

/** Build a full set for a learning session. */
export function generateSet(profile, module, size = 4) {
  const used = new Set();
  const items = [];
  let guard = 0;
  while (items.length < size && guard < size * 4) {
    guard += 1;
    const ex = generateExercise(profile, module);
    const key = ex.word || ex.sentence || ex.uid;
    if (used.has(key)) continue;
    used.add(key);
    items.push(ex);
  }
  return items;
}

/** Build a writing exercise for an explicit level (1–6). */
export function buildWritingExercise(profile, level) {
  const focus = focusErrorType(profile);
  const focusKey = focus ? FOCUS_KEY[focus] : null;

  if (level === 1) {
    const meta = pickTargetWord(profile, { focus: focusKey });
    return {
      uid: uid('ex'),
      type: 'copy',
      skill: 'spelling',
      instructionKey: 'exercise.copy',
      focusTag: focus,
      answer: meta.w,
      word: meta.w,
      emoji: meta.emoji,
      context: personalContext(profile, meta.w),
      hints: baseHints(meta.w),
    };
  }
  if (level === 2) {
    const meta = pickTargetWord(profile, {});
    return {
      uid: uid('ex'),
      type: 'spellImage',
      skill: 'spelling',
      instructionKey: 'exercise.spell',
      focusTag: focus,
      answer: meta.w,
      word: meta.w,
      emoji: meta.emoji || '🖼️',
      context: personalContext(profile, meta.w),
      hints: baseHints(meta.w),
    };
  }
  if (level === 3) {
    const meta = pickTargetWord(profile, { preferDue: true });
    return {
      uid: uid('ex'),
      type: 'dictation',
      skill: 'spelling',
      instructionKey: 'exercise.dictation',
      focusTag: focus,
      answer: meta.w,
      word: meta.w,
      emoji: meta.emoji,
      context: personalContext(profile, meta.w),
      hints: baseHints(meta.w),
    };
  }
  if (level === 4) {
    const meta = pickTargetWord(profile, { preferDue: true, focus: focusKey });
    return {
      uid: uid('ex'),
      type: 'cloze',
      skill: 'spelling',
      instructionKey: 'exercise.cloze',
      focusTag: focus,
      prompt: maskWord(meta.w, Math.min(1, meta.w.length - 1)).join(' '),
      answer: meta.w,
      word: meta.w,
      emoji: meta.emoji,
      context: personalContext(profile, meta.w),
      hints: baseHints(meta.w),
      singleBlank: true,
    };
  }
  if (level === 5) {
    const meta = pickTargetWord(profile, { tier: 2 });
    return {
      uid: uid('ex'),
      type: 'sentence',
      skill: 'writing',
      instructionKey: 'exercise.writeSentence',
      focusTag: focus,
      answer: meta.w,
      word: meta.w,
      emoji: meta.emoji,
      context: { key: 'content.sentenceAbout', vars: { word: meta.w } },
      hints: baseHints(meta.w),
      minChars: Math.max(8, meta.w.length + 5),
    };
  }
  const meta = pickTargetWord(profile, { tier: 2 });
  return {
    uid: uid('ex'),
    type: 'creative',
    skill: 'writing',
    instructionKey: 'exercise.creative',
    focusTag: focus,
    answer: meta.w,
    word: meta.w,
    emoji: meta.emoji,
    context: personalContext(profile, meta.w),
    hints: [],
    minChars: 8,
  };
}

/** 6-step friendly diagnostic for a brand-new profile. */
export function buildDiagnostic(profile) {
  const letter = pick(['b', 'd', 'p', 'q', 'a', 'm']);
  const catWord = 'cat';
  const tasks = [
    {
      uid: uid('dx'),
      type: 'choice',
      subtype: 'findLetter',
      skill: 'letterRecognition',
      instructionKey: 'diagnostic.q_findLetter',
      instructionVars: { letter: letter.toUpperCase() },
      options: shuffle([letter, ...letterDistractors(letter)]),
      answer: letter,
      letter: letter.toUpperCase(),
      hints: [],
      diagnostic: true,
    },
    {
      uid: uid('dx'),
      type: 'choice',
      subtype: 'matchWord',
      skill: 'reading',
      instructionKey: 'diagnostic.q_whichWord',
      instructionVars: { word: catWord.toUpperCase() },
      options: shuffle([catWord, 'cap', 'can']),
      answer: catWord,
      wordOptions: true,
      word: catWord,
      hints: [],
      diagnostic: true,
    },
    {
      uid: uid('dx'),
      type: 'cloze',
      skill: 'spelling',
      instructionKey: 'diagnostic.q_missing',
      prompt: 'C _ T',
      answer: catWord,
      word: catWord,
      emoji: '🐱',
      hints: [],
      singleBlank: true,
      diagnostic: true,
    },
    {
      uid: uid('dx'),
      type: 'spellImage',
      skill: 'spelling',
      instructionKey: 'diagnostic.q_spelling',
      answer: 'dog',
      word: 'dog',
      emoji: '🐶',
      hints: [],
      diagnostic: true,
    },
    {
      uid: uid('dx'),
      type: 'readAloud',
      skill: 'reading',
      instructionKey: 'diagnostic.q_read',
      sentence: 'Dino sees a big rocket.',
      answer: 'Dino sees a big rocket.',
      hints: [],
      diagnostic: true,
    },
    {
      uid: uid('dx'),
      type: 'choice',
      subtype: 'comprehension',
      skill: 'comprehension',
      instructionKey: 'diagnostic.q_comp',
      options: ['Dino', 'Luna', 'Milo'],
      emojis: ['🦖', '🦊', '🐻'],
      answer: 'Dino',
      wordOptions: true,
      hints: [],
      diagnostic: true,
    },
  ];
  return tasks;
}

export function seedProfileFromDiagnostic(results) {
  /* results: [{skill, ok}] — produce a realistic starting profile */
  const bySkill = {};
  results.forEach((r) => {
    if (!bySkill[r.skill]) bySkill[r.skill] = { n: 0, ok: 0 };
    bySkill[r.skill].n += 1;
    if (r.ok) bySkill[r.skill].ok += 1;
  });
  const out = {};
  Object.entries(bySkill).forEach(([k, v]) => {
    out[k] = { attempts: v.n * 3, correct: Math.round(v.n * 3 * (v.ok / v.n)) };
  });
  return out;
}

export { normalizeWord };
