import assert from 'node:assert/strict';
import { WORDS } from '../src/data/words.js';
import { buildWritingExercise } from '../src/services/adaptiveEngine.js';
import { mergeHydratedState, profileFreshness } from '../src/services/cloudMerge.js';
import {
  applyExerciseResult,
  derivedProfile,
  learningTimeSeconds,
  normalizeProfile,
  recentAccuracy,
  weeklyAccuracy,
} from '../src/services/profileService.js';

function tierOf(word) {
  return WORDS.find((row) => row.w === word)?.tier ?? null;
}

function profile(extra = {}) {
  return {
    id: 'p1',
    name: 'Ayan',
    interests: ['space'],
    stars: 10,
    learning: { difficulty: 2, skills: {}, errorLog: [], difficultWords: [] },
    ...extra,
  };
}

const easyTiers = Array.from({ length: 12 }, () =>
  tierOf(buildWritingExercise(profile({ parentDifficulty: 'easy' }), 1).word)
);
const hardTiers = Array.from({ length: 12 }, () =>
  tierOf(buildWritingExercise(profile({ parentDifficulty: 'hard' }), 2).word)
);
assert.ok(easyTiers.every((tier) => tier === 1), `easy short writing stayed tier 1, got ${easyTiers}`);
assert.ok(hardTiers.every((tier) => tier >= 2), `hard short writing left tier 1, got ${hardTiers}`);

assert.equal(recentAccuracy({}), null);
assert.equal(weeklyAccuracy({ history: undefined }), null);
assert.equal(learningTimeSeconds({}), 0);

const bare = normalizeProfile({ id: 'cloud', name: 'Nova' });
assert.ok(Array.isArray(bare.history));
assert.ok(Array.isArray(bare.worlds));
assert.equal(typeof bare.learning.skills.reading.attempts, 'number');
assert.ok(derivedProfile({ name: 'Z' }).level);
const recorded = applyExerciseResult({ name: 'Q' }, {
  module: 'letters',
  skill: 'letterRecognition',
  kind: 'letter',
  expected: 'b',
  actual: 'b',
  stars: 1,
});
assert.equal(recorded.profile.history.length, 1);

const local = profile({
  demo: true,
  history: [{ at: 500, ok: true }],
  updatedAt: 500,
});
const remoteOlder = profile({
  demo: false,
  history: [{ at: 100, ok: true }],
  updatedAt: 100,
  stars: 1,
});
const remoteOnly = profile({ id: 'remote-only', name: 'Mira', history: [{ at: 50, ok: true }] });
const merged = mergeHydratedState(
  {
    profiles: [local, { id: 'local-only', name: 'Extra', demo: true, history: [] }],
    stories: [{ id: 's-local', title: 'Local' }],
    activeProfileId: 'p1',
  },
  {
    profiles: [remoteOlder, remoteOnly],
    stories: [{ id: 's-cloud', title: 'Cloud' }, { id: 's-local', title: 'Old cloud copy' }],
  }
);
const ayan = merged.profiles.find((row) => row.id === 'p1');
assert.equal(ayan.demo, true);
assert.equal(profileFreshness(ayan), 500);
assert.equal(ayan.stars, 10);
assert.ok(merged.profiles.some((row) => row.id === 'local-only'));
assert.ok(merged.profiles.some((row) => row.id === 'remote-only'));
assert.equal(merged.activeProfileId, 'p1');
assert.equal(merged.stories.find((story) => story.id === 's-local').title, 'Local');
assert.ok(merged.stories.some((story) => story.id === 's-cloud'));

const newerCloud = mergeHydratedState(
  { profiles: [local], stories: [], activeProfileId: 'p1' },
  { profiles: [profile({ history: [{ at: 900, ok: true }], updatedAt: 900, stars: 40, demo: false })], stories: [] }
);
const taken = newerCloud.profiles[0];
assert.equal(taken.stars, 40);
assert.equal(taken.demo, true);

console.log('check:guards ok');
