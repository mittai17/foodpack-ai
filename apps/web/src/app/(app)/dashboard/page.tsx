'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Layers, Leaf, Package, PlusCircle, Sparkles, Sprout } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryPills } from '@/components/food/category-pills';
import { useAnalyses } from '@/hooks/use-analysis';
import { useFoods } from '@/hooks/use-foods';
import { useProjects } from '@/hooks/use-projects';
import { getFoodEmoji } from '@/lib/food-icons';
import { getFoodName, getStorageLabel, getStatusLabel } from '@/lib/i18n-helpers';

export default function DashboardPage() {
  const [category, setCategory] = useState<string | undefined>();
  const { data: foods } = useFoods({ category });
  const { data: analyses, isLoading: analysesLoading } = useAnalyses();
  const { data: projects } = useProjects();
  const tc = useTranslations('common');
  const t = useTranslations('dashboard');
  const tn = useTranslations('navigation');
  const locale = useLocale();

  const commoditiesAnalyzed = new Set((analyses?.items ?? []).map((a) => a.food.id)).size;

  const QUICK_ACTIONS = [
    { labelKey: 'newAnalysis', href: '/analysis/new', icon: PlusCircle },
    { labelKey: 'foodDatabase', href: '/foods', icon: Sprout },
    { labelKey: 'packagingMaterials', href: '/materials', icon: Layers },
    { labelKey: 'reports', href: '/reports', icon: FileText },
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 to-primary text-primary-foreground">
        <div className="flex flex-col gap-5 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl space-y-3">
            <Badge variant="secondary" className="bg-white/15 text-white border-0">
              <Sparkles className="h-3 w-3" />
              {t('heroBadge')}
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {t('heroTitle')}
            </h1>
            <p className="text-sm text-primary-foreground/85 md:text-base">
              {t('heroSubtitle')}
            </p>
          </div>
          <Button
            size="lg"
            nativeButton={false}
            className="bg-white text-primary hover:bg-white/90 shrink-0"
            render={
              <Link href="/analysis/new">
                {t('newAnalysisBtn')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label={t('analysesRun')} value={analyses?.pagination.total ?? 0} />
        <StatCard label={t('savedProjects')} value={projects?.length ?? 0} />
        <StatCard label={t('commoditiesAnalyzed')} value={commoditiesAnalyzed} />
        <StatCard label={t('reportsGenerated')} value={0} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">{t('whatAreYouPackaging')}</h2>
          <Link href="/foods" className="text-sm font-medium text-primary hover:underline">
            {tc('viewAll')}
          </Link>
        </div>
        <div className="mb-3">
          <CategoryPills value={category} onChange={setCategory} />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-8">
          {(foods?.items ?? []).slice(0, 8).map((food) => {
            // Auto-route to the correct module based on isFreshProduce
            const href = food.isFreshProduce
              ? `/analysis/new/fresh-produce?food=${food.slug}`
              : `/analysis/new/other-commodities?food=${food.slug}`;
            return (
              <Link key={food.id} href={href}>
                <Card className="items-center gap-2 py-4 text-center transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-2 px-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg">
                      {getFoodEmoji(food.slug, food.category.slug)}
                    </div>
                    <p className="text-xs font-medium leading-tight">{getFoodName(food, locale)}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {/* ── Replace QuickStart generic form with module selection cards ── */}
        <Card>
          <CardHeader>
            <CardTitle>{t('startNewAnalysis')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('startNewAnalysisDesc')}
            </p>

            {/* Fresh Produce module card */}
            <Link href="/analysis/new/fresh-produce" className="group block">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-accent/40 px-4 py-3.5 transition-all hover:border-primary/40 hover:bg-accent hover:shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg">
                  <Leaf className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">{t('freshProduceModule')}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {t('freshProduceModuleDesc')}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>

            {/* Other Commodities module card */}
            <Link href="/analysis/new/other-commodities" className="group block">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4 py-3.5 transition-all hover:border-blue-400/40 hover:bg-blue-50/60 hover:shadow-sm dark:hover:bg-blue-950/20">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white text-lg">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight">{t('otherCommoditiesModule')}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {t('otherCommoditiesModuleDesc')}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600" />
              </div>
            </Link>

            <div className="border-t pt-2">
              <Link
                href="/analysis/new"
                className="text-xs text-muted-foreground hover:text-primary hover:underline"
              >
                {t('notSureModule')}
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('recentAnalyses')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {analysesLoading && (
                <>
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </>
              )}
              {!analysesLoading && (analyses?.items.length ?? 0) === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {t('noAnalysesYet')}
                </p>
              )}
              {(analyses?.items ?? []).slice(0, 6).map((a) => {
                const moduleBadge = a.food.isFreshProduce
                  ? t('freshProduce')
                  : t('otherCommodity');
                return (
                  <Link
                    key={a.id}
                    href={`/analysis/${a.id}`}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-secondary/40"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{getFoodName(a.food, locale)}</p>
                        <span className="text-[10px] text-muted-foreground">{moduleBadge}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {getStorageLabel(a.storageType, locale)} · {a.targetShelfLifeDays} {t('daysTarget')}
                      </p>
                    </div>
                    <Badge
                      variant={
                        a.status === 'COMPLETED'
                          ? 'default'
                          : a.status === 'FAILED'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {getStatusLabel(a.status, locale)}
                    </Badge>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('quickActions')}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border px-3 py-4 text-center text-xs font-medium transition-colors hover:bg-secondary/40"
                >
                  <action.icon className="h-5 w-5 text-primary" />
                  {tn(action.labelKey)}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="px-5">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
