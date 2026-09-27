'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFood } from '@/hooks/use-foods';
import { formatValue } from '@/lib/format-value';
import { getFoodEmoji } from '@/lib/food-icons';
import {
  getFoodName,
  getCategoryName,
  getPropertyName,
  getConfidenceLabel,
  getStorageLabel,
} from '@/lib/i18n-helpers';

export function FoodDetail({ slug }: { slug: string }) {
  const { data: food, isLoading } = useFood(slug);
  const locale = useLocale();
  const t = useTranslations('foods');

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (!food) return <p className="text-sm text-muted-foreground">{t('foodNotFound')}</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-3xl">
            {getFoodEmoji(food.slug, food.category.slug)}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{getCategoryName(food.category, locale)}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{getFoodName(food, locale)}</h1>
            {food.scientificName && (
              <p className="text-sm italic text-muted-foreground">{food.scientificName}</p>
            )}
            {food.commonNames.length > 0 && (
              <p className="text-xs text-muted-foreground">{t('alsoKnownAs')}: {food.commonNames.join(', ')}</p>
            )}
          </div>
        </div>
        <Button
          nativeButton={false}
          render={
            <Link href={`/analysis/new?food=${food.slug}`}>
              {t('analyzePackagingFor', { name: getFoodName(food, locale) })}
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>

      {food.description && <p className="text-sm text-muted-foreground">{food.description}</p>}

      <Card>
        <CardHeader>
          <CardTitle>{t('properties')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {food.properties.length === 0 && (
            <p className="text-sm text-muted-foreground">{t('insufficientData')}</p>
          )}
          {food.properties.map((p, i) => (
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
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('storageConditions')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {food.storageConditions.map((s, i) => (
            <div key={i} className="rounded-lg border border-border px-3 py-2">
              <p className="text-sm font-medium">{getStorageLabel(s.storageType, locale)}</p>
              <p className="text-xs text-muted-foreground">
                {s.minTempC ?? '—'}–{s.maxTempC ?? '—'}°C
                {(s.minRH || s.maxRH) && ` · ${s.minRH ?? '—'}–${s.maxRH ?? '—'}% RH`}
              </p>
              {s.notes && <p className="mt-1 text-xs text-muted-foreground">{s.notes}</p>}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('shelfLifeReference')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {food.shelfLifeData.map((s, i) => (
            <div key={i} className="rounded-lg border border-border px-3 py-2">
              <p className="text-sm font-medium">{getStorageLabel(s.storageType, locale)}</p>
              <p className="text-xs text-muted-foreground">
                {s.minDays ?? '—'}–{s.maxDays ?? '—'} {t('days')} · {s.packagingContext}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {food.sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('sources')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {food.sources.map((s) => (
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

