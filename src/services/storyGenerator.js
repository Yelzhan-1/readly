/* Personalized, level-aware story generator (deterministic demo engine).
   Vocabulary is pulled from the child's interests and tier. */

import { wordsForInterests, wordMeta } from '../data/words.js';
import { shuffle, pick, pickN, seededRandom } from '../utils/random.js';
import { uid } from '../utils/random.js';

const TITLES = {
  dinosaur: ['Dino and the {noun}', 'Dino Finds a {noun}', 'Dino’s Big {noun} Day'],
  space: ['Nova and the {noun}', '{noun} in Space', 'Nova’s {noun} Hunt'],
  football: ['Milo’s {noun} Match', 'The Great {noun} Game', 'Milo and the {noun}'],
  animals: ['The {noun} Next Door', 'A Little {noun} Story', '{noun} Comes Home'],
  ocean: ['Under the Blue {noun}', 'The {noun} and the Sea', 'Luna’s {noun}'],
  superheroes: ['The {noun} Hero', 'One Day, a {noun}…', 'The {noun} Cape'],
  magic: ['The Magic {noun}', '{noun} and the Wand', 'A {noun} Spell'],
  cars: ['Vroom! The {noun}', 'The Fast {noun}', '{noun} Race Day'],
  nature: ['The {noun} in the Forest', '{noun} and the Sun', 'A Green {noun}'],
  science: ['The Curious {noun}', '{noun} in the Lab', 'A Small {noun} Experiment'],
  default: ['The {noun} Adventure', 'A {noun} Day', '{noun} and Friends'],
};

const OPENERS = {
  1: [
    '{Name} sees a {noun}.',
    'The {noun} is big.',
    '{Name} goes to the {noun}.',
    'Look! A {noun}!',
    '{Name} says hello.',
    'The {noun} is red.',
    '{Name} runs to the {noun}.',
  ],
  2: [
    '{Name} sees a big {noun} today.',
    'The {noun} is bright and round.',
    '{Name} and friends run to the {noun}.',
    'A little {noun} sits by the tree.',
    'The {noun} makes {Name} laugh.',
    '{Name} touches the soft {noun}.',
    'They carry the {noun} home.',
  ],
  3: [
    'One morning, {Name} finds a strange {noun} near the old tree.',
    'The {noun} is bigger than {Name} expected.',
    '“Look at this {noun}!” {Name} shouts with joy.',
    'Together they carry the {noun} across the field.',
    'The {noun} glows softly in the afternoon sun.',
    '{Name} writes about the {noun} in a little book.',
  ],
};

function titleCase(w) {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function mascotName(profile) {
  const map = { dino: 'Dino', luna: 'Luna', nova: 'Nova', milo: 'Milo' };
  return map[profile.mascot] || 'Dino';
}

function storyLevel(profile) {
  const d = profile.learning?.difficulty || 1;
  if (d <= 1) return 1;
  if (d <= 3) return d;
  return 3;
}

/**
 * Generate a story tailored to profile (level + interests).
 * @param {number} seedMix - change to get a different story
 * @param {{interest?: string, name?: string}} opts - override hero/topic
 */
export function generateStory(profile, seedMix = 0, opts = {}) {
  const level = storyLevel(profile);
  const rng = seededRandom(`${profile.id}-${seedMix}-${Date.now().toString(36)}-${seedMix}`);
  const interests = profile.interests?.length ? profile.interests : ['default'];
  const interest =
    opts.interest && (interests.includes(opts.interest) || opts.interest !== 'default')
      ? opts.interest
      : interests[seedMix % interests.length];
  const name = opts.name || mascotName(profile);

  const pool = wordsForInterests([interest], null);
  const fallback = wordsForInterests([], null);
  const chosen = pickN(pool.length >= 3 ? pool : fallback, 3, rng);
  const noun = chosen[0] ? chosen[0].w : 'star';
  const noun2 = chosen[1] ? chosen[1].w : noun;
  const noun3 = chosen[2] ? chosen[2].w : noun;

  const titleTpl = pick(TITLES[interest] || TITLES.default, rng);
  const title = titleTpl.replace('{noun}', titleCase(noun));

  const linePool = OPENERS[level];
  const lineCount = level === 1 ? 4 : 5;
  const lines = pickN(linePool, lineCount, rng).map((tpl) =>
    tpl
      .replace(/\{Name\}/g, name)
      .replace(/\{noun\}/g, () => {
        const roll = rng();
        if (roll < 0.5) return noun;
        if (roll < 0.8) return noun2;
        return noun3;
      })
  );

  const otherNames = shuffle(
    ['Luna', 'Dino', 'Nova', 'Milo'].filter((n) => n !== name),
    rng
  ).slice(0, 2);
  const whoOptions = shuffle([name, ...otherNames], rng);

  const whatOthers = pickN(
    (pool.length ? pool : fallback).map((x) => x.w).filter((w) => w !== noun),
    2,
    rng
  );
  const whatOptions = shuffle([noun, ...whatOthers], rng);

  const questions = [
    {
      qKey: 'content.storyWho',
      qVars: {},
      options: whoOptions,
      emojis: whoOptions.map(emojiForName),
      answer: name,
    },
    {
      qKey: 'content.storyWhat',
      qVars: { name },
      options: whatOptions,
      emojis: whatOptions.map((w) => wordMeta(w).emoji || '✨'),
      answer: noun,
    },
  ];

  return {
    id: uid('story'),
    owner: profile.id,
    title,
    emoji: wordMeta(noun).emoji || '📖',
    tint: tintFor(interest),
    level,
    interests: [interest],
    sentences: lines,
    practiceWords: uniqueWords([noun, noun2, noun3, ...lines.join(' ').toLowerCase().split(/\s+/)])
      .filter((w) => /^[a-z]{3,7}$/.test(w))
      .slice(0, 4),
    questions,
    createdAt: Date.now(),
    generated: true,
  };
}

function emojiForName(n) {
  return n === 'Dino' ? '🦖' : n === 'Luna' ? '🦊' : n === 'Nova' ? '🌟' : n === 'Milo' ? '🐻' : '🐉';
}

function uniqueWords(list) {
  return [...new Set(list)];
}

function tintFor(interest) {
  const map = {
    dinosaur: 'linear-gradient(160deg, #DFF5E1, #B8ECD0)',
    football: 'linear-gradient(160deg, #E7F0FF, #CFE2FF)',
    space: 'linear-gradient(160deg, #EDE9FF, #D6CFFF)',
    animals: 'linear-gradient(160deg, #FFF1CC, #FFE39A)',
    ocean: 'linear-gradient(160deg, #D8F5F1, #B2EBE2)',
    superheroes: 'linear-gradient(160deg, #FFE3EA, #FFC9D5)',
    magic: 'linear-gradient(160deg, #F3E8FF, #E4C9FF)',
    cars: 'linear-gradient(160deg, #FFE7D9, #FFD0B8)',
    nature: 'linear-gradient(160deg, #E4F7E0, #C8EFC0)',
    science: 'linear-gradient(160deg, #E0F4FF, #BFE6FF)',
    default: 'linear-gradient(160deg, #FFF1CC, #FFE7D9)',
  };
  return map[interest] || map.default;
}
