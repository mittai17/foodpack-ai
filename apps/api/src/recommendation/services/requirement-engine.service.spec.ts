import { describe, expect, it } from 'vitest';
import { RequirementEngineService, type FoodWithProperties } from './requirement-engine.service';
import { FoodPropertyType } from '../config/property-types';

function makeFood(overrides: Partial<FoodWithProperties> = {}): FoodWithProperties {
  return {
    id: 'food-1',
    slug: 'mango',
    name: 'Mango',
    commonNames: [],
    scientificName: null,
    categoryId: 'cat-1',
    imageUrl: null,
    description: null,
    isFreshProduce: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    properties: [],
    shelfLifeData: [],
    respirationData: [],
    ...overrides,
  } as FoodWithProperties;
}

describe('RequirementEngineService', () => {
  const engine = new RequirementEngineService();

  it('gives fresh produce a breathable band and recommends MAP when chilled', () => {
    const result = engine.derive({
      food: makeFood({ slug: 'mango' }),
      productState: 'FRESH',
      storageType: 'CHILLED',
      transportType: 'LOCAL',
      targetShelfLifeDays: 21,
    });

    expect(result.mapRecommended).toBe(true);
    expect(result.targetOtrMin).not.toBeNull();
    // No respiration data was provided -> low confidence, flagged.
    expect(result.dataConfidence).toBe('LOW');
    expect(result.limitingFactors.length).toBeGreaterThan(0);
  });

  it('does not recommend MAP for fresh produce stored ambient', () => {
    const result = engine.derive({
      food: makeFood(),
      productState: 'FRESH',
      storageType: 'AMBIENT',
      transportType: 'LOCAL',
      targetShelfLifeDays: 21,
    });

    expect(result.mapRecommended).toBe(false);
  });

  it('gives dry, low-moisture, non-fresh foods a strong moisture barrier band', () => {
    const rice = makeFood({
      slug: 'rice',
      isFreshProduce: false,
      properties: [
        {
          id: 'p1',
          foodId: 'food-1',
          propertyType: FoodPropertyType.MOISTURE_CONTENT,
          value: 13,
          minValue: null,
          maxValue: null,
          unit: '%',
          temperatureC: null,
          relativeHumidity: null,
          sourceId: null,
          confidence: 'MEDIUM',
          notes: null,
        },
      ],
    });

    const result = engine.derive({
      food: rice,
      productState: 'PROCESSED',
      storageType: 'AMBIENT',
      transportType: 'LOCAL',
      targetShelfLifeDays: 180,
    });

    // Dry-goods band caps WVTR at 5 g/m^2/day.
    expect(result.targetWvtrMax).toBe(5);
    expect(result.mapRecommended).toBe(false);
  });

  it('prioritizes a low-OTR barrier for high-fat oxidation-sensitive foods', () => {
    const chips = makeFood({
      slug: 'potato-chips',
      isFreshProduce: false,
      properties: [
        {
          id: 'p1',
          foodId: 'food-1',
          propertyType: FoodPropertyType.FAT_CONTENT,
          value: 32,
          minValue: null,
          maxValue: null,
          unit: '%',
          temperatureC: null,
          relativeHumidity: null,
          sourceId: null,
          confidence: 'MEDIUM',
          notes: null,
        },
      ],
    });

    const result = engine.derive({
      food: chips,
      productState: 'PROCESSED',
      storageType: 'AMBIENT',
      transportType: 'LOCAL',
      targetShelfLifeDays: 90,
    });

    expect(result.targetOtrMax).toBeLessThanOrEqual(5);
  });

  it('only fills recommended MAP gas composition for commodities with a documented reference', () => {
    const undocumented = makeFood({ slug: 'not-a-real-commodity' });
    const result = engine.derive({
      food: undocumented,
      productState: 'FRESH',
      storageType: 'CHILLED',
      transportType: 'LOCAL',
      targetShelfLifeDays: 21,
    });

    expect(result.mapRecommended).toBe(true);
    expect(result.recommendedO2Min).toBeNull();
    expect(result.limitingFactors.some((f) => f.includes('gas composition'))).toBe(true);
  });

  it('gives export transport stricter mechanical guidance than local', () => {
    const local = engine.derive({
      food: makeFood(),
      productState: 'FRESH',
      storageType: 'CHILLED',
      transportType: 'LOCAL',
      targetShelfLifeDays: 21,
    });
    const exportShipment = engine.derive({
      food: makeFood(),
      productState: 'FRESH',
      storageType: 'CHILLED',
      transportType: 'EXPORT',
      targetShelfLifeDays: 21,
    });

    expect(local.mechanicalNotes).not.toEqual(exportShipment.mechanicalNotes);
    expect(exportShipment.mechanicalNotes.toLowerCase()).toContain('export');
  });
});
