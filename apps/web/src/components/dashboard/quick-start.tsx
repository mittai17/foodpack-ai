'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import {
  OBJECTIVE_LABELS,
  OBJECTIVES,
  PRODUCT_STATE_LABELS,
  PRODUCT_STATES,
  STORAGE_LABELS,
  STORAGE_TYPES,
  TRANSPORT_LABELS,
  TRANSPORT_TYPES,
  PACKAGING_FORMATS,
  PACKAGING_FORMAT_LABELS,
  type ObjectiveType,
  type ProductState,
  type StorageType,
  type TransportType,
  type PackagingFormat,
  type AdvancedInputs,
} from '@foodpack/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFoods } from '@/hooks/use-foods';
import { useCreateAnalysis } from '@/hooks/use-analysis';
import { toast } from 'sonner';

const SHELF_LIFE_PRESETS = [
  { label: 'Less than 1 week', days: 5 },
  { label: '1–4 weeks', days: 21 },
  { label: '1–3 months', days: 75 },
  { label: '3+ months', days: 150 },
];

const PACKAGE_WEIGHT_PRESETS = [
  { label: '1 kg (retail pack)', kg: 1 },
  { label: '5 kg (retail pack)', kg: 5 },
  { label: '25 kg (sack/carton)', kg: 25 },
  { label: '50 kg (sack)', kg: 50 },
  { label: '500 kg (bulk bag)', kg: 500 },
  { label: '2000+ kg (bulk/truckload)', kg: 2000 },
];

export function QuickStart() {
  const router = useRouter();
  const { data: foods } = useFoods();
  const createAnalysis = useCreateAnalysis();

  const [foodId, setFoodId] = useState<string | null>(null);
  const [productState, setProductState] = useState<ProductState>('FRESH');
  const [packagingFormat, setPackagingFormat] = useState<PackagingFormat>('AUTO');
  const [storageType, setStorageType] = useState<StorageType>('CHILLED');
  const [transportType, setTransportType] = useState<TransportType>('LOCAL');
  const [shelfLifeDays, setShelfLifeDays] = useState(21);
  const [packageWeightKg, setPackageWeightKg] = useState(1);
  const [objective, setObjective] = useState<ObjectiveType>('BALANCED');
  
  const [advancedMode, setAdvancedMode] = useState(false);
  const [advancedInputs, setAdvancedInputs] = useState<AdvancedInputs>({});

  const selectedFood = foods?.items.find((f) => f.id === foodId);
  const categorySlug = selectedFood?.category?.slug || '';
  
  // Dynamic fields logic
  const isProduce = categorySlug === 'fruits' || categorySlug === 'vegetables';
  const isDry = categorySlug === 'grains-cereals' || categorySlug === 'pulses' || categorySlug === 'spices';
  const isOily = categorySlug === 'nuts' || categorySlug === 'processed-bakery';

  const updateAdvanced = (key: keyof AdvancedInputs, value: string) => {
    const num = parseFloat(value);
    setAdvancedInputs(prev => ({
      ...prev,
      [key]: isNaN(num) ? undefined : num
    }));
  };

  async function handleGenerate() {
    if (!foodId) {
      toast.error('Select a food commodity first.');
      return;
    }
    try {
      const result = await createAnalysis.mutateAsync({
        foodId,
        productState,
        storageType,
        transportType,
        targetShelfLifeDays: shelfLifeDays,
        packageWeightKg,
        objective,
        packagingFormat: packagingFormat === 'AUTO' ? undefined : packagingFormat,
        advancedMode,
        advancedInputs: advancedMode ? advancedInputs : undefined,
      });
      router.push(`/analysis/${result.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not run the analysis.');
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Start</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Field label="Food">
          <Select value={foodId ?? undefined} onValueChange={setFoodId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a food">
                {(v: string | undefined) => foods?.items.find((f) => f.id === v)?.name ?? 'Select a food'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(foods?.items ?? []).map((food) => (
                <SelectItem key={food.id} value={food.id}>
                  {food.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Product Form">
          <Select value={productState} onValueChange={(v) => setProductState(v as ProductState)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: ProductState) => PRODUCT_STATE_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_STATES.map((s) => (
                <SelectItem key={s} value={s}>
                  {PRODUCT_STATE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Storage Condition">
          <Select value={storageType} onValueChange={(v) => setStorageType(v as StorageType)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: StorageType) => STORAGE_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STORAGE_TYPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STORAGE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Target Shelf Life">
          <Select value={String(shelfLifeDays)} onValueChange={(v) => setShelfLifeDays(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) => SHELF_LIFE_PRESETS.find((p) => String(p.days) === v)?.label ?? v}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SHELF_LIFE_PRESETS.map((p) => (
                <SelectItem key={p.days} value={String(p.days)}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Pack Size">
          <Select value={String(packageWeightKg)} onValueChange={(v) => setPackageWeightKg(Number(v))}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {(v: string) =>
                  PACKAGE_WEIGHT_PRESETS.find((p) => String(p.kg) === v)?.label ?? `${v} kg`
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PACKAGE_WEIGHT_PRESETS.map((p) => (
                <SelectItem key={p.kg} value={String(p.kg)}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Transportation">
          <Select value={transportType} onValueChange={(v) => setTransportType(v as TransportType)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: TransportType) => TRANSPORT_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TRANSPORT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TRANSPORT_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        
        <Field label="Packaging Format">
          <Select value={packagingFormat} onValueChange={(v) => setPackagingFormat(v as PackagingFormat)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: PackagingFormat) => PACKAGING_FORMAT_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PACKAGING_FORMATS.map((f) => (
                <SelectItem key={f} value={f}>
                  {PACKAGING_FORMAT_LABELS[f]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {isProduce && (
          <div className="rounded bg-secondary/30 p-2 text-xs text-muted-foreground border">
             Considering respiration/MAP automatically.
          </div>
        )}
        {isDry && (
          <div className="rounded bg-secondary/30 p-2 text-xs text-muted-foreground border">
             Focusing on moisture/oxygen protection automatically.
          </div>
        )}
        {isOily && (
          <div className="rounded bg-secondary/30 p-2 text-xs text-muted-foreground border">
             Focusing on oxidation/light protection automatically.
          </div>
        )}

        <Field label="Main problem / objective">
          <Select value={objective} onValueChange={(v) => setObjective(v as ObjectiveType)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(v: ObjectiveType) => OBJECTIVE_LABELS[v]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {OBJECTIVES.map((o) => (
                <SelectItem key={o} value={o}>
                  {OBJECTIVE_LABELS[o]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <div className="border-t pt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between p-0 font-normal hover:bg-transparent"
            onClick={() => setAdvancedMode(!advancedMode)}
          >
            <span className="text-sm">Advanced / Expert Mode</span>
            {advancedMode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          {advancedMode && (
            <div className="mt-3 grid gap-3 rounded-md bg-secondary/20 p-3">
              <Field label="Moisture Content (%) (User-provided)">
                <Input 
                  type="number" 
                  className="h-8 text-sm"
                  placeholder="e.g. 15" 
                  value={advancedInputs.moistureContentPercent ?? ''} 
                  onChange={(e) => updateAdvanced('moistureContentPercent', e.target.value)} 
                />
              </Field>
              <Field label="pH (User-provided)">
                <Input 
                  type="number" 
                  className="h-8 text-sm"
                  placeholder="e.g. 4.5" 
                  value={advancedInputs.ph ?? ''} 
                  onChange={(e) => updateAdvanced('ph', e.target.value)} 
                />
              </Field>
              {isOily && (
                <Field label="Fat/oil Content (%) (User-provided)">
                  <Input 
                    type="number" 
                    className="h-8 text-sm"
                    placeholder="e.g. 20" 
                    value={advancedInputs.fatContentPercent ?? ''} 
                    onChange={(e) => updateAdvanced('fatContentPercent', e.target.value)} 
                  />
                </Field>
              )}
              {isProduce && (
                <Field label="Respiration Rate (ml CO2/kg/hr) (User-provided)">
                  <Input 
                    type="number" 
                    className="h-8 text-sm"
                    placeholder="e.g. 10" 
                    value={advancedInputs.respirationRateMlCo2PerKgPerHr ?? ''} 
                    onChange={(e) => updateAdvanced('respirationRateMlCo2PerKgPerHr', e.target.value)} 
                  />
                </Field>
              )}
              <Field label="Temperature (°C) (User-provided)">
                <Input 
                  type="number" 
                  className="h-8 text-sm"
                  placeholder="e.g. 20" 
                  value={advancedInputs.storageTemperatureC ?? ''} 
                  onChange={(e) => updateAdvanced('storageTemperatureC', e.target.value)} 
                />
              </Field>
              <Field label="Relative Humidity (%) (User-provided)">
                <Input 
                  type="number" 
                  className="h-8 text-sm"
                  placeholder="e.g. 60" 
                  value={advancedInputs.relativeHumidityPercent ?? ''} 
                  onChange={(e) => updateAdvanced('relativeHumidityPercent', e.target.value)} 
                />
              </Field>
              <div className="text-[10px] text-muted-foreground mt-1">
                Leave blank to use Reference values or Predicted values.
              </div>
            </div>
          )}
        </div>

        <Button className="w-full mt-2" onClick={handleGenerate} disabled={createAnalysis.isPending}>
          <Sparkles className="h-4 w-4 mr-2" />
          {createAnalysis.isPending ? 'Analyzing…' : 'Analyze & Recommend →'}
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
