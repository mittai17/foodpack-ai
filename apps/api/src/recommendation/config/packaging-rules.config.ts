/**
 * Deterministic requirement-derivation thresholds.
 *
 * These are NOT per-food measured values — they are engineering heuristics
 * commonly used in food-packaging design (see e.g. Robertson, G.L., "Food
 * Packaging: Principles and Practice", 3rd ed., CRC Press, 2013; Kader, A.A.
 * (ed.), "Postharvest Technology of Horticultural Crops", UC ANR Pub. 3311)
 * used to translate a food's own KB properties into a target barrier band.
 * Where the food's own KB has no properties at all, the engine falls back
 * to the most conservative band and marks confidence LOW.
 */

export interface Band {
  min: number;
  max: number;
}

// g/m^2/day, typical film test condition ~38C/90%RH unless the material's
// own stored test condition says otherwise.
export const WVTR_BANDS = {
  /** Fresh produce needs SOME vapor exchange — too tight a barrier causes
   * in-pack condensation and decay; too loose causes wilting/desiccation. */
  FRESH_PRODUCE_BREATHABLE: { min: 5, max: 30 } as Band,
  /** Dry, hygroscopic goods (grains, flour, spices, biscuits) need a strong
   * moisture barrier to stay crisp/dry. */
  DRY_GOODS_LOW_WVTR: { min: 0, max: 5 } as Band,
  /** Moderately moist processed/dairy items. */
  MODERATE_MOISTURE: { min: 2, max: 15 } as Band,
} as const;

// cc/m^2/day, typical film test condition ~23C/0%RH.
export const OTR_BANDS = {
  /** Generic breathable band used only when a food has no respiration data
   * of its own recorded in the KB (confidence forced to LOW in this case). */
  FRESH_PRODUCE_GENERIC_BREATHABLE: { min: 1000, max: 8000 } as Band,
  /** Fat/oil-bearing foods are oxidation-sensitive and need a strong O2
   * barrier. */
  OXIDATION_SENSITIVE_LOW_OTR: { min: 0, max: 5 } as Band,
  /** General dry / ambient-shelf-stable goods. */
  GENERAL_DRY_GOODS: { min: 0, max: 50 } as Band,
} as const;

/**
 * Respiration-rate-scaled OTR sub-bands for fresh produce, used whenever an
 * actual CO2-production-rate figure is available (KB `FoodRespirationData`
 * average, or a user-supplied Advanced Mode value) instead of the generic
 * fallback band above. A more actively respiring commodity consumes O2
 * faster, so the pack needs proportionally more O2 transmission to avoid
 * anaerobic respiration/off-flavors; a slowly respiring commodity can use a
 * tighter barrier that still slows senescence.
 *
 * Thresholds follow Kader, A.A. (ed.), Postharvest Technology of
 * Horticultural Crops, 3rd ed., UC ANR Pub. 3311 — respiration-rate
 * classification (mL CO2/kg/hr at ~5-10C): very low <5, low 5-10,
 * moderate 10-20, high 20-40, very high >40.
 */
export const RESPIRATION_OTR_BANDS = {
  VERY_LOW_OR_LOW: { min: 1000, max: 3000 } as Band, // <10 mL CO2/kg/hr
  MODERATE: { min: 3000, max: 5000 } as Band, // 10-20 mL CO2/kg/hr
  HIGH_OR_VERY_HIGH: { min: 5000, max: 8000 } as Band, // >20 mL CO2/kg/hr
} as const;

export const RESPIRATION_RATE_THRESHOLDS = {
  lowMax: 10,
  moderateMax: 20,
} as const;

/** Fat content (%) at/above which a food is treated as oxidation-sensitive. */
export const OXIDATION_SENSITIVE_FAT_THRESHOLD = 8;

/** Moisture content (%) at/below which a food is treated as a "dry good"
 * requiring a strong moisture barrier. */
export const DRY_GOOD_MOISTURE_THRESHOLD = 14;

/** Commodities with a documented, literature-typical recommended MAP gas
 * composition. Left deliberately short — anything not listed here returns
 * "insufficient validated data" for gas composition rather than a guess.
 * Source: Kader, A.A. (ed.), Postharvest Technology of Horticultural Crops,
 * UC ANR Pub. 3311, chapter on Controlled Atmosphere / MAP storage.
 */
export const MAP_GAS_COMPOSITION: Record<
  string,
  { o2Min: number; o2Max: number; co2Min: number; co2Max: number }
> = {
  apple: { o2Min: 1, o2Max: 2, co2Min: 1, co2Max: 3 },
  banana: { o2Min: 2, o2Max: 5, co2Min: 2, co2Max: 5 },
  grapes: { o2Min: 2, o2Max: 5, co2Min: 1, co2Max: 3 },
  strawberry: { o2Min: 5, o2Max: 10, co2Min: 15, co2Max: 20 },
  mango: { o2Min: 3, o2Max: 5, co2Min: 5, co2Max: 8 },
  tomato: { o2Min: 3, o2Max: 5, co2Min: 2, co2Max: 5 },
};
