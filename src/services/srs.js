/* Simplified spaced repetition (SM-2 flavoured, local only). */

const DAY = 86400000;

function entryFor(list, word) {
  return list.find((x) => x.word === word) || null;
}

export function srsEnsure(list, word) {
  const found = entryFor(list, word);
  if (found) return found;
  const fresh = { word, ease: 2.3, interval: 0, due: Date.now(), lapses: 0, seen: 0 };
  list.push(fresh);
  return fresh;
}

/**
 * quality: 0 = failed, 1 = correct with hints / partial, 2 = clean success
 */
export function srsReview(entry, quality) {
  if (!entry) return entry;
  entry.seen += 1;
  if (quality === 0) {
    entry.lapses += 1;
    entry.ease = Math.max(1.3, entry.ease - 0.2);
    entry.interval = 0;
    entry.due = Date.now() + DAY;
  } else if (quality === 1) {
    entry.ease = Math.max(1.3, entry.ease - 0.05);
    entry.interval = entry.interval === 0 ? 1 : Math.max(1, Math.round(entry.interval * 1.2));
    entry.due = Date.now() + entry.interval * DAY;
  } else {
    entry.ease = Math.min(3.2, entry.ease + 0.1);
    if (entry.interval === 0) entry.interval = 1;
    else if (entry.interval === 1) entry.interval = 2;
    else entry.interval = Math.min(60, Math.round(entry.interval * entry.ease));
    entry.due = Date.now() + entry.interval * DAY;
  }
  return entry;
}

export function srsDue(list, now = Date.now()) {
  return list.filter((x) => x.due <= now).sort((a, b) => a.due - b.due);
}

export function srsIsMastered(entry) {
  return entry.interval >= 8 && entry.lapses <= 1;
}

export function srsSummary(list) {
  const now = Date.now();
  return {
    total: list.length,
    due: list.filter((x) => x.due <= now).length,
    mastered: list.filter(srsIsMastered).length,
  };
}
