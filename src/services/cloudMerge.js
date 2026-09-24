/* Merge a cloud pull into on-device state.
   Newer local progress wins. Demo profiles and local-only stories stay. */

import { normalizeProfile } from './profileService.js';

export function profileFreshness(profile) {
  const history = Array.isArray(profile?.history) ? profile.history : [];
  const fromHistory = history.reduce((max, item) => Math.max(max, item?.at || 0), 0);
  return Math.max(fromHistory, Number(profile?.updatedAt) || 0);
}

export function mergeHydratedState(state, remote) {
  const byId = new Map(
    (state.profiles || []).map((profile) => [profile.id, normalizeProfile({ ...profile })])
  );

  (remote?.profiles || []).forEach((raw) => {
    const incoming = normalizeProfile({ ...raw });
    if (!incoming.id) return;
    const local = byId.get(incoming.id);
    if (!local) {
      byId.set(incoming.id, incoming);
      return;
    }
    const keepLocal = profileFreshness(local) >= profileFreshness(incoming);
    const chosen = keepLocal ? local : incoming;
    if (local.demo) chosen.demo = true;
    byId.set(incoming.id, chosen);
  });

  const profiles = [...byId.values()];
  const storyMap = new Map();
  (state.stories || []).forEach((story) => {
    if (story?.id) storyMap.set(story.id, story);
  });
  (remote?.stories || []).forEach((story) => {
    if (story?.id && !storyMap.has(story.id)) storyMap.set(story.id, story);
  });

  const activeProfileId = profiles.some((profile) => profile.id === state.activeProfileId)
    ? state.activeProfileId
    : profiles[0]?.id || null;

  return {
    profiles,
    stories: [...storyMap.values()].slice(0, 14),
    activeProfileId,
  };
}
