/**
 * Scores how well a measured value fits inside a target [min, max] window.
 * Inside the window: 100. Outside: decays linearly to 0 over one
 * band-width of distance past the edge. Deliberately simple/explainable —
 * no fabricated precision.
 */
export function rangeFitScore(
  value: number,
  min: number,
  max: number,
  minDecayTolerance = 0,
): number {
  if (value >= min && value <= max) return 100;
  const width = Math.max(max - min, minDecayTolerance, 1e-6);
  const distance = value < min ? min - value : value - max;
  const score = 100 * (1 - Math.min(distance / width, 1));
  return Math.max(0, Math.round(score));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}
