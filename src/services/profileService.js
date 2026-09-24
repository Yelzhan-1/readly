/* OBSERVE → UNDERSTAND → ADAPT
   profileService applies real exercise results to the learning profile. */

import { todayKey, daysBetween, daysAgoKey, clamp } from '../utils/dates.js';
import { srsEnsure, srsReview, srsIsMastered, srsDue } from './srs.js';
import { BADGES } from '../data/badges.js';
import { WORLDS, levelForStars, nextLevel } from '../data/worlds.js';
import { classify } from './errorAnalyzer.js';

export const SKILLS = ['letterRecognition', 'spelling', 'reading', 'comprehension', 'writing'];

export function emptySkills() {
  const s = {};
  SKILLS.forEach((k) => {
    s[k] = { attempts: 0, correct: 0 };
  });
  return s;
}

/** Fill arrays and skill counters so a partial cloud profile cannot crash the app. */
export function normalizeProfile(profile) {
  if (!profile || typeof profile !== 'object') return profile;
  const skills = emptySkills();
  const incoming =
    profile.learning && profile.learning.skills && typeof profile.learning.skills === 'object'
      ? profile.learning.skills
      : {};
  SKILLS.forEach((k) => {
    const row = incoming[k];
    skills[k] = {
      attempts: Number(row && row.attempts) || 0,
      correct: Number(row && row.correct) || 0,
    };
  });
  const learning = profile.learning && typeof profile.learning === 'object' ? profile.learning : {};
  profile.history = Array.isArray(profile.history) ? profile.history : [];
  profile.worlds = Array.isArray(profile.worlds) ? profile.worlds : [];
  profile.badges = Array.isArray(profile.badges) ? profile.badges : [];
  profile.stars = Number(profile.stars) || 0;
  profile.learning = {
    ...learning,
    difficulty: learning.difficulty || 1,
    skills,
    errorLog: Array.isArray(learning.errorLog) ? learning.errorLog : [],
    difficultWords: Array.isArray(learning.difficultWords) ? learning.difficultWords : [],
    masteredWords: Array.isArray(learning.masteredWords) ? learning.masteredWords : [],
    recent: Array.isArray(learning.recent) ? learning.recent : [],
  };
  return profile;
}

export function skillAccuracy(profile, skill) {
  const s = profile?.learning?.skills?.[skill];
  if (!s || !s.attempts) return null;
  return s.correct / s.attempts;
}

export function overallAccuracy(profile, skills = SKILLS) {
  let a = 0;
  let c = 0;
  skills.forEach((k) => {
    const s = profile?.learning?.skills?.[k];
    if (s) {
      a += s.attempts;
      c += s.correct;
    }
  });
  return a ? c / a : null;
}

export function accuracyMap(profile) {
  const out = {};
  SKILLS.forEach((k) => {
    out[k] = skillAccuracy(profile, k);
  });
  return out;
}

export function recentAccuracy(profile, days = 7) {
  const since = Date.now() - days * 86400000;
  const items = (profile.history || []).filter((h) => h.at >= since);
  if (!items.length) return null;
  const ok = items.filter((h) => h.ok).length;
  return ok / items.length;
}

export function weeklyAccuracy(profile, startDaysAgo, endDaysAgo = 0) {
  const from = new Date();
  from.setDate(from.getDate() - startDaysAgo);
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setDate(to.getDate() - endDaysAgo);
  to.setHours(23, 59, 59, 999);
  const items = (profile.history || []).filter((h) => h.at >= from.getTime() && h.at <= to.getTime());
  if (!items.length) return null;
  return items.filter((h) => h.ok).length / items.length;
}

/** Weighted error patterns: recent counts matter more than old ones. */
export function commonErrors(profile, limit = 8) {
  const now = Date.now();
  const d7 = now - 7 * 86400000;
  const d14 = now - 14 * 86400000;
  const map = new Map();
  (profile.learning.errorLog || []).forEach((e) => {
    if (!map.has(e.type)) map.set(e.type, { type: e.type, total: 0, recent: 0, prev: 0 });
    const row = map.get(e.type);
    row.total += 1;
    if (e.at >= d7) row.recent += 1;
    else if (e.at >= d14) row.prev += 1;
  });
  return [...map.values()]
    .map((r) => ({ ...r, weight: r.recent * 3 + r.prev * 1.5 + r.total * 0.4 }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit);
}

export function focusErrorType(profile) {
  const errs = commonErrors(profile, 5);
  if (!errs.length) return null;
  const top = errs[0];
  if (top.recent === 0 && top.total < 2) return null;
  return top.type;
}

export function weakestSkill(profile) {
  let worst = null;
  let worstVal = 1.1;
  const skills = profile?.learning?.skills || emptySkills();
  SKILLS.forEach((k) => {
    const s = skills[k];
    if (s && s.attempts >= 3) {
      const val = s.correct / s.attempts;
      if (val < worstVal) {
        worstVal = val;
        worst = k;
      }
    }
  });
  if (worst) return worst;
  // not enough data → prefer letter recognition first
  const first = SKILLS.find((k) => (skills[k]?.attempts || 0) < 3);
  return first || 'spelling';
}

export function difficultyOf(profile, pref) {
  const base = profile.learning?.difficulty || 1;
  const mode = pref || profile?.parentDifficulty || 'auto';
  if (mode === 'easy') return clamp(base - 1, 1, 4);
  if (mode === 'hard') return clamp(base + 1, 1, 4);
  return clamp(base, 1, 4);
}

/** Parent session length scales a module's exercise count. */
export function sessionItemCount(base, length = 'medium') {
  const n = Number(base) || 4;
  if (length === 'short') return Math.max(2, Math.round(n * 0.5));
  if (length === 'long') return Math.max(n + 1, Math.round(n * 1.5));
  return n;
}

function pushCapped(arr, item, cap) {
  arr.unshift(item);
  if (arr.length > cap) arr.length = cap;
}

function touchStreak(profile) {
  const today = todayKey();
  const events = [];
  if (profile.lastActiveDate === today) return { events };
  const gap = profile.lastActiveDate ? daysBetween(profile.lastActiveDate, today) : null;
  if (gap === 1) profile.streak = (profile.streak || 0) + 1;
  else profile.streak = 1;
  profile.lastActiveDate = today;
  if (profile.streak >= 3) events.push({ kind: 'streak', n: profile.streak });
  return { events };
}

function award(profile, n) {
  const events = [];
  if (n <= 0) return events;
  const beforeLevel = levelForStars(profile.stars).id;
  profile.stars += n;
  events.push({ kind: 'stars', n });
  const afterLevel = levelForStars(profile.stars).id;
  if (afterLevel !== beforeLevel) events.push({ kind: 'level', id: afterLevel });
  WORLDS.forEach((w) => {
    if (profile.stars >= w.unlockStars && !profile.worlds.includes(w.id)) {
      profile.worlds.push(w.id);
      events.push({ kind: 'world', id: w.id });
    }
  });
  return events;
}

function evaluateBadges(profile) {
  const events = [];
  BADGES.forEach((b) => {
    if (profile.badges.includes(b.id)) return;
    if (b.test(profile)) {
      profile.badges.push(b.id);
      events.push({ kind: 'badge', id: b.id });
    }
  });
  return events;
}

function adaptDifficulty(profile, ok) {
  const recent = profile.learning.recent || [];
  if (recent.length < 6) return;
  const last = recent.slice(0, 6);
  const hits = last.filter((r) => r.ok).length;
  if (hits >= 5 && profile.learning.difficulty < 4) profile.learning.difficulty += 1;
  else if (hits <= 2 && profile.learning.difficulty > 1) profile.learning.difficulty -= 1;
}

/**
 * Main entry: record a single graded exercise.
 * payload: { module, skill, kind, expected, actual, word, hints, durationSec, stars, analysis? }
 */
export function applyExerciseResult(profile, payload) {
  normalizeProfile(profile);
  const {
    module = 'practice',
    skill = 'spelling',
    kind = 'word',
    expected = '',
    actual = '',
    word = null,
    hints = 0,
    durationSec = 0,
    stars = 0,
    analysis: provided = null,
  } = payload;

  const analysis = provided || classify(expected, actual, kind);
  const ok = analysis.ok;
  const events = [];

  // skills
  const sk = profile.learning.skills[skill] || { attempts: 0, correct: 0 };
  sk.attempts += 1;
  if (ok) sk.correct += 1;
  profile.learning.skills[skill] = sk;

  // error log (patterns the system watches)
  (analysis.types || []).forEach((type) => {
    pushCapped(profile.learning.errorLog, { type, at: Date.now(), module }, 400);
  });

  // difficult words — spaced repetition
  const target = word || (kind === 'word' ? String(expected).trim().toLowerCase() : null);
  if (target && target.length > 2 && target.includes(' ') === false) {
    const entry = srsEnsure(profile.learning.difficultWords, target.toLowerCase());
    const quality = ok ? (hints === 0 ? 2 : 1) : 0;
    srsReview(entry, quality);
    if (!ok) entry.lastErrorAt = Date.now();
    if (srsIsMastered(entry) && !profile.learning.masteredWords.includes(entry.word)) {
      profile.learning.masteredWords.push(entry.word);
      profile.learning.difficultWords = profile.learning.difficultWords.filter(
        (x) => x.word !== entry.word
      );
      events.push({ kind: 'word', word: entry.word });
    }
  }

  // reading speed
  if (payload.wpm && profile.learning.readingSpeed) {
    profile.learning.readingSpeed = Math.round(profile.learning.readingSpeed * 0.6 + payload.wpm * 0.4);
  } else if (payload.wpm) {
    profile.learning.readingSpeed = payload.wpm;
  }

  // recency for difficulty adaptation
  profile.learning.recent = profile.learning.recent || [];
  pushCapped(profile.learning.recent, { ok, at: Date.now() }, 30);
  adaptDifficulty(profile, ok);

  // history for parents
  pushCapped(
    profile.history,
    {
      id: `h_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      at: Date.now(),
      module,
      skill,
      ok,
      word: target || (kind === 'sentence' ? String(expected).slice(0, 40) : null),
      errors: analysis.types || [],
      hints,
      durationSec,
    },
    400
  );

  // stars / streak / badges / worlds
  events.push(...award(profile, stars));
  events.push(...touchStreak(profile).events);

  if (ok && analysis.types && analysis.types.length === 0 && !payload.hasErrors) {
    // perfect clean answer — candidate for perfect badge marker
    profile.badges = profile.badges || [];
    if (!profile.badges.includes('__perfect_seen') && profile.history.length >= 1) {
      profile.badges.push('__perfect_seen');
    }
  }
  events.push(...evaluateBadges(profile));

  return { profile, analysis, events };
}

/** Award stars outside a graded exercise (story reading, bonuses). */
export function giveStars(profile, n) {
  normalizeProfile(profile);
  return { profile, events: award(profile, n) };
}

export function recordSession(profile, { module, correct = 0, total = 0, stars = 0, durationSec = 0 }) {
  normalizeProfile(profile);
  const events = [];
  profile.sessions = profile.sessions || [];
  pushCapped(
    profile.sessions,
    { at: Date.now(), module, correct, total, stars, durationSec },
    200
  );
  profile.wordsPracticed = (profile.wordsPracticed || 0) + total;
  events.push(...touchStreak(profile).events);
  return { profile, events };
}

export function markQuestItem(profile, itemId) {
  normalizeProfile(profile);
  const events = [];
  const today = todayKey();
  if (!profile.dailyQuest || profile.dailyQuest.date !== today) {
    profile.dailyQuest = {
      date: today,
      items: { letters: false, reading: false, writing: false, game: false },
    };
  }
  if (itemId && profile.dailyQuest.items[itemId] === false) {
    profile.dailyQuest.items[itemId] = true;
    const done = Object.values(profile.dailyQuest.items).every(Boolean);
    if (done) {
      profile.questsDone = (profile.questsDone || 0) + 1;
      events.push({ kind: 'quest' });
      events.push(...award(profile, 15));
      events.push(...evaluateBadges(profile));
    }
  }
  return { profile, events };
}

export function resetDailyQuest(profile) {
  normalizeProfile(profile);
  const today = todayKey();
  if (!profile.dailyQuest || profile.dailyQuest.date !== today) {
    profile.dailyQuest = {
      date: today,
      items: { letters: false, reading: false, writing: false, game: false },
    };
  }
  return profile;
}

export function questProgress(profile) {
  const items = profile.dailyQuest?.items || {};
  const values = Object.values(items);
  return { done: values.filter(Boolean).length, total: values.length || 4 };
}

export function derivedProfile(profile) {
  const safe = normalizeProfile({ ...(profile || {}) });
  const level = levelForStars(safe.stars);
  const next = nextLevel(safe.stars);
  const acc = accuracyMap(safe);
  return {
    level,
    next,
    levelPercent: next
      ? clamp(
          ((safe.stars - level.minStars) / (next.minStars - level.minStars)) * 100,
          0,
          100
        )
      : 100,
    accuracies: acc,
    dueWords: srsDue(safe.learning.difficultWords || []).map((x) => x.word),
    currentWorld: WORLDS.find((w) => safe.worlds.includes(w.id)) || WORLDS[0],
  };
}

export function learningTimeSeconds(profile, days = 7) {
  const since = Date.now() - days * 86400000;
  return (profile.history || [])
    .filter((h) => h.at >= since)
    .reduce((sum, h) => sum + (h.durationSec || 0), 0);
}

export function moduleLabelKey(module) {
  const map = {
    letters: 'parent.moduleLetters',
    reading: 'parent.moduleReading',
    writing: 'parent.moduleWriting',
    game: 'parent.moduleGame',
    diagnostic: 'parent.moduleDiagnostic',
    practice: 'parent.modulePractice',
  };
  return map[module] || 'parent.modulePractice';
}

const ERROR_KEYS = {
  bd_confusion: 'parent.err_bd',
  pq_confusion: 'parent.err_pq',
  missing_letter: 'parent.err_missing',
  extra_letter: 'parent.err_extra',
  wrong_letter: 'parent.err_wrong',
  letter_order: 'parent.err_order',
  vowel_confusion: 'parent.err_vowel',
  long_word: 'parent.err_long',
  spelling: 'parent.err_spelling',
  word_substitution: 'parent.err_sub',
  skipped_word: 'parent.err_skip',
  repeated_word: 'parent.err_repeat',
  sentence_structure: 'parent.err_sentence',
  extra_word: 'parent.err_extra',
};

export function errorLabelKey(type) {
  return ERROR_KEYS[type] || 'parent.err_spelling';
}

const SKILL_KEYS = {
  letterRecognition: 'parent.skillLetter',
  spelling: 'parent.skillSpelling',
  reading: 'parent.skillReading',
  comprehension: 'parent.skillComprehension',
  writing: 'parent.skillWriting',
};

export function skillLabelKey(skill) {
  return SKILL_KEYS[skill] || 'parent.skillSpelling';
}

export { daysAgoKey };
