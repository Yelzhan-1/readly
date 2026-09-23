/* All profile mutations go through here so results are applied
   immediately (copy → engine → replace) and events become toasts. */

import { useCallback, useMemo } from 'react';
import { useApp } from '../store/AppContext.jsx';
import { useNotify } from './useNotify.js';
import {
  applyExerciseResult,
  recordSession,
  markQuestItem,
  giveStars,
} from '../services/profileService.js';
import { generateSet } from '../services/adaptiveEngine.js';
import { generateStory } from '../services/storyGenerator.js';

function clone(p) {
  return JSON.parse(JSON.stringify(p));
}

export function useLearning() {
  const { profile, mutateProfile, addStory, pushToast } = useApp();
  const notify = useNotify();

  const recordExercise = useCallback(
    (payload) => {
      if (!profile) return null;
      const working = clone(profile);
      const res = applyExerciseResult(working, payload);
      mutateProfile(profile.id, () => res.profile);
      notify(res.events);
      return res.analysis;
    },
    [profile, mutateProfile, notify]
  );

  const finishSession = useCallback(
    ({ module, correct, total, stars, durationSec, questItem = null }) => {
      if (!profile) return;
      let working = clone(profile);
      let res = recordSession(working, { module, correct, total, stars, durationSec });
      working = res.profile;
      let events = [...res.events];
      if (questItem) {
        res = markQuestItem(working, questItem);
        working = res.profile;
        events = [...events, ...res.events];
      }
      mutateProfile(profile.id, () => working);
      notify(events);
    },
    [profile, mutateProfile, notify]
  );

  const buildSet = useCallback(
    (module, size) => {
      if (!profile) return [];
      return generateSet(profile, module, size);
    },
    [profile]
  );

  const makeStory = useCallback(
    (opts = {}) => {
      if (!profile) return null;
      const conf = typeof opts === 'number' ? { seedMix: opts } : opts;
      const story = generateStory(profile, conf.seedMix ?? 0, conf);
      addStory(story);
      return story;
    },
    [profile, addStory]
  );

  const patchProfile = useCallback(
    (patch) => {
      if (!profile) return;
      mutateProfile(profile.id, (p) => ({ ...p, ...patch }));
    },
    [profile, mutateProfile]
  );

  const award = useCallback(
    (n) => {
      if (!profile) return;
      const working = clone(profile);
      const res = giveStars(working, n);
      mutateProfile(profile.id, () => res.profile);
      notify(res.events);
    },
    [profile, mutateProfile, notify]
  );

  /** Mark a finished story: counts + quest + a few stars. */
  const completeStory = useCallback(() => {
    if (!profile) return;
    let working = clone(profile);
    working.readStories = (working.readStories || 0) + 1;
    let res = giveStars(working, 6);
    working = res.profile;
    let events = [...res.events];
    res = markQuestItem(working, 'reading');
    working = res.profile;
    events = [...events, ...res.events];
    mutateProfile(profile.id, () => working);
    notify(events);
  }, [profile, mutateProfile, notify]);

  return useMemo(
    () => ({
      profile,
      recordExercise,
      finishSession,
      buildSet,
      makeStory,
      patchProfile,
      award,
      completeStory,
      pushToast,
    }),
    [profile, recordExercise, finishSession, buildSet, makeStory, patchProfile, award, completeStory, pushToast]
  );
}
