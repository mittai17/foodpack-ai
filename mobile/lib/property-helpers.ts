import type { StructureLayer, MaterialProperty, FoodProperty } from './api/analysis';

function midpoint(p: MaterialProperty | FoodProperty): number {
  if (p.value !== null && p.value !== undefined) return p.value;
  if (p.minValue !== null && p.minValue !== undefined && p.maxValue !== null && p.maxValue !== undefined) {
    return (p.minValue + p.maxValue) / 2;
  }
  return NaN;
}

export function findMinProperty(layers: StructureLayer[] | undefined, type: string): MaterialProperty | null {
  if (!layers) return null;
  let best: MaterialProperty | null = null;
  let bestValue = Infinity;
  for (const layer of layers) {
    const prop = layer.material?.properties?.find((p) => p.propertyType === type);
    if (!prop) continue;
    const value = midpoint(prop);
    if (!Number.isNaN(value) && value < bestValue) {
      bestValue = value;
      best = prop;
    }
  }
  return best;
}

export function findMaxProperty(layers: StructureLayer[] | undefined, type: string): MaterialProperty | null {
  if (!layers) return null;
  let best: MaterialProperty | null = null;
  let bestValue = -Infinity;
  for (const layer of layers) {
    const prop = layer.material?.properties?.find((p) => p.propertyType === type);
    if (!prop) continue;
    const value = midpoint(prop);
    if (!Number.isNaN(value) && value > bestValue) {
      bestValue = value;
      best = prop;
    }
  }
  return best;
}

export function formatValue(v: { value?: number | null; minValue?: number | null; maxValue?: number | null } | undefined | null): string {
  if (!v) return '—';
  if (v.value !== null && v.value !== undefined) return String(v.value);
  const hasMin = v.minValue !== null && v.minValue !== undefined;
  const hasMax = v.maxValue !== null && v.maxValue !== undefined;
  if (hasMin && hasMax) return `${v.minValue}–${v.maxValue}`;
  if (hasMax) return `≤${v.maxValue}`;
  if (hasMin) return `≥${v.minValue}`;
  return '—';
}
