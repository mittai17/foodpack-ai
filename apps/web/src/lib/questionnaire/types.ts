/**
 * Questionnaire Template Engine – Types
 *
 * These types describe the data-driven question configuration system.
 * The frontend renders questions from these descriptors rather than
 * hard-coding food-specific forms.
 *
 * Future: these come from GET /api/v1/questionnaire?foodId=<id>
 * Current: resolved client-side from category/slug templates.
 */

export type QuestionType =
  | 'single_select'   // Pick one tile
  | 'shelf_life'      // Preset buttons + optional numeric override
  | 'pack_weight'     // Preset buttons + optional numeric override
  | 'info_hint';      // Non-interactive advisory note

export interface QuestionOption {
  value: string;
  label: string;
  sublabel?: string;
  /** Lucide icon name (resolved to component at render time) */
  icon?: string;
}

export interface QuestionDef {
  id: string;
  /** Human-readable question */
  question: string;
  /** Short help text shown below the label */
  helpText?: string;
  type: QuestionType;
  /** Options for single_select */
  options?: QuestionOption[];
  required?: boolean;
  /** Which wizard field this answer populates */
  fieldKey: WizardField;
  /** Number of columns for the option grid (default 3) */
  columns?: 2 | 3 | 4;
  /** Optional advisory note for info_hint type */
  note?: string;
}

/**
 * All top-level mutable fields the wizard collects.
 * Extending this list requires adding corresponding state in the wizard.
 */
export type WizardField =
  | 'productState'
  | 'storageType'
  | 'transportType'
  | 'shelfLifeDays'
  | 'packageWeightKg'
  | 'objective'
  | 'packagingFormat'
  | 'customProductForm'   // category-specific product type (e.g. "Pasteurized" for milk)
  | 'ripeness'            // fruits
  | 'ventilation'         // fresh produce
  | '_hint';              // info_hint (not stored, display-only)

export interface QuestionnaireTemplate {
  /** Display name e.g. "Fruit", "Dairy – Milk" */
  name: string;
  /** Short sentence shown at the top of step 2 */
  intro?: string;
  /** Ordered questions for step 2 */
  questions: QuestionDef[];
  /** Whether to auto-note MAP consideration (fresh produce) */
  autoMap?: boolean;
  /** Whether to auto-note moisture/oxygen protection (dry foods) */
  autoDry?: boolean;
  /** Whether to auto-note fat/oxidation protection (oily foods) */
  autoOily?: boolean;
}
