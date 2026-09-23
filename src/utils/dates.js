export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(aKey, bKey) {
  const a = new Date(`${aKey}T00:00:00`);
  const b = new Date(`${bKey}T00:00:00`);
  return Math.round((b - a) / 86400000);
}

export function daysAgoKey(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayKey(d);
}

export function formatDate(iso, lang = 'en') {
  try {
    const locale = { en: 'en-US', ru: 'ru-RU', kk: 'kk-KZ' }[lang] || 'en-US';
    return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

export function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
