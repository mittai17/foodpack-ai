/**
 * IoT Service — Transport Module
 *
 * Reads the latest simulated (or real) ESP32 telemetry for
 * the IoT Validation During Transit section.
 *
 * Reuses the existing NutriWrap IoT mock infrastructure.
 * Data source: ESP32 (SHT35 + MH-Z19B + ZE03-O₂) — Simulated when not connected.
 */

import { generateTick } from '@/lib/iot/iot-mock-stream';
import type { IoTValidationSnapshot } from './types';

/** Expected temperature range during transit (°C) — from Open-Meteo / reference */
interface ExpectedConditions {
  tempMin: number;
  tempMax: number;
  rhMin: number;
  rhMax: number;
}

function statusFor(
  value: number,
  min: number,
  max: number,
  tolerance = 0.2,
): 'normal' | 'watch' | 'warning' {
  const range = max - min;
  const low = min - range * tolerance;
  const high = max + range * tolerance;
  if (value >= min && value <= max) return 'normal';
  if (value >= low && value <= high) return 'watch';
  return 'warning';
}

/**
 * Snapshot current IoT sensor readings.
 * Always clearly marks source as 'simulated' since no live ESP32 is connected
 * in the transport context. When a real hardware bridge is added, update source.
 */
export function getIoTSnapshot(expected?: ExpectedConditions): IoTValidationSnapshot {
  const reading = generateTick('optimal_cold_storage');

  const tempMin = expected?.tempMin ?? 0;
  const tempMax = expected?.tempMax ?? 35;
  const rhMin = expected?.rhMin ?? 40;
  const rhMax = expected?.rhMax ?? 90;

  return {
    temperatureC: reading.temperatureC,
    relativeHumidityPercent: reading.relativeHumidityPercent,
    co2Ppm: reading.co2Ppm,
    o2Percent: reading.o2Percent,
    timestamp: reading.timestamp,
    source: 'simulated',
    status: {
      temperature: statusFor(reading.temperatureC, tempMin, tempMax),
      humidity: statusFor(reading.relativeHumidityPercent, rhMin, rhMax),
      co2: reading.co2Ppm < 5000 ? 'normal' : reading.co2Ppm < 8000 ? 'watch' : 'warning',
      o2: reading.o2Percent > 1.5 ? 'normal' : reading.o2Percent > 0.8 ? 'watch' : 'warning',
    },
  };
}
