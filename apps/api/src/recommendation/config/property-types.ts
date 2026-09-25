/** Canonical property keys used across the food and packaging knowledge bases. */
export const FoodPropertyType = {
  MOISTURE_CONTENT: 'MOISTURE_CONTENT', // %
  PH: 'PH',
  FAT_CONTENT: 'FAT_CONTENT', // %
  WATER_ACTIVITY: 'WATER_ACTIVITY', // aw, 0-1
} as const;

export const MaterialPropertyType = {
  OTR: 'OTR', // cc/m2/day
  WVTR: 'WVTR', // g/m2/day
  THICKNESS: 'THICKNESS', // micron
  TENSILE_STRENGTH: 'TENSILE_STRENGTH', // MPa
  PUNCTURE_RESISTANCE: 'PUNCTURE_RESISTANCE', // N
  SEAL_STRENGTH: 'SEAL_STRENGTH', // N/15mm
  TEMP_RESISTANCE_MIN: 'TEMP_RESISTANCE_MIN', // C
  TEMP_RESISTANCE_MAX: 'TEMP_RESISTANCE_MAX', // C
  TRANSPARENCY: 'TRANSPARENCY', // %
} as const;

export const LayerRole = {
  OUTER: 'OUTER',
  BARRIER: 'BARRIER',
  ADHESIVE: 'ADHESIVE',
  SEAL: 'SEAL',
  TRAY: 'TRAY',
} as const;
