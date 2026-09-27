'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatValue } from '@/lib/format-value';
import { useMaterial } from '@/hooks/use-materials';
import {
  getMaterialName,
  getMaterialDescription,
  getMaterialTypeName,
  getPropertyName,
  getConfidenceLabel,
} from '@/lib/i18n-helpers';

export function MaterialDetail({ slug }: { slug: string }) {
  const { data: material, isLoading } = useMaterial(slug);
  const t = useTranslations('materials');
  const locale = useLocale();

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!material) return <p className="text-sm text-muted-foreground">{t('materialNotFound')}</p>;

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="outline">{getMaterialTypeName(material.materialType, locale)}</Badge>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{getMaterialName(material, locale)}</h1>
        <p className="text-sm text-muted-foreground">{getMaterialDescription(material, locale)}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {material.recyclable === true && <Badge variant="secondary">{t('recyclable')}</Badge>}
          {material.recyclable === false && <Badge variant="outline">{t('notRecyclable')}</Badge>}
          {material.biodegradable && <Badge variant="secondary">{t('biodegradable')}</Badge>}
          {material.monoMaterial && <Badge variant="secondary">{t('monoMaterial')}</Badge>}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('technicalSpecifications')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {material.properties.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('insufficientData')}</p>
          )}
          {material.properties.map((p, i) => (
            <div key={i} className="rounded-lg border border-border px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {getPropertyName(p.propertyType, locale)}
              </p>
              <p className="text-sm font-medium">
                {formatValue(p)}{' '}
                {p.unit}
              </p>
              <Badge variant="outline" className="mt-1">
                {getConfidenceLabel(p.confidence, locale)} {t('confidence')}
              </Badge>
              {p.notes && <p className="mt-1 text-xs text-muted-foreground">{p.notes}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      {material.sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('sources')}</CardTitle>
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

