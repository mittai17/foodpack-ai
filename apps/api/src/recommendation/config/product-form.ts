/**
 * A commodity's physical form drives what packaging format is actually used
 * in practice, independent of barrier science — a sack is never used for
 * milk, a bottle is never used for rice, regardless of how well the barrier
 * numbers might otherwise line up. This is a deliberately small, sourced set
 * (see research notes in candidate-generator.service.ts), not an attempt to
 * model every commodity nuance.
 */
export const ProductForm = {
  FRESH_PRODUCE: 'FRESH_PRODUCE',
  GRAIN_PULSE: 'GRAIN_PULSE',
  POWDER_SPICE: 'POWDER_SPICE',
  LIQUID: 'LIQUID',
  NUTS_SNACKS: 'NUTS_SNACKS',
} as const;

export type ProductFormType = (typeof ProductForm)[keyof typeof ProductForm];

// Per-commodity overrides for cases the category alone gets wrong — e.g.
// milk is "dairy" but liquid, flour and ground coffee are milled to a
// powder even though their raw category is grains/beverages.
const SLUG_OVERRIDES: Record<string, ProductFormType> = {
  milk: ProductForm.LIQUID,
  'wheat-flour': ProductForm.POWDER_SPICE,
  'coffee-roasted-ground': ProductForm.POWDER_SPICE,
};

const CATEGORY_FORM: Record<string, ProductFormType> = {
  'grains-cereals': ProductForm.GRAIN_PULSE,
  pulses: ProductForm.GRAIN_PULSE,
  spices: ProductForm.POWDER_SPICE,
  nuts: ProductForm.NUTS_SNACKS,
  'processed-bakery': ProductForm.NUTS_SNACKS,
};

/**
 * Returns null (general-purpose, no restriction) rather than guessing when
 * a commodity doesn't clearly fit one of the sourced forms above — e.g.
 * paneer (a fresh but non-respiring, typically brine/vacuum-packed dairy
 * solid) isn't fresh produce and isn't a liquid; forcing it into either
 * bucket would be a fabricated rule, not a sourced one.
 */
export function deriveProductForm(food: {
  slug: string;
  isFreshProduce: boolean;
  category: { slug: string };
}): ProductFormType | null {
  if (SLUG_OVERRIDES[food.slug]) return SLUG_OVERRIDES[food.slug];
  if (food.isFreshProduce) return ProductForm.FRESH_PRODUCE;
  return CATEGORY_FORM[food.category.slug] ?? null;
}
