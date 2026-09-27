/**
 * Seed data for FoodPack AI.
 *
 * Every numeric value below is a literature-typical range (not a lab
 * measurement of a specific batch), taken from commonly cited food-science
 * and packaging-science references:
 *  - Kader, A.A. (ed.), Postharvest Technology of Horticultural Crops,
 *    3rd ed., UC ANR Publication 3311, 2002.
 *  - USDA Agricultural Handbook 66, The Commercial Storage of Fruits,
 *    Vegetables, and Florist and Nursery Stocks.
 *  - USDA FoodData Central (generic proximate composition figures).
 *  - Robertson, G.L., Food Packaging: Principles and Practice, 3rd ed.,
 *    CRC Press, 2013.
 *  - Selke, S.E.M., Culter, J.D., Plastics Packaging: Properties,
 *    Processing, Applications, and Regulations, 3rd ed., Hanser, 2016.
 *
 * Where a real value isn't confidently known it is simply omitted — the
 * API will honestly report "insufficient validated data" rather than a
 * fabricated number. Confidence levels are deliberately conservative.
 */
import { PrismaClient, type ConfidenceLevel, type StorageType } from '@prisma/client';

const prisma = new PrismaClient();

const REF = {
  kader: { publication: 'Postharvest Technology of Horticultural Crops (UC ANR 3311)', year: 2002, citation: 'Kader, A.A. (ed.)' },
  usdaHandbook66: { publication: 'USDA Agricultural Handbook 66', year: 1986, citation: 'USDA Agricultural Research Service' },
  usdaFdc: { publication: 'USDA FoodData Central (generic proximate composition)', year: 2019, citation: 'USDA FoodData Central' },
  robertson: { publication: 'Food Packaging: Principles and Practice, 3rd ed.', year: 2013, citation: 'Robertson, G.L.' },
  selke: { publication: 'Plastics Packaging: Properties, Processing, Applications, and Regulations, 3rd ed.', year: 2016, citation: 'Selke, S.E.M. & Culter, J.D.' },
};

type Ref = { citation: string; publication?: string; year?: number };

interface PropertySeed {
  propertyType: string;
  value?: number;
  minValue?: number;
  maxValue?: number;
  unit: string;
  confidence: ConfidenceLevel;
  notes?: string;
  ref: Ref;
}

interface StorageSeed {
  storageType: StorageType;
  minTempC?: number;
  maxTempC?: number;
  minRH?: number;
  maxRH?: number;
  notes?: string;
  ref: Ref;
}

interface RespirationSeed {
  temperatureC: number;
  co2ProductionRate?: number;
  minRate?: number;
  maxRate?: number;
  unit: string;
  confidence: ConfidenceLevel;
  ref: Ref;
}

interface ShelfLifeSeed {
  storageType: StorageType;
  minDays: number;
  maxDays: number;
  packagingContext: string;
  confidence: ConfidenceLevel;
  ref: Ref;
}

interface FoodSeed {
  slug: string;
  name: string;
  commonNames: string[];
  scientificName?: string;
  categorySlug: string;
  isFreshProduce: boolean;
  description: string;
  properties: PropertySeed[];
  storage: StorageSeed[];
  respiration?: RespirationSeed[];
  shelfLife: ShelfLifeSeed[];
}

const CATEGORIES = [
  { slug: 'fruits', name: 'Fruits', description: 'Fresh whole fruit commodities.' },
  { slug: 'vegetables', name: 'Vegetables', description: 'Fresh vegetable commodities.' },
  { slug: 'grains-cereals', name: 'Grains & Cereals', description: 'Staple grains and milled cereal products.' },
  { slug: 'pulses', name: 'Pulses', description: 'Dried legumes.' },
  { slug: 'spices', name: 'Spices', description: 'Dried spice powders and whole spices.' },
  { slug: 'nuts', name: 'Nuts', description: 'Tree nuts and oilseeds.' },
  { slug: 'dairy', name: 'Dairy', description: 'Milk and milk-derived products.' },
  { slug: 'processed-bakery', name: 'Processed & Bakery', description: 'Processed and baked snack foods.' },
  { slug: 'beverages', name: 'Beverages', description: 'Beverage ingredients and products.' },
];

const FOODS: FoodSeed[] = [
  {
    slug: 'mango', name: 'Mango', commonNames: ['Aam'], scientificName: 'Mangifera indica',
    categorySlug: 'fruits', isFreshProduce: true,
    description: 'Climacteric tropical fruit; chilling-sensitive below ~10-13°C.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 81, maxValue: 85, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'PH', minValue: 3.4, maxValue: 4.8, unit: 'pH', confidence: 'MEDIUM', ref: REF.kader },
      { propertyType: 'FAT_CONTENT', maxValue: 0.5, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 10, maxTempC: 13, minRH: 85, maxRH: 90, notes: 'Chilling injury occurs below ~10°C.', ref: REF.kader },
      { storageType: 'AMBIENT', minTempC: 20, maxTempC: 25, minRH: 85, maxRH: 90, ref: REF.kader },
    ],
    respiration: [
      { temperatureC: 13, minRate: 20, maxRate: 40, unit: 'mL CO2/kg/hr', confidence: 'MEDIUM', ref: REF.kader },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 14, maxDays: 28, packagingContext: 'typical retail, ventilated/perforated pack', confidence: 'MEDIUM', ref: REF.kader },
      { storageType: 'AMBIENT', minDays: 4, maxDays: 7, packagingContext: 'unpackaged', confidence: 'MEDIUM', ref: REF.kader },
    ],
  },
  {
    slug: 'tomato', name: 'Tomato', commonNames: ['Tamatar'], scientificName: 'Solanum lycopersicum',
    categorySlug: 'vegetables', isFreshProduce: true,
    description: 'Climacteric fruit-vegetable; chilling-sensitive below ~10-13°C.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 94, maxValue: 95, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'PH', minValue: 4.3, maxValue: 4.9, unit: 'pH', confidence: 'MEDIUM', ref: REF.kader },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 10, maxTempC: 13, minRH: 90, maxRH: 95, notes: 'Chilling injury below ~10°C.', ref: REF.kader },
      { storageType: 'AMBIENT', minTempC: 20, maxTempC: 25, minRH: 85, maxRH: 90, ref: REF.kader },
    ],
    respiration: [
      { temperatureC: 20, minRate: 10, maxRate: 20, unit: 'mL CO2/kg/hr', confidence: 'MEDIUM', ref: REF.kader },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 14, maxDays: 21, packagingContext: 'typical retail, ventilated/perforated pack', confidence: 'MEDIUM', ref: REF.kader },
      { storageType: 'AMBIENT', minDays: 5, maxDays: 10, packagingContext: 'unpackaged', confidence: 'MEDIUM', ref: REF.kader },
    ],
  },
  {
    slug: 'banana', name: 'Banana', commonNames: ['Kela'], scientificName: 'Musa spp.',
    categorySlug: 'fruits', isFreshProduce: true,
    description: 'Climacteric fruit; chilling-sensitive below ~13°C. Respiration spikes sharply at the climacteric ripening stage.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 74, maxValue: 76, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'PH', minValue: 4.5, maxValue: 5.2, unit: 'pH', confidence: 'MEDIUM', ref: REF.kader },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 13, maxTempC: 15, minRH: 90, maxRH: 95, notes: 'Chilling-sensitive — do not store below ~13°C despite falling in the "chilled" bucket.', ref: REF.kader },
    ],
    respiration: [
      { temperatureC: 20, minRate: 15, maxRate: 25, unit: 'mL CO2/kg/hr', confidence: 'LOW', ref: REF.kader },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 14, maxDays: 28, packagingContext: 'green stage, ventilated pack', confidence: 'MEDIUM', ref: REF.kader },
    ],
  },
  {
    slug: 'apple', name: 'Apple', commonNames: ['Seb'], scientificName: 'Malus domestica',
    categorySlug: 'fruits', isFreshProduce: true,
    description: 'Climacteric fruit; tolerates near-freezing cold storage.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 84, maxValue: 86, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'PH', minValue: 3.3, maxValue: 4.0, unit: 'pH', confidence: 'MEDIUM', ref: REF.kader },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 0, maxTempC: 4, minRH: 90, maxRH: 95, ref: REF.kader },
    ],
    respiration: [
      { temperatureC: 5, minRate: 5, maxRate: 15, unit: 'mL CO2/kg/hr', confidence: 'MEDIUM', ref: REF.kader },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 30, maxDays: 90, packagingContext: 'typical retail cold storage (long-term CA storage can exceed this)', confidence: 'MEDIUM', ref: REF.kader },
      { storageType: 'AMBIENT', minDays: 7, maxDays: 14, packagingContext: 'unpackaged', confidence: 'MEDIUM', ref: REF.kader },
    ],
  },
  {
    slug: 'strawberry', name: 'Strawberry', commonNames: [], scientificName: 'Fragaria × ananassa',
    categorySlug: 'fruits', isFreshProduce: true,
    description: 'Highly perishable non-climacteric fruit; very high respiration rate.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 90, maxValue: 91, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'PH', minValue: 3.0, maxValue: 3.5, unit: 'pH', confidence: 'MEDIUM', ref: REF.kader },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 0, maxTempC: 2, minRH: 90, maxRH: 95, ref: REF.kader },
    ],
    respiration: [
      { temperatureC: 5, minRate: 40, maxRate: 80, unit: 'mL CO2/kg/hr', confidence: 'MEDIUM', ref: REF.kader },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 5, maxDays: 10, packagingContext: 'clamshell, ventilated', confidence: 'MEDIUM', ref: REF.kader },
    ],
  },
  {
    slug: 'grapes', name: 'Grapes', commonNames: ['Angoor'], scientificName: 'Vitis vinifera',
    categorySlug: 'fruits', isFreshProduce: true,
    description: 'Non-climacteric fruit; stores well near 0°C.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 80, maxValue: 82, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'PH', minValue: 3.1, maxValue: 3.6, unit: 'pH', confidence: 'MEDIUM', ref: REF.kader },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: -1, maxTempC: 0, minRH: 90, maxRH: 95, ref: REF.kader },
    ],
    respiration: [
      { temperatureC: 0, minRate: 5, maxRate: 10, unit: 'mL CO2/kg/hr', confidence: 'MEDIUM', ref: REF.kader },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 21, maxDays: 56, packagingContext: 'typical retail cold storage', confidence: 'MEDIUM', ref: REF.kader },
    ],
  },
  {
    slug: 'potato', name: 'Potato', commonNames: ['Aloo'], scientificName: 'Solanum tuberosum',
    categorySlug: 'vegetables', isFreshProduce: true,
    description: 'Long-storing tuber; cold-induced sweetening below ~4°C is undesirable for processing/frying use.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 78, maxValue: 80, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'PH', minValue: 5.4, maxValue: 6.3, unit: 'pH', confidence: 'MEDIUM', ref: REF.kader },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 7, maxTempC: 10, minRH: 90, maxRH: 95, notes: 'Below ~4°C causes cold-induced sweetening (starch-to-sugar conversion), undesirable for frying/processing.', ref: REF.kader },
      { storageType: 'AMBIENT', minTempC: 15, maxTempC: 20, minRH: 85, maxRH: 90, ref: REF.kader },
    ],
    respiration: [
      { temperatureC: 10, minRate: 3, maxRate: 8, unit: 'mL CO2/kg/hr', confidence: 'MEDIUM', ref: REF.kader },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 60, maxDays: 120, packagingContext: 'sack/ventilated', confidence: 'MEDIUM', ref: REF.kader },
    ],
  },
  {
    slug: 'onion', name: 'Onion', commonNames: ['Pyaaz'], scientificName: 'Allium cepa',
    categorySlug: 'vegetables', isFreshProduce: true,
    description: 'Unlike most produce, onion storage needs LOW relative humidity (~65-70%) to prevent rot.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 86, maxValue: 89, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 0, maxTempC: 4, minRH: 65, maxRH: 70, notes: 'Low RH is required — high humidity causes rot/sprouting.', ref: REF.kader },
      { storageType: 'AMBIENT', minTempC: 20, maxTempC: 25, minRH: 65, maxRH: 70, notes: 'Cured bulbs, well-ventilated storage.', ref: REF.kader },
    ],
    respiration: [
      { temperatureC: 5, minRate: 3, maxRate: 6, unit: 'mL CO2/kg/hr', confidence: 'MEDIUM', ref: REF.kader },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 90, maxDays: 240, packagingContext: 'mesh sack, ventilated', confidence: 'MEDIUM', ref: REF.kader },
      { storageType: 'AMBIENT', minDays: 30, maxDays: 60, packagingContext: 'mesh sack, cured bulbs', confidence: 'MEDIUM', ref: REF.kader },
    ],
  },
  {
    slug: 'carrot', name: 'Carrot', commonNames: ['Gajar'], scientificName: 'Daucus carota',
    categorySlug: 'vegetables', isFreshProduce: true,
    description: 'Root vegetable; needs very high humidity (~95%+) to avoid wilting.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 87, maxValue: 90, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 0, maxTempC: 2, minRH: 95, maxRH: 98, ref: REF.kader },
    ],
    respiration: [
      { temperatureC: 5, minRate: 10, maxRate: 20, unit: 'mL CO2/kg/hr', confidence: 'MEDIUM', ref: REF.kader },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 90, maxDays: 180, packagingContext: 'perforated bag', confidence: 'MEDIUM', ref: REF.kader },
    ],
  },
  {
    slug: 'rice', name: 'Rice', commonNames: ['Chawal'], scientificName: 'Oryza sativa',
    categorySlug: 'grains-cereals', isFreshProduce: false,
    description: 'Milled dry grain; primary risk is moisture pickup and insect infestation, not oxidation.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 12, maxValue: 14, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'AMBIENT', minTempC: 15, maxTempC: 30, maxRH: 70, notes: 'Keep RH below ~70% to limit mold/insect risk.', ref: REF.usdaHandbook66 },
    ],
    shelfLife: [
      { storageType: 'AMBIENT', minDays: 180, maxDays: 540, packagingContext: 'sealed bag, low RH', confidence: 'MEDIUM', ref: REF.usdaHandbook66 },
    ],
  },
  {
    slug: 'wheat', name: 'Wheat', commonNames: ['Gehun'], scientificName: 'Triticum aestivum',
    categorySlug: 'grains-cereals', isFreshProduce: false,
    description: 'Whole grain; low moisture and low RH storage are the key controls.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 10, maxValue: 13, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'AMBIENT', minTempC: 15, maxTempC: 30, maxRH: 65, ref: REF.usdaHandbook66 },
    ],
    shelfLife: [
      { storageType: 'AMBIENT', minDays: 180, maxDays: 365, packagingContext: 'sealed bag, low RH', confidence: 'MEDIUM', ref: REF.usdaHandbook66 },
    ],
  },
  {
    slug: 'wheat-flour', name: 'Wheat Flour (Atta)', commonNames: ['Atta'], scientificName: undefined,
    categorySlug: 'grains-cereals', isFreshProduce: false,
    description: 'Whole-wheat flour; germ oil content makes it more rancidity-prone than whole grain.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 12, maxValue: 14, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'FAT_CONTENT', minValue: 1, maxValue: 2.5, unit: '%', confidence: 'LOW', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'AMBIENT', minTempC: 15, maxTempC: 25, maxRH: 65, ref: REF.usdaHandbook66 },
    ],
    shelfLife: [
      { storageType: 'AMBIENT', minDays: 60, maxDays: 120, packagingContext: 'sealed bag', confidence: 'MEDIUM', ref: REF.usdaHandbook66 },
    ],
  },
  {
    slug: 'toor-dal', name: 'Toor Dal (Pigeon Pea, split)', commonNames: ['Arhar Dal', 'Toor Dal'], scientificName: 'Cajanus cajan',
    categorySlug: 'pulses', isFreshProduce: false,
    description: 'Dried split legume.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 10, maxValue: 12, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'AMBIENT', minTempC: 15, maxTempC: 30, maxRH: 65, ref: REF.usdaHandbook66 },
    ],
    shelfLife: [
      { storageType: 'AMBIENT', minDays: 270, maxDays: 365, packagingContext: 'sealed bag', confidence: 'MEDIUM', ref: REF.usdaHandbook66 },
    ],
  },
  {
    slug: 'turmeric-powder', name: 'Turmeric Powder', commonNames: ['Haldi'], scientificName: 'Curcuma longa',
    categorySlug: 'spices', isFreshProduce: false,
    description: 'Ground spice; very moisture-sensitive (clumping/mold) and light-sensitive (color/potency loss).',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 8, maxValue: 10, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'AMBIENT', minTempC: 15, maxTempC: 25, maxRH: 60, ref: REF.usdaHandbook66 },
    ],
    shelfLife: [
      { storageType: 'AMBIENT', minDays: 365, maxDays: 730, packagingContext: 'sealed pouch, low RH', confidence: 'LOW', ref: REF.usdaHandbook66 },
    ],
  },
  {
    slug: 'cashew', name: 'Cashew (raw kernel)', commonNames: ['Kaju'], scientificName: 'Anacardium occidentale',
    categorySlug: 'nuts', isFreshProduce: false,
    description: 'High-fat nut; very oxidation/rancidity-sensitive, benefits from cool storage.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 5, maxValue: 6, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'FAT_CONTENT', minValue: 43, maxValue: 48, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 0, maxTempC: 10, maxRH: 65, notes: 'Cool storage slows rancidity development.', ref: REF.usdaHandbook66 },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 180, maxDays: 365, packagingContext: 'sealed, high-barrier pack', confidence: 'MEDIUM', ref: REF.usdaHandbook66 },
      { storageType: 'AMBIENT', minDays: 60, maxDays: 120, packagingContext: 'sealed pack, ambient', confidence: 'LOW', ref: REF.usdaHandbook66 },
    ],
  },
  {
    slug: 'milk', name: 'Milk (pasteurized, whole)', commonNames: ['Doodh'], scientificName: undefined,
    categorySlug: 'dairy', isFreshProduce: false,
    description: 'Pasteurized (HTST) liquid whole milk — not UHT. Requires strict, unbroken cold chain.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 87, maxValue: 88, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'FAT_CONTENT', value: 3.5, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'PH', minValue: 6.5, maxValue: 6.7, unit: 'pH', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 0, maxTempC: 4, notes: 'Strict unbroken cold chain required.', ref: REF.usdaHandbook66 },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 5, maxDays: 10, packagingContext: 'HDPE bottle or pouch', confidence: 'MEDIUM', ref: REF.usdaHandbook66 },
    ],
  },
  {
    slug: 'paneer', name: 'Paneer (fresh)', commonNames: [], scientificName: undefined,
    categorySlug: 'dairy', isFreshProduce: false,
    description: 'Fresh unripened soft cheese; highly perishable without added preservatives.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 50, maxValue: 60, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'FAT_CONTENT', minValue: 20, maxValue: 25, unit: '%', confidence: 'LOW', ref: REF.usdaFdc },
      { propertyType: 'PH', minValue: 5.5, maxValue: 6.0, unit: 'pH', confidence: 'LOW', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'CHILLED', minTempC: 0, maxTempC: 4, ref: REF.usdaHandbook66 },
    ],
    shelfLife: [
      { storageType: 'CHILLED', minDays: 3, maxDays: 7, packagingContext: 'vacuum or water-immersed pack', confidence: 'MEDIUM', ref: REF.usdaHandbook66 },
    ],
  },
  {
    slug: 'potato-chips', name: 'Potato Chips (fried, salted)', commonNames: [], scientificName: undefined,
    categorySlug: 'processed-bakery', isFreshProduce: false,
    description: 'Fried snack; very low moisture but high fat content makes oxidative rancidity, not microbial spoilage, the shelf-life driver. Also highly susceptible to moisture pickup (loss of crispness).',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 1.5, maxValue: 2.5, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'FAT_CONTENT', minValue: 30, maxValue: 38, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'AMBIENT', minTempC: 15, maxTempC: 25, maxRH: 50, notes: 'Low RH essential to preserve crispness.', ref: REF.robertson },
    ],
    shelfLife: [
      { storageType: 'AMBIENT', minDays: 60, maxDays: 180, packagingContext: 'metallized-film pack', confidence: 'MEDIUM', ref: REF.robertson },
    ],
  },
  {
    slug: 'biscuits', name: 'Biscuits (commercial)', commonNames: [], scientificName: undefined,
    categorySlug: 'processed-bakery', isFreshProduce: false,
    description: 'Baked snack; moisture pickup causes loss of crunch, fat content varies widely by recipe.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 2, maxValue: 4, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'FAT_CONTENT', minValue: 15, maxValue: 25, unit: '%', confidence: 'LOW', notes: 'Wide variance by recipe/type.', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'AMBIENT', minTempC: 15, maxTempC: 25, maxRH: 60, ref: REF.robertson },
    ],
    shelfLife: [
      { storageType: 'AMBIENT', minDays: 120, maxDays: 270, packagingContext: 'sealed pack', confidence: 'MEDIUM', ref: REF.robertson },
    ],
  },
  {
    slug: 'coffee-roasted-ground', name: 'Coffee (roasted, ground)', commonNames: [], scientificName: 'Coffea spp.',
    categorySlug: 'beverages', isFreshProduce: false,
    description: 'Roasted ground coffee; aromatic oils are highly oxidation-sensitive — the classic case for foil-laminate + degassing valve packaging.',
    properties: [
      { propertyType: 'MOISTURE_CONTENT', minValue: 2, maxValue: 4, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
      { propertyType: 'FAT_CONTENT', minValue: 10, maxValue: 15, unit: '%', confidence: 'MEDIUM', ref: REF.usdaFdc },
    ],
    storage: [
      { storageType: 'AMBIENT', minTempC: 15, maxTempC: 25, maxRH: 60, ref: REF.robertson },
    ],
    shelfLife: [
      { storageType: 'AMBIENT', minDays: 180, maxDays: 365, packagingContext: 'foil-laminate pack with one-way valve, unopened — highly dependent on roast date, grind size, and pack barrier', confidence: 'LOW', ref: REF.robertson },
    ],
  },
];

// ---------- Packaging materials ----------

interface MaterialPropertySeed {
  propertyType: string;
  value?: number;
  minValue?: number;
  maxValue?: number;
  unit: string;
  testConditionTempC?: number;
  testConditionRH?: number;
  confidence: ConfidenceLevel;
  notes?: string;
  ref: Ref;
}

interface MaterialSeed {
  slug: string;
  name: string;
  materialType: string;
  description: string;
  recyclable: boolean | null;
  monoMaterial: boolean | null;
  biodegradable: boolean;
  properties: MaterialPropertySeed[];
}

const MATERIALS: MaterialSeed[] = [
  {
    slug: 'ldpe', name: 'LDPE Film', materialType: 'LDPE',
    description: 'Low-density polyethylene film — cheap, heat-sealable, moderate barrier.',
    recyclable: true, monoMaterial: true, biodegradable: false,
    properties: [
      { propertyType: 'OTR', minValue: 7000, maxValue: 8000, unit: 'cc/m²/day', testConditionTempC: 23, testConditionRH: 0, confidence: 'MEDIUM', notes: 'At ~25 µm gauge.', ref: REF.selke },
      { propertyType: 'WVTR', minValue: 16, maxValue: 20, unit: 'g/m²/day', testConditionTempC: 38, testConditionRH: 90, confidence: 'MEDIUM', notes: 'At ~25 µm gauge.', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 25, maxValue: 75, unit: 'µm', confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 10, maxValue: 20, unit: 'MPa', confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'SEAL_STRENGTH', minValue: 3, maxValue: 5, unit: 'N/15mm', confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'PUNCTURE_RESISTANCE', minValue: 4, maxValue: 7, unit: 'N', confidence: 'LOW', ref: REF.selke },
    ],
  },
  {
    slug: 'hdpe', name: 'HDPE', materialType: 'HDPE',
    description: 'High-density polyethylene — stiffer and a better barrier than LDPE; common for bottles.',
    recyclable: true, monoMaterial: true, biodegradable: false,
    properties: [
      { propertyType: 'OTR', minValue: 1800, maxValue: 3000, unit: 'cc/m²/day', testConditionTempC: 23, testConditionRH: 0, confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'WVTR', minValue: 6, maxValue: 10, unit: 'g/m²/day', testConditionTempC: 38, testConditionRH: 90, confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 300, maxValue: 800, unit: 'µm', confidence: 'MEDIUM', notes: 'Typical bottle wall gauge.', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 20, maxValue: 30, unit: 'MPa', confidence: 'MEDIUM', ref: REF.selke },
    ],
  },
  {
    slug: 'bopp', name: 'BOPP Film', materialType: 'PP',
    description: 'Biaxially oriented polypropylene — good moisture barrier, high mechanical strength, common outer web.',
    recyclable: true, monoMaterial: null, biodegradable: false,
    properties: [
      { propertyType: 'OTR', minValue: 1500, maxValue: 2500, unit: 'cc/m²/day', testConditionTempC: 23, testConditionRH: 0, confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'WVTR', minValue: 5, maxValue: 10, unit: 'g/m²/day', testConditionTempC: 38, testConditionRH: 90, confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 15, maxValue: 40, unit: 'µm', confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 130, maxValue: 180, unit: 'MPa', confidence: 'MEDIUM', ref: REF.selke },
    ],
  },
  {
    slug: 'pet-film', name: 'PET Film (BoPET)', materialType: 'PET',
    description: 'Biaxially oriented PET film — good oxygen barrier, high clarity and strength, common outer/structural layer.',
    recyclable: true, monoMaterial: null, biodegradable: false,
    properties: [
      { propertyType: 'OTR', minValue: 50, maxValue: 100, unit: 'cc/m²/day', testConditionTempC: 23, testConditionRH: 0, confidence: 'MEDIUM', notes: 'At ~12 µm gauge.', ref: REF.selke },
      { propertyType: 'WVTR', minValue: 20, maxValue: 40, unit: 'g/m²/day', testConditionTempC: 38, testConditionRH: 90, confidence: 'MEDIUM', notes: 'At ~12 µm gauge.', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 12, maxValue: 23, unit: 'µm', confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 190, maxValue: 220, unit: 'MPa', confidence: 'MEDIUM', ref: REF.selke },
    ],
  },
  {
    slug: 'metallized-pet', name: 'Metallized Film', materialType: 'METALLIZED_FILM',
    description: 'Vacuum-metallized PET/BOPP — dramatically improved O2/moisture barrier vs. the unmetallized base film.',
    recyclable: false, monoMaterial: false, biodegradable: false,
    properties: [
      { propertyType: 'OTR', minValue: 1, maxValue: 5, unit: 'cc/m²/day', testConditionTempC: 23, testConditionRH: 0, confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'WVTR', minValue: 1, maxValue: 2, unit: 'g/m²/day', testConditionTempC: 38, testConditionRH: 90, confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 12, maxValue: 20, unit: 'µm', confidence: 'MEDIUM', ref: REF.selke },
    ],
  },
  {
    slug: 'alu-foil-laminate', name: 'Aluminum Foil Laminate', materialType: 'ALU_FOIL_LAMINATE',
    description: 'PET/Aluminum-foil/PE laminate — near-total gas and moisture barrier, used for the most oxidation-sensitive products.',
    recyclable: false, monoMaterial: false, biodegradable: false,
    properties: [
      { propertyType: 'OTR', minValue: 0, maxValue: 0.5, unit: 'cc/m²/day', testConditionTempC: 23, testConditionRH: 0, confidence: 'MEDIUM', notes: 'Pinhole-free foil is effectively an absolute barrier.', ref: REF.selke },
      { propertyType: 'WVTR', minValue: 0, maxValue: 0.5, unit: 'g/m²/day', testConditionTempC: 38, testConditionRH: 90, confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 60, maxValue: 90, unit: 'µm', confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'SEAL_STRENGTH', minValue: 4, maxValue: 6, unit: 'N/15mm', confidence: 'LOW', ref: REF.selke },
    ],
  },
  {
    slug: 'pla-film', name: 'PLA Film', materialType: 'BIODEGRADABLE_FILM',
    description: 'Compostable polylactic-acid film. Weaker O2 barrier than PET; industrially compostable, not home-recyclable.',
    recyclable: false, monoMaterial: true, biodegradable: true,
    properties: [
      { propertyType: 'OTR', minValue: 150, maxValue: 400, unit: 'cc/m²/day', testConditionTempC: 23, testConditionRH: 0, confidence: 'LOW', ref: REF.selke },
      { propertyType: 'WVTR', minValue: 10, maxValue: 30, unit: 'g/m²/day', testConditionTempC: 38, testConditionRH: 90, confidence: 'LOW', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 20, maxValue: 40, unit: 'µm', confidence: 'LOW', ref: REF.selke },
    ],
  },
  {
    slug: 'cellulose-film', name: 'Cellulose Film', materialType: 'BIODEGRADABLE_FILM',
    description: 'Compostable cellulose-based film (e.g. NatureFlex-type). Barrier varies significantly with any applied coating.',
    recyclable: false, monoMaterial: true, biodegradable: true,
    properties: [
      { propertyType: 'OTR', minValue: 80, maxValue: 150, unit: 'cc/m²/day', testConditionTempC: 23, testConditionRH: 0, confidence: 'LOW', ref: REF.selke },
      { propertyType: 'WVTR', minValue: 5, maxValue: 20, unit: 'g/m²/day', testConditionTempC: 38, testConditionRH: 90, confidence: 'LOW', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 20, maxValue: 35, unit: 'µm', confidence: 'LOW', ref: REF.selke },
    ],
  },
  {
    slug: 'micro-perforated-bopp', name: 'Micro-Perforated BOPP Film', materialType: 'MICRO_PERFORATED_FILM',
    description: 'BOPP film engineered with laser micro-perforations so OTR/WVTR can be tuned to a commodity\'s respiration rate.',
    recyclable: true, monoMaterial: true, biodegradable: false,
    properties: [
      { propertyType: 'OTR', minValue: 3000, maxValue: 15000, unit: 'cc/m²/day', testConditionTempC: 23, testConditionRH: 0, confidence: 'LOW', notes: 'Highly variable — engineered per perforation density for the target commodity.', ref: REF.robertson },
      { propertyType: 'WVTR', minValue: 30, maxValue: 100, unit: 'g/m²/day', testConditionTempC: 38, testConditionRH: 90, confidence: 'LOW', ref: REF.robertson },
      { propertyType: 'THICKNESS', minValue: 20, maxValue: 40, unit: 'µm', confidence: 'MEDIUM', ref: REF.robertson },
    ],
  },
  {
    slug: 'kraft-pe-liner', name: 'Kraft Paper with PE Liner', materialType: 'MONO_MATERIAL',
    description: 'Kraft paper laminated with a thin PE liner — mechanical protection and a moisture liner for dry granular goods. Not primarily an oxygen barrier.',
    recyclable: null, monoMaterial: false, biodegradable: false,
    properties: [
      { propertyType: 'WVTR', minValue: 15, maxValue: 20, unit: 'g/m²/day', testConditionTempC: 38, testConditionRH: 90, confidence: 'LOW', notes: 'Dominated by the PE liner.', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 100, maxValue: 200, unit: 'µm', confidence: 'LOW', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 15, maxValue: 25, unit: 'MPa', confidence: 'LOW', ref: REF.selke },
    ],
  },
  {
    slug: 'rigid-pet-tray', name: 'Rigid PET Tray', materialType: 'PET',
    description: 'Thermoformed rigid PET tray for produce trays/clamshells.',
    recyclable: true, monoMaterial: true, biodegradable: false,
    properties: [
      { propertyType: 'OTR', minValue: 5, maxValue: 15, unit: 'cc/m²/day', testConditionTempC: 23, testConditionRH: 0, confidence: 'LOW', notes: 'At typical tray gauge (~250-300 µm).', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 250, maxValue: 350, unit: 'µm', confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 50, maxValue: 70, unit: 'MPa', confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'PUNCTURE_RESISTANCE', minValue: 8, maxValue: 15, unit: 'N', confidence: 'LOW', ref: REF.selke },
    ],
  },
  {
    slug: 'paperboard', name: 'Paperboard', materialType: 'MONO_MATERIAL',
    description: 'Folding carton board — recyclable and biodegradable, low intrinsic barrier.',
    recyclable: true, monoMaterial: true, biodegradable: true,
    properties: [
      { propertyType: 'THICKNESS', minValue: 300, maxValue: 600, unit: 'µm', confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 20, maxValue: 35, unit: 'MPa', confidence: 'LOW', ref: REF.selke },
      { propertyType: 'PUNCTURE_RESISTANCE', minValue: 5, maxValue: 10, unit: 'N', confidence: 'LOW', ref: REF.selke },
    ],
  },
  // ---- Bulk / wholesale formats (25 kg sacks up to 2000 kg+ jumbo bags) ----
  {
    slug: 'vented-hdpe-crate', name: 'Vented HDPE Crate Wall', materialType: 'VENTED_CRATE',
    description: 'Injection-molded HDPE crate wall with open vent slots — essentially unrestricted gas/moisture exchange by design, for stacked fresh-produce transport.',
    recyclable: true, monoMaterial: true, biodegradable: false,
    properties: [
      { propertyType: 'OTR', minValue: 50000, maxValue: 100000, unit: 'cc/m²/day', confidence: 'LOW', notes: 'Vented crate wall, not a barrier film — value is an engineering approximation of "essentially unrestricted", not a lab OTR test (which doesn\'t apply to an open format).', ref: REF.robertson },
      { propertyType: 'WVTR', minValue: 5000, maxValue: 10000, unit: 'g/m²/day', confidence: 'LOW', notes: 'Same caveat as OTR — open-vented format.', ref: REF.robertson },
      { propertyType: 'TENSILE_STRENGTH', minValue: 25, maxValue: 35, unit: 'MPa', confidence: 'MEDIUM', ref: REF.selke },
      { propertyType: 'PUNCTURE_RESISTANCE', minValue: 20, maxValue: 35, unit: 'N', confidence: 'MEDIUM', notes: 'Rigid, stackable, load-bearing wall.', ref: REF.selke },
    ],
  },
  {
    slug: 'woven-pp-fabric', name: 'Woven PP Fabric', materialType: 'WOVEN_PP',
    description: 'Woven polypropylene tape fabric — the standard bulk sack material (grain, onion, potato). Porous weave, not a barrier.',
    recyclable: true, monoMaterial: true, biodegradable: false,
    properties: [
      { propertyType: 'OTR', minValue: 30000, maxValue: 80000, unit: 'cc/m²/day', confidence: 'LOW', notes: 'Open woven fabric, not a barrier film — engineering approximation of "essentially unrestricted".', ref: REF.robertson },
      { propertyType: 'WVTR', minValue: 3000, maxValue: 8000, unit: 'g/m²/day', confidence: 'LOW', notes: 'Same caveat as OTR.', ref: REF.robertson },
      { propertyType: 'THICKNESS', minValue: 200, maxValue: 300, unit: 'µm', confidence: 'LOW', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 30, maxValue: 45, unit: 'MPa', confidence: 'MEDIUM', notes: 'Tape-woven fabric — strong in tension along the weave.', ref: REF.selke },
      { propertyType: 'PUNCTURE_RESISTANCE', minValue: 15, maxValue: 25, unit: 'N', confidence: 'LOW', ref: REF.selke },
    ],
  },
  {
    slug: 'jute-fabric', name: 'Jute Fabric', materialType: 'JUTE',
    description: 'Woven natural jute sacking — biodegradable, breathable, the traditional Indian bulk-grain/produce sack material.',
    recyclable: true, monoMaterial: true, biodegradable: true,
    properties: [
      { propertyType: 'OTR', minValue: 30000, maxValue: 80000, unit: 'cc/m²/day', confidence: 'LOW', notes: 'Open natural-fiber weave, not a barrier — engineering approximation of "essentially unrestricted".', ref: REF.robertson },
      { propertyType: 'WVTR', minValue: 3000, maxValue: 8000, unit: 'g/m²/day', confidence: 'LOW', notes: 'Same caveat as OTR.', ref: REF.robertson },
      { propertyType: 'THICKNESS', minValue: 300, maxValue: 500, unit: 'µm', confidence: 'LOW', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 20, maxValue: 30, unit: 'MPa', confidence: 'LOW', ref: REF.selke },
      { propertyType: 'PUNCTURE_RESISTANCE', minValue: 10, maxValue: 18, unit: 'N', confidence: 'LOW', ref: REF.selke },
    ],
  },
  {
    slug: 'corrugated-fiberboard', name: 'Corrugated Fiberboard', materialType: 'CORRUGATED_FIBERBOARD',
    description: 'Corrugated cardboard — recyclable, biodegradable, the standard export-grade fruit/vegetable carton and mid-size dry-goods case material.',
    recyclable: true, monoMaterial: false, biodegradable: true,
    properties: [
      { propertyType: 'OTR', minValue: 15000, maxValue: 40000, unit: 'cc/m²/day', confidence: 'LOW', notes: 'Porous fiberboard, not a barrier film — engineering approximation.', ref: REF.robertson },
      { propertyType: 'WVTR', minValue: 1500, maxValue: 4000, unit: 'g/m²/day', confidence: 'LOW', ref: REF.robertson },
      { propertyType: 'THICKNESS', minValue: 3000, maxValue: 6000, unit: 'µm', confidence: 'MEDIUM', notes: 'Single/double-wall corrugated board.', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 15, maxValue: 25, unit: 'MPa', confidence: 'LOW', ref: REF.selke },
      { propertyType: 'PUNCTURE_RESISTANCE', minValue: 25, maxValue: 40, unit: 'N', confidence: 'MEDIUM', notes: 'Stacking/handling strength of a corrugated case.', ref: REF.selke },
    ],
  },
  {
    slug: 'stainless-steel', name: 'Stainless Steel (food-grade)', materialType: 'STAINLESS_STEEL',
    description: 'Food-grade stainless steel — the traditional Indian dairy milk can (~40L) for farm-to-collection-center transport. Reusable, essentially impermeable, no barrier concerns.',
    recyclable: true, monoMaterial: true, biodegradable: false,
    properties: [
      { propertyType: 'OTR', value: 0, unit: 'cc/m²/day', confidence: 'HIGH', notes: 'Solid metal — effectively zero gas transmission.', ref: REF.selke },
      { propertyType: 'WVTR', value: 0, unit: 'g/m²/day', confidence: 'HIGH', notes: 'Solid metal — effectively zero moisture transmission.', ref: REF.selke },
      { propertyType: 'THICKNESS', minValue: 600, maxValue: 1000, unit: 'µm', confidence: 'MEDIUM', notes: 'Typical milk-can sheet gauge.', ref: REF.selke },
      { propertyType: 'TENSILE_STRENGTH', minValue: 500, maxValue: 700, unit: 'MPa', confidence: 'HIGH', ref: REF.selke },
      { propertyType: 'PUNCTURE_RESISTANCE', minValue: 200, maxValue: 300, unit: 'N', confidence: 'HIGH', ref: REF.selke },
    ],
  },
];

// ---------- Packaging structures ----------

interface LayerSeed {
  order: number;
  layerRole: string;
  materialSlug: string;
  thicknessMinMicron?: number;
  thicknessMaxMicron?: number;
}

interface StructureSeed {
  slug: string;
  name: string;
  structureType: string;
  description: string;
  supportsMap: boolean;
  microPerforated: boolean;
  approxCostMin: number;
  approxCostMax: number;
  costUnit: string;
  /** Pack-quantity range this structure is actually made/sold at, in kg. */
  minPackWeightKg: number;
  maxPackWeightKg: number;
  /** Commodity physical forms this structure is real-world used for; [] = general-purpose. */
  applicableProductForms: string[];
  layers: LayerSeed[];
}

const STRUCTURES: StructureSeed[] = [
  {
    slug: 'micro-perforated-pet-tray', name: 'PET Tray with Micro-Perforated Lidding Film', structureType: 'tray',
    description: 'Rigid PET tray with a micro-perforated breathable lid — for chilled fresh produce needing gas exchange.',
    supportsMap: true, microPerforated: true, approxCostMin: 3, approxCostMax: 5, costUnit: '₹/pack',
    minPackWeightKg: 0.2, maxPackWeightKg: 2, applicableProductForms: ['FRESH_PRODUCE'],
    layers: [
      { order: 1, layerRole: 'TRAY', materialSlug: 'rigid-pet-tray' },
      { order: 2, layerRole: 'SEAL', materialSlug: 'micro-perforated-bopp' },
    ],
  },
  {
    slug: 'map-multilayer-pouch', name: 'PET / Metallized PET / LDPE MAP Pouch', structureType: 'pouch',
    description: 'Multilayer flexible pouch combining PET strength, a metallized barrier, and an LDPE heat seal — for MAP-packed fresh produce.',
    supportsMap: true, microPerforated: false, approxCostMin: 4, approxCostMax: 6, costUnit: '₹/pack',
    minPackWeightKg: 0.1, maxPackWeightKg: 2, applicableProductForms: ['FRESH_PRODUCE'],
    layers: [
      { order: 1, layerRole: 'OUTER', materialSlug: 'pet-film', thicknessMinMicron: 12, thicknessMaxMicron: 12 },
      { order: 2, layerRole: 'BARRIER', materialSlug: 'metallized-pet', thicknessMinMicron: 12, thicknessMaxMicron: 12 },
      { order: 3, layerRole: 'SEAL', materialSlug: 'ldpe', thicknessMinMicron: 40, thicknessMaxMicron: 60 },
    ],
  },
  {
    slug: 'ldpe-bag', name: 'LDPE Bag', structureType: 'bag',
    description: 'Simple mono-material LDPE bag — low cost, moderate barrier, fully recyclable.',
    supportsMap: false, microPerforated: false, approxCostMin: 1, approxCostMax: 2, costUnit: '₹/pack',
    minPackWeightKg: 0.25, maxPackWeightKg: 5, applicableProductForms: [],
    layers: [{ order: 1, layerRole: 'SEAL', materialSlug: 'ldpe', thicknessMinMicron: 40, thicknessMaxMicron: 75 }],
  },
  {
    slug: 'hdpe-bottle', name: 'HDPE Bottle', structureType: 'bottle',
    description: 'Rigid HDPE bottle for liquid dairy products.',
    supportsMap: false, microPerforated: false, approxCostMin: 3, approxCostMax: 5, costUnit: '₹/pack',
    minPackWeightKg: 0.2, maxPackWeightKg: 2, applicableProductForms: ['LIQUID'],
    layers: [{ order: 1, layerRole: 'OUTER', materialSlug: 'hdpe' }],
  },
  {
    slug: 'metallized-snack-pouch', name: 'Metallized BOPP/LDPE Snack Pouch', structureType: 'pouch',
    description: 'Metallized-film laminate pouch for oxidation-sensitive foods (coffee, nuts, fried/oily snacks).',
    supportsMap: false, microPerforated: false, approxCostMin: 2, approxCostMax: 4, costUnit: '₹/pack',
    minPackWeightKg: 0.03, maxPackWeightKg: 2, applicableProductForms: ['NUTS_SNACKS', 'POWDER_SPICE'],
    layers: [
      { order: 1, layerRole: 'OUTER', materialSlug: 'bopp', thicknessMinMicron: 18, thicknessMaxMicron: 20 },
      { order: 2, layerRole: 'BARRIER', materialSlug: 'metallized-pet', thicknessMinMicron: 12, thicknessMaxMicron: 12 },
      { order: 3, layerRole: 'SEAL', materialSlug: 'ldpe', thicknessMinMicron: 40, thicknessMaxMicron: 50 },
    ],
  },
  {
    slug: 'foil-laminate-sachet', name: 'Aluminum Foil Laminate Sachet', structureType: 'sachet',
    description: 'Near-hermetic foil-laminate sachet for the most oxidation-sensitive products (coffee, spices, nuts).',
    supportsMap: false, microPerforated: false, approxCostMin: 5, approxCostMax: 8, costUnit: '₹/pack',
    minPackWeightKg: 0.01, maxPackWeightKg: 2, applicableProductForms: ['POWDER_SPICE', 'NUTS_SNACKS'],
    layers: [
      { order: 1, layerRole: 'OUTER', materialSlug: 'pet-film', thicknessMinMicron: 12, thicknessMaxMicron: 12 },
      { order: 2, layerRole: 'BARRIER', materialSlug: 'alu-foil-laminate', thicknessMinMicron: 60, thicknessMaxMicron: 90 },
      { order: 3, layerRole: 'SEAL', materialSlug: 'ldpe', thicknessMinMicron: 40, thicknessMaxMicron: 50 },
    ],
  },
  {
    slug: 'kraft-liner-bag', name: 'Kraft Paper Bag with PE Liner', structureType: 'bag',
    description: 'Paper-forward bag for dry granular goods (grains, pulses) — mechanical strength plus a moisture liner.',
    supportsMap: false, microPerforated: false, approxCostMin: 2, approxCostMax: 3, costUnit: '₹/pack',
    minPackWeightKg: 0.5, maxPackWeightKg: 5, applicableProductForms: ['GRAIN_PULSE'],
    layers: [{ order: 1, layerRole: 'SEAL', materialSlug: 'kraft-pe-liner' }],
  },
  {
    slug: 'compostable-pouch', name: 'PLA/Cellulose Compostable Pouch', structureType: 'pouch',
    description: 'Fully compostable pouch for sustainability-prioritized use cases — trades some barrier performance for end-of-life impact.',
    supportsMap: false, microPerforated: false, approxCostMin: 6, approxCostMax: 9, costUnit: '₹/pack',
    minPackWeightKg: 0.1, maxPackWeightKg: 2, applicableProductForms: [],
    layers: [
      { order: 1, layerRole: 'OUTER', materialSlug: 'cellulose-film', thicknessMinMicron: 25, thicknessMaxMicron: 30 },
      { order: 2, layerRole: 'SEAL', materialSlug: 'pla-film', thicknessMinMicron: 25, thicknessMaxMicron: 30 },
    ],
  },
  {
    slug: 'produce-crate', name: 'Ventilated HDPE Produce Crate', structureType: 'crate',
    description: 'Reusable, stackable ventilated plastic crate — the standard for moving fresh produce from farm to mandi/wholesale market with airflow to shed field heat and respiration gases.',
    supportsMap: false, microPerforated: true, approxCostMin: 80, approxCostMax: 150, costUnit: '₹/crate (reusable)',
    minPackWeightKg: 8, maxPackWeightKg: 25, applicableProductForms: ['FRESH_PRODUCE'],
    layers: [{ order: 1, layerRole: 'TRAY', materialSlug: 'vented-hdpe-crate' }],
  },
  {
    slug: 'woven-pp-sack', name: 'Woven PP Sack', structureType: 'sack',
    description: 'Woven polypropylene sack — the standard bulk sack for grains, pulses, onions and potatoes at mandi/wholesale scale.',
    supportsMap: false, microPerforated: false, approxCostMin: 25, approxCostMax: 40, costUnit: '₹/sack',
    minPackWeightKg: 25, maxPackWeightKg: 50, applicableProductForms: ['GRAIN_PULSE'],
    layers: [{ order: 1, layerRole: 'OUTER', materialSlug: 'woven-pp-fabric' }],
  },
  {
    slug: 'jute-sack', name: 'Jute Sack', structureType: 'sack',
    description: 'Traditional woven jute sack — biodegradable, breathable, widely used for grain and produce procurement in India.',
    supportsMap: false, microPerforated: false, approxCostMin: 30, approxCostMax: 50, costUnit: '₹/sack',
    minPackWeightKg: 25, maxPackWeightKg: 50, applicableProductForms: ['GRAIN_PULSE'],
    layers: [{ order: 1, layerRole: 'OUTER', materialSlug: 'jute-fabric' }],
  },
  {
    slug: 'laminated-pp-sack', name: 'BOPP-Laminated Woven PP Sack', structureType: 'sack',
    description: 'Woven PP sack laminated with a BOPP film — adds a real moisture/oxygen barrier over a plain woven sack, for moisture-sensitive bulk goods (rice, sugar, flour, spices).',
    supportsMap: false, microPerforated: false, approxCostMin: 35, approxCostMax: 55, costUnit: '₹/sack',
    minPackWeightKg: 25, maxPackWeightKg: 50, applicableProductForms: ['GRAIN_PULSE', 'POWDER_SPICE'],
    layers: [
      { order: 1, layerRole: 'OUTER', materialSlug: 'woven-pp-fabric' },
      { order: 2, layerRole: 'BARRIER', materialSlug: 'bopp', thicknessMinMicron: 18, thicknessMaxMicron: 20 },
    ],
  },
  {
    slug: 'corrugated-carton', name: 'Corrugated Fiberboard Carton', structureType: 'carton',
    description: 'Corrugated cardboard box — the standard for export-grade fruit/vegetable cartons and mid-size dry-goods cases.',
    supportsMap: false, microPerforated: false, approxCostMin: 20, approxCostMax: 45, costUnit: '₹/carton',
    minPackWeightKg: 5, maxPackWeightKg: 25, applicableProductForms: ['FRESH_PRODUCE'],
    layers: [{ order: 1, layerRole: 'OUTER', materialSlug: 'corrugated-fiberboard' }],
  },
  {
    slug: 'fibc-jumbo-bag', name: 'FIBC Jumbo Bag (Bulk Bag)', structureType: 'jumbo_bag',
    description: 'Flexible Intermediate Bulk Container with a woven-PP body and PE liner — mini bulk bags from ~50kg up to full 500-2000kg+ jumbo bags for bulk grain, produce, or powder shipments; larger sizes need a forklift or crane, not hand-loading.',
    supportsMap: false, microPerforated: false, approxCostMin: 300, approxCostMax: 2500, costUnit: '₹/bag',
    minPackWeightKg: 50, maxPackWeightKg: 25000,
    applicableProductForms: ['GRAIN_PULSE', 'POWDER_SPICE', 'NUTS_SNACKS'],
    layers: [
      { order: 1, layerRole: 'OUTER', materialSlug: 'woven-pp-fabric' },
      { order: 2, layerRole: 'SEAL', materialSlug: 'ldpe', thicknessMinMicron: 80, thicknessMaxMicron: 150 },
    ],
  },
  // ---- Liquid-handling formats (milk, oil) — a bag/sack/carton is never a
  // real option for a liquid; bottles/cans/drums are the only real formats. ----
  {
    slug: 'hdpe-jerry-can', name: 'HDPE Jerry Can', structureType: 'jerry_can',
    description: 'Rigid HDPE jerry can — the standard retail-to-wholesale liquid container (milk, edible oil) once volumes exceed a bottle, 5-30L.',
    supportsMap: false, microPerforated: false, approxCostMin: 40, approxCostMax: 90, costUnit: '₹/can',
    minPackWeightKg: 2, maxPackWeightKg: 30, applicableProductForms: ['LIQUID'],
    layers: [{ order: 1, layerRole: 'OUTER', materialSlug: 'hdpe' }],
  },
  {
    slug: 'milk-can', name: 'Stainless Steel Milk Can', structureType: 'milk_can',
    description: 'Traditional ~40L stainless-steel milk can — the standard farm-to-dairy-collection-center bulk-intermediate container in India; reusable, not disposable.',
    supportsMap: false, microPerforated: false, approxCostMin: 2500, approxCostMax: 4500, costUnit: '₹/can (reusable)',
    minPackWeightKg: 30, maxPackWeightKg: 50, applicableProductForms: ['LIQUID'],
    layers: [{ order: 1, layerRole: 'OUTER', materialSlug: 'stainless-steel' }],
  },
  {
    slug: 'hdpe-drum', name: 'HDPE Drum / Barrel', structureType: 'drum',
    description: 'Rigid HDPE drum/barrel, 50-210L — bulk liquid (edible oil) transport once past milk-can/jerry-can scale, below a tanker load.',
    supportsMap: false, microPerforated: false, approxCostMin: 900, approxCostMax: 1800, costUnit: '₹/drum',
    minPackWeightKg: 50, maxPackWeightKg: 210, applicableProductForms: ['LIQUID'],
    layers: [{ order: 1, layerRole: 'OUTER', materialSlug: 'hdpe' }],
  },
  // ---- Powder/spice-specific bulk format — distinct from a plain woven
  // sack because fine powders need the PE-lined multiwall paper's tighter
  // moisture barrier, not just mechanical containment. ----
  {
    slug: 'multiwall-paper-sack', name: 'Multiwall Paper Sack with PE Liner', structureType: 'sack',
    description: 'Heat-sealed multiwall kraft paper sack with a PE inner liner — the standard bulk format for spices/flour (10-50kg), where the moisture barrier matters more than for whole grain.',
    supportsMap: false, microPerforated: false, approxCostMin: 25, approxCostMax: 45, costUnit: '₹/sack',
    minPackWeightKg: 10, maxPackWeightKg: 50, applicableProductForms: ['POWDER_SPICE', 'GRAIN_PULSE'],
    layers: [{ order: 1, layerRole: 'OUTER', materialSlug: 'kraft-pe-liner' }],
  },
];

export const LOCAL_USER_ID = '00000000-0000-0000-0000-000000000001';

async function main() {
  console.log('Seeding local user...');
  await prisma.user.upsert({
    where: { id: LOCAL_USER_ID },
    update: {},
    create: {
      id: LOCAL_USER_ID,
      email: 'local@foodpack.ai',
      name: 'Local User',
    },
  });

  console.log('Seeding categories...');
  const categoryIdBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const row = await prisma.foodCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    categoryIdBySlug.set(c.slug, row.id);
  }

  console.log('Seeding foods...');
  for (const f of FOODS) {
    const food = await prisma.food.upsert({
      where: { slug: f.slug },
      update: {
        name: f.name,
        commonNames: f.commonNames,
        scientificName: f.scientificName,
        categoryId: categoryIdBySlug.get(f.categorySlug)!,
        isFreshProduce: f.isFreshProduce,
        description: f.description,
      },
      create: {
        slug: f.slug,
        name: f.name,
        commonNames: f.commonNames,
        scientificName: f.scientificName,
        categoryId: categoryIdBySlug.get(f.categorySlug)!,
        isFreshProduce: f.isFreshProduce,
        description: f.description,
      },
    });

    // Idempotent re-seed: clear children, recreate from source data.
    await prisma.foodProperty.deleteMany({ where: { foodId: food.id } });
    await prisma.foodStorageCondition.deleteMany({ where: { foodId: food.id } });
    await prisma.foodRespirationData.deleteMany({ where: { foodId: food.id } });
    await prisma.foodShelfLifeData.deleteMany({ where: { foodId: food.id } });
    await prisma.foodSource.deleteMany({ where: { foodId: food.id } });

    const sourceIdByCitation = new Map<string, string>();
    const getSourceId = async (ref: Ref) => {
      const key = `${ref.citation}|${ref.publication}|${ref.year}`;
      if (sourceIdByCitation.has(key)) return sourceIdByCitation.get(key)!;
      const source = await prisma.foodSource.create({
        data: { foodId: food.id, citation: ref.citation, publication: ref.publication, year: ref.year },
      });
      sourceIdByCitation.set(key, source.id);
      return source.id;
    };

    for (const p of f.properties) {
      const sourceId = await getSourceId(p.ref);
      await prisma.foodProperty.create({
        data: {
          foodId: food.id,
          propertyType: p.propertyType,
          value: p.value,
          minValue: p.minValue,
          maxValue: p.maxValue,
          unit: p.unit,
          confidence: p.confidence,
          notes: p.notes,
          sourceId,
        },
      });
    }

    for (const s of f.storage) {
      const sourceId = await getSourceId(s.ref);
      await prisma.foodStorageCondition.create({
        data: {
          foodId: food.id,
          storageType: s.storageType,
          minTempC: s.minTempC,
          maxTempC: s.maxTempC,
          minRH: s.minRH,
          maxRH: s.maxRH,
          notes: s.notes,
          sourceId,
        },
      });
    }

    for (const r of f.respiration ?? []) {
      const sourceId = await getSourceId(r.ref);
      await prisma.foodRespirationData.create({
        data: {
          foodId: food.id,
          temperatureC: r.temperatureC,
          co2ProductionRate: r.co2ProductionRate ?? (r.minRate !== undefined && r.maxRate !== undefined ? (r.minRate + r.maxRate) / 2 : undefined),
          unit: r.unit,
          confidence: r.confidence,
          sourceId,
        },
      });
    }

    for (const sl of f.shelfLife) {
      const sourceId = await getSourceId(sl.ref);
      await prisma.foodShelfLifeData.create({
        data: {
          foodId: food.id,
          storageType: sl.storageType,
          minDays: sl.minDays,
          maxDays: sl.maxDays,
          packagingContext: sl.packagingContext,
          confidence: sl.confidence,
          sourceId,
        },
      });
    }
  }

  console.log('Seeding packaging materials...');
  const materialIdBySlug = new Map<string, string>();
  for (const m of MATERIALS) {
    const material = await prisma.packagingMaterial.upsert({
      where: { slug: m.slug },
      update: {
        name: m.name,
        materialType: m.materialType,
        description: m.description,
        recyclable: m.recyclable,
        monoMaterial: m.monoMaterial,
        biodegradable: m.biodegradable,
      },
      create: {
        slug: m.slug,
        name: m.name,
        materialType: m.materialType,
        description: m.description,
        recyclable: m.recyclable,
        monoMaterial: m.monoMaterial,
        biodegradable: m.biodegradable,
      },
    });
    materialIdBySlug.set(m.slug, material.id);

    await prisma.materialProperty.deleteMany({ where: { materialId: material.id } });
    await prisma.materialSource.deleteMany({ where: { materialId: material.id } });

    const sourceIdByCitation = new Map<string, string>();
    const getSourceId = async (ref: Ref) => {
      const key = `${ref.citation}|${ref.publication}|${ref.year}`;
      if (sourceIdByCitation.has(key)) return sourceIdByCitation.get(key)!;
      const source = await prisma.materialSource.create({
        data: { materialId: material.id, citation: ref.citation, publication: ref.publication, year: ref.year },
      });
      sourceIdByCitation.set(key, source.id);
      return source.id;
    };

    for (const p of m.properties) {
      const sourceId = await getSourceId(p.ref);
      await prisma.materialProperty.create({
        data: {
          materialId: material.id,
          propertyType: p.propertyType,
          value: p.value,
          minValue: p.minValue,
          maxValue: p.maxValue,
          unit: p.unit,
          testConditionTempC: p.testConditionTempC,
          testConditionRH: p.testConditionRH,
          confidence: p.confidence,
          notes: p.notes,
          sourceId,
        },
      });
    }
  }

  console.log('Seeding packaging structures...');
  for (const s of STRUCTURES) {
    const structure = await prisma.packagingStructure.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        structureType: s.structureType,
        description: s.description,
        supportsMap: s.supportsMap,
        microPerforated: s.microPerforated,
        approxCostMin: s.approxCostMin,
        approxCostMax: s.approxCostMax,
        costUnit: s.costUnit,
        minPackWeightKg: s.minPackWeightKg,
        maxPackWeightKg: s.maxPackWeightKg,
        applicableProductForms: s.applicableProductForms,
      },
      create: {
        slug: s.slug,
        name: s.name,
        structureType: s.structureType,
        description: s.description,
        supportsMap: s.supportsMap,
        microPerforated: s.microPerforated,
        approxCostMin: s.approxCostMin,
        approxCostMax: s.approxCostMax,
        costUnit: s.costUnit,
        minPackWeightKg: s.minPackWeightKg,
        maxPackWeightKg: s.maxPackWeightKg,
        applicableProductForms: s.applicableProductForms,
      },
    });

    await prisma.packagingStructureLayer.deleteMany({ where: { structureId: structure.id } });
    for (const l of s.layers) {
      await prisma.packagingStructureLayer.create({
        data: {
          structureId: structure.id,
          order: l.order,
          layerRole: l.layerRole,
          materialId: materialIdBySlug.get(l.materialSlug)!,
          thicknessMinMicron: l.thicknessMinMicron,
          thicknessMaxMicron: l.thicknessMaxMicron,
        },
      });
    }
  }

  console.log(`Seeded ${CATEGORIES.length} categories, ${FOODS.length} foods, ${MATERIALS.length} materials, ${STRUCTURES.length} structures.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
