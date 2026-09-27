import { Suspense } from 'react';
import { IotMockDashboard } from '@/components/iot/iot-mock-dashboard';
import { Activity } from 'lucide-react';

export const metadata = {
  title: 'IoT Sensor Monitoring — NutriWrap',
  description: 'Real-time post-harvest environmental telemetry from ESP32 nodes',
};

export default function IotPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">IoT Sensor Telemetry</h1>
            <p className="text-xs text-muted-foreground">
              Live post-harvest cold storage and intelligent packaging environmental monitoring
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted/40" />}>
        <IotMockDashboard />
      </Suspense>
    </div>
  );
}
