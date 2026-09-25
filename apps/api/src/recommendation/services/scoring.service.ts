import { Injectable } from '@nestjs/common';
import type { MaterialProperty } from '@prisma/client';
import type { TransportType } from '@foodpack/shared';
import type { DerivedRequirement } from './requirement-engine.service';
import type { StructureCandidate } from './candidate-generator.service';
import { LayerRole, MaterialPropertyType } from '../config/property-types';
import { rangeFitScore } from './scoring-math';

export interface RawCandidateMetrics {
  representativeOtr: number | null;
  representativeWvtr: number | null;
  maxTensileStrength: number | null;
  maxPunctureResistance: number | null;
  sealStrength: number | null;
  distinctMaterialCount: number;
  allLayersRecyclable: boolean | null;
  anyLayerBiodegradable: boolean;
}

export interface CandidateScore {
  barrierSuitability: number;
  moistureProtection: number;
  mechanicalSuitability: number;
  sealability: number;
  mapSuitability: number;
  raw: RawCandidateMetrics;
}

const MECHANICAL_BASELINE: Record<TransportType, { tensile: number; puncture: number }> = {
  LOCAL: { tensile: 20, puncture: 3 },
  LONG_DISTANCE: { tensile: 35, puncture: 5 },
  EXPORT: { tensile: 50, puncture: 7 },
};

@Injectable()
export class ScoringService {
  extractRawMetrics(candidate: StructureCandidate): RawCandidateMetrics {
    const allProps = candidate.layers.flatMap((l) => l.material.properties);
    const materialIds = new Set(candidate.layers.map((l) => l.materialId));

    // For a micro-perforated tray/pouch, gas exchange happens through the
    // perforated lid/film, not the rigid tray body — pooling OTR/WVTR across
    // every layer (as for a true laminate, where gas must cross all layers
    // in series) would let the tray's near-zero OTR mask the lid's actual,
    // intentionally loose barrier. Score barrier fit off the SEAL layer(s)
    // alone in that case; mechanical/seal strength still use every layer.
    const sealLayers = candidate.layers.filter((l) => l.layerRole === LayerRole.SEAL);
    const gasExchangeProps =
      candidate.microPerforated && sealLayers.length
        ? sealLayers.flatMap((l) => l.material.properties)
        : allProps;

    const otrValues = this.valuesFor(gasExchangeProps, MaterialPropertyType.OTR);
    const wvtrValues = this.valuesFor(gasExchangeProps, MaterialPropertyType.WVTR);
    const tensileValues = this.valuesFor(allProps, MaterialPropertyType.TENSILE_STRENGTH);
    const punctureValues = this.valuesFor(
      allProps,
      MaterialPropertyType.PUNCTURE_RESISTANCE,
    );
    const sealValues = this.valuesFor(allProps, MaterialPropertyType.SEAL_STRENGTH);

    const recyclableFlags = candidate.layers.map((l) => l.material.recyclable);

    return {
      representativeOtr: otrValues.length ? Math.min(...otrValues) : null,
      representativeWvtr: wvtrValues.length ? Math.min(...wvtrValues) : null,
      maxTensileStrength: tensileValues.length ? Math.max(...tensileValues) : null,
      maxPunctureResistance: punctureValues.length ? Math.max(...punctureValues) : null,
      sealStrength: sealValues.length ? Math.max(...sealValues) : null,
      distinctMaterialCount: materialIds.size,
      allLayersRecyclable: recyclableFlags.every((r) => r === true)
        ? true
        : recyclableFlags.some((r) => r === false)
          ? false
          : null,
      anyLayerBiodegradable: candidate.layers.some((l) => l.material.biodegradable === true),
    };
  }

  score(
    raw: RawCandidateMetrics,
    requirement: DerivedRequirement,
    transportType: TransportType,
    structureSupportsMap: boolean,
  ): CandidateScore {
    const barrierSuitability =
      raw.representativeOtr !== null && requirement.targetOtrMin !== null
        ? rangeFitScore(
            raw.representativeOtr,
            requirement.targetOtrMin,
            requirement.targetOtrMax!,
          )
        : 50; // insufficient data on either side — neutral, not penalized nor rewarded

    const moistureProtection =
      raw.representativeWvtr !== null && requirement.targetWvtrMin !== null
        ? rangeFitScore(
            raw.representativeWvtr,
            requirement.targetWvtrMin,
            requirement.targetWvtrMax!,
          )
        : 50;

    const baseline = MECHANICAL_BASELINE[transportType];
    const tensileScore =
      raw.maxTensileStrength !== null
        ? Math.min(100, Math.round((raw.maxTensileStrength / baseline.tensile) * 100))
        : null;
    const punctureScore =
      raw.maxPunctureResistance !== null
        ? Math.min(100, Math.round((raw.maxPunctureResistance / baseline.puncture) * 100))
        : null;
    const mechanicalSuitability =
      tensileScore !== null && punctureScore !== null
        ? Math.round((tensileScore + punctureScore) / 2)
        : (tensileScore ?? punctureScore ?? 50);

    const sealability = raw.sealStrength !== null ? Math.min(100, Math.round((raw.sealStrength / 3) * 100)) : 50;

    let mapSuitability = 100; // not applicable -> neutral, doesn't drag down the score
    let barrierSuitabilityFinal = barrierSuitability;
    let moistureProtectionFinal = moistureProtection;
    if (requirement.mapRecommended) {
      mapSuitability = structureSupportsMap ? 100 : 10;
      if (!structureSupportsMap) {
        // A sealed, non-perforated pack traps respiration gases regardless
        // of the film's own OTR/WVTR — cap the barrier scores to reflect
        // that real failure mode, which raw film permeability alone misses.
        barrierSuitabilityFinal = Math.min(barrierSuitabilityFinal, 55);
        moistureProtectionFinal = Math.min(moistureProtectionFinal, 55);
      }
    }

    return {
      barrierSuitability: barrierSuitabilityFinal,
      moistureProtection: moistureProtectionFinal,
      mechanicalSuitability,
      sealability,
      mapSuitability,
      raw,
    };
  }

  private valuesFor(properties: MaterialProperty[], type: string): number[] {
    return properties
      .filter((p) => p.propertyType === type)
      .map((p) => p.value ?? (p.minValue !== null && p.maxValue !== null ? (p.minValue + p.maxValue) / 2 : null))
      .filter((v): v is number => v !== null);
  }
}
