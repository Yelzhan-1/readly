/* Curated reading adventures (English reading material).
   UI around them is fully localized; the story text itself is the literacy target. */

export const STORIES = [
  {
    id: 'dino-big-day',
    title: "Dino's Big Day",
    emoji: '🦖',
    tint: 'linear-gradient(160deg, #DFF5E1, #B8ECD0)',
    level: 1,
    minTier: 1,
    interests: ['dinosaur'],
    sentences: [
      'Dino wakes up early.',
      'He goes outside.',
      'He sees a big tree.',
      'A red rocket lands near the tree.',
      'Dino waves hello!',
    ],
    practiceWords: ['dino', 'big', 'tree', 'rocket'],
    questions: [
      {
        qKey: 'content.storyWho',
        qVars: {},
        options: ['Dino', 'Luna', 'Milo'],
        emojis: ['🦖', '🦊', '🐻'],
        answer: 'Dino',
      },
      {
        qKey: 'content.storyWhat',
        qVars: { name: 'Dino' },
        options: ['rocket', 'whale', 'cake'],
        emojis: ['🚀', '🐋', '🎂'],
        answer: 'rocket',
      },
    ],
  },
  {
    id: 'nova-star-hunt',
    title: 'Nova’s Star Hunt',
    emoji: '🌟',
    tint: 'linear-gradient(160deg, #EDE9FF, #D6CFFF)',
    level: 2,
    minTier: 2,
    interests: ['space'],
    sentences: [
      'Nova looks at the night sky.',
      'She sees one bright star.',
      'The star sits on a small planet.',
      'Nova climbs into her rocket.',
      'She flies up to say hello.',
    ],
    practiceWords: ['star', 'planet', 'rocket', 'bright'],
    questions: [
      {
        qKey: 'content.storyWhat',
        qVars: { name: 'Nova' },
        options: ['star', 'shell', 'cake'],
        emojis: ['⭐', '🐚', '🎂'],
        answer: 'star',
      },
      {
        qKey: 'content.storyWhere',
        qVars: { name: 'Nova' },
        options: ['planet', 'ocean', 'garden'],
        emojis: ['🪐', '🌊', '🌻'],
        answer: 'planet',
      },
    ],
  },
  {
    id: 'luna-ocean-day',
    title: 'Luna and the Blue Whale',
    emoji: '🐳',
    tint: 'linear-gradient(160deg, #D8F5F1, #B2EBE2)',
    level: 2,
    minTier: 2,
    interests: ['ocean', 'animals'],
    sentences: [
      'Luna walks by the sea.',
      'A big whale jumps high.',
      'Water lands on Luna’s hat.',
      'She laughs and waves.',
      'The whale sings a song.',
    ],
    practiceWords: ['whale', 'sea', 'hat', 'song'],
    questions: [
      {
        qKey: 'content.storyWho',
        qVars: {},
        options: ['Luna', 'Dino', 'Nova'],
        emojis: ['🦊', '🦖', '🌟'],
        answer: 'Luna',
      },
      {
        qKey: 'content.storyWhat',
        qVars: { name: 'Luna' },
        options: ['whale', 'rocket', 'car'],
        emojis: ['🐋', '🚀', '🚗'],
        answer: 'whale',
      },
    ],
  },
  {
    id: 'milo-footy-final',
    title: 'Milo’s Big Match',
    emoji: '⚽',
    tint: 'linear-gradient(160deg, #E7F0FF, #CFE2FF)',
    level: 2,
    minTier: 2,
    interests: ['football'],
    sentences: [
      'Milo kicks the red ball.',
      'His team runs fast.',
      'The ball hits the goal.',
      'Everyone jumps and cheers.',
      'Milo smiles big.',
    ],
    practiceWords: ['ball', 'goal', 'team', 'kicks'],
    questions: [
      {
        qKey: 'content.storyWhat',
        qVars: { name: 'Milo' },
        options: ['ball', 'moon', 'fish'],
        emojis: ['⚽', '🌙', '🐟'],
        answer: 'ball',
      },
      {
        qKey: 'content.storyWho',
        qVars: {},
        options: ['Milo', 'Luna', 'Dino'],
        emojis: ['🐻', '🦊', '🦖'],
        answer: 'Milo',
      },
    ],
  },
];

export function storyById(id) {
  return STORIES.find((s) => s.id === id) || null;
}
