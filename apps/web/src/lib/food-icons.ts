/**
 * Per-commodity emoji glyphs. Emoji render crisply at any size, need no
 * asset hosting/licensing, and work in light/dark mode — the pragmatic
 * choice until real photography/illustration is commissioned per §10 of
 * the product brief. Falls back to a category-level glyph so newly added
 * foods (the DB is designed to grow, see foods.controller) never show a
 * blank icon.
 */
const FOOD_EMOJI: Record<string, string> = {
  mango: '🥭',
  tomato: '🍅',
  banana: '🍌',
  apple: '🍎',
  strawberry: '🍓',
  grapes: '🍇',
  potato: '🥔',
  onion: '🧅',
  carrot: '🥕',
  rice: '🍚',
  wheat: '🌾',
  'wheat-flour': '🌾',
  'toor-dal': '🫘',
  'turmeric-powder': '🧂',
  cashew: '🥜',
  milk: '🥛',
  paneer: '🧀',
  'potato-chips': '🍟',
  biscuits: '🍪',
  'coffee-roasted-ground': '☕',
};

const CATEGORY_EMOJI: Record<string, string> = {
  fruits: '🍎',
  vegetables: '🥦',
  'grains-cereals': '🌾',
  pulses: '🫘',
  spices: '🧂',
  nuts: '🥜',
  dairy: '🥛',
  'processed-bakery': '🍪',
  beverages: '☕',
};

export function getFoodEmoji(slug: string, categorySlug?: string): string {
  return FOOD_EMOJI[slug] ?? (categorySlug && CATEGORY_EMOJI[categorySlug]) ?? '🍽️';
}
