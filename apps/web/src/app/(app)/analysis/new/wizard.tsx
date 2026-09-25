'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Boxes,
  Flame,
  Globe2,
  Leaf,
  Loader2,
  MapPin,
  PackageCheck,
  Recycle,
  Scale,
  Search,
  Snowflake,
  Sparkles,
  Truck,
  Wallet,
} from 'lucide-react';
import {
  OBJECTIVE_LABELS,
  PRODUCT_STATE_LABELS,
  STORAGE_LABELS,
  TRANSPORT_LABELS,
  type AdvancedInputs,
  type ObjectiveType,
  type ProductState,
  type StorageType,
  type TransportType,
} from '@foodpack/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Stepper } from '@/components/wizard/stepper';
import { OptionPicker } from '@/components/wizard/option-picker';
import { useFood, useFoods } from '@/hooks/use-foods';
import { useCreateAnalysis } from '@/hooks/use-analysis';
import { getFoodEmoji } from '@/lib/food-icons';
import { CategoryPills } from '@/components/food/category-pills';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const STEPS = [
  { label: 'Food', description: 'Select' },
  { label: 'Details', description: 'Simple questions' },
  { label: 'Review', description: 'Analyze' },
];

const SHELF_LIFE_PRESETS = [
  { label: 'Less than 1 week', days: 5 },
  { label: '1–4 weeks', days: 21 },
  { label: '1–3 months', days: 75 },
  { label: '3+ months', days: 150 },
];

const PACKAGE_WEIGHT_PRESETS = [
  { label: '1 kg', sublabel: 'Retail pack', kg: 1 },
  { label: '5 kg', sublabel: 'Retail pack', kg: 5 },
  { label: '25 kg', sublabel: 'Sack / carton', kg: 25 },
  { label: '50 kg', sublabel: 'Sack', kg: 50 },
  { label: '500 kg', sublabel: 'Bulk bag', kg: 500 },
  { label: '2000+ kg', sublabel: 'Bulk / truckload', kg: 2000 },
];

export function AnalysisWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();

  const [foodId, setFoodId] = useState<string | undefined>();
  const [productState, setProductState] = useState<ProductState>('FRESH');
  const [storageType, setStorageType] = useState<StorageType>('CHILLED');
  const [transportType, setTransportType] = useState<TransportType>('LOCAL');
  const [shelfLifeDays, setShelfLifeDays] = useState(21);
  const [packageWeightKg, setPackageWeightKg] = useState(1);
  const [objective, setObjective] = useState<ObjectiveType>('BALANCED');
  const [advancedMode, setAdvancedMode] = useState(false);
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

  async function handleAnalyze() {
    if (!effectiveFoodId) return;
    try {
      const result = await createAnalysis.mutateAsync({
        foodId: effectiveFoodId,
        productState,
        storageType,
        transportType,
        targetShelfLifeDays: shelfLifeDays,
        packageWeightKg,
        objective,
        advancedMode,
        advancedInputs: advancedMode ? advancedInputs : undefined,
      });
      router.push(`/analysis/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not run the analysis.');
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="px-6 py-5">
          <Stepper steps={STEPS} current={step} />
        </CardContent>
      </Card>

      {step === 0 && (
        <Card>
          <CardContent className="space-y-4 px-6 py-6">
            <h2 className="text-lg font-semibold tracking-tight">What are you packaging?</h2>
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search food (e.g., mango, rice, tomato...)"
                className="pl-9"
              />
            </div>

            <CategoryPills value={category} onChange={setCategory} />

            {foodsLoading && <p className="text-sm text-muted-foreground">Loading commodities…</p>}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {(foods?.items ?? []).map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => setFoodId(food.id)}
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
                  <span className="text-xs font-medium leading-tight">{food.name}</span>
                  <span className="text-[10px] text-muted-foreground">{food.category.name}</span>
                </button>
              ))}
            </div>

            {!foodsLoading && (foods?.items.length ?? 0) === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No commodities matched &ldquo;{search}&rdquo;.
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button disabled={!effectiveFoodId} onClick={() => setStep(1)}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && selectedFood && (
        <Card>
          <CardContent className="space-y-6 px-6 py-6">
            <div className="flex items-center gap-3 rounded-xl bg-accent px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-background text-lg">
                {getFoodEmoji(selectedFood.slug, selectedFood.category.slug)}
              </span>
              <div>
                <p className="text-sm font-semibold text-accent-foreground">{selectedFood.name}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedFood.category.name}
                  {selectedFood.isFreshProduce ? ' · Fresh produce' : ''}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>What type of {selectedFood.name.toLowerCase()}?</Label>
              <OptionPicker
                columns={3}
                value={productState}
                onChange={setProductState}
                options={[
                  { value: 'FRESH', label: PRODUCT_STATE_LABELS.FRESH, icon: Leaf },
                  { value: 'CUT_READY_TO_EAT', label: PRODUCT_STATE_LABELS.CUT_READY_TO_EAT, icon: Scale },
                  { value: 'PROCESSED', label: PRODUCT_STATE_LABELS.PROCESSED, icon: Boxes },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label>Where will it be stored?</Label>
              <OptionPicker
                columns={3}
                value={storageType}
                onChange={setStorageType}
                options={[
                  { value: 'AMBIENT', label: STORAGE_LABELS.AMBIENT, icon: Globe2 },
                  { value: 'CHILLED', label: STORAGE_LABELS.CHILLED, icon: Snowflake },
                  { value: 'FROZEN', label: STORAGE_LABELS.FROZEN, icon: Flame },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label>Target shelf life</Label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {SHELF_LIFE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setShelfLifeDays(preset.days)}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors',
                      shelfLifeDays === preset.days
                        ? 'border-primary bg-accent text-accent-foreground ring-1 ring-primary'
                        : 'border-border bg-card hover:bg-secondary/40',
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Or set exact days:</span>
                <Input
                  type="number"
                  min={1}
                  max={730}
                  value={shelfLifeDays}
                  onChange={(e) => setShelfLifeDays(Number(e.target.value) || 1)}
                  className="h-8 w-24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>How much are you packing at once?</Label>
              <p className="text-xs text-muted-foreground">
                A 1&nbsp;kg retail pouch and a 2000&nbsp;kg truckload need completely different
                packaging — this decides between a retail pack, a wholesale sack, or a bulk bag.
              </p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {PACKAGE_WEIGHT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPackageWeightKg(preset.kg)}
                    className={cn(
                      'rounded-xl border px-4 py-3 text-left transition-colors',
                      packageWeightKg === preset.kg
                        ? 'border-primary bg-accent text-accent-foreground ring-1 ring-primary'
                        : 'border-border bg-card hover:bg-secondary/40',
                    )}
                  >
                    <span className="block text-sm font-medium">{preset.label}</span>
                    <span className="block text-xs text-muted-foreground">{preset.sublabel}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-muted-foreground">Or set exact weight (kg):</span>
                <Input
                  type="number"
                  min={0.1}
                  max={25000}
                  step={0.1}
                  value={packageWeightKg}
                  onChange={(e) => setPackageWeightKg(Number(e.target.value) || 0.1)}
                  className="h-8 w-28"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>How will it be transported?</Label>
              <OptionPicker
                columns={3}
                value={transportType}
                onChange={setTransportType}
                options={[
                  { value: 'LOCAL', label: TRANSPORT_LABELS.LOCAL, icon: MapPin },
                  { value: 'LONG_DISTANCE', label: TRANSPORT_LABELS.LONG_DISTANCE, icon: Truck },
                  { value: 'EXPORT', label: TRANSPORT_LABELS.EXPORT, icon: Globe2 },
                ]}
              />
            </div>

            <div className="space-y-2">
              <Label>What matters most?</Label>
              <OptionPicker
                columns={4}
                value={objective}
                onChange={setObjective}
                options={[
                  { value: 'MAX_SHELF_LIFE', label: OBJECTIVE_LABELS.MAX_SHELF_LIFE, icon: PackageCheck },
                  { value: 'MIN_COST', label: OBJECTIVE_LABELS.MIN_COST, icon: Wallet },
                  { value: 'SUSTAINABILITY', label: OBJECTIVE_LABELS.SUSTAINABILITY, icon: Recycle },
                  { value: 'BALANCED', label: OBJECTIVE_LABELS.BALANCED, icon: Sparkles },
                ]}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Advanced Mode</p>
                <p className="text-xs text-muted-foreground">
                  Provide lab-measured values to override knowledge-base references.
                </p>
              </div>
              <Switch checked={advancedMode} onCheckedChange={setAdvancedMode} />
            </div>

            {advancedMode && (
              <div className="grid grid-cols-2 gap-4 rounded-xl border border-dashed border-border p-4 sm:grid-cols-3">
                <AdvancedField
                  label="Moisture (%)"
                  value={advancedInputs.moistureContentPercent}
                  onChange={(v) => setAdvancedInputs((s) => ({ ...s, moistureContentPercent: v }))}
                />
                <AdvancedField
                  label="pH"
                  value={advancedInputs.ph}
                  onChange={(v) => setAdvancedInputs((s) => ({ ...s, ph: v }))}
                />
                <AdvancedField
                  label="Fat / oil (%)"
                  value={advancedInputs.fatContentPercent}
                  onChange={(v) => setAdvancedInputs((s) => ({ ...s, fatContentPercent: v }))}
                />
                <AdvancedField
                  label="Storage temp (°C)"
                  value={advancedInputs.storageTemperatureC}
                  onChange={(v) => setAdvancedInputs((s) => ({ ...s, storageTemperatureC: v }))}
                />
                <AdvancedField
                  label="Relative humidity (%)"
                  value={advancedInputs.relativeHumidityPercent}
                  onChange={(v) => setAdvancedInputs((s) => ({ ...s, relativeHumidityPercent: v }))}
                />
                <AdvancedField
                  label="Respiration rate (mL CO₂/kg/hr)"
                  value={advancedInputs.respirationRateMlCo2PerKgPerHr}
                  onChange={(v) =>
                    setAdvancedInputs((s) => ({ ...s, respirationRateMlCo2PerKgPerHr: v }))
                  }
                />
                <AdvancedField
                  label="Measured OTR (cc/m²/day)"
                  value={advancedInputs.measuredOtr}
                  onChange={(v) => setAdvancedInputs((s) => ({ ...s, measuredOtr: v }))}
                />
                <AdvancedField
                  label="Measured WVTR (g/m²/day)"
                  value={advancedInputs.measuredWvtr}
                  onChange={(v) => setAdvancedInputs((s) => ({ ...s, measuredWvtr: v }))}
                />
              </div>
            )}

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button onClick={() => setStep(2)}>Review</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && selectedFood && (
        <Card>
          <CardContent className="space-y-5 px-6 py-6">
            <h2 className="text-lg font-semibold tracking-tight">Review your analysis</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <ReviewItem label="Food" value={selectedFood.name} />
              <ReviewItem label="State" value={PRODUCT_STATE_LABELS[productState]} />
              <ReviewItem label="Storage" value={STORAGE_LABELS[storageType]} />
              <ReviewItem label="Transport" value={TRANSPORT_LABELS[transportType]} />
              <ReviewItem label="Target shelf life" value={`${shelfLifeDays} days`} />
              <ReviewItem
                label="Pack size"
                value={packageWeightKg >= 1000 ? `${packageWeightKg / 1000} tonne` : `${packageWeightKg} kg`}
              />
              <ReviewItem label="Objective" value={OBJECTIVE_LABELS[objective]} />
            </div>
            {advancedMode && (
              <p className="rounded-lg bg-accent px-3 py-2 text-xs text-accent-foreground">
                Advanced Mode is on — user-provided values will override knowledge-base references
                where given.
              </p>
            )}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleAnalyze} disabled={createAnalysis.isPending}>
                {createAnalysis.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Recommendation
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

function AdvancedField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        placeholder="—"
      />
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
