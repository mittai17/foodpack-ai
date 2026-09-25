import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { RecommendationCandidate } from '@/lib/api/types';

const LAYER_COLORS: Record<string, string> = {
  OUTER: 'bg-blue-500',
  BARRIER: 'bg-amber-500',
  ADHESIVE: 'bg-neutral-400',
  SEAL: 'bg-primary',
  TRAY: 'bg-violet-500',
};

export function AlternativesGrid({ alternatives }: { alternatives: RecommendationCandidate[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {alternatives.map((alt) => {
        const materials = alt.structure?.layers.map((l) => l.material) ?? [];
        const allRecyclable = materials.length > 0 && materials.every((m) => m.recyclable === true);
        const supportsMap = alt.structure?.supportsMap;

        return (
          <Card key={alt.id} className="flex h-full flex-col">
            <CardContent className="flex flex-1 flex-col gap-3 px-5 py-5">
              <div className="flex items-center gap-1.5">
                {(alt.structure?.layers ?? []).map((l) => (
                  <span key={l.order} className={cn('h-2 w-6 rounded-full', LAYER_COLORS[l.layerRole] ?? 'bg-muted-foreground')} />
                ))}
              </div>

              <div>
                <p className="text-sm font-semibold leading-tight">{alt.structure?.name}</p>
                <p className="text-xs text-muted-foreground">Rank #{alt.rank + 1} · Score {alt.overallScore}</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {allRecyclable && <Badge variant="secondary">Recyclable</Badge>}
                {supportsMap && <Badge variant="secondary">Suitable for MAP</Badge>}
              </div>

              <div className="mt-auto grid grid-cols-2 gap-2 pt-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Shelf life</p>
                  <p className="font-medium">
                    {alt.estimatedShelfLifeMinDays ?? '—'}–{alt.estimatedShelfLifeMaxDays ?? '—'} d
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cost</p>
                  <p className="font-medium">
                    {alt.estimatedCostMin ?? '—'}–{alt.estimatedCostMax ?? '—'} {alt.costUnit}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Sustainability</p>
                  <p className="font-medium">{alt.scoreBreakdown.sustainability ?? '—'} / 100</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Barrier fit</p>
                  <p className="font-medium">{alt.scoreBreakdown.barrierSuitability ?? '—'} / 100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
