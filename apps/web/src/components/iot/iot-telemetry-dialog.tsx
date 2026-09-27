'use client';

/**
 * IotTelemetryDialog
 *
 * Modal dialog wrapping the IotMockDashboard when opened from the wizard's
 * "View Live Data →" button.
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { IotMockDashboard } from './iot-mock-dashboard';
import type { TelemetryReading } from '@/lib/iot/iot-mock-stream';

interface IotTelemetryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyReadings?: (reading: TelemetryReading) => void;
}

export function IotTelemetryDialog({
  open,
  onOpenChange,
  onApplyReadings,
}: IotTelemetryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        style={{ maxWidth: '68rem', width: '94vw' }}
        className="max-h-[92vh] overflow-y-auto overflow-x-hidden p-5 sm:p-7 rounded-2xl border border-border bg-card shadow-2xl"
      >
        <DialogHeader className="mb-2 space-y-1">
          <DialogTitle className="text-xl font-bold tracking-tight">
            ESP32 Live IoT Sensor Telemetry
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Real-time environmental monitoring node streaming SHT35, MH-Z19B, and ZE03-O₂ sensor data.
          </DialogDescription>
        </DialogHeader>

        <IotMockDashboard
          isModal
          onClose={() => onOpenChange(false)}
          onApplyToWizard={onApplyReadings}
        />
      </DialogContent>
    </Dialog>
  );
}
