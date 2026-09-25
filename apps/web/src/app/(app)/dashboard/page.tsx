'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, Layers, PlusCircle, Sparkles, Sprout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryPills } from '@/components/food/category-pills';
import { QuickStart } from '@/components/dashboard/quick-start';
import { useAnalyses } from '@/hooks/use-analysis';
import { useFoods } from '@/hooks/use-foods';
import { useProjects } from '@/hooks/use-projects';
import { getFoodEmoji } from '@/lib/food-icons';
import { STORAGE_LABELS } from '@foodpack/shared';

const QUICK_ACTIONS = [
  { label: 'New Analysis', href: '/analysis/new', icon: PlusCircle },
  { label: 'Food Database', href: '/foods', icon: Sprout },
  { label: 'Packaging Materials', href: '/materials', icon: Layers },
  { label: 'Reports', href: '/reports', icon: FileText },
];

export default function DashboardPage() {
  const [category, setCategory] = useState<string | undefined>();
  const { data: foods } = useFoods({ category });
  const { data: analyses, isLoading: analysesLoading } = useAnalyses();
  const { data: projects } = useProjects();

  const commoditiesAnalyzed = new Set((analyses?.items ?? []).map((a) => a.food.id)).size;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary/95 to-primary text-primary-foreground">
        <div className="flex flex-col gap-5 p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl space-y-3">
            <Badge variant="secondary" className="bg-white/15 text-white border-0">
              <Sparkles className="h-3 w-3" />
              AI-assisted, science-backed
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Welcome back. Better Packaging for a Healthier Tomorrow.
            </h1>
            <p className="text-sm text-primary-foreground/85 md:text-base">
              Select your food, answer a few simple questions, and get a scientific packaging
              recommendation with technical specs, cost, and sustainability insight.
            </p>
          </div>
          <Button
            size="lg"
            nativeButton={false}
            className="bg-white text-primary hover:bg-white/90 shrink-0"
            render={
              <Link href="/analysis/new">
                New Packaging Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Analyses run" value={analyses?.pagination.total ?? 0} />
        <StatCard label="Saved projects" value={projects?.length ?? 0} />
        <StatCard label="Commodities analyzed" value={commoditiesAnalyzed} />
        <StatCard label="Reports generated" value={0} />
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">What are you packaging?</h2>
          <Link href="/foods" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mb-3">
          <CategoryPills value={category} onChange={setCategory} />
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-8">
          {(foods?.items ?? []).slice(0, 8).map((food) => (
            <Link key={food.id} href={`/analysis/new?food=${food.slug}`}>
              <Card className="items-center gap-2 py-4 text-center transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-center gap-2 px-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg">
                    {getFoodEmoji(food.slug, food.category.slug)}
                  </div>
                  <p className="text-xs font-medium leading-tight">{food.name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <QuickStart />

        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent analyses</CardTitle>
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
                  No analyses yet — start your first packaging analysis.
                </p>
              )}
              {(analyses?.items ?? []).slice(0, 6).map((a) => (
                <Link
                  key={a.id}
                  href={`/analysis/${a.id}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-secondary/40"
                >
                  <div>
                    <p className="font-medium">{a.food.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {STORAGE_LABELS[a.storageType]} · {a.targetShelfLifeDays} days target
                    </p>
                  </div>
                  <Badge variant={a.status === 'COMPLETED' ? 'default' : a.status === 'FAILED' ? 'destructive' : 'secondary'}>
                    {a.status}
                  </Badge>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border px-3 py-4 text-center text-xs font-medium transition-colors hover:bg-secondary/40"
                >
                  <action.icon className="h-5 w-5 text-primary" />
                  {action.label}
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
