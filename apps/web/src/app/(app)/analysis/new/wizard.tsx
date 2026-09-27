'use client';

/**
 * AnalysisWizard — dynamic questionnaire
 *
 * Step 0 — Food selection (search + category pills + food grid)
 * Step 1 — Dynamic questions (loaded from questionnaire template engine)
 * Step 2 — Review & submit
 *
 * The questionnaire template engine (`resolveTemplate`) determines which
 * questions are shown based on the selected food's slug and category.
 * No food-specific logic lives inside this component.
 *
 * Advanced Mode (optional toggle in Step 1) exposes lab-measured values that
 * override knowledge-base references. Normal users never see these fields.
 */

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Info,
  LayoutGrid,
  Leaf,
  Loader2,
  Search,
  Sparkles,
  Thermometer,
  UploadCloud,
  Wind,
} from 'lucide-react';
import {
  OBJECTIVE_LABELS,
  STORAGE_LABELS,
  TRANSPORT_LABELS,
  PRODUCT_STATE_LABELS,
  PACKAGING_FORMAT_LABELS,
  type AdvancedInputs,
  type ObjectiveType,
  type PackagingFormat,
  type ProductState,
  type StorageType,
  type TransportType,
} from '@foodpack/shared';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Stepper } from '@/components/wizard/stepper';
import { QuestionBlock } from '@/components/wizard/question-block';
import { FoodImageUploader } from '@/components/wizard/food-image-uploader';
import { useFood, useFoods } from '@/hooks/use-foods';
import { useCreateAnalysis } from '@/hooks/use-analysis';
import { useTranslations, useLocale } from 'next-intl';
import { getFoodEmoji } from '@/lib/food-icons';
import { getFoodName, getCategoryName } from '@/lib/i18n-helpers';
import { CategoryPills } from '@/components/food/category-pills';
import { resolveTemplate } from '@/lib/questionnaire/templates';
import type { WizardField } from '@/lib/questionnaire/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ─── Wizard steps ─────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Select food', description: 'What are you packaging?' },
  { label: 'Details', description: 'A few quick questions' },
  { label: 'Review', description: 'Confirm & analyze' },
];

// ─── State – all values a QuestionDef can populate ───────────────────────────

interface WizardState {
  productState: ProductState;
  storageType: StorageType;
  transportType: TransportType;
  shelfLifeDays: number;
  packageWeightKg: number;
  objective: ObjectiveType;
  packagingFormat: PackagingFormat;
  customProductForm: string;
  ripeness: string;
  ventilation: string;
}

const DEFAULT_STATE: WizardState = {
  productState: 'FRESH',
  storageType: 'CHILLED',
  transportType: 'LOCAL',
  shelfLifeDays: 21,
  packageWeightKg: 1,
  objective: 'BALANCED',
  packagingFormat: 'AUTO',
  customProductForm: '',
  ripeness: '',
  ventilation: '',
};

// ─── Field → state key bridge ─────────────────────────────────────────────────

function getFieldValue(state: WizardState, field: WizardField): unknown {
  if (field === '_hint') return null;
  return state[field as keyof WizardState];
}

function setFieldValue(state: WizardState, field: WizardField, value: unknown): WizardState {
  if (field === '_hint') return state;
  return { ...state, [field]: value };
}

// ─── Label helpers ────────────────────────────────────────────────────────────

function labelForField(field: WizardField, value: unknown, customLabel?: string): string {
  if (customLabel) return customLabel;
  const v = value as string;
  switch (field) {
    case 'productState':
      return PRODUCT_STATE_LABELS[v as ProductState] ?? v;
    case 'storageType':
      return STORAGE_LABELS[v as StorageType] ?? v;
    case 'transportType':
      return TRANSPORT_LABELS[v as TransportType] ?? v;
    case 'objective':
      return OBJECTIVE_LABELS[v as ObjectiveType] ?? v;
    case 'packagingFormat':
      return PACKAGING_FORMAT_LABELS[v as PackagingFormat] ?? v;
    case 'shelfLifeDays':
      return `${value} days`;
    case 'packageWeightKg':
      return Number(value) >= 1000 ? `${Number(value) / 1000} tonne` : `${value} kg`;
    default:
      return String(value || '—');
  }
}

// ─── Advanced field ───────────────────────────────────────────────────────────

function AdvancedField({
  label,
  badge,
  value,
  onChange,
  unit,
  placeholder = '—',
}: {
  label: string;
  badge: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  unit?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <Label className="text-xs">{label}</Label>
        <span className="inline-flex items-center rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          {badge}
        </span>
        {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
      </div>
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        placeholder={placeholder}
        className="h-8 text-sm"
      />
    </div>
  );
}

// ─── Auto-consideration hints ─────────────────────────────────────────────────

function AutoHints({
  autoMap,
  autoDry,
  autoOily,
}: {
  autoMap?: boolean;
  autoDry?: boolean;
  autoOily?: boolean;
}) {
  if (!autoMap && !autoDry && !autoOily) return null;
  return (
    <div className="space-y-2">
      {autoMap && (
        <HintPill icon={<Wind className="h-3.5 w-3.5" />} color="green">
          Respiration rate &amp; MAP suitability considered automatically
        </HintPill>
      )}
      {autoDry && (
        <HintPill icon={<Leaf className="h-3.5 w-3.5" />} color="amber">
          Moisture &amp; oxygen barrier requirements evaluated automatically
        </HintPill>
      )}
      {autoOily && (
        <HintPill icon={<FlaskConical className="h-3.5 w-3.5" />} color="orange">
          Fat oxidation &amp; light protection considered automatically
        </HintPill>
      )}
    </div>
  );
}

function HintPill({
  icon,
  color,
  children,
}: {
  icon: React.ReactNode;
  color: 'green' | 'amber' | 'orange';
  children: React.ReactNode;
}) {
  const styles = {
    green: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-900/40 dark:text-green-300',
    amber: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300',
    orange: 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/30 dark:border-orange-900/40 dark:text-orange-300',
  }[color];

  return (
    <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 text-xs', styles)}>
      {icon}
      <span>{children}</span>
    </div>
  );
}

// ─── Review item ──────────────────────────────────────────────────────────────

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────

export function AnalysisWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tw = useTranslations('wizard');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [step, setStep] = useState(0);

  const steps = [
    { label: tw('steps.food'), description: tw('selectFoodPrompt') },
    { label: tw('steps.storage'), description: tw('steps.requirements') },
    { label: tw('steps.results'), description: tw('steps.results') },
  ];
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [foodId, setFoodId] = useState<string | undefined>();
  const [selectionMode, setSelectionMode] = useState<'catalog' | 'upload'>('catalog');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>();
  const [wizState, setWizState] = useState<WizardState>(DEFAULT_STATE);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [advancedInputs, setAdvancedInputs] = useState<AdvancedInputs>({});

  const { data: foods, isLoading: foodsLoading } = useFoods({ search, category });
  const createAnalysis = useCreateAnalysis();

  const presetSlug = searchParams.get('food') ?? undefined;
  const { data: presetFood } = useFood(!foodId ? presetSlug : undefined);

  const effectiveFoodId = foodId ?? (presetSlug ? presetFood?.id : undefined);

  const selectedFood = useMemo(() => {
    if (foods?.items.some((f) => f.id === effectiveFoodId)) {
      return foods.items.find((f) => f.id === effectiveFoodId);
    }
    return presetFood && presetFood.id === effectiveFoodId ? presetFood : undefined;
  }, [foods, effectiveFoodId, presetFood]);

  // ── Resolve template whenever food changes ──────────────────────────────────
  const template = useMemo(() => {
    if (!selectedFood) return null;
    return resolveTemplate(selectedFood);
  }, [selectedFood]);

  // ── Field value get/set ─────────────────────────────────────────────────────
  function getValue(field: WizardField): unknown {
    return getFieldValue(wizState, field);
  }

  function setValue(field: WizardField, value: unknown) {
    setWizState((s) => setFieldValue(s, field, value));
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleAnalyze() {
    if (!effectiveFoodId) return;
    try {
      const result = await createAnalysis.mutateAsync({
        foodId: effectiveFoodId,
        productState: wizState.productState,
        storageType: wizState.storageType,
        transportType: wizState.transportType,
        targetShelfLifeDays: wizState.shelfLifeDays,
        packageWeightKg: wizState.packageWeightKg,
        objective: wizState.objective,
        packagingFormat: wizState.packagingFormat === 'AUTO' ? undefined : wizState.packagingFormat,
        advancedMode,
        advancedInputs: advancedMode ? advancedInputs : undefined,
      });
      router.push(`/analysis/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not run the analysis.');
    }
  }

  // ── Review summary items ────────────────────────────────────────────────────
  function buildReviewItems() {
    if (!template || !selectedFood) return [];
    const items: Array<{ label: string; value: string }> = [
      { label: tw('steps.food'), value: getFoodName(selectedFood, locale) },
    ];
    if (uploadedImageUrl) {
      items.push({
        label: tw('attachedPhoto'),
        value: tw('viaPhotoBadge'),
      });
    }
    for (const q of template.questions) {
      const raw = getValue(q.fieldKey);
      if (q.type === 'info_hint' || raw === '' || raw === null || raw === undefined) continue;
      const optionLabel = q.options?.find((o) => o.value === String(raw))?.label;
      items.push({
        label: q.question.replace(/\?$/, ''),
        value: labelForField(q.fieldKey, raw, optionLabel),
      });
    }
    return items;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Stepper */}
      <Card>
        <CardContent className="px-6 py-4">
          <Stepper steps={steps} current={step} />
        </CardContent>
      </Card>

      {/* ── STEP 0 — Food selection ─────────────────────────────────────────── */}
      {step === 0 && (
        <Card>
          <CardContent className="space-y-6 px-6 py-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{tw('whatAreYouPackaging')}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {tw('otherCommodityPrompt')}
                </p>
              </div>

              {/* Mode switch */}
              <div className="inline-flex rounded-xl bg-secondary/80 p-1 border border-border/80 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectionMode('catalog')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                    selectionMode === 'catalog'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  {tw('selectCatalog')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectionMode('upload')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                    selectionMode === 'upload'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Camera className="h-3.5 w-3.5 text-emerald-600" />
                  {tw('uploadPhoto')}
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                    AI
                  </span>
                </button>
              </div>
            </div>

            {/* Mode 1: Upload Photo */}
            {selectionMode === 'upload' && (
              <div className="space-y-4">
                <FoodImageUploader
                  availableFoods={foods?.items ?? []}
                  selectedFood={selectedFood}
                  uploadedImageUrl={uploadedImageUrl}
                  onFoodSelected={(food, imgUrl) => {
                    setFoodId(food.id);
                    setUploadedImageUrl(imgUrl);
                    setWizState(DEFAULT_STATE);
                  }}
                  onClear={() => {
                    setFoodId(undefined);
                    setUploadedImageUrl(undefined);
                  }}
                />

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <span>{tw('preferCatalog')}</span>
                  <button
                    type="button"
                    onClick={() => setSelectionMode('catalog')}
                    className="font-medium text-primary hover:underline"
                  >
                    {tw('switchToCatalog')}
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Catalog Selection */}
            {selectionMode === 'catalog' && (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="relative flex-1 max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={tw('searchPlaceholderOther')}
                      className="pl-9"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectionMode('upload')}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors self-start sm:self-auto"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    {tw('orUploadImage')}
                  </button>
                </div>

                <CategoryPills value={category} onChange={setCategory} />

                {foodsLoading && (
                  <p className="text-sm text-muted-foreground">{tc('loading')}</p>
                )}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {(foods?.items ?? []).map((food) => (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => {
                        setFoodId(food.id);
                        setWizState(DEFAULT_STATE);
                      }}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-center transition-colors',
                        effectiveFoodId === food.id
                          ? 'border-primary bg-accent ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-secondary/40',
                      )}
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg">
                        {getFoodEmoji(food.slug, food.category.slug)}
                      </span>
                      <span className="text-xs font-medium leading-tight">{getFoodName(food, locale)}</span>
                      <span className="text-[10px] text-muted-foreground">{getCategoryName(food.category, locale)}</span>
                    </button>
                  ))}
                </div>

                {!foodsLoading && (foods?.items.length ?? 0) === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {tw('noProduceFound')}
                  </p>
                )}
              </div>
            )}

            {/* Selected food preview */}
            {selectedFood && (
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-accent/60 px-4 py-3">
                {uploadedImageUrl ? (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={uploadedImageUrl} alt={getFoodName(selectedFood, locale)} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-lg">
                    {getFoodEmoji(selectedFood.slug, selectedFood.category.slug)}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold truncate">{getFoodName(selectedFood, locale)}</p>
                    {uploadedImageUrl && (
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {tw('viaPhotoBadge')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{getCategoryName(selectedFood.category, locale)}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {tw('selectedBadge')}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">
                {effectiveFoodId
                  ? tw('commodityReady')
                  : tw('selectToContinue')}
              </span>
              <Button disabled={!effectiveFoodId} onClick={() => setStep(1)}>
                {tc('next')} →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 1 — Dynamic questions ──────────────────────────────────────── */}
      {step === 1 && selectedFood && template && (
        <Card>
          <CardContent className="space-y-7 px-6 py-6">
            {/* Food banner */}
            <div className="flex items-center gap-3 rounded-xl bg-accent px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-lg">
                {getFoodEmoji(selectedFood.slug, selectedFood.category.slug)}
              </span>
              <div>
                <p className="text-sm font-semibold text-accent-foreground">{selectedFood.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedFood.category.name}
                  {selectedFood.isFreshProduce ? ' · Fresh produce' : ''}
                </p>
              </div>
              {template.intro && (
                <div className="ml-auto hidden max-w-xs lg:block">
                  <p className="text-xs text-muted-foreground">{template.intro}</p>
                </div>
              )}
            </div>

            {/* Template intro (mobile) */}
            {template.intro && (
              <p className="text-sm text-muted-foreground lg:hidden">{template.intro}</p>
            )}

            {/* Auto-consideration hints */}
            <AutoHints
              autoMap={template.autoMap}
              autoDry={template.autoDry}
              autoOily={template.autoOily}
            />

            {/* Dynamic questions */}
            {template.questions.map((q) => (
              <QuestionBlock
                key={q.id}
                question={q}
                value={getValue(q.fieldKey)}
                onChange={(v) => setValue(q.fieldKey, v)}
              />
            ))}

            {/* ── Advanced Mode toggle ── */}
            <div className="rounded-xl border border-border">
              <button
                type="button"
                onClick={() => {
                  if (!advancedMode) {
                    setAdvancedMode(true);
                    setAdvancedOpen(true);
                  } else {
                    setAdvancedOpen((v) => !v);
                  }
                }}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-semibold">Advanced / Expert Mode</p>
                  <p className="text-xs text-muted-foreground">
                    Provide lab-measured values to override knowledge-base references.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {advancedMode && (
                    <Badge variant="secondary" className="text-xs">Active</Badge>
                  )}
                  {advancedOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {advancedOpen && (
                <div className="border-t border-border px-4 pb-4 pt-4">
                  <div className="mb-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>
                      Leave fields blank to use <strong>Reference values</strong> from the NutriWrap
                      database. Only fill in values you have measured in a lab.
                    </span>
                  </div>

                  {/* Enable/disable toggle */}
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium">Enable advanced overrides</p>
                    <Switch
                      checked={advancedMode}
                      onCheckedChange={(v) => {
                        setAdvancedMode(v);
                        if (!v) setAdvancedInputs({});
                      }}
                    />
                  </div>

                  {advancedMode && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <AdvancedField
                        label="Moisture content"
                        badge="User-provided"
                        unit="%"
                        value={advancedInputs.moistureContentPercent}
                        onChange={(v) => setAdvancedInputs((s) => ({ ...s, moistureContentPercent: v }))}
                      />
                      <AdvancedField
                        label="pH"
                        badge="User-provided"
                        value={advancedInputs.ph}
                        onChange={(v) => setAdvancedInputs((s) => ({ ...s, ph: v }))}
                      />
                      <AdvancedField
                        label="Fat / oil content"
                        badge="User-provided"
                        unit="%"
                        value={advancedInputs.fatContentPercent}
                        onChange={(v) => setAdvancedInputs((s) => ({ ...s, fatContentPercent: v }))}
                      />
                      <AdvancedField
                        label="Respiration rate"
                        badge="User-provided"
                        unit="mL CO₂/kg/hr"
                        value={advancedInputs.respirationRateMlCo2PerKgPerHr}
                        onChange={(v) => setAdvancedInputs((s) => ({ ...s, respirationRateMlCo2PerKgPerHr: v }))}
                      />
                      <AdvancedField
                        label="Storage temperature"
                        badge="User-provided"
                        unit="°C"
                        value={advancedInputs.storageTemperatureC}
                        onChange={(v) => setAdvancedInputs((s) => ({ ...s, storageTemperatureC: v }))}
                      />
                      <AdvancedField
                        label="Relative humidity"
                        badge="User-provided"
                        unit="%"
                        value={advancedInputs.relativeHumidityPercent}
                        onChange={(v) => setAdvancedInputs((s) => ({ ...s, relativeHumidityPercent: v }))}
                      />
                      <AdvancedField
                        label="Measured OTR"
                        badge="User-provided"
                        unit="cc/m²/day"
                        value={advancedInputs.measuredOtr}
                        onChange={(v) => setAdvancedInputs((s) => ({ ...s, measuredOtr: v }))}
                      />
                      <AdvancedField
                        label="Measured WVTR"
                        badge="User-provided"
                        unit="g/m²/day"
                        value={advancedInputs.measuredWvtr}
                        onChange={(v) => setAdvancedInputs((s) => ({ ...s, measuredWvtr: v }))}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-1">
              <Button variant="outline" onClick={() => setStep(0)}>
                ← Back
              </Button>
              <Button onClick={() => setStep(2)}>Review →</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── STEP 2 — Review ─────────────────────────────────────────────────── */}
      {step === 2 && selectedFood && template && (
        <Card>
          <CardContent className="space-y-5 px-6 py-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Review your analysis</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Check the inputs below before NutriWrap analyzes your packaging requirements.
              </p>
            </div>

            {uploadedImageUrl && (
              <div className="flex items-center gap-3.5 rounded-xl border border-emerald-300/80 bg-emerald-50/60 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border shadow-xs bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadedImageUrl} alt="Uploaded produce" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{tw('attachedPhoto')}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {tw('attachedPhotoDesc')}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {buildReviewItems().map((item) => (
                <ReviewItem key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            {/* Auto-consideration summary */}
            <AutoHints
              autoMap={template.autoMap}
              autoDry={template.autoDry}
              autoOily={template.autoOily}
            />

            {advancedMode && (
              <div className="flex items-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm text-accent-foreground">
                <Thermometer className="h-4 w-4 shrink-0 text-primary" />
                <span>
                  <strong>Advanced Mode is on</strong> — user-provided lab values will override
                  knowledge-base references where supplied.
                </span>
              </div>
            )}

            {/* Scientific disclaimer */}
            <div className="flex items-start gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span>
                NutriWrap uses validated reference data and a deterministic scoring model.
                Results are decision-support estimates — validate experimentally before commercial
                production.
              </span>
            </div>

            <div className="flex justify-between pt-1">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button
                onClick={handleAnalyze}
                disabled={createAnalysis.isPending}
                className="gap-2"
              >
                {createAnalysis.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Analyze &amp; Recommend →
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
