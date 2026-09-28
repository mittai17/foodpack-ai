import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Truck } from 'lucide-react';
import { TransportDashboard } from './transport-dashboard';

export const metadata: Metadata = {
  title: 'Transport Analysis — NutriWrap',
  description:
    'Analyse transportation routes and environmental conditions to support safe food delivery with optimised packaging.',
};

export default function TransportPage() {
  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transport Analysis</h1>
            <p className="text-xs text-muted-foreground">
              Analyse the transportation route and environmental conditions to get optimised packaging recommendations.
            </p>
          </div>
        </div>

        {/* Info callout */}
        <div className="flex max-w-sm items-start gap-2.5 rounded-xl border border-border bg-accent/50 p-3 text-xs text-accent-foreground">
          <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary">
            <span className="text-[10px] font-bold">i</span>
          </div>
          <p className="leading-relaxed">
            Transportation conditions like distance, temperature, humidity and duration can affect food quality.
            This module analyses the route and provides packaging insights for safe delivery.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="h-[520px] animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-[520px] animate-pulse rounded-2xl bg-muted/40" />
            <div className="h-[520px] animate-pulse rounded-2xl bg-muted/40" />
          </div>
        }
      >
        <TransportDashboard />
      </Suspense>
    </div>
  );
}
