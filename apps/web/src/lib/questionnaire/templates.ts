/**
 * Questionnaire Template Library
 *
 * Maps food category slugs (and specific food slugs) to question templates.
 * The wizard calls `resolveTemplate(food)` to get the right question set.
 *
 * All templates share a set of universal "tail" questions (packaging format,
 * transport, objective) appended after category-specific questions.
 *
 * Scientific/technical values (OTR, WVTR, moisture, pH, respiration) are
 * NEVER asked here — they come from the knowledge base or Advanced Mode.
 */

import type { QuestionDef, QuestionnaireTemplate } from './types';

// ─── Universal tail questions ─────────────────────────────────────────────────
// These are appended to every template. Options may be overridden per category.

const UNIVERSAL_SHELF_LIFE_QUESTION: QuestionDef = {
  id: 'shelf_life',
  question: 'How long should it stay suitable to use?',
  helpText: 'Target shelf life — how long the product should remain safe and acceptable.',
  type: 'shelf_life',
  fieldKey: 'shelfLifeDays',
};

const UNIVERSAL_PACK_WEIGHT_QUESTION: QuestionDef = {
  id: 'pack_weight',
  question: 'How much are you packaging per unit?',
  helpText: 'Package size affects material selection. A 1 kg retail pouch is very different from a 50 kg sack.',
  type: 'pack_weight',
  fieldKey: 'packageWeightKg',
};

const UNIVERSAL_TRANSPORT_QUESTION: QuestionDef = {
  id: 'transport',
  question: 'How far will it be transported?',
  helpText: 'Longer journeys need more durable packaging.',
  type: 'single_select',
  fieldKey: 'transportType',
  columns: 3,
  options: [
    { value: 'LOCAL', label: 'Local', sublabel: 'Short distance', icon: 'MapPin' },
    { value: 'LONG_DISTANCE', label: 'Long distance', sublabel: 'Domestic', icon: 'Truck' },
    { value: 'EXPORT', label: 'Export', sublabel: 'International', icon: 'Globe2' },
  ],
};

const UNIVERSAL_PACKAGING_FORMAT_QUESTION: QuestionDef = {
  id: 'packaging_format',
  question: 'What kind of package do you want?',
  helpText: 'Choose a format, or let FoodPack AI decide the best option.',
  type: 'single_select',
  fieldKey: 'packagingFormat',
  columns: 3,
  options: [
    { value: 'AUTO', label: 'Auto-select', sublabel: 'Let FoodPack AI decide', icon: 'Sparkles' },
    { value: 'POUCH', label: 'Pouch / bag', icon: 'Package' },
    { value: 'TRAY', label: 'Tray', icon: 'Square' },
    { value: 'BOTTLE', label: 'Bottle', icon: 'FlaskConical' },
    { value: 'JAR', label: 'Jar', icon: 'Cookie' },
    { value: 'SACHET', label: 'Sachet', icon: 'Ticket' },
    { value: 'BOX', label: 'Box / carton', icon: 'Box' },
    { value: 'CLAMSHELL', label: 'Clamshell', icon: 'Layers' },
    { value: 'BAG', label: 'Bulk bag / sack', icon: 'Archive' },
  ],
};

const UNIVERSAL_OBJECTIVE_QUESTION: QuestionDef = {
  id: 'objective',
  question: 'What matters most to you?',
  helpText: 'This guides the trade-off between shelf life, cost, and sustainability.',
  type: 'single_select',
  fieldKey: 'objective',
  columns: 2,
  options: [
    { value: 'BALANCED', label: 'Balanced', sublabel: 'Good all-round recommendation', icon: 'Sparkles' },
    { value: 'MAX_SHELF_LIFE', label: 'Maximum shelf life', sublabel: 'Keep it fresh as long as possible', icon: 'PackageCheck' },
    { value: 'MIN_COST', label: 'Lowest cost', sublabel: 'Most affordable packaging', icon: 'Wallet' },
    { value: 'SUSTAINABILITY', label: 'More sustainable', sublabel: 'Recyclable / eco-friendly', icon: 'Recycle' },
  ],
};

/** Standard tail appended to every template */
function universalTail(overrides?: { packagingFormatOptions?: QuestionDef['options'] }): QuestionDef[] {
  const formatQ = overrides?.packagingFormatOptions
    ? { ...UNIVERSAL_PACKAGING_FORMAT_QUESTION, options: overrides.packagingFormatOptions }
    : UNIVERSAL_PACKAGING_FORMAT_QUESTION;
  return [
    UNIVERSAL_SHELF_LIFE_QUESTION,
    UNIVERSAL_PACK_WEIGHT_QUESTION,
    UNIVERSAL_TRANSPORT_QUESTION,
    formatQ,
    UNIVERSAL_OBJECTIVE_QUESTION,
  ];
}

// ─── Storage question builder ─────────────────────────────────────────────────

function storageQuestion(opts: {
  includeAmbient?: boolean;
  includeChilled?: boolean;
  includeFrozen?: boolean;
  ambientLabel?: string;
  helpText?: string;
}): QuestionDef {
  const options: QuestionDef['options'] = [];
  if (opts.includeAmbient ?? true) {
    options.push({ value: 'AMBIENT', label: opts.ambientLabel ?? 'Ambient', sublabel: 'Room temperature', icon: 'Globe2' });
  }
  if (opts.includeChilled ?? true) {
    options.push({ value: 'CHILLED', label: 'Refrigerated', sublabel: 'Chilled storage', icon: 'Snowflake' });
  }
  if (opts.includeFrozen ?? false) {
    options.push({ value: 'FROZEN', label: 'Frozen', sublabel: 'Freezer storage', icon: 'Snowflake' });
  }
  return {
    id: 'storage',
    question: 'Where will it spend most of its shelf life?',
    helpText: opts.helpText ?? 'Storage condition affects packaging requirements significantly.',
    type: 'single_select',
    fieldKey: 'storageType',
    columns: options.length <= 2 ? 2 : 3,
    options,
  };
}

// ─── CATEGORY TEMPLATES ───────────────────────────────────────────────────────

// ── FRUITS ───────────────────────────────────────────────────────────────────

const FRUITS_TEMPLATE: QuestionnaireTemplate = {
  name: 'Fruit',
  intro: 'Fresh fruit packaging depends on ripeness, breathing rate, and intended use.',
  autoMap: true,
  questions: [
    {
      id: 'product_form_fruits',
      question: 'What form is the fruit in?',
      helpText: 'Processing state changes moisture, respiration, and contamination risk.',
      type: 'single_select',
      fieldKey: 'productState',
      columns: 3,
      options: [
        { value: 'FRESH', label: 'Whole / fresh', sublabel: 'Uncut, as harvested', icon: 'Leaf' },
        { value: 'CUT_READY_TO_EAT', label: 'Cut / ready-to-eat', sublabel: 'Sliced, diced, peeled', icon: 'Scissors' },
        { value: 'DRIED', label: 'Dried', sublabel: 'Dehydrated / sun-dried', icon: 'Sun' },
        { value: 'FROZEN', label: 'Frozen', sublabel: 'IQF or block frozen', icon: 'Snowflake' },
        { value: 'PROCESSED', label: 'Pulp / puree / juice', sublabel: 'Processed form', icon: 'FlaskConical' },
        { value: 'POWDERED', label: 'Powder', sublabel: 'Spray-dried / powdered', icon: 'Layers' },
      ],
    },
    {
      id: 'ripeness',
      question: 'How ripe is the fruit?',
      helpText: 'Ripeness affects respiration rate and packaging urgency.',
      type: 'single_select',
      fieldKey: 'ripeness',
      columns: 2,
      options: [
        { value: 'unripe', label: 'Unripe / firm', sublabel: 'Needs to ripen in transit', icon: 'TreeDeciduous' },
        { value: 'ready', label: 'Ready to eat', sublabel: 'Optimal ripeness', icon: 'CheckCircle2' },
        { value: 'ripe', label: 'Ripe', sublabel: 'Best consumed soon', icon: 'Clock' },
        { value: 'very_ripe', label: 'Very ripe', sublabel: 'Needs immediate protection', icon: 'AlertTriangle' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: true, includeFrozen: true }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', sublabel: 'Let FoodPack AI decide', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Pouch / bag', icon: 'Package' },
        { value: 'TRAY', label: 'Tray', sublabel: 'With film lid', icon: 'Square' },
        { value: 'CLAMSHELL', label: 'Clamshell', icon: 'Layers' },
        { value: 'BOX', label: 'Carton / box', icon: 'Box' },
        { value: 'BAG', label: 'Crate / bulk', icon: 'Archive' },
      ],
    }),
  ],
};

// ── VEGETABLES ────────────────────────────────────────────────────────────────

const VEGETABLES_TEMPLATE: QuestionnaireTemplate = {
  name: 'Vegetable',
  intro: 'Vegetable packaging depends on the plant part, processing, and respiration rate.',
  autoMap: true,
  questions: [
    {
      id: 'product_form_veg',
      question: 'What form is the vegetable in?',
      helpText: 'Cut or peeled vegetables need stronger barrier and microbial protection.',
      type: 'single_select',
      fieldKey: 'productState',
      columns: 3,
      options: [
        { value: 'FRESH', label: 'Whole / fresh', sublabel: 'Uncut, as harvested', icon: 'Leaf' },
        { value: 'CUT_READY_TO_EAT', label: 'Cut / peeled / diced', sublabel: 'Minimal processing', icon: 'Scissors' },
        { value: 'DRIED', label: 'Dried', sublabel: 'Dehydrated', icon: 'Sun' },
        { value: 'FROZEN', label: 'Frozen', sublabel: 'Blanched & frozen', icon: 'Snowflake' },
        { value: 'PROCESSED', label: 'Paste / puree', sublabel: 'Further processed', icon: 'FlaskConical' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: true, includeFrozen: true }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', sublabel: 'Let FoodPack AI decide', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Mesh / breathable bag', sublabel: 'For venting', icon: 'Package' },
        { value: 'TRAY', label: 'Tray + film', icon: 'Square' },
        { value: 'CLAMSHELL', label: 'Clamshell', icon: 'Layers' },
        { value: 'BOX', label: 'Carton / box', icon: 'Box' },
        { value: 'BAG', label: 'Crate / bulk', icon: 'Archive' },
      ],
    }),
  ],
};

// ── DAIRY ─────────────────────────────────────────────────────────────────────

const DAIRY_MILK_TEMPLATE: QuestionnaireTemplate = {
  name: 'Milk',
  intro: 'Milk packaging requirements depend heavily on heat treatment and shelf-life target.',
  questions: [
    {
      id: 'milk_type',
      question: 'What type of milk?',
      helpText: 'Heat treatment level determines storage requirement and packaging barrier need.',
      type: 'single_select',
      fieldKey: 'customProductForm',
      columns: 2,
      options: [
        { value: 'raw', label: 'Raw milk', sublabel: 'Unprocessed — must be refrigerated', icon: 'Thermometer' },
        { value: 'pasteurized', label: 'Pasteurized', sublabel: 'Short shelf life, chilled', icon: 'Flame' },
        { value: 'uht', label: 'UHT / long-life', sublabel: 'Shelf-stable until opened', icon: 'Globe2' },
        { value: 'flavored', label: 'Flavored / drink', sublabel: 'Value-added milk product', icon: 'Cup' },
      ],
    },
    storageQuestion({
      includeAmbient: true,
      includeChilled: true,
      includeFrozen: false,
      helpText: 'UHT milk can be stored ambient; pasteurized must stay refrigerated.',
    }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', sublabel: 'Let FoodPack AI decide', icon: 'Sparkles' },
        { value: 'BOTTLE', label: 'Bottle', sublabel: 'HDPE / PET / glass', icon: 'FlaskConical' },
        { value: 'BOX', label: 'Carton', sublabel: 'Tetra Pak / gable top', icon: 'Box' },
        { value: 'POUCH', label: 'Pouch / sachet', icon: 'Package' },
      ],
    }),
  ],
};

const DAIRY_YOGURT_TEMPLATE: QuestionnaireTemplate = {
  name: 'Yogurt / Curd',
  intro: 'Fermented dairy products need moisture and oxygen barrier with seal integrity.',
  questions: [
    {
      id: 'yogurt_type',
      question: 'What type of product?',
      type: 'single_select',
      fieldKey: 'customProductForm',
      columns: 2,
      options: [
        { value: 'plain', label: 'Plain / natural', icon: 'Circle' },
        { value: 'flavored', label: 'Flavored', sublabel: 'Added fruit / flavoring', icon: 'Sparkles' },
        { value: 'drinking', label: 'Drinking / liquid', sublabel: 'Pourable consistency', icon: 'FlaskConical' },
        { value: 'thick', label: 'Greek / thick', sublabel: 'High-protein, strained', icon: 'Layers' },
      ],
    },
    storageQuestion({ includeAmbient: false, includeChilled: true, includeFrozen: false }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'TRAY', label: 'Cup / tub', sublabel: 'Rigid container with lid', icon: 'Square' },
        { value: 'BOTTLE', label: 'Bottle', sublabel: 'For drinking yogurt', icon: 'FlaskConical' },
        { value: 'POUCH', label: 'Pouch', icon: 'Package' },
      ],
    }),
  ],
};

const DAIRY_PANEER_TEMPLATE: QuestionnaireTemplate = {
  name: 'Paneer',
  intro: 'Fresh paneer is highly perishable and needs tight moisture and microbial control.',
  questions: [
    {
      id: 'paneer_type',
      question: 'What type of paneer?',
      type: 'single_select',
      fieldKey: 'customProductForm',
      columns: 3,
      options: [
        { value: 'fresh', label: 'Fresh', sublabel: 'Unpackaged / short shelf life', icon: 'Leaf' },
        { value: 'vacuum', label: 'Vacuum packed', sublabel: 'Extended shelf life', icon: 'Package' },
        { value: 'frozen', label: 'Frozen', sublabel: 'Long-term storage', icon: 'Snowflake' },
      ],
    },
    storageQuestion({ includeAmbient: false, includeChilled: true, includeFrozen: true }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Vacuum pouch', icon: 'Package' },
        { value: 'TRAY', label: 'Tray + film', icon: 'Square' },
      ],
    }),
  ],
};

const DAIRY_CHEESE_TEMPLATE: QuestionnaireTemplate = {
  name: 'Cheese',
  intro: 'Cheese packaging depends on moisture content, ripening stage, and fat level.',
  questions: [
    {
      id: 'cheese_type',
      question: 'What type of cheese?',
      type: 'single_select',
      fieldKey: 'customProductForm',
      columns: 2,
      options: [
        { value: 'fresh', label: 'Fresh cheese', sublabel: 'Cottage / ricotta / cream cheese', icon: 'Leaf' },
        { value: 'soft', label: 'Soft cheese', sublabel: 'Brie / Camembert', icon: 'Circle' },
        { value: 'semi_hard', label: 'Semi-hard', sublabel: 'Gouda / Edam', icon: 'Square' },
        { value: 'hard', label: 'Hard cheese', sublabel: 'Cheddar / Parmesan', icon: 'Box' },
        { value: 'processed', label: 'Processed cheese', sublabel: 'Slices / spreads', icon: 'Layers' },
      ],
    },
    storageQuestion({ includeAmbient: false, includeChilled: true, includeFrozen: false }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Vacuum pouch', icon: 'Package' },
        { value: 'TRAY', label: 'Tray + wrap', icon: 'Square' },
        { value: 'BOX', label: 'Carton / wrapper', icon: 'Box' },
      ],
    }),
  ],
};

const DAIRY_BUTTER_TEMPLATE: QuestionnaireTemplate = {
  name: 'Butter / Ghee',
  intro: 'Fat-rich dairy needs light and oxygen protection to prevent rancidity.',
  autoOily: true,
  questions: [
    {
      id: 'butter_type',
      question: 'What type of product?',
      type: 'single_select',
      fieldKey: 'customProductForm',
      columns: 2,
      options: [
        { value: 'butter', label: 'Butter', sublabel: 'Refrigerated', icon: 'Square' },
        { value: 'ghee', label: 'Ghee / clarified butter', sublabel: 'Shelf-stable', icon: 'Globe2' },
        { value: 'cream', label: 'Cream', sublabel: 'High-fat liquid', icon: 'FlaskConical' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: true, includeFrozen: true }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'TRAY', label: 'Tub / cup', icon: 'Square' },
        { value: 'BOTTLE', label: 'Bottle / jar', icon: 'FlaskConical' },
        { value: 'JAR', label: 'Jar', icon: 'Cookie' },
        { value: 'BOX', label: 'Carton wrapper', icon: 'Box' },
      ],
    }),
  ],
};

// ── GRAINS & CEREALS ──────────────────────────────────────────────────────────

const GRAINS_CEREALS_TEMPLATE: QuestionnaireTemplate = {
  name: 'Grain / Cereal',
  intro: 'Grain packaging focuses on moisture protection, pest prevention, and pack size.',
  autoDry: true,
  questions: [
    {
      id: 'grain_form',
      question: 'What form is the grain in?',
      helpText: 'Milled and powdered grains absorb moisture faster and need tighter sealing.',
      type: 'single_select',
      fieldKey: 'productState',
      columns: 3,
      options: [
        { value: 'FRESH', label: 'Whole grain', sublabel: 'As harvested / paddy', icon: 'Leaf' },
        { value: 'PROCESSED', label: 'Milled / polished', sublabel: 'White rice, semolina', icon: 'Layers' },
        { value: 'POWDERED', label: 'Flour / powder', sublabel: 'Finely milled', icon: 'Wind' },
        { value: 'CUT_READY_TO_EAT', label: 'Rolled / flaked', sublabel: 'Oats, cornflakes', icon: 'Circle' },
        { value: 'DRIED', label: 'Dried cooked', sublabel: 'Ready-to-cook', icon: 'Sun' },
      ],
    },
    {
      id: 'grain_storage_duration',
      question: 'How long should it be stored?',
      helpText: 'Longer storage needs better moisture and oxygen barriers.',
      type: 'single_select',
      fieldKey: 'shelfLifeDays',
      columns: 3,
      options: [
        { value: '90', label: 'Short-term', sublabel: 'Up to 3 months', icon: 'Clock' },
        { value: '180', label: 'Medium-term', sublabel: '3–6 months', icon: 'Calendar' },
        { value: '365', label: 'Long-term', sublabel: '6–12 months', icon: 'Archive' },
        { value: '730', label: 'Very long-term', sublabel: '12+ months', icon: 'Package' },
      ],
    },
    storageQuestion({
      includeAmbient: true,
      includeChilled: false,
      includeFrozen: false,
      ambientLabel: 'Ambient / controlled',
      helpText: 'Most grains are stored ambient. Cold storage is used for speciality products.',
    }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Pouch', sublabel: '250 g – 5 kg retail', icon: 'Package' },
        { value: 'BAG', label: 'Sack / bag', sublabel: '10–50 kg', icon: 'Archive' },
        { value: 'BOX', label: 'Carton / box', icon: 'Box' },
      ],
    }),
  ],
};

// ── PULSES ────────────────────────────────────────────────────────────────────

const PULSES_TEMPLATE: QuestionnaireTemplate = {
  name: 'Pulse / Legume',
  intro: 'Pulses need moisture and pest protection. Form affects packaging barrier needs.',
  autoDry: true,
  questions: [
    {
      id: 'pulse_form',
      question: 'What form is the pulse in?',
      type: 'single_select',
      fieldKey: 'productState',
      columns: 3,
      options: [
        { value: 'FRESH', label: 'Whole', sublabel: 'Whole lentils / beans', icon: 'Circle' },
        { value: 'CUT_READY_TO_EAT', label: 'Split / dehusked', sublabel: 'Dal / split peas', icon: 'Scissors' },
        { value: 'POWDERED', label: 'Flour / powder', sublabel: 'Gram flour / besan', icon: 'Wind' },
        { value: 'PROCESSED', label: 'Processed / ready', sublabel: 'Canned / cooked', icon: 'Layers' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: false, includeFrozen: false }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Pouch', sublabel: 'Retail pack', icon: 'Package' },
        { value: 'BAG', label: 'Sack / bulk bag', icon: 'Archive' },
        { value: 'BOX', label: 'Carton', icon: 'Box' },
      ],
    }),
  ],
};

// ── NUTS & SEEDS ──────────────────────────────────────────────────────────────

const NUTS_SEEDS_TEMPLATE: QuestionnaireTemplate = {
  name: 'Nut / Seed',
  intro: 'Nut and seed packaging must control oxygen and moisture to prevent rancidity.',
  autoOily: true,
  questions: [
    {
      id: 'nut_form',
      question: 'What form is the product in?',
      type: 'single_select',
      fieldKey: 'productState',
      columns: 3,
      options: [
        { value: 'FRESH', label: 'Raw / natural', sublabel: 'Unroasted, in shell or shelled', icon: 'Leaf' },
        { value: 'PROCESSED', label: 'Roasted', sublabel: 'Dry or oil roasted', icon: 'Flame' },
        { value: 'CUT_READY_TO_EAT', label: 'Salted / seasoned', sublabel: 'Value-added snack', icon: 'Sparkles' },
        { value: 'POWDERED', label: 'Paste / butter', sublabel: 'Peanut butter, tahini', icon: 'Layers' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: true, includeFrozen: false }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Pouch', sublabel: 'Vacuum or nitrogen-flush', icon: 'Package' },
        { value: 'JAR', label: 'Jar', sublabel: 'Glass or rigid plastic', icon: 'Cookie' },
        { value: 'BOX', label: 'Box / carton', icon: 'Box' },
        { value: 'SACHET', label: 'Sachet', sublabel: 'Single-serve', icon: 'Ticket' },
        { value: 'BAG', label: 'Bulk bag', icon: 'Archive' },
      ],
    }),
  ],
};

// ── SPICES ────────────────────────────────────────────────────────────────────

const SPICES_TEMPLATE: QuestionnaireTemplate = {
  name: 'Spice',
  intro: 'Spice packaging must protect aroma, prevent moisture uptake, and block light.',
  autoDry: true,
  questions: [
    {
      id: 'spice_form',
      question: 'What form is the spice in?',
      helpText: 'Powdered spices lose aroma faster and need tighter barrier.',
      type: 'single_select',
      fieldKey: 'productState',
      columns: 3,
      options: [
        { value: 'FRESH', label: 'Whole spice', sublabel: 'Cardamom, peppercorns, cloves', icon: 'Leaf' },
        { value: 'POWDERED', label: 'Powder / ground', sublabel: 'Turmeric, chilli, cumin powder', icon: 'Wind' },
        { value: 'CUT_READY_TO_EAT', label: 'Flakes / crushed', sublabel: 'Chilli flakes, herb blends', icon: 'Scissors' },
        { value: 'PROCESSED', label: 'Paste / blend', sublabel: 'Mixed masala, spice paste', icon: 'Layers' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: false, includeFrozen: false }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'SACHET', label: 'Sachet', sublabel: 'Small retail pack', icon: 'Ticket' },
        { value: 'POUCH', label: 'Pouch', sublabel: 'Stand-up or flat', icon: 'Package' },
        { value: 'JAR', label: 'Jar', sublabel: 'Glass or rigid plastic', icon: 'Cookie' },
        { value: 'BOTTLE', label: 'Bottle / shaker', icon: 'FlaskConical' },
        { value: 'BAG', label: 'Bulk bag', icon: 'Archive' },
      ],
    }),
  ],
};

// ── PROCESSED & BAKERY ────────────────────────────────────────────────────────

const BISCUITS_SNACKS_TEMPLATE: QuestionnaireTemplate = {
  name: 'Biscuit / Snack',
  intro: 'Snack packaging must maintain crispness, aroma, and prevent fat oxidation.',
  autoOily: true,
  questions: [
    {
      id: 'snack_type',
      question: 'What type of product?',
      helpText: 'Fat content and texture determine the barrier requirements.',
      type: 'single_select',
      fieldKey: 'customProductForm',
      columns: 2,
      options: [
        { value: 'plain_biscuit', label: 'Plain biscuit', sublabel: 'Crackers, marie, digestive', icon: 'Circle' },
        { value: 'cream_filled', label: 'Cream-filled', sublabel: 'Sandwich biscuit', icon: 'Layers' },
        { value: 'chocolate_coated', label: 'Chocolate-coated', sublabel: 'Needs temperature control', icon: 'Sparkles' },
        { value: 'fried_snack', label: 'Fried snack', sublabel: 'Chips, crisps, bhujia', icon: 'Flame' },
        { value: 'baked_snack', label: 'Baked snack', sublabel: 'Pretzels, crackers', icon: 'Sun' },
        { value: 'puffed', label: 'Puffed / extruded', sublabel: 'Puffs, rings, corn snacks', icon: 'Wind' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: false, includeFrozen: false }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Pouch / pillow bag', icon: 'Package' },
        { value: 'BOX', label: 'Box / carton', sublabel: 'With inner wrap', icon: 'Box' },
        { value: 'TRAY', label: 'Tray + overwrap', icon: 'Square' },
      ],
    }),
  ],
};

const BREAD_TEMPLATE: QuestionnaireTemplate = {
  name: 'Bread / Bakery',
  intro: 'Bread packaging must prevent moisture loss, mold growth, and compression damage.',
  questions: [
    {
      id: 'bread_type',
      question: 'What type of bread or bakery product?',
      type: 'single_select',
      fieldKey: 'customProductForm',
      columns: 2,
      options: [
        { value: 'sliced_bread', label: 'Sliced bread', sublabel: 'Sandwich / white / brown', icon: 'Layers' },
        { value: 'whole_loaf', label: 'Whole loaf', sublabel: 'Artisan, unsliced', icon: 'Box' },
        { value: 'filled_bread', label: 'Filled / stuffed', sublabel: 'Rolls, buns, filled bread', icon: 'Circle' },
        { value: 'flatbread', label: 'Flatbread', sublabel: 'Chapati, tortilla, pita', icon: 'Square' },
        { value: 'cake', label: 'Cake / pastry', sublabel: 'Soft sponge or pastry', icon: 'Sparkles' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: true, includeFrozen: true }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Bag / pouch', sublabel: 'PP or PE bag', icon: 'Package' },
        { value: 'TRAY', label: 'Tray + film lid', icon: 'Square' },
        { value: 'BOX', label: 'Box / carton', icon: 'Box' },
      ],
    }),
  ],
};

const PICKLES_SAUCES_TEMPLATE: QuestionnaireTemplate = {
  name: 'Pickle / Sauce / Condiment',
  intro: 'Acidic and oil-based condiments need leakage prevention and oxygen/light protection.',
  questions: [
    {
      id: 'condiment_type',
      question: 'What type of product?',
      type: 'single_select',
      fieldKey: 'customProductForm',
      columns: 2,
      options: [
        { value: 'pickle_oil', label: 'Oil-based pickle', sublabel: 'Mango pickle, achar', icon: 'Flame' },
        { value: 'pickle_water', label: 'Brine / vinegar pickle', sublabel: 'Water-based, acidic', icon: 'Droplets' },
        { value: 'sauce', label: 'Sauce / ketchup', sublabel: 'Tomato, chilli, etc.', icon: 'FlaskConical' },
        { value: 'paste', label: 'Paste / chutney', sublabel: 'Thick, semi-solid', icon: 'Layers' },
        { value: 'dressing', label: 'Dressing / marinade', sublabel: 'Oil + acid blend', icon: 'Droplets' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: true, includeFrozen: false }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'JAR', label: 'Glass jar', sublabel: 'Traditional, hermetic seal', icon: 'Cookie' },
        { value: 'BOTTLE', label: 'Bottle', sublabel: 'PET or glass', icon: 'FlaskConical' },
        { value: 'POUCH', label: 'Pouch / sachet', icon: 'Package' },
        { value: 'TRAY', label: 'Tub / cup', icon: 'Square' },
      ],
    }),
  ],
};

// ── BEVERAGES ─────────────────────────────────────────────────────────────────

const BEVERAGES_TEMPLATE: QuestionnaireTemplate = {
  name: 'Beverage',
  intro: 'Beverage packaging depends on whether the drink is carbonated, acidic, or shelf-stable.',
  questions: [
    {
      id: 'beverage_form',
      question: 'What type of beverage?',
      type: 'single_select',
      fieldKey: 'productState',
      columns: 2,
      options: [
        { value: 'LIQUID', label: 'Ready-to-drink', sublabel: 'Juice, water, RTD', icon: 'FlaskConical' },
        { value: 'PROCESSED', label: 'Carbonated drink', sublabel: 'Soda, sparkling water', icon: 'Wind' },
        { value: 'CUT_READY_TO_EAT', label: 'Concentrate', sublabel: 'Requires dilution', icon: 'Layers' },
        { value: 'POWDERED', label: 'Powder / mix', sublabel: 'Instant drink powder', icon: 'Circle' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: true, includeFrozen: false }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'BOTTLE', label: 'Bottle', sublabel: 'PET / glass', icon: 'FlaskConical' },
        { value: 'BOX', label: 'Carton', sublabel: 'Tetra / gable top', icon: 'Box' },
        { value: 'POUCH', label: 'Pouch / stand-up', icon: 'Package' },
        { value: 'SACHET', label: 'Sachet', sublabel: 'For powder', icon: 'Ticket' },
      ],
    }),
  ],
};

// ── FROZEN FOODS ──────────────────────────────────────────────────────────────

const FROZEN_TEMPLATE: QuestionnaireTemplate = {
  name: 'Frozen Food',
  intro: 'Frozen products need puncture resistance, seal integrity, and freezer-burn protection.',
  questions: [
    {
      id: 'frozen_type',
      question: 'What type of frozen product?',
      type: 'single_select',
      fieldKey: 'customProductForm',
      columns: 2,
      options: [
        { value: 'frozen_veg', label: 'Frozen vegetables', sublabel: 'IQF or block', icon: 'Leaf' },
        { value: 'frozen_fruit', label: 'Frozen fruit', sublabel: 'Berries, mango pieces', icon: 'Sun' },
        { value: 'frozen_snack', label: 'Frozen snack / meal', sublabel: 'Samosa, nugget, ready meal', icon: 'Layers' },
        { value: 'frozen_dough', label: 'Frozen dough / bread', sublabel: 'Paratha, pizza base', icon: 'Box' },
        { value: 'frozen_meat', label: 'Frozen meat / seafood', sublabel: 'Poultry, fish, prawns', icon: 'Flame' },
        { value: 'ice_cream', label: 'Ice cream / frozen dessert', icon: 'Circle' },
      ],
    },
    // Only frozen storage — no ambient / chilled options for frozen-by-design products
    {
      id: 'frozen_storage_confirm',
      question: 'Will the product be stored frozen throughout?',
      helpText: 'Cold chain integrity is essential for frozen products.',
      type: 'single_select',
      fieldKey: 'storageType',
      columns: 2,
      options: [
        { value: 'FROZEN', label: 'Yes — full cold chain', sublabel: 'Freezer throughout', icon: 'Snowflake' },
        { value: 'CHILLED', label: 'Chilled only', sublabel: 'For partially frozen products', icon: 'Thermometer' },
      ],
    },
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Bag / pouch', sublabel: 'Flexible freezer bag', icon: 'Package' },
        { value: 'TRAY', label: 'Tray + film', sublabel: 'Rigid tray + sealing', icon: 'Square' },
        { value: 'BOX', label: 'Carton', sublabel: 'Outer secondary', icon: 'Box' },
      ],
    }),
  ],
};

// ─── GENERIC FALLBACK ─────────────────────────────────────────────────────────

const GENERIC_TEMPLATE: QuestionnaireTemplate = {
  name: 'Food Product',
  intro: 'Tell us a bit about the product so we can suggest the right packaging.',
  questions: [
    {
      id: 'product_form_generic',
      question: 'What form / processing state is the product in?',
      helpText: 'Processing level affects moisture, microbial risk, and required barrier.',
      type: 'single_select',
      fieldKey: 'productState',
      columns: 3,
      options: [
        { value: 'FRESH', label: 'Fresh / raw', sublabel: 'Unprocessed', icon: 'Leaf' },
        { value: 'CUT_READY_TO_EAT', label: 'Cut / ready-to-eat', sublabel: 'Minimally processed', icon: 'Scissors' },
        { value: 'DRIED', label: 'Dried', sublabel: 'Low moisture', icon: 'Sun' },
        { value: 'PROCESSED', label: 'Processed', sublabel: 'Heat-treated / manufactured', icon: 'Flame' },
        { value: 'FROZEN', label: 'Frozen', sublabel: 'Freezer storage', icon: 'Snowflake' },
        { value: 'POWDERED', label: 'Powder', sublabel: 'Ground / spray-dried', icon: 'Wind' },
        { value: 'LIQUID', label: 'Liquid', sublabel: 'Juice / sauce / drink', icon: 'FlaskConical' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: true, includeFrozen: true }),
    ...universalTail(),
  ],
};

// ─── CATEGORY → TEMPLATE MAPPING ─────────────────────────────────────────────

/**
 * Category slug → template.
 * Specific food slugs override category.
 */
const CATEGORY_TEMPLATES: Record<string, QuestionnaireTemplate> = {
  fruits: FRUITS_TEMPLATE,
  vegetables: VEGETABLES_TEMPLATE,
  dairy: DAIRY_MILK_TEMPLATE,          // default dairy → milk (most common)
  beverages: BEVERAGES_TEMPLATE,
  'grains-cereals': GRAINS_CEREALS_TEMPLATE,
  pulses: PULSES_TEMPLATE,
  nuts: NUTS_SEEDS_TEMPLATE,
  seeds: NUTS_SEEDS_TEMPLATE,
  'nuts-seeds': NUTS_SEEDS_TEMPLATE,
  spices: SPICES_TEMPLATE,
  'spices-herbs': SPICES_TEMPLATE,
  'processed-bakery': BISCUITS_SNACKS_TEMPLATE,
  bakery: BREAD_TEMPLATE,
  'frozen-foods': FROZEN_TEMPLATE,
  condiments: PICKLES_SAUCES_TEMPLATE,
  oils: GENERIC_TEMPLATE,
};

// ─── Coffee / Tea-specific template ──────────────────────────────────────────
// Coffee is in the "beverages" category but is sold as a dry ingredient
// (ground coffee, beans, instant powder) — not as a liquid drink. It needs
// aroma-retention and oxidation/moisture protection, not drink-product questions.

const COFFEE_TEA_TEMPLATE: QuestionnaireTemplate = {
  name: 'Coffee / Tea',
  intro: 'Roasted products need excellent aroma retention and oxygen/moisture barriers.',
  autoOily: true,
  questions: [
    {
      id: 'coffee_form',
      question: 'What form is the product in?',
      helpText: 'Ground coffee stales faster than whole beans; instant powder needs moisture protection.',
      type: 'single_select',
      fieldKey: 'productState',
      columns: 3,
      options: [
        { value: 'FRESH', label: 'Whole beans', sublabel: 'Roasted, whole bean', icon: 'Circle' },
        { value: 'POWDERED', label: 'Ground / powder', sublabel: 'Roasted & ground or instant', icon: 'Wind' },
        { value: 'CUT_READY_TO_EAT', label: 'Capsule / pod', sublabel: 'Single-serve format', icon: 'Layers' },
        { value: 'PROCESSED', label: 'Instant / soluble', sublabel: 'Spray-dried or freeze-dried', icon: 'Sparkles' },
        { value: 'LIQUID', label: 'Ready-to-drink', sublabel: 'Bottled / canned cold brew', icon: 'FlaskConical' },
      ],
    },
    storageQuestion({
      includeAmbient: true,
      includeChilled: false,
      includeFrozen: false,
      helpText: 'Ground coffee is stored ambient. Refrigerating can introduce condensation and moisture.',
    }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', sublabel: 'Let FoodPack AI decide', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Foil-laminate pouch', sublabel: 'With one-way degassing valve', icon: 'Package' },
        { value: 'JAR', label: 'Jar / tin', sublabel: 'Rigid resealable container', icon: 'Cookie' },
        { value: 'SACHET', label: 'Sachet / single-serve', icon: 'Ticket' },
        { value: 'BOTTLE', label: 'Bottle / can', sublabel: 'For RTD coffee', icon: 'FlaskConical' },
        { value: 'BOX', label: 'Carton / box', icon: 'Box' },
      ],
    }),
  ],
};

// ─── Wheat flour-specific template ───────────────────────────────────────────
// Shorter shelf life than whole grain due to exposed germ oils.

const WHEAT_FLOUR_TEMPLATE: QuestionnaireTemplate = {
  name: 'Flour / Milled Grain',
  intro: 'Flour has shorter shelf life than whole grain due to exposed germ oils. Moisture control is critical.',
  autoDry: true,
  questions: [
    {
      id: 'flour_type',
      question: 'What type of flour or milled product?',
      type: 'single_select',
      fieldKey: 'customProductForm',
      columns: 2,
      options: [
        { value: 'whole_wheat', label: 'Whole wheat (atta)', sublabel: 'With germ — shorter shelf life', icon: 'Leaf' },
        { value: 'refined', label: 'Refined / maida', sublabel: 'White flour — longer shelf life', icon: 'Circle' },
        { value: 'gram_flour', label: 'Gram / chickpea flour', sublabel: 'Besan — moisture sensitive', icon: 'Layers' },
        { value: 'rice_flour', label: 'Rice flour', sublabel: 'Low fat, moisture sensitive', icon: 'Wind' },
        { value: 'semolina', label: 'Semolina / rava / suji', sublabel: 'Coarse milled', icon: 'Square' },
        { value: 'multigrain', label: 'Multigrain / specialty', sublabel: 'Mixed grain flour', icon: 'Sparkles' },
      ],
    },
    storageQuestion({ includeAmbient: true, includeChilled: false, includeFrozen: false }),
    ...universalTail({
      packagingFormatOptions: [
        { value: 'AUTO', label: 'Auto-select', icon: 'Sparkles' },
        { value: 'POUCH', label: 'Pouch', sublabel: 'Retail pack (500 g – 5 kg)', icon: 'Package' },
        { value: 'BAG', label: 'Bag / sack', sublabel: '10–50 kg', icon: 'Archive' },
        { value: 'BOX', label: 'Carton / box', icon: 'Box' },
      ],
    }),
  ],
};

// ─── FOOD_SLUG_TEMPLATES ──────────────────────────────────────────────────────
// Maps EXACT food slugs (as seeded in the database) to questionnaire templates.
// Exact slug matching is more reliable than partial-string matching, which can
// produce wrong results (e.g. "toor-dal" accidentally matching "sauce").
//
// Add new foods here as the database grows. If a food's slug is not listed,
// the category-level template is used as a reasonable fallback.

const FOOD_SLUG_TEMPLATES: Record<string, QuestionnaireTemplate> = {
  // ── Fruits ──────────────────────────────────────────────────────────────────
  mango:       FRUITS_TEMPLATE,
  banana:      FRUITS_TEMPLATE,
  apple:       FRUITS_TEMPLATE,
  strawberry:  FRUITS_TEMPLATE,
  grapes:      FRUITS_TEMPLATE,
  papaya:      FRUITS_TEMPLATE,
  guava:       FRUITS_TEMPLATE,
  orange:      FRUITS_TEMPLATE,
  pineapple:   FRUITS_TEMPLATE,

  // ── Vegetables ──────────────────────────────────────────────────────────────
  tomato:   VEGETABLES_TEMPLATE,
  potato:   VEGETABLES_TEMPLATE,
  onion:    VEGETABLES_TEMPLATE,
  carrot:   VEGETABLES_TEMPLATE,
  cabbage:  VEGETABLES_TEMPLATE,
  chilli:   VEGETABLES_TEMPLATE,
  spinach:  VEGETABLES_TEMPLATE,

  // ── Grains & Cereals ────────────────────────────────────────────────────────
  rice:         GRAINS_CEREALS_TEMPLATE,
  wheat:        GRAINS_CEREALS_TEMPLATE,
  maize:        GRAINS_CEREALS_TEMPLATE,
  oats:         GRAINS_CEREALS_TEMPLATE,
  millet:       GRAINS_CEREALS_TEMPLATE,
  'wheat-flour': WHEAT_FLOUR_TEMPLATE,
  'rice-flour':  WHEAT_FLOUR_TEMPLATE,

  // ── Pulses ───────────────────────────────────────────────────────────────────
  'toor-dal':     PULSES_TEMPLATE,
  'chana-dal':    PULSES_TEMPLATE,
  'moong-dal':    PULSES_TEMPLATE,
  'masoor-dal':   PULSES_TEMPLATE,
  chickpeas:      PULSES_TEMPLATE,
  lentils:        PULSES_TEMPLATE,

  // ── Spices ───────────────────────────────────────────────────────────────────
  'turmeric-powder': SPICES_TEMPLATE,
  'chilli-powder':   SPICES_TEMPLATE,
  cumin:             SPICES_TEMPLATE,
  coriander:         SPICES_TEMPLATE,
  pepper:            SPICES_TEMPLATE,
  cardamom:          SPICES_TEMPLATE,
  'garam-masala':    SPICES_TEMPLATE,

  // ── Nuts & Seeds ─────────────────────────────────────────────────────────────
  cashew:       NUTS_SEEDS_TEMPLATE,
  almond:       NUTS_SEEDS_TEMPLATE,
  groundnut:    NUTS_SEEDS_TEMPLATE,
  sesame:       NUTS_SEEDS_TEMPLATE,
  'sunflower-seed': NUTS_SEEDS_TEMPLATE,

  // ── Dairy ───────────────────────────────────────────────────────────────────
  milk:   DAIRY_MILK_TEMPLATE,
  paneer: DAIRY_PANEER_TEMPLATE,
  yogurt: DAIRY_YOGURT_TEMPLATE,
  curd:   DAIRY_YOGURT_TEMPLATE,
  cheese: DAIRY_CHEESE_TEMPLATE,
  butter: DAIRY_BUTTER_TEMPLATE,
  ghee:   DAIRY_BUTTER_TEMPLATE,
  cream:  DAIRY_BUTTER_TEMPLATE,

  // ── Processed & Bakery ───────────────────────────────────────────────────────
  'potato-chips':    BISCUITS_SNACKS_TEMPLATE,
  biscuits:          BISCUITS_SNACKS_TEMPLATE,
  bread:             BREAD_TEMPLATE,
  'sliced-bread':    BREAD_TEMPLATE,
  pickle:            PICKLES_SAUCES_TEMPLATE,
  sauce:             PICKLES_SAUCES_TEMPLATE,
  ketchup:           PICKLES_SAUCES_TEMPLATE,
  chutney:           PICKLES_SAUCES_TEMPLATE,

  // ── Beverages ────────────────────────────────────────────────────────────────
  // Coffee and tea are dry ingredients despite being in the "beverages" category.
  // They need aroma/oxidation protection, not beverage-specific questions.
  'coffee-roasted-ground': COFFEE_TEA_TEMPLATE,
  'coffee-beans':          COFFEE_TEA_TEMPLATE,
  'instant-coffee':        COFFEE_TEA_TEMPLATE,
  'tea-leaves':            COFFEE_TEA_TEMPLATE,
  'green-tea':             COFFEE_TEA_TEMPLATE,
  tea:                     COFFEE_TEA_TEMPLATE,
  // Liquid beverages use the beverages template
  juice:   BEVERAGES_TEMPLATE,
  water:   BEVERAGES_TEMPLATE,
  'soft-drink': BEVERAGES_TEMPLATE,
};

/**
 * Returns the appropriate questionnaire template for the given food.
 *
 * Resolution priority (highest to lowest):
 *   1. Exact food slug match  — most specific, always correct
 *   2. Category slug match    — good for foods not yet in the slug map
 *   3. Generic fallback       — never wrong, just less tailored
 */
export function resolveTemplate(food: {
  slug: string;
  category: { slug: string };
}): QuestionnaireTemplate {
  // 1. Exact food slug match
  if (FOOD_SLUG_TEMPLATES[food.slug]) {
    return FOOD_SLUG_TEMPLATES[food.slug];
  }

  // 2. Category match
  if (CATEGORY_TEMPLATES[food.category.slug]) {
    return CATEGORY_TEMPLATES[food.category.slug];
  }

  // 3. Generic fallback
  return GENERIC_TEMPLATE;
}

export type { QuestionnaireTemplate, QuestionDef };

