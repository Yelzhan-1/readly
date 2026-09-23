export const BADGES = [
  {
    id: 'firstSteps',
    icon: '👣',
    nameKey: 'badges.firstSteps',
    descKey: 'badges.firstStepsD',
    test: (p) => (p.history || []).length >= 1,
  },
  {
    id: 'questDay',
    icon: '🗺️',
    nameKey: 'badges.questDay',
    descKey: 'badges.questDayD',
    test: (p) => p.questsDone >= 1,
  },
  {
    id: 'streak3',
    icon: '🔥',
    nameKey: 'badges.streak3',
    descKey: 'badges.streak3D',
    test: (p) => p.streak >= 3,
  },
  {
    id: 'reader5',
    icon: '📖',
    nameKey: 'badges.reader5',
    descKey: 'badges.reader5D',
    test: (p) => p.readStories >= 5,
  },
  {
    id: 'wordWhiz',
    icon: '🧠',
    nameKey: 'badges.wordWhiz',
    descKey: 'badges.wordWhizD',
    test: (p) => (p.learning?.masteredWords || []).length >= 10,
  },
  {
    id: 'perfect',
    icon: '💯',
    nameKey: 'badges.perfect',
    descKey: 'badges.perfectD',
    test: (p) => (p.badges || []).includes('__perfect_seen'),
  },
];

export const BADGE_IDS = BADGES.map((b) => b.id);

export function badgeById(id) {
  return BADGES.find((b) => b.id === id) || null;
}
