'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatValue } from '@/lib/format-value';
import { useMaterial } from '@/hooks/use-materials';

const PROPERTY_LABELS: Record<string, string> = {
  OTR: 'Oxygen Transmission Rate (OTR)',
  WVTR: 'Water Vapor Transmission Rate (WVTR)',
  THICKNESS: 'Thickness',
  TENSILE_STRENGTH: 'Tensile strength',
  PUNCTURE_RESISTANCE: 'Puncture resistance',
  SEAL_STRENGTH: 'Seal strength',
  TEMP_RESISTANCE_MIN: 'Min. temperature resistance',
  TEMP_RESISTANCE_MAX: 'Max. temperature resistance',
  TRANSPARENCY: 'Transparency',
};

export function MaterialDetail({ slug }: { slug: string }) {
  const { data: material, isLoading } = useMaterial(slug);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!material) return <p className="text-sm text-muted-foreground">Material not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">{material.materialType}</Badge>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{material.name}</h1>
        <p className="text-sm text-muted-foreground">{material.description}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {material.recyclable === true && <Badge variant="secondary">Recyclable</Badge>}
          {material.recyclable === false && <Badge variant="outline">Not readily recyclable</Badge>}
          {material.biodegradable && <Badge variant="secondary">Biodegradable</Badge>}
          {material.monoMaterial && <Badge variant="secondary">Mono-material</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technical specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {material.properties.length === 0 && (
            <p className="text-sm text-muted-foreground">Insufficient validated data.</p>
          )}
          {material.properties.map((p, i) => (
            <div key={i} className="rounded-lg border border-border px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {PROPERTY_LABELS[p.propertyType] ?? p.propertyType}
              </p>
              <p className="text-sm font-medium">
                {formatValue(p)}{' '}
                {p.unit}
              </p>
              <Badge variant="outline" className="mt-1">
                {p.confidence} confidence
              </Badge>
              {p.notes && <p className="mt-1 text-xs text-muted-foreground">{p.notes}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      {material.sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {material.sources.map((s) => (
              <div key={s.id} className="text-sm">
                <p className="font-medium">{s.citation}</p>
                <p className="text-xs text-muted-foreground">
                  {[s.publication, s.year].filter(Boolean).join(' · ')}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
