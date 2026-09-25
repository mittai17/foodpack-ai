import type { StructureLayer, MaterialProperty } from '@/lib/api/types';

function midpoint(p: MaterialProperty): number {
  if (p.value !== null && p.value !== undefined) return p.value;
  if (p.minValue !== null && p.minValue !== undefined && p.maxValue !== null && p.maxValue !== undefined) {
    return (p.minValue + p.maxValue) / 2;
  }
  return NaN;
}

/**
 * Picks the tightest (lowest-transmission) layer for a barrier property —
 * the limiting layer in a laminate dominates overall gas/moisture
 * transmission, so this is the scientifically representative value.
 */
export function findMinProperty(layers: StructureLayer[] | undefined, type: string): MaterialProperty | null {
  if (!layers) return null;
  let best: MaterialProperty | null = null;
  let bestValue = Infinity;
  for (const layer of layers) {
    const prop = layer.material.properties?.find((p) => p.propertyType === type);
    if (!prop) continue;
    const value = midpoint(prop);
    if (!Number.isNaN(value) && value < bestValue) {
      bestValue = value;
      best = prop;
    }
  }
  return best;
}

/**
 * Picks the strongest layer for a mechanical property (tensile strength,
 * puncture resistance, seal strength) — the toughest layer in the laminate
 * carries the mechanical load, so the maximum across layers is what
 * matters, mirroring ScoringService.extractRawMetrics on the backend.
 */
export function findMaxProperty(layers: StructureLayer[] | undefined, type: string): MaterialProperty | null {
  if (!layers) return null;
  let best: MaterialProperty | null = null;
  let bestValue = -Infinity;
  for (const layer of layers) {
    const prop = layer.material.properties?.find((p) => p.propertyType === type);
    if (!prop) continue;
    const value = midpoint(prop);
    if (!Number.isNaN(value) && value > bestValue) {
      bestValue = value;
      best = prop;
    }
  }
  return best;
}
