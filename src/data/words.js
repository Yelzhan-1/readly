/* Word bank used by the adaptive engine.
   tier 1 → 3–4 letters, tier 2 → 5–6 letters, tier 3 → 7+ letters */

export const WORDS = [
  { w: 'cat', tier: 1, emoji: '🐱', interests: ['animals'] },
  { w: 'dog', tier: 1, emoji: '🐶', interests: ['animals'] },
  { w: 'sun', tier: 1, emoji: '☀️', interests: ['space', 'nature'] },
  { w: 'egg', tier: 1, emoji: '🥚', interests: ['dinosaur', 'animals'] },
  { w: 'ball', tier: 1, emoji: '⚽', interests: ['football'] },
  { w: 'hat', tier: 1, emoji: '🎩', interests: [] },
  { w: 'bus', tier: 1, emoji: '🚌', interests: ['cars'] },
  { w: 'cow', tier: 1, emoji: '🐄', interests: ['animals', 'nature'] },
  { w: 'pig', tier: 1, emoji: '🐷', interests: ['animals'] },
  { w: 'fish', tier: 1, emoji: '🐟', interests: ['ocean', 'animals'] },
  { w: 'cake', tier: 1, emoji: '🎂', interests: [] },
  { w: 'bird', tier: 1, emoji: '🐦', interests: ['nature', 'animals'] },
  { w: 'star', tier: 1, emoji: '⭐', interests: ['space'] },
  { w: 'moon', tier: 1, emoji: '🌙', interests: ['space'] },
  { w: 'bed', tier: 1, emoji: '🛏️', interests: [] },
  { w: 'big', tier: 1, emoji: null, interests: [] },
  { w: 'red', tier: 1, emoji: '🔴', interests: [] },
  { w: 'run', tier: 1, emoji: '🏃', interests: ['football'] },
  { w: 'bad', tier: 1, emoji: null, interests: [] },
  { w: 'dad', tier: 1, emoji: '👨', interests: [] },
  { w: 'leg', tier: 1, emoji: '🦵', interests: [] },
  { w: 'box', tier: 1, emoji: '📦', interests: [] },

  { w: 'dino', tier: 2, emoji: '🦖', interests: ['dinosaur'] },
  { w: 'tail', tier: 2, emoji: '🦕', interests: ['dinosaur'] },
  { w: 'bone', tier: 2, emoji: '🦴', interests: ['dinosaur', 'animals'] },
  { w: 'roar', tier: 2, emoji: '🔊', interests: ['dinosaur'] },
  { w: 'rocket', tier: 2, emoji: '🚀', interests: ['space'] },
  { w: 'planet', tier: 2, emoji: '🪐', interests: ['space'] },
  { w: 'alien', tier: 2, emoji: '👽', interests: ['space'] },
  { w: 'comet', tier: 2, emoji: '☄️', interests: ['space'] },
  { w: 'goal', tier: 2, emoji: '🥅', interests: ['football'] },
  { w: 'team', tier: 2, emoji: '🤝', interests: ['football'] },
  { w: 'kick', tier: 2, emoji: '🦵', interests: ['football'] },
  { w: 'shirt', tier: 2, emoji: '👕', interests: ['football'] },
  { w: 'whale', tier: 2, emoji: '🐋', interests: ['ocean'] },
  { w: 'coral', tier: 2, emoji: '🪸', interests: ['ocean'] },
  { w: 'shell', tier: 2, emoji: '🐚', interests: ['ocean'] },
  { w: 'tiger', tier: 2, emoji: '🐯', interests: ['animals'] },
  { w: 'panda', tier: 2, emoji: '🐼', interests: ['animals'] },
  { w: 'green', tier: 2, emoji: '💚', interests: ['nature'] },
  { w: 'tree', tier: 2, emoji: '🌳', interests: ['nature'] },
  { w: 'flower', tier: 2, emoji: '🌸', interests: ['nature'] },
  { w: 'car', tier: 2, emoji: '🚗', interests: ['cars'] },
  { w: 'vroom', tier: 2, emoji: '🏎️', interests: ['cars'] },
  { w: 'magic', tier: 2, emoji: '✨', interests: ['magic'] },
  { w: 'wand', tier: 2, emoji: '🪄', interests: ['magic'] },
  { w: 'hero', tier: 2, emoji: '🦸', interests: ['superheroes'] },
  { w: 'cape', tier: 2, emoji: '🦸', interests: ['superheroes'] },
  { w: 'lab', tier: 2, emoji: '🧪', interests: ['science'] },
  { w: 'atom', tier: 2, emoji: '⚛️', interests: ['science'] },
  { w: 'door', tier: 2, emoji: '🚪', interests: [] },
  { w: 'rainbow', tier: 2, emoji: '🌈', interests: ['nature', 'magic'] },

  { w: 'dinosaur', tier: 3, emoji: '🦖', interests: ['dinosaur'] },
  { w: 'volcano', tier: 3, emoji: '🌋', interests: ['dinosaur', 'science'] },
  { w: 'telescope', tier: 3, emoji: '🔭', interests: ['space', 'science'] },
  { w: 'football', tier: 3, emoji: '⚽', interests: ['football'] },
  { w: 'dolphin', tier: 3, emoji: '🐬', interests: ['ocean', 'animals'] },
  { w: 'treasure', tier: 3, emoji: '💎', interests: ['ocean', 'magic'] },
  { w: 'mountain', tier: 3, emoji: '⛰️', interests: ['nature'] },
  { w: 'butterfly', tier: 3, emoji: '🦋', interests: ['nature', 'animals'] },
  { w: 'superhero', tier: 3, emoji: '🦸', interests: ['superheroes'] },
  { w: 'unicorn', tier: 3, emoji: '🦄', interests: ['magic', 'animals'] },
  { w: 'library', tier: 3, emoji: '📚', interests: [] },
  { w: 'morning', tier: 3, emoji: '🌅', interests: [] },
  { w: 'friend', tier: 3, emoji: '🤝', interests: [] },
  { w: 'because', tier: 3, emoji: '💭', interests: [] },
  { w: 'together', tier: 3, emoji: '🧩', interests: [] },
  { w: 'beautiful', tier: 3, emoji: '🌸', interests: [] },
];

/* letter-level practice pools for confusion targets */
export const FOCUS_LETTERS = {
  bd: ['b', 'd'],
  pq: ['p', 'q'],
  vowels: ['a', 'e', 'i', 'o', 'u'],
  mn: ['m', 'n'],
  general: 'abcdefghijklmnopqrstuvwxyz'.split(''),
};

export const FOCUS_WORDS = {
  bd: ['bad', 'dad', 'bed', 'dog', 'door', 'big', 'dig', 'bat', 'bird', 'rabbit'],
  pq: ['pig', 'pen', 'queen', 'quilt', 'pool', 'paper'],
  vowels: ['cat', 'bed', 'pig', 'dog', 'cub', 'kite', 'rose', 'sun', 'cake'],
  mn: ['man', 'net', 'moon', 'name', 'funny', 'nine'],
};

const BY_WORD = new Map(WORDS.map((x) => [x.w, x]));

export function wordMeta(w) {
  return BY_WORD.get(w) || { w, tier: 2, emoji: null, interests: [] };
}

export function wordsByTier(tier) {
  return WORDS.filter((x) => x.tier === tier);
}

export function wordsForInterests(interests = [], tier = null) {
  const set = new Set(interests);
  let pool = WORDS.filter((x) => x.interests.some((i) => set.has(i)));
  if (tier) pool = pool.filter((x) => x.tier === tier);
  if (pool.length < 4) pool = WORDS.filter((x) => (tier ? x.tier === tier : true));
  return pool;
}

export function wordLengthTier(len) {
  if (len <= 4) return 1;
  if (len <= 6) return 2;
  return 3;
}
