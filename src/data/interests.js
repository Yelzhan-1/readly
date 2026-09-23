export const INTERESTS = [
  { id: 'dinosaur', emoji: '🦖', tint: '#DFF5E1', color: '#22A06B' },
  { id: 'football', emoji: '⚽', tint: '#E7F0FF', color: '#3B82F6' },
  { id: 'space', emoji: '🚀', tint: '#EDE9FF', color: '#7C6BF2' },
  { id: 'animals', emoji: '🐼', tint: '#FFF1CC', color: '#D9A100' },
  { id: 'ocean', emoji: '🐳', tint: '#D8F5F1', color: '#0E9484' },
  { id: 'superheroes', emoji: '🦸', tint: '#FFE3EA', color: '#E84A6C' },
  { id: 'magic', emoji: '🪄', tint: '#F3E8FF', color: '#9B4DCA' },
  { id: 'cars', emoji: '🏎️', tint: '#FFE7D9', color: '#EF5F26' },
  { id: 'nature', emoji: '🌿', tint: '#E4F7E0', color: '#4E9A2A' },
  { id: 'science', emoji: '🔬', tint: '#E0F4FF', color: '#2D9CDB' },
];

export const INTEREST_IDS = INTERESTS.map((i) => i.id);

export function interestMeta(id) {
  return INTERESTS.find((i) => i.id === id) || INTERESTS[0];
}

export const PROFILE_COLORS = [
  '#FF7A45',
  '#17B8A6',
  '#7C6BF2',
  '#FFC53D',
  '#2FBF83',
  '#FF6B8A',
  '#4AA8FF',
];
