'use client';

/**
 * EnvironmentalDataSource
 *
 * Renders the Environmental Data Source selection block, matching the reference design:
 *   - 3 Source Options: Reference conditions, Live IoT monitoring, Both
 *   - Info callout explaining how IoT data is used
 *   - "IoT Sensors Connected" banner with SHT35, MH-Z19B, and ZE03-O₂ hardware cards
 *   - "View Live Data →" button opening real-time telemetry modal
 */

import { useState } from 'react';
import {
  Activity,
  ArrowLeftRight,
  ArrowRight,
  Database,
  HelpCircle,
  Info,
  Radio as SignalIcon,
  RefreshCw,
  Thermometer,
  Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { IotTelemetryDialog } from '@/components/iot/iot-telemetry-dialog';
import type { TelemetryReading } from '@/lib/iot/iot-mock-stream';
import type { EnvironmentalDataSource as EnvSourceType } from '@foodpack/shared';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EnvironmentalDataSourceProps {
  value: EnvSourceType;
  onChange: (value: EnvSourceType) => void;
  onApplyReadings?: (reading: TelemetryReading) => void;
}

export function EnvironmentalDataSource({
  value,
  onChange,
  onApplyReadings,
}: EnvironmentalDataSourceProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('2 min ago');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated('Just now');
      toast.success('IoT sensors status refreshed: All 3 sensors online');
    }, 600);
  };

  const isIotActive = value === 'IOT' || value === 'BOTH';

  return (
    <div className="space-y-4">
      {/* ─── Section Header & Info Callout ─── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mt-0.5">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold tracking-tight text-foreground">
                Environmental Data Source
              </h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="text-muted-foreground hover:text-foreground inline-flex items-center">
                    <HelpCircle className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Choose whether post-harvest temperature, relative humidity, and gas parameters
                    are populated from knowledge-base references or live ESP32 sensors.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose how the storage and transport environmental conditions should be obtained.
            </p>
          </div>
        </div>

        {/* Right Info Badge */}
        <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/80 px-3.5 py-2.5 text-xs text-blue-900 border border-blue-200/80 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-200 max-w-md">
          <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
          <span className="leading-relaxed">
            IoT data will be used to validate the recommended packaging conditions and monitor
            real-time storage and transportation environment.
          </span>
        </div>
      </div>

      {/* ─── 3 Option Cards ─── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Option 1: Reference */}
        <button
          type="button"
          onClick={() => onChange('REFERENCE')}
          className={cn(
            'group relative flex items-start justify-between rounded-2xl border p-4 text-left transition-all',
            value === 'REFERENCE'
              ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/20'
              : 'border-border/80 bg-card hover:border-slate-300 dark:hover:border-neutral-700',
          )}
        >
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <Database
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0 transition-colors',
                value === 'REFERENCE'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-700 dark:text-muted-foreground',
              )}
            />
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground tracking-tight">
                Reference conditions
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Use NutriWrap database values
              </span>
            </div>
          </div>
          <div
            className={cn(
              'ml-2 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all',
              value === 'REFERENCE'
                ? 'border-2 border-emerald-600 dark:border-emerald-500'
                : 'border border-slate-300 dark:border-neutral-600',
            )}
          >
            {value === 'REFERENCE' && (
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-in zoom-in-50 duration-150" />
            )}
          </div>
        </button>

        {/* Option 2: Live IoT monitoring */}
        <button
          type="button"
          onClick={() => onChange('IOT')}
          className={cn(
            'group relative flex items-start justify-between rounded-2xl border p-4 text-left transition-all',
            value === 'IOT'
              ? 'border-emerald-600 bg-emerald-50/20 shadow-xs ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/20'
              : 'border-border/80 bg-card hover:border-slate-300 dark:hover:border-neutral-700',
          )}
        >
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <Wifi
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0 transition-colors',
                value === 'IOT'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-700 dark:text-muted-foreground',
              )}
            />
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground tracking-tight">
                Live IoT monitoring
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Use ESP32 sensor readings
              </span>
            </div>
          </div>
          <div
            className={cn(
              'ml-2 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all',
              value === 'IOT'
                ? 'border-2 border-emerald-600 dark:border-emerald-500'
                : 'border border-slate-300 dark:border-neutral-600',
            )}
          >
            {value === 'IOT' && (
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-in zoom-in-50 duration-150" />
            )}
          </div>
        </button>

        {/* Option 3: Both */}
        <button
          type="button"
          onClick={() => onChange('BOTH')}
          className={cn(
            'group relative flex items-start justify-between rounded-2xl border p-4 text-left transition-all',
            value === 'BOTH'
              ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/20'
              : 'border-border/80 bg-card hover:border-slate-300 dark:hover:border-neutral-700',
          )}
        >
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <ArrowLeftRight
              className={cn(
                'mt-0.5 h-5 w-5 shrink-0 transition-colors',
                value === 'BOTH'
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-700 dark:text-muted-foreground',
              )}
            />
            <div className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-foreground tracking-tight">
                Both
              </span>
              <span className="block text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Compare reference and live sensor readings
              </span>
            </div>
          </div>
          <div
            className={cn(
              'ml-2 mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all',
              value === 'BOTH'
                ? 'border-2 border-emerald-600 dark:border-emerald-500'
                : 'border border-slate-300 dark:border-neutral-600',
            )}
          >
            {value === 'BOTH' && (
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-in zoom-in-50 duration-150" />
            )}
          </div>
        </button>
      </div>

      {/* ─── Connected Sensors Banner (Visible when IoT is selected) ─── */}
      {isIotActive && (
        <div className="rounded-2xl border border-emerald-200/80 bg-[#eef8f2] p-4.5 dark:border-emerald-900/50 dark:bg-emerald-950/20 animate-in fade-in-50">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center text-emerald-800 dark:text-emerald-300">
                <SignalIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                IoT Sensors Connected
              </span>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
              <span>Last updated: {lastUpdated}</span>
            </button>
          </div>

          {/* Sensors Cards Grid & Button */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center">
            {/* Card 1: SHT35 */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100/80 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300">
                <Thermometer className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  Temperature &amp; Humidity
                </p>
                <p className="text-[11px] text-muted-foreground">SHT35</p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Connected</span>
                </div>
              </div>
            </div>

            {/* Card 2: MH-Z19B */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100/80 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                <span className="font-bold text-xs tracking-tight">CO₂</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">CO₂</p>
                <p className="text-[11px] text-muted-foreground">MH-Z19B</p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Connected</span>
                </div>
              </div>
            </div>

            {/* Card 3: ZE03-O2 */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-card">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100/80 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
                <div className="flex items-baseline font-bold text-xs">
                  <span>O</span>
                  <span className="text-[9px]">₂</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground">O₂</p>
                <p className="text-[11px] text-muted-foreground">ZE03-O₂</p>
                <div className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>Connected</span>
                </div>
              </div>
            </div>

            {/* Action Button: View Live Data -> */}
            <div className="flex justify-center sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(true)}
                className="w-full sm:w-auto h-11 rounded-xl border-emerald-600 bg-white text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-500 dark:bg-card dark:text-emerald-400 dark:hover:bg-emerald-950/40 font-semibold text-xs gap-1.5 shadow-2xs"
              >
                <span>View Live Data</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Dialog ─── */}
      <IotTelemetryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onApplyReadings={onApplyReadings}
      />
    </div>
  );
}
