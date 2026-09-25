import { Injectable } from '@nestjs/common';
import type {
  Food,
  FoodProperty,
  FoodRespirationData,
  FoodShelfLifeData,
} from '@prisma/client';
import type {
  AdvancedInputs,
  ProductState,
  StorageType,
  TransportType,
} from '@foodpack/shared';
import {
  DRY_GOOD_MOISTURE_THRESHOLD,
  MAP_GAS_COMPOSITION,
  OTR_BANDS,
  OXIDATION_SENSITIVE_FAT_THRESHOLD,
  RESPIRATION_OTR_BANDS,
  RESPIRATION_RATE_THRESHOLDS,
  WVTR_BANDS,
} from '../config/packaging-rules.config';
import { FoodPropertyType } from '../config/property-types';

export interface FoodWithProperties extends Food {
  properties: FoodProperty[];
  shelfLifeData: FoodShelfLifeData[];
  respirationData: FoodRespirationData[];
}

export interface DerivedRequirement {
  targetOtrMin: number | null;
  targetOtrMax: number | null;
  otrUnit: string | null;
  targetWvtrMin: number | null;
  targetWvtrMax: number | null;
  wvtrUnit: string | null;
  mapRecommended: boolean;
  recommendedO2Min: number | null;
  recommendedO2Max: number | null;
  recommendedCo2Min: number | null;
  recommendedCo2Max: number | null;
  sealabilityRequired: boolean;
  mechanicalNotes: string;
  assumptions: string[];
  limitingFactors: string[];
  dataConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RequirementEngineInput {
  food: FoodWithProperties;
  productState: ProductState;
  storageType: StorageType;
  transportType: TransportType;
  targetShelfLifeDays: number;
  advancedInputs?: AdvancedInputs;
}

@Injectable()
export class RequirementEngineService {
  derive(input: RequirementEngineInput): DerivedRequirement {
    const { food, productState, storageType, transportType, advancedInputs } = input;
    const assumptions: string[] = [];
    const limitingFactors: string[] = [];
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

    const moisture =
      advancedInputs?.moistureContentPercent ??
      this.readProperty(food.properties, FoodPropertyType.MOISTURE_CONTENT);
    const fat =
      advancedInputs?.fatContentPercent ??
      this.readProperty(food.properties, FoodPropertyType.FAT_CONTENT);

    if (advancedInputs?.moistureContentPercent !== undefined) {
      assumptions.push('Moisture content uses the user-provided (Advanced Mode) value.');
    } else if (moisture !== null) {
      assumptions.push('Moisture content uses the knowledge-base reference value.');
    }

    // --- WVTR requirement ---
    let wvtrBand = WVTR_BANDS.MODERATE_MOISTURE;
    if (food.isFreshProduce && productState === 'FRESH') {
      wvtrBand = WVTR_BANDS.FRESH_PRODUCE_BREATHABLE;
    } else if (moisture !== null && moisture <= DRY_GOOD_MOISTURE_THRESHOLD) {
      wvtrBand = WVTR_BANDS.DRY_GOODS_LOW_WVTR;
    } else if (moisture === null) {
      limitingFactors.push(
        'No validated moisture-content data for this commodity — WVTR band uses a moderate default.',
      );
      confidence = 'LOW';
    }

    // --- OTR requirement ---
    let otrBand = OTR_BANDS.GENERAL_DRY_GOODS;
    let mapRecommended = false;
    if (food.isFreshProduce && productState !== 'PROCESSED') {
      mapRecommended = storageType === 'CHILLED';
      const respiration = this.resolveRespirationRate(food, advancedInputs);
      if (respiration) {
        otrBand = this.respirationOtrBand(respiration.rate);
        assumptions.push(
          respiration.source === 'user'
            ? `Oxygen requirement is scaled to the user-provided (Advanced Mode) respiration rate of ${respiration.rate} mL CO₂/kg/hr.`
            : `Oxygen requirement is scaled to the knowledge-base respiration rate of ${respiration.rate} mL CO₂/kg/hr.`,
        );
        if (respiration.source === 'user') confidence = 'HIGH';
      } else {
        otrBand = OTR_BANDS.FRESH_PRODUCE_GENERIC_BREATHABLE;
        limitingFactors.push(
          'No validated respiration-rate data for this commodity — oxygen requirement uses a generic breathable band; experimental validation is recommended.',
        );
        confidence = 'LOW';
      }
    } else if (fat !== null && fat >= OXIDATION_SENSITIVE_FAT_THRESHOLD) {
      otrBand = OTR_BANDS.OXIDATION_SENSITIVE_LOW_OTR;
      assumptions.push(
        `Fat content (${fat}%) is above the oxidation-sensitivity threshold — prioritizing a low-OTR barrier.`,
      );
    }

    // --- MAP gas composition (only for commodities with a documented reference) ---
    const gasComposition = MAP_GAS_COMPOSITION[food.slug];
    if (mapRecommended && !gasComposition) {
      limitingFactors.push(
        'MAP is indicated by storage/respiration conditions, but no validated recommended gas composition is available for this commodity yet — experimental validation of O2/CO2 targets is required before commercial use.',
      );
    }

    // --- Mechanical / transport ---
    const mechanicalNotes =
      transportType === 'EXPORT'
        ? 'Export transport: prioritize higher puncture resistance and tensile strength, plus a wider temperature-resistance range.'
        : transportType === 'LONG_DISTANCE'
          ? 'Long-distance transport: prioritize above-average puncture and seal strength to withstand handling and stacking.'
          : 'Local/short-distance transport: standard mechanical strength is generally sufficient.';

    return {
      targetOtrMin: otrBand.min,
      targetOtrMax: otrBand.max,
      otrUnit: 'cc/m²/day',
      targetWvtrMin: wvtrBand.min,
      targetWvtrMax: wvtrBand.max,
      wvtrUnit: 'g/m²/day',
      mapRecommended,
      recommendedO2Min: gasComposition?.o2Min ?? null,
      recommendedO2Max: gasComposition?.o2Max ?? null,
      recommendedCo2Min: gasComposition?.co2Min ?? null,
      recommendedCo2Max: gasComposition?.co2Max ?? null,
      sealabilityRequired: true,
      mechanicalNotes,
      assumptions,
      limitingFactors,
      dataConfidence: confidence,
    };
  }

  private readProperty(properties: FoodProperty[], type: string): number | null {
    const prop = properties.find((p) => p.propertyType === type);
    return prop?.value ?? null;
  }

  private resolveRespirationRate(
    food: FoodWithProperties,
    advancedInputs?: AdvancedInputs,
  ): { rate: number; source: 'user' | 'kb' } | null {
    if (advancedInputs?.respirationRateMlCo2PerKgPerHr !== undefined) {
      return { rate: advancedInputs.respirationRateMlCo2PerKgPerHr, source: 'user' };
    }
    const kbRates = food.respirationData
      .map((d) => d.co2ProductionRate)
      .filter((r): r is number => r !== null);
    if (kbRates.length === 0) return null;
    const average = kbRates.reduce((sum, r) => sum + r, 0) / kbRates.length;
    return { rate: Math.round(average * 10) / 10, source: 'kb' };
  }

  private respirationOtrBand(rate: number) {
    if (rate < RESPIRATION_RATE_THRESHOLDS.lowMax) return RESPIRATION_OTR_BANDS.VERY_LOW_OR_LOW;
    if (rate < RESPIRATION_RATE_THRESHOLDS.moderateMax) return RESPIRATION_OTR_BANDS.MODERATE;
    return RESPIRATION_OTR_BANDS.HIGH_OR_VERY_HIGH;
  }
}
