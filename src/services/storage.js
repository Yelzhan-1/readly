const KEY = 'readly.state.v1';

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.profiles)) return null;
    return parsed;
  } catch (err) {
    console.warn('[storage] failed to load state', err);
    return null;
  }
}

export function saveState(state) {
  try {
    const slim = {
      lang: state.lang,
      settings: state.settings,
      profiles: state.profiles,
      activeProfileId: state.activeProfileId,
      stories: state.stories,
    };
    localStorage.setItem(KEY, JSON.stringify(slim));
    return true;
  } catch (err) {
    console.warn('[storage] failed to save state', err);
    return false;
  }
}

export function clearState() {
  try {
    localStorage.removeItem(KEY);
  } catch (err) {
    console.warn('[storage] failed to clear state', err);
  }
}
