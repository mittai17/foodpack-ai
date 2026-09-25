import { describe, expect, it } from 'vitest';
import { average, clamp, rangeFitScore } from './scoring-math';

describe('rangeFitScore', () => {
  it('scores 100 for any value inside the band', () => {
    expect(rangeFitScore(50, 0, 100)).toBe(100);
    expect(rangeFitScore(0, 0, 100)).toBe(100);
    expect(rangeFitScore(100, 0, 100)).toBe(100);
  });

  it('decays linearly to 0 over one band-width past the edge', () => {
    expect(rangeFitScore(150, 0, 100)).toBe(50);
    expect(rangeFitScore(200, 0, 100)).toBe(0);
    expect(rangeFitScore(-50, 0, 100)).toBe(50);
    expect(rangeFitScore(-100, 0, 100)).toBe(0);
  });

  it('never returns a negative score for values far outside the band', () => {
    expect(rangeFitScore(10_000, 0, 100)).toBe(0);
  });

  it('handles a zero-width band without dividing by zero', () => {
    expect(rangeFitScore(5, 5, 5)).toBe(100);
    expect(Number.isFinite(rangeFitScore(6, 5, 5))).toBe(true);
  });
});

describe('clamp', () => {
  it('clamps values to the given bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });
});

describe('average', () => {
  it('returns null for an empty list rather than NaN', () => {
    expect(average([])).toBeNull();
  });

  it('averages a list of numbers', () => {
    expect(average([1, 2, 3])).toBe(2);
  });
});
