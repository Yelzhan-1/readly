export const WORLDS = [
  {
    id: 'dino',
    emoji: '🦖',
    nameKey: 'worlds.dino',
    unlockStars: 0,
    gradient: 'linear-gradient(150deg, #2FBF83, #1a8f62)',
  },
  {
    id: 'space',
    emoji: '🚀',
    nameKey: 'worlds.space',
    unlockStars: 80,
    gradient: 'linear-gradient(150deg, #7C6BF2, #5344c9)',
  },
  {
    id: 'ocean',
    emoji: '🐳',
    nameKey: 'worlds.ocean',
    unlockStars: 200,
    gradient: 'linear-gradient(150deg, #17B8A6, #0e8a7c)',
  },
  {
    id: 'meadow',
    emoji: '🌈',
    nameKey: 'worlds.meadow',
    unlockStars: 400,
    gradient: 'linear-gradient(150deg, #FF7A45, #ef5f26)',
  },
];

export const LEVELS = [
  { id: 'beginner', minStars: 0, nameKey: 'levels.beginner' },
  { id: 'explorer', minStars: 80, nameKey: 'levels.explorer' },
  { id: 'reader', minStars: 250, nameKey: 'levels.reader' },
  { id: 'storyteller', minStars: 550, nameKey: 'levels.storyteller' },
];

export function levelForStars(stars) {
  let current = LEVELS[0];
  for (const lv of LEVELS) if (stars >= lv.minStars) current = lv;
  return current;
}

export function nextLevel(stars) {
  return LEVELS.find((lv) => lv.minStars > stars) || null;
}

export function worldById(id) {
  return WORLDS.find((w) => w.id === id) || WORLDS[0];
}

export function unlockedWorlds(stars) {
  return WORLDS.filter((w) => stars >= w.unlockStars).map((w) => w.id);
}
