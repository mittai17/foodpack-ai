export function darken(hex: string, amount: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, ((n >> 16) & 255) - amount);
  const g = Math.max(0, ((n >> 8) & 255) - amount);
  const b = Math.max(0, (n & 255) - amount);
  return `rgb(${r},${g},${b})`;
}

/** Shared between the static illustration and the 3D viewer, so both agree on what a material "looks like". */
export function colorForMaterial(materialName: string | undefined, fallback: string): string {
  const name = (materialName ?? '').toLowerCase();
  if (name.includes('jute')) return '#b08c5a';
  if (name.includes('stainless') || name.includes('steel')) return '#c7ccd1';
  if (name.includes('metallized') || name.includes('foil')) return '#b8c0c8';
  if (name.includes('kraft') || name.includes('paper') || name.includes('corrugated') || name.includes('fiberboard'))
    return '#c19a6b';
  if (name.includes('woven pp') || name.includes('fibc')) return '#e8e4d8';
  if (name.includes('hdpe')) return '#f4f4f4';
  if (name.includes('pla') || name.includes('cellulose') || name.includes('compostable')) return '#d9c9a3';
  return fallback;
}

export const PACKAGE_TYPE_LABELS: Record<string, string> = {
  pouch: 'Flexible pouch',
  bag: 'Bag',
  sachet: 'Sachet',
  bottle: 'Bottle',
  tray: 'Tray with lid',
  sack: 'Sack',
  carton: 'Carton',
  crate: 'Ventilated crate',
  jumbo_bag: 'Jumbo bag (FIBC)',
  jerry_can: 'Jerry can',
  milk_can: 'Milk can',
  drum: 'Drum / barrel',
};
