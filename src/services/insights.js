/* Parent-facing insights: honest, non-clinical, derived only from app data.
   Values that should themselves be translated are prefixed with '%'
   and resolved via resolveInsightVars(). */

import { commonErrors, focusErrorType, weeklyAccuracy, skillAccuracy, SKILLS } from './profileService.js';

function countTypeIn(profile, type, days) {
  const since = Date.now() - days * 86400000;
  return (profile.learning.errorLog || []).filter((e) => e.type === type && e.at >= since).length;
}

function activeDays(profile, days = 7) {
  const since = Date.now() - days * 86400000;
  const set = new Set();
  (profile.history || [])
    .filter((h) => h.at >= since)
    .forEach((h) => set.add(new Date(h.at).toDateString()));
  return set.size;
}

function skillWeek(profile, skill, startDaysAgo, endDaysAgo = 0) {
  const from = new Date();
  from.setDate(from.getDate() - startDaysAgo);
  from.setHours(0, 0, 0, 0);
  const to = new Date();
  to.setDate(to.getDate() - endDaysAgo);
  to.setHours(23, 59, 59, 999);
  const items = (profile.history || []).filter(
    (h) => h.skill === skill && h.at >= from.getTime() && h.at <= to.getTime()
  );
  if (!items.length) return null;
  return items.filter((h) => h.ok).length / items.length;
}

const SKILL_LABEL_KEYS = {
  letterRecognition: 'parent.skillLetter',
  spelling: 'parent.skillSpelling',
  reading: 'parent.skillReading',
  comprehension: 'parent.skillComprehension',
  writing: 'parent.skillWriting',
};

/** Resolve '%' prefixed vars into translated strings. */
export function resolveInsightVars(t, vars = {}) {
  const out = {};
  Object.entries(vars).forEach(([k, v]) => {
    out[k] = typeof v === 'string' && v.startsWith('%') ? t(v.slice(1)) : v;
  });
  return out;
}

/**
 * Build a short list of insights for the parent dashboard.
 * @returns {Array<{icon: string, key: string, vars: object}>}
 */
export function generateInsights(profile) {
  const out = [];
  if (!profile) return out;

  /* best / worst skill shifts this week vs last week */
  let best = null;
  let worst = null;
  SKILLS.forEach((skill) => {
    const now = skillWeek(profile, skill, 6, 0);
    const prev = skillWeek(profile, skill, 13, 7);
    if (now == null || prev == null) return;
    const delta = now - prev;
    if (!best || delta > best.delta) best = { skill, delta, now, prev };
    if (!worst || delta < worst.delta) worst = { skill, delta, now, prev };
  });

  if (best && best.delta >= 0.05) {
    out.push({
      icon: '📈',
      key: 'parent.insightImproving',
      vars: {
        skill: `%${SKILL_LABEL_KEYS[best.skill]}`,
        from: Math.round(best.prev * 100),
        to: Math.round(best.now * 100),
      },
    });
  } else if (worst && worst.delta <= -0.05) {
    out.push({
      icon: '🌱',
      key: 'parent.insightDeclining',
      vars: { skill: `%${SKILL_LABEL_KEYS[worst.skill]}` },
    });
  }

  if (countTypeIn(profile, 'long_word', 7) >= 2) {
    out.push({ icon: '🧩', key: 'parent.insightLongWords', vars: { name: profile.name } });
  }

  const bdNow = countTypeIn(profile, 'bd_confusion', 7);
  const bdPrev = countTypeIn(profile, 'bd_confusion', 14) - bdNow;
  if (bdNow > 0) {
    const trend =
      bdNow < bdPrev
        ? '%parent.insightBdLess'
        : bdNow > bdPrev
          ? '%parent.insightBdMore'
          : '%parent.insightBdSame';
    out.push({ icon: '🔁', key: 'parent.insightBd', vars: { n: bdNow, t: trend } });
  }

  if (profile.streak >= 2) {
    out.push({ icon: '🔥', key: 'parent.insightStreak', vars: { name: profile.name, n: profile.streak } });
  }

  const days = activeDays(profile, 7);
  if (days >= 2) {
    out.push({ icon: '🗓️', key: 'parent.insightQuest', vars: { n: days } });
  }

  const focus = focusErrorType(profile);
  if (focus) {
    const rec =
      focus === 'long_word' || focus === 'reading' || focus === 'comprehension' || focus === 'skipped_word'
        ? '%parent.recReading'
        : focus === 'spelling' || focus === 'word_substitution' || focus === 'sentence_structure' || focus === 'missing_letter' || focus === 'extra_letter'
          ? '%parent.recWriting'
          : '%parent.recLetters';
    out.push({ icon: '💡', key: 'parent.insightRec', vars: { rec } });
  }

  if (!out.length) {
    out.push({ icon: '💤', key: 'parent.insightNoData', vars: {} });
  }

  return out.slice(0, 5);
}

/** Current per-skill accuracy snapshot. */
export function skillSnapshots(profile) {
  return SKILLS.map((skill) => ({
    skill,
    labelKey: SKILL_LABEL_KEYS[skill],
    now: skillAccuracy(profile, skill),
    attempts: profile.learning.skills[skill]?.attempts || 0,
    prev: skillWeek(profile, skill, 13, 7),
    week: skillWeek(profile, skill, 6, 0),
  }));
}

/** Last-7-days daily accuracy for the bar chart. */
export function dailyAccuracy(profile, days = 7) {
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    const items = (profile.history || []).filter((h) => h.at >= d.getTime() && h.at <= end.getTime());
    out.push({
      date: d,
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      value: items.length ? Math.round((items.filter((h) => h.ok).length / items.length) * 100) : null,
      n: items.length,
    });
  }
  return out;
}

export { commonErrors, focusErrorType, weeklyAccuracy };
