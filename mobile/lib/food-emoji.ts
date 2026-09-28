export const FOOD_EMOJI_MAP: Record<string, string> = {
  apple: '🍎',
  banana: '🍌',
  mango: '🥭',
  tomato: '🍅',
  potato: '🥔',
  spinach: '🌿',
  onion: '🧅',
  wheat: '🌾',
  carrot: '🥕',
  rice: '🍚',
  coffee: '☕',
  'coffee-roasted-ground': '☕',
  biscuits: '🍪',
  'biscuits-commercial': '🍪',
  grapes: '🍇',
  cashew: '🥜',
  'cashew-raw': '🥜',
  'cashew-nut': '🥜',
  corn: '🌽',
  orange: '🍊',
  lemon: '🍋',
  strawberry: '🍓',
  blueberry: '🫐',
  broccoli: '🥦',
  cauliflower: '🥦',
  cabbage: '🥬',
  lettuce: '🥬',
  cucumber: '🥒',
  pepper: '🫑',
  'bell-pepper': '🫑',
  chilli: '🌶️',
  garlic: '🧄',
  ginger: '🫚',
  turmeric: '🟡',
  'turmeric-powder': '🟡',
  coriander: '🌿',
  milk: '🥛',
  'milk-pasteurized-whole': '🥛',
  cheese: '🧀',
  yogurt: '🥛',
  butter: '🧈',
  paneer: '🧀',
  lentils: '🫘',
  'toor-dal': '🫘',
  chickpeas: '🫘',
  soybeans: '🫘',
  peas: '🟢',
  beans: '🫘',
  peanut: '🥜',
  almond: '🌰',
  walnut: '🌰',
  flour: '🌾',
  'wheat-flour': '🌾',
  sugar: '🍬',
  salt: '🧂',
};

export function getFoodEmoji(slug?: string, categorySlug?: string): string {
  if (slug && FOOD_EMOJI_MAP[slug]) {
    return FOOD_EMOJI_MAP[slug];
  }
  if (categorySlug === 'fruits') return '🍎';
  if (categorySlug === 'vegetables') return '🥦';
  if (categorySlug === 'grains-cereals' || categorySlug === 'pulses') return '🌾';
  if (categorySlug === 'dairy') return '🥛';
  if (categorySlug === 'spices') return '🌶️';
  if (categorySlug === 'nuts') return '🥜';
  if (categorySlug === 'beverages') return '☕';
  return '📦';
}
