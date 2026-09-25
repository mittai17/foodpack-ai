import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatValue } from '@/lib/format-value';
import type { RecommendationCandidate, RequirementSummary } from '@/lib/api/types';
import { findMaxProperty, findMinProperty } from '../property-helpers';

export function TechnicalSpecsCard({
  structure,
  requirement,
}: {
  structure: RecommendationCandidate['structure'];
  requirement: RequirementSummary | null;
}) {
  if (!structure) return null;

  const otr = findMinProperty(structure.layers, 'OTR');
  const wvtr = findMinProperty(structure.layers, 'WVTR');
  const tensile = findMaxProperty(structure.layers, 'TENSILE_STRENGTH');
  const puncture = findMaxProperty(structure.layers, 'PUNCTURE_RESISTANCE');
  const seal = findMaxProperty(structure.layers, 'SEAL_STRENGTH');
  const materialComposition = Array.from(new Set(structure.layers.map((l) => l.material.materialType))).join(' / ');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Technical Specifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <SpecGroup title="Packaging structure">
          <SpecRow label="Structure type" value={structure.structureType} />
          <SpecRow label="Material composition" value={materialComposition || '—'} />
          <SpecRow label="Layer count" value={String(structure.layers.length)} />
        </SpecGroup>

        <SpecGroup title="Barrier properties">
          <SpecRow label="OTR (oxygen)" value={otr ? `${formatValue(otr)} ${otr.unit ?? ''}` : 'Insufficient validated data'} />
          <SpecRow label="WVTR (moisture)" value={wvtr ? `${formatValue(wvtr)} ${wvtr.unit ?? ''}` : 'Insufficient validated data'} />
        </SpecGroup>

        <SpecGroup title="Mechanical properties">
          <SpecRow
            label="Tensile strength"
            value={tensile ? `${formatValue(tensile)} ${tensile.unit ?? ''}` : 'Insufficient validated data'}
          />
          <SpecRow
            label="Puncture resistance"
            value={puncture ? `${formatValue(puncture)} ${puncture.unit ?? ''}` : 'Insufficient validated data'}
          />
          <SpecRow
            label="Seal strength"
            value={seal ? `${formatValue(seal)} ${seal.unit ?? ''}` : 'Insufficient validated data'}
          />
        </SpecGroup>

        {requirement && (
          <SpecGroup title="MAP parameters (fresh produce)">
            <SpecRow label="Recommended" value={requirement.mapRecommended ? 'Yes' : 'No'} />
            <SpecRow
              label="Target O₂"
              value={
                requirement.recommendedO2Min !== null && requirement.recommendedO2Min !== undefined
                  ? `${requirement.recommendedO2Min}–${requirement.recommendedO2Max}%`
                  : 'Insufficient validated data'
              }
            />
            <SpecRow
              label="Target CO₂"
              value={
                requirement.recommendedCo2Min !== null && requirement.recommendedCo2Min !== undefined
                  ? `${requirement.recommendedCo2Min}–${requirement.recommendedCo2Max}%`
                  : 'Insufficient validated data'
              }
            />
          </SpecGroup>
        )}
      </CardContent>
    </Card>
  );
}

function SpecGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
