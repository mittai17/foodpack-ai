import { describe, expect, it } from 'vitest';
import { ScoringService, type RawCandidateMetrics } from './scoring.service';
import type { DerivedRequirement } from './requirement-engine.service';

function baseRequirement(overrides: Partial<DerivedRequirement> = {}): DerivedRequirement {
  return {
    targetOtrMin: 1000,
    targetOtrMax: 8000,
    otrUnit: 'cc/m²/day',
    targetWvtrMin: 5,
    targetWvtrMax: 30,
    wvtrUnit: 'g/m²/day',
    mapRecommended: false,
    recommendedO2Min: null,
    recommendedO2Max: null,
    recommendedCo2Min: null,
    recommendedCo2Max: null,
    sealabilityRequired: true,
    mechanicalNotes: '',
    assumptions: [],
    limitingFactors: [],
    dataConfidence: 'MEDIUM',
    ...overrides,
  };
}

function rawMetrics(overrides: Partial<RawCandidateMetrics> = {}): RawCandidateMetrics {
  return {
    representativeOtr: 5000,
    representativeWvtr: 15,
    maxTensileStrength: null,
    maxPunctureResistance: null,
    sealStrength: null,
    distinctMaterialCount: 1,
    allLayersRecyclable: null,
    anyLayerBiodegradable: false,
    ...overrides,
  };
}

describe('ScoringService', () => {
  const scoring = new ScoringService();

  it('does not penalize mapSuitability when MAP is not recommended', () => {
    const result = scoring.score(rawMetrics(), baseRequirement({ mapRecommended: false }), 'LOCAL', false);
    expect(result.mapSuitability).toBe(100);
  });

  it('heavily penalizes a non-MAP structure when MAP is recommended', () => {
    const result = scoring.score(rawMetrics(), baseRequirement({ mapRecommended: true }), 'LOCAL', false);
    expect(result.mapSuitability).toBeLessThan(20);
  });

  it('rewards full marks when MAP is recommended and the structure supports it', () => {
    const result = scoring.score(rawMetrics(), baseRequirement({ mapRecommended: true }), 'LOCAL', true);
    expect(result.mapSuitability).toBe(100);
  });

  it('caps barrier scores for a sealed non-MAP structure even if raw film permeability fits the band', () => {
    // A film whose intrinsic OTR/WVTR happen to sit inside the generic band,
    // but the structure itself has no gas-exchange pathway.
    const raw = rawMetrics({ representativeOtr: 5000, representativeWvtr: 15 });
    const result = scoring.score(raw, baseRequirement({ mapRecommended: true }), 'LOCAL', false);

    expect(result.barrierSuitability).toBeLessThanOrEqual(55);
    expect(result.moistureProtection).toBeLessThanOrEqual(55);
  });

  it('does not cap barrier scores for a MAP-supporting structure', () => {
    const raw = rawMetrics({ representativeOtr: 5000, representativeWvtr: 15 });
    const result = scoring.score(raw, baseRequirement({ mapRecommended: true }), 'LOCAL', true);

    expect(result.barrierSuitability).toBe(100);
    expect(result.moistureProtection).toBe(100);
  });

  it('falls back to a neutral score when there is no barrier data at all', () => {
    const raw = rawMetrics({ representativeOtr: null, representativeWvtr: null });
    const result = scoring.score(raw, baseRequirement(), 'LOCAL', false);

    expect(result.barrierSuitability).toBe(50);
    expect(result.moistureProtection).toBe(50);
  });
});
