'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Box,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Droplet,
  FileText,
  Loader2,
  Package,
  Ruler,
  Sparkles,
  Thermometer,
  Truck,
  Wind,
} from 'lucide-react';
import {
  OBJECTIVE_LABELS,
  STORAGE_LABELS,
  TRANSPORT_LABELS,
} from '@foodpack/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CircularScore } from '@/components/ui/circular-score';
import { useAnalysis } from '@/hooks/use-analysis';
import type { RecommendationCandidate, SourceRef } from '@/lib/api/types';
import { formatValue } from '@/lib/format-value';
import { getFoodEmoji } from '@/lib/food-icons';
import { cn } from '@/lib/utils';
import { PackagingViewer3D } from '@/components/three/packaging-viewer-loader';
import { PackageIllustration } from '@/components/packaging/package-illustration';
import { colorForMaterial } from '@/lib/package-visuals';
import { findMinProperty } from './property-helpers';
import { EnvironmentalConditionsCard } from './components/environmental-conditions-card';
import { TechnicalSpecsCard } from './components/technical-specs-card';
import { AlternativesGrid } from './components/alternatives-grid';
import { SaveProjectDialog } from './components/save-project-dialog';

const LAYER_COLORS: Record<string, string> = {
  OUTER: 'bg-blue-500',
  BARRIER: 'bg-amber-500',
  ADHESIVE: 'bg-neutral-400',
  SEAL: 'bg-primary',
  TRAY: 'bg-violet-500',
};

const LAYER_PURPOSE: Record<string, string> = {
  OUTER: 'protects from tearing and handling damage',
  BARRIER: 'blocks oxygen and moisture from getting in',
  ADHESIVE: 'bonds the layers together',
  SEAL: 'closes and holds the pack shut',
  TRAY: 'gives the pack a rigid shape',
};

export function AnalysisResult({ id }: { id: string }) {
  const { data: analysis, isLoading, error } = useAnalysis(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="font-medium">Couldn&apos;t load this analysis.</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'It may not exist or you may not have access.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (analysis.status === 'FAILED') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
          <p className="font-medium">This analysis could not be completed.</p>
          <p className="max-w-md text-sm text-muted-foreground">{analysis.errorMessage}</p>
        </CardContent>
      </Card>
    );
  }

  if (analysis.status !== 'COMPLETED') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-medium">Analyzing packaging options for {analysis.food.name}…</p>
        </CardContent>
      </Card>
    );
  }

  const recommended = analysis.recommendations.find((r) => r.isRecommended);
  const alternatives = analysis.recommendations.filter((r) => !r.isRecommended);

  const allSources = collectSources(analysis, recommended);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Packaging Recommendation</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <SummaryChip
              emoji={getFoodEmoji(analysis.food.slug, analysis.food.category.slug)}
              label="Food"
              value={analysis.food.name}
            />
            <SummaryChip icon={Thermometer} label="Storage" value={STORAGE_LABELS[analysis.storageType]} />
            <SummaryChip icon={Calendar} label="Target" value={`${analysis.targetShelfLifeDays} days`} />
            <SummaryChip
              icon={Package}
              label="Pack size"
              value={
                analysis.packageWeightKg >= 1000
                  ? `${analysis.packageWeightKg / 1000} tonne`
                  : `${analysis.packageWeightKg} kg`
              }
            />
            <SummaryChip icon={Truck} label="Transport" value={TRANSPORT_LABELS[analysis.transportType]} />
            <SummaryChip icon={Sparkles} label="Objective" value={OBJECTIVE_LABELS[analysis.objective]} />
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <SaveProjectDialog analysisId={analysis.id} currentProjectId={analysis.projectId} />
          <Button onClick={() => window.print()}>
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {recommended && (
        <>
          <RecommendedCard
            recommendation={recommended}
            foodName={analysis.food.name}
            packageWeightKg={analysis.packageWeightKg}
            mapRecommended={analysis.requirement?.mapRecommended ?? false}
          />
          <WhySection recommendation={recommended} />
          <EnvironmentalConditionsCard
            food={analysis.food}
            storageType={analysis.storageType}
            requirement={analysis.requirement}
            shelfLifeConfidence={recommended.shelfLifeConfidence}
          />
          <TechnicalSpecsCard structure={recommended.structure} requirement={analysis.requirement} />
        </>
      )}

      {analysis.requirement?.limitingFactors && analysis.requirement.limitingFactors.length > 0 && (
        <Card className="border-amber-300/60 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="space-y-1 px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4" />
              Data limitations
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-amber-800/90 dark:text-amber-300/80">
              {analysis.requirement.limitingFactors.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Alternatives</CardTitle>
          </CardHeader>
          <CardContent>
            <AlternativesGrid alternatives={alternatives} />
          </CardContent>
        </Card>
      )}

      {recommended && <CostSustainabilitySection recommendation={recommended} />}

      {allSources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scientific Evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allSources.map((source) => (
              <div key={source.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                <p className="font-medium">{source.citation}</p>
                <p className="text-xs text-muted-foreground">
                  {[source.publication, source.year].filter(Boolean).join(' · ') || 'Reference'}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="rounded-lg bg-muted px-4 py-3 text-xs text-muted-foreground">
        This is a decision-support estimate based on validated reference data and a deterministic
        scoring model. Validate experimentally before commercial production.
      </p>
    </div>
  );
}

function SummaryChip({
  icon: Icon,
  emoji,
  label,
  value,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  emoji?: string;
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
      {emoji ? <span className="text-sm leading-none">{emoji}</span> : Icon ? <Icon className="h-3.5 w-3.5 text-primary" /> : null}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

function RecommendedCard({
  recommendation,
  foodName,
  packageWeightKg,
  mapRecommended,
}: {
  recommendation: RecommendationCandidate;
  foodName: string;
  packageWeightKg: number;
  mapRecommended: boolean;
}) {
  const [show3D, setShow3D] = useState(false);
  const structure = recommendation.structure;
  const outerLayer = structure?.layers.find((l) => l.layerRole === 'OUTER' || l.layerRole === 'TRAY') ?? structure?.layers[0];
  const otr = findMinProperty(structure?.layers, 'OTR');
  const wvtr = findMinProperty(structure?.layers, 'WVTR');
  const thickness = structure?.layers.reduce(
    (acc, l) => ({
      min: l.thicknessMinMicron !== null && l.thicknessMinMicron !== undefined ? Math.min(acc.min ?? Infinity, l.thicknessMinMicron) : acc.min,
      max: l.thicknessMaxMicron !== null && l.thicknessMaxMicron !== undefined ? Math.max(acc.max ?? 0, l.thicknessMaxMicron) : acc.max,
    }),
    { min: undefined as number | undefined, max: undefined as number | undefined },
  );

  return (
    <Card className="overflow-hidden border-primary/30">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recommended Packaging</CardTitle>
        <Badge className="gap-1">
          <Award className="h-3 w-3" />
          Recommended
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-base font-semibold">{structure?.name}</p>
          <p className="text-sm text-muted-foreground">
            {structure?.description ?? `Recommended for ${foodName} under the selected conditions.`}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {structure && (
            <PackageIllustration
              structureType={structure.structureType}
              outerColor={colorForMaterial(outerLayer?.material.name, '#94a3b8')}
            />
          )}

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Layer stack</p>
            {structure?.layers.map((layer) => (
              <div key={layer.order} className="flex items-center gap-3">
                <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', LAYER_COLORS[layer.layerRole] ?? 'bg-muted-foreground')} />
                <div className="flex-1">
                  <p className="text-sm font-medium leading-tight">
                    {layer.layerRole.charAt(0) + layer.layerRole.slice(1).toLowerCase()} — {layer.material.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {LAYER_PURPOSE[layer.layerRole] ?? 'part of the pack structure'}
                    {(layer.thicknessMinMicron || layer.thicknessMaxMicron) &&
                      ` · ${layer.thicknessMinMicron}–${layer.thicknessMaxMicron} µm`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          <SpecTile
            icon={Wind}
            label="Oxygen protection"
            sublabel="OTR"
            value={otr ? `${formatValue(otr)} ${otr.unit ?? ''}` : '—'}
          />
          <SpecTile
            icon={Droplet}
            label="Moisture protection"
            sublabel="WVTR"
            value={wvtr ? `${formatValue(wvtr)} ${wvtr.unit ?? ''}` : '—'}
          />
          <SpecTile
            icon={Ruler}
            label="Film thickness"
            value={thickness?.min || thickness?.max ? `${thickness.min ?? '–'}–${thickness.max ?? '–'} µm` : '—'}
          />
          <SpecTile
            icon={Calendar}
            label="Expected shelf life"
            value={
              recommendation.estimatedShelfLifeMinDays !== null &&
              recommendation.estimatedShelfLifeMinDays !== undefined
                ? `${recommendation.estimatedShelfLifeMinDays}–${recommendation.estimatedShelfLifeMaxDays} days`
                : '—'
            }
          />
          <SpecTile
            icon={CheckCircle2}
            label="Breathable pack needed?"
            sublabel="MAP"
            value={
              !mapRecommended
                ? 'Not needed for this product'
                : structure?.supportsMap
                  ? 'Yes — this pack breathes'
                  : 'Recommended, but not available at this pack size'
            }
          />
          <SpecTile icon={Award} label="Match score" value={`${recommendation.overallScore} / 100`} />
        </div>

        {structure && (
          <div className="print:hidden">
            <button
              type="button"
              onClick={() => setShow3D((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Box className="h-3.5 w-3.5" />
              Inspect in 3D — rotate the pack and see the material layers
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', show3D && 'rotate-180')} />
            </button>
            {show3D && (
              <div className="mt-3">
                <PackagingViewer3D
                  layers={structure.layers.map((l) => ({ order: l.order, layerRole: l.layerRole, materialName: l.material.name }))}
                  structureType={structure.structureType}
                  packageWeightKg={packageWeightKg}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SpecTile({
  icon: Icon,
  label,
  sublabel,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel?: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-1.5 text-sm font-semibold">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
        {sublabel && <span className="normal-case"> ({sublabel})</span>}
      </p>
    </div>
  );
}

function WhySection({ recommendation }: { recommendation: RecommendationCandidate }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Why this packaging?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendation.aiExplanation && (
          <p className="rounded-lg bg-accent px-4 py-3 text-sm text-accent-foreground">
            {recommendation.aiExplanation}
          </p>
        )}
        <ul className="space-y-2">
          {recommendation.explanation.map((line, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span className="text-muted-foreground">{line}</span>
            </li>
          ))}
        </ul>
        <ScoreBreakdown breakdown={recommendation.scoreBreakdown} />
      </CardContent>
    </Card>
  );
}

function ScoreBreakdown({ breakdown }: { breakdown: Record<string, number> }) {
  const labels: Record<string, string> = {
    barrierSuitability: 'Keeps oxygen out',
    moistureProtection: 'Keeps moisture out',
    mechanicalSuitability: 'Survives handling & transport',
    sealability: 'Seals properly',
    shelfLifePotential: 'Keeps product fresh long enough',
    cost: 'Affordable',
    sustainability: 'Eco-friendly',
    mapSuitability: 'Lets product breathe (if needed)',
  };

  return (
    <div className="space-y-2 pt-2">
      {Object.entries(breakdown).map(([key, value]) => (
        <div key={key} className="flex items-center gap-3 text-xs">
          <span className="w-36 shrink-0 text-muted-foreground">{labels[key] ?? key}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
          </div>
          <span className="w-8 shrink-0 text-right font-medium">{Math.round(value)}</span>
        </div>
      ))}
    </div>
  );
}

function CostSustainabilitySection({ recommendation }: { recommendation: RecommendationCandidate }) {
  const materials = recommendation.structure?.layers.map((l) => l.material) ?? [];
  const allRecyclable = materials.length > 0 && materials.every((m) => m.recyclable === true);
  const anyBiodegradable = materials.some((m) => m.biodegradable === true);
  const anyNonRecyclable = materials.some((m) => m.recyclable === false);
  const distinctMaterials = new Set(materials.map((m) => m.id)).size;
  const hasSustainabilityData = allRecyclable || anyBiodegradable || anyNonRecyclable;
  const sustainabilityScore = recommendation.scoreBreakdown.sustainability;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost &amp; Sustainability</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated cost</p>
          <p className="text-2xl font-semibold tracking-tight">
            {recommendation.estimatedCostMin ?? '—'}–{recommendation.estimatedCostMax ?? '—'}{' '}
            <span className="text-sm font-normal text-muted-foreground">{recommendation.costUnit}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Estimated indicative cost — not verified supplier pricing.
          </p>
        </div>

        <div className="flex items-center justify-center sm:justify-start">
          {typeof sustainabilityScore === 'number' && (
            <CircularScore value={sustainabilityScore} label="Sustainability" />
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Environmental impact</p>
          {hasSustainabilityData ? (
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <ImpactRow label="Recyclable" value={allRecyclable ? 'Yes' : anyNonRecyclable ? 'No' : 'Partial'} />
              <ImpactRow label="Biodegradable" value={anyBiodegradable ? 'Yes' : 'No'} />
              <ImpactRow label="Mono-material" value={distinctMaterials === 1 ? 'Yes' : `No — ${distinctMaterials} materials`} />
              <ImpactRow label="Carbon footprint" value="Insufficient validated data" />
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">Insufficient validated environmental data.</p>
          )}
          <p className="mt-3 text-xs text-muted-foreground">
            {recommendation.sustainabilityNotes}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ImpactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function collectSources(
  analysis: { food: { sources?: SourceRef[] } },
  recommended: RecommendationCandidate | undefined,
): SourceRef[] {
  const seen = new Map<string, SourceRef>();
  const key = (s: SourceRef) => `${s.citation}|${s.publication}|${s.year}`;
  for (const s of analysis.food.sources ?? []) seen.set(key(s), s);
  for (const layer of recommended?.structure?.layers ?? []) {
    for (const s of layer.material.sources ?? []) seen.set(key(s), s);
  }
  return Array.from(seen.values());
}
