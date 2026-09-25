'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import {
  OBJECTIVE_LABELS,
  OBJECTIVES,
  PRODUCT_STATE_LABELS,
  PRODUCT_STATES,
  STORAGE_LABELS,
  STORAGE_TYPES,
  TRANSPORT_LABELS,
  TRANSPORT_TYPES,
  type ObjectiveType,
  type ProductState,
  type StorageType,
  type TransportType,
} from '@foodpack/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
  const [storageType, setStorageType] = useState<StorageType>('CHILLED');
  const [transportType, setTransportType] = useState<TransportType>('LOCAL');
  const [shelfLifeDays, setShelfLifeDays] = useState(21);
  const [packageWeightKg, setPackageWeightKg] = useState(1);
  const [objective, setObjective] = useState<ObjectiveType>('BALANCED');

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
        advancedMode: false,
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
      <CardContent className="space-y-3">
        <Field label="Food">
          <Select value={foodId} onValueChange={setFoodId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a food">
                {(v: string | null) => foods?.items.find((f) => f.id === v)?.name ?? 'Select a food'}
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

        <Field label="Type">
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

        <Field label="What matters most?">
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

        <Button className="w-full" onClick={handleGenerate} disabled={createAnalysis.isPending}>
          <Sparkles className="h-4 w-4" />
          {createAnalysis.isPending ? 'Analyzing…' : 'Generate Recommendation'}
        </Button>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
