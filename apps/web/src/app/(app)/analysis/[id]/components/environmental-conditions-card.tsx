import { Info, Wind, Droplets, Thermometer, Gauge } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FoodSummary, RequirementSummary } from '@/lib/api/types';
import type { ConfidenceLevel, StorageType } from '@foodpack/shared';

export function EnvironmentalConditionsCard({
  food,
  storageType,
  requirement,
  shelfLifeConfidence,
}: {
  food: FoodSummary;
  storageType: StorageType;
  requirement: RequirementSummary | null;
  shelfLifeConfidence: ConfidenceLevel;
}) {
  if (!food.isFreshProduce || !requirement) return null;

  const storageCondition = food.storageConditions?.find((s) => s.storageType === storageType);
  const hasGasData =
    requirement.recommendedO2Min !== null &&
    requirement.recommendedO2Min !== undefined &&
    requirement.recommendedCo2Min !== null &&
    requirement.recommendedCo2Min !== undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gas Exchange &amp; Environmental Conditions</CardTitle>
        <Badge variant={requirement.mapRecommended ? 'default' : 'secondary'}>
          {requirement.mapRecommended ? 'MAP recommended' : 'MAP not required'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {food.name} continues to respire after harvest — consuming O₂ and producing CO₂. Packaging
          must allow enough gas exchange to avoid anaerobic spoilage without wasting the shelf-life
          benefit of a controlled atmosphere.
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {hasGasData && (
            <>
              <ConditionTile
                icon={Wind}
                label="Target O₂"
                value={`${requirement.recommendedO2Min}–${requirement.recommendedO2Max}%`}
              />
              <ConditionTile
                icon={Wind}
                label="Target CO₂"
                value={`${requirement.recommendedCo2Min}–${requirement.recommendedCo2Max}%`}
              />
            </>
          )}
          {storageCondition && (storageCondition.minRH || storageCondition.maxRH) && (
            <ConditionTile
              icon={Droplets}
              label="Relative humidity"
              value={`${storageCondition.minRH ?? '—'}–${storageCondition.maxRH ?? '—'}%`}
            />
          )}
          {storageCondition && (storageCondition.minTempC !== null || storageCondition.maxTempC !== null) && (
            <ConditionTile
              icon={Thermometer}
              label="Storage temperature"
              value={`${storageCondition.minTempC ?? '—'}–${storageCondition.maxTempC ?? '—'}°C`}
            />
          )}
          <ConditionTile icon={Gauge} label="Confidence" value={shelfLifeConfidence} />
        </div>

        {requirement.mapRecommended && !hasGasData && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            MAP is indicated by storage/respiration conditions, but no validated recommended gas
            composition is available yet for {food.name} — experimental validation of O₂/CO₂ targets
            is required before commercial use.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ConditionTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-1.5 text-sm font-semibold">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
