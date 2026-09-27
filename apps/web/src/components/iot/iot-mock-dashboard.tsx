'use client';

/**
 * IotMockDashboard
 *
 * Real-time telemetry dashboard for ESP32 post-harvest monitoring nodes.
 * Visualizes Sensirion SHT35, Winsen MH-Z19B, and ZE03-O2 sensors with
 * interactive anomaly simulation, sparkline visualizations, and instant
 * synchronization to the NutriWrap analysis wizard.
 */

import { useState, useEffect, useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Check,
  Copy,
  Cpu,
  Download,
  Gauge,
  Pause,
  Play,
  Sparkles,
  Terminal,
  Thermometer,
  Wind,
  Droplets,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SCENARIOS,
  generateInitialHistory,
  generateTick,
  formatMqttPayload,
  type SimulationScenarioId,
  type TelemetryReading,
} from '@/lib/iot/iot-mock-stream';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface IotMockDashboardProps {
  onApplyToWizard?: (reading: TelemetryReading) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export function IotMockDashboard({
  onApplyToWizard,
  isModal: _isModal = false,
  onClose,
}: IotMockDashboardProps) {
  const [scenario, setScenario] = useState<SimulationScenarioId>('optimal_cold_storage');
  const [isStreaming, setIsStreaming] = useState(true);
  const [history, setHistory] = useState<TelemetryReading[]>(() =>
    generateInitialHistory('optimal_cold_storage'),
  );
  const [copied, setCopied] = useState(false);
  const [manualTempOffset, setManualTempOffset] = useState<number>(0);

  const current = history[history.length - 1] ?? history[0];
  const activeScenario = SCENARIOS[scenario];

  // Continuous live sensor ticker
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setHistory((prev) => {
        const next = generateTick(scenario);
        if (manualTempOffset !== 0) {
          next.temperatureC = Number((next.temperatureC + manualTempOffset).toFixed(2));
        }
        return [...prev.slice(-24), next];
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isStreaming, scenario, manualTempOffset]);

  const handleScenarioChange = (id: SimulationScenarioId) => {
    setScenario(id);
    setManualTempOffset(0);
    setHistory(generateInitialHistory(id));
    toast.info(`Switched to scenario: ${SCENARIOS[id].name}`);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(formatMqttPayload(current));
    setCopied(true);
    toast.success('ESP32 telemetry JSON copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const headers = 'Timestamp,Time,Temperature_C,Humidity_RH,CO2_ppm,O2_pct,RespirationRate_mlCO2_kg_hr\n';
    const rows = history
      .map(
        (h) =>
          `${h.timestamp},${h.timeLabel},${h.temperatureC},${h.relativeHumidityPercent},${h.co2Ppm},${h.o2Percent},${h.respirationRateMlCo2PerKgPerHr}`,
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `esp32_iot_telemetry_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Telemetry CSV exported successfully');
  };

  const handleApplyToWizard = () => {
    if (onApplyToWizard) {
      onApplyToWizard(current);
      toast.success(
        `Applied IoT readings: ${current.temperatureC}°C, ${current.relativeHumidityPercent}% RH, ${current.respirationRateMlCo2PerKgPerHr} mL CO₂/kg·hr`,
      );
      if (onClose) onClose();
    }
  };

  return (
    <div className="space-y-5 text-foreground overflow-x-hidden">
      {/* ─── Top Telemetry Header ─── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <Cpu className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-base tracking-tight">ESP32-S3-LAB-01</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300 whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
              <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                MQTT TLS
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              Station: <strong className="text-foreground font-semibold">Cold Room Bay #4</strong> · Signal: -58 dBm (94% WiFi) · Sample: 2.4s
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsStreaming((s) => !s)}
            className="h-8 gap-1.5 text-xs whitespace-nowrap"
          >
            {isStreaming ? (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-500" />
                Pause Feed
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-500" />
                Resume Feed
              </>
            )}
          </Button>

          {onApplyToWizard && (
            <Button
              size="sm"
              onClick={handleApplyToWizard}
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-2xs whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Apply to Wizard
            </Button>
          )}
        </div>
      </div>

      {/* ─── Simulation Alert (if scenario has active warning) ─── */}
      {activeScenario.alert && (
        <div
          className={cn(
            'flex items-start gap-3 rounded-xl border p-3.5 text-xs animate-in fade-in-50',
            activeScenario.alert.type === 'critical'
              ? 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300'
              : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300',
          )}
        >
          {activeScenario.alert.type === 'critical' ? (
            <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          )}
          <div className="flex-1 font-medium">{activeScenario.alert.message}</div>
        </div>
      )}

      {/* ─── Live Sensor Telemetry Grid (4 Cards) ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Sensor 1: SHT35 Temperature */}
        <SensorMetricCard
          title="Temperature"
          sensor="Sensirion SHT35"
          value={`${current.temperatureC} °C`}
          targetRange="2.0 – 6.0 °C"
          status={
            current.temperatureC > 10
              ? 'critical'
              : current.temperatureC > 6
                ? 'warning'
                : 'optimal'
          }
          icon={<Thermometer className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
          badgeColor="purple"
          history={history.map((h) => h.temperatureC)}
          minVal={0}
          maxVal={20}
        />

        {/* Sensor 2: SHT35 Relative Humidity */}
        <SensorMetricCard
          title="Relative Humidity"
          sensor="Sensirion SHT35"
          value={`${current.relativeHumidityPercent} %`}
          targetRange="85 – 95 %"
          status={
            current.relativeHumidityPercent > 98
              ? 'warning'
              : current.relativeHumidityPercent < 75
                ? 'warning'
                : 'optimal'
          }
          icon={<Droplets className="h-4 w-4 text-sky-600 dark:text-sky-400" />}
          badgeColor="sky"
          history={history.map((h) => h.relativeHumidityPercent)}
          minVal={60}
          maxVal={100}
        />

        {/* Sensor 3: MH-Z19B Carbon Dioxide */}
        <SensorMetricCard
          title="Carbon Dioxide (CO₂)"
          sensor="Winsen MH-Z19B"
          value={`${current.co2Ppm.toLocaleString()} ppm`}
          subValue={`(${(current.co2Ppm / 10000).toFixed(2)}%)`}
          targetRange="2,500 – 4,500 ppm"
          status={current.co2Ppm > 8000 ? 'warning' : 'optimal'}
          icon={<Wind className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          badgeColor="blue"
          history={history.map((h) => h.co2Ppm)}
          minVal={400}
          maxVal={10000}
        />

        {/* Sensor 4: ZE03-O2 Oxygen */}
        <SensorMetricCard
          title="Oxygen (O₂)"
          sensor="Winsen ZE03-O₂"
          value={`${current.o2Percent} %`}
          targetRange="2.0 – 5.0 %"
          status={
            current.o2Percent < 1.0
              ? 'critical'
              : current.o2Percent > 15
                ? 'critical'
                : 'optimal'
          }
          icon={<Gauge className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
          badgeColor="rose"
          history={history.map((h) => h.o2Percent)}
          minVal={0}
          maxVal={21}
        />
      </div>

      {/* ─── Biological Computed Respiration Rate Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 dark:border-emerald-900/40 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold">
                R
              </span>
              <h3 className="text-sm font-semibold tracking-tight text-foreground">
                Derived Respiration Rate (R_CO₂)
              </h3>
              <Badge variant="outline" className="text-[10px] border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
                Calculated in Real-Time
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Computed from closed-system gas delta accumulation over head-space volume:
              <code className="ml-1 text-[11px] bg-background/80 px-1.5 py-0.5 rounded border border-border/60">
                Δ[CO₂] / (W_kg × Δt)
              </code>
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400">
              {current.respirationRateMlCo2PerKgPerHr}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              mL CO₂ / kg·hr
            </span>
          </div>
        </div>
      </div>

      {/* ─── Tabs: Simulation Presets, Raw MQTT Terminal, Hardware Spec ─── */}
      <Tabs defaultValue="scenarios" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/60 p-1">
          <TabsTrigger value="scenarios" className="text-xs">
            Simulation Presets
          </TabsTrigger>
          <TabsTrigger value="terminal" className="text-xs">
            MQTT Stream
          </TabsTrigger>
          <TabsTrigger value="specs" className="text-xs">
            Sensors Specs
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Simulation Scenarios */}
        <TabsContent value="scenarios" className="space-y-4 pt-3">
          <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold">Active Simulation Scenario</h4>
                <p className="text-xs text-muted-foreground">
                  Simulate live storage chamber anomalies or standard controlled conditions.
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {activeScenario.name}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.keys(SCENARIOS) as SimulationScenarioId[]).map((scId) => {
                const item = SCENARIOS[scId];
                const active = scenario === scId;
                return (
                  <button
                    key={scId}
                    type="button"
                    onClick={() => handleScenarioChange(scId)}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-all',
                      active
                        ? 'border-emerald-600 bg-emerald-50/30 ring-1 ring-emerald-600/30 dark:border-emerald-500 dark:bg-emerald-950/20'
                        : 'border-border/80 bg-card hover:bg-secondary/30',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{item.name}</span>
                      {active && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                      {item.tagline}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                      <span>{item.baseTemp}°C</span>·<span>{item.baseRH}% RH</span>·
                      <span>{item.baseCO2}ppm</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Raw MQTT Terminal */}
        <TabsContent value="terminal" className="space-y-3 pt-3">
          <div className="rounded-2xl border border-border/80 bg-neutral-950 p-4 font-mono text-neutral-100 shadow-md">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>topic: nutriwrap/lab-01/esp32/telemetry</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopyJson}
                  className="h-7 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDownloadCsv}
                  className="h-7 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export CSV
                </Button>
              </div>
            </div>

            <pre className="max-h-64 overflow-y-auto text-[11px] leading-relaxed text-emerald-400/90 scrollbar-thin">
              {formatMqttPayload(current)}
            </pre>
          </div>
        </TabsContent>

        {/* Tab 3: Hardware Specifications */}
        <TabsContent value="specs" className="space-y-3 pt-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400 font-semibold text-xs">
                <Thermometer className="h-3.5 w-3.5" />
                <span>Sensirion SHT35</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Premium digital temp &amp; humidity sensor. Accuracy: ±0.1°C, ±1.5% RH. I2C Interface at address <code>0x45</code>.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold text-xs">
                <Wind className="h-3.5 w-3.5" />
                <span>Winsen MH-Z19B</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Non-Dispersive Infrared (NDIR) CO₂ chamber with gold-plated optics. UART 9600 baud communication. Range: 0–10,000 ppm.
              </p>
            </div>

            <div className="rounded-xl border border-border/80 bg-card p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold text-xs">
                <Gauge className="h-3.5 w-3.5" />
                <span>Winsen ZE03-O₂</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Electrochemical fuel cell oxygen sensor. Analog DAC output calibrated for hypoxia (&lt;1%) through atmospheric (20.9%).
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Metric Card Component with Pure SVG Sparkline ────────────────────────────

interface SensorMetricCardProps {
  title: string;
  sensor: string;
  value: string;
  subValue?: string;
  targetRange: string;
  status: 'optimal' | 'warning' | 'critical';
  icon: React.ReactNode;
  badgeColor: 'purple' | 'sky' | 'blue' | 'rose';
  history: number[];
  minVal: number;
  maxVal: number;
}

function SensorMetricCard({
  title,
  sensor,
  value,
  subValue,
  targetRange,
  status,
  icon,
  history,
  minVal,
  maxVal,
}: SensorMetricCardProps) {
  // Compute SVG Sparkline points
  const sparklinePoints = useMemo(() => {
    if (history.length < 2) return '';
    const width = 120;
    const height = 32;
    const range = maxVal - minVal || 1;

    return history
      .map((val, idx) => {
        const x = (idx / (history.length - 1)) * width;
        const normalized = (val - minVal) / range;
        const y = height - Math.max(0, Math.min(1, normalized)) * height;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [history, minVal, maxVal]);

  const statusBadge = {
    optimal: {
      text: 'In Range',
      class: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/40 dark:text-emerald-300',
    },
    warning: {
      text: 'Warning',
      class: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300',
    },
    critical: {
      text: 'Out of Spec',
      class: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300',
    },
  }[status];

  return (
    <Card className="overflow-hidden border-border/80 shadow-2xs bg-card">
      <CardContent className="p-3.5 sm:p-4 space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/80">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold leading-tight truncate">{title}</p>
              <p className="text-[10px] text-muted-foreground truncate">{sensor}</p>
            </div>
          </div>
          <span
            className={cn(
              'rounded-full border px-1.5 py-0.5 text-[9px] font-medium whitespace-nowrap shrink-0',
              statusBadge.class,
            )}
          >
            {statusBadge.text}
          </span>
        </div>

        {/* Big Value Display */}
        <div className="flex items-baseline justify-between pt-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-foreground whitespace-nowrap">{value}</span>
            {subValue && (
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{subValue}</span>
            )}
          </div>
        </div>

        {/* Live Sparkline Chart */}
        <div className="h-8 w-full pt-0.5">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 120 32" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                'transition-all duration-300',
                status === 'critical'
                  ? 'text-rose-500'
                  : status === 'warning'
                    ? 'text-amber-500'
                    : 'text-emerald-500',
              )}
              points={sparklinePoints}
            />
          </svg>
        </div>

        {/* Target Range Subtitle */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-2 gap-2">
          <span className="shrink-0">Target:</span>
          <span className="font-mono font-medium text-foreground whitespace-nowrap shrink-0">{targetRange}</span>
        </div>
      </CardContent>
    </Card>
  );
}
