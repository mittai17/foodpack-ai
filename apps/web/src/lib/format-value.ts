interface RangedValue {
  value?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
}

/**
 * Formats a value/min/max triple honestly: an exact value, a full range, a
 * one-sided bound ("≤x" / "≥x") when only one side was recorded, or an
 * em dash when nothing was validated — never fabricates the missing side.
 */
export function formatValue(v: RangedValue): string {
  if (v.value !== null && v.value !== undefined) return String(v.value);
  const hasMin = v.minValue !== null && v.minValue !== undefined;
  const hasMax = v.maxValue !== null && v.maxValue !== undefined;
  if (hasMin && hasMax) return `${v.minValue}–${v.maxValue}`;
  if (hasMax) return `≤${v.maxValue}`;
  if (hasMin) return `≥${v.minValue}`;
  return '—';
}
