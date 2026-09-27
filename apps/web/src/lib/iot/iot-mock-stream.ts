/**
 * IoT Mock Telemetry & ESP32 Streaming Service
 *
 * Simulates high-precision environmental sensors deployed in post-harvest
 * storage and intelligent food packaging labs:
 *   - Sensirion SHT35 (High-Accuracy Temperature & Relative Humidity)
 *   - Winsen MH-Z19B (NDIR Carbon Dioxide Sensor)
 *   - Winsen ZE03-O2 (Electrochemical Oxygen Sensor)
 *
 * Dynamically computes physiological fruit/vegetable respiration rate (R_CO2)
 * and generates realistic MQTT payloads with configurable anomaly presets.
 */

export type SimulationScenarioId =
  | 'optimal_cold_storage'
  | 'cold_chain_break'
  | 'high_respiration'
  | 'condensation_surge'
  | 'map_leak';

export interface TelemetryReading {
  timestamp: string;
  timeLabel: string;
  temperatureC: number;
  relativeHumidityPercent: number;
  co2Ppm: number;
  o2Percent: number;
  respirationRateMlCo2PerKgPerHr: number;
}

export interface ScenarioDef {
  id: SimulationScenarioId;
  name: string;
  tagline: string;
  baseTemp: number;
  baseRH: number;
  baseCO2: number;
  baseO2: number;
  baseRespiration: number;
  alert?: {
    type: 'critical' | 'warning' | 'info';
    message: string;
  };
}

export const SCENARIOS: Record<SimulationScenarioId, ScenarioDef> = {
  optimal_cold_storage: {
    id: 'optimal_cold_storage',
    name: 'Optimal Cold Storage',
    tagline: 'Standard chilled storage with controlled MAP atmosphere',
    baseTemp: 4.1,
    baseRH: 89.2,
    baseCO2: 3250,
    baseO2: 3.2,
    baseRespiration: 28.5,
  },
  cold_chain_break: {
    id: 'cold_chain_break',
    name: 'Cold Chain Break',
    tagline: 'Thermal abuse during transit / refrigerated vehicle failure',
    baseTemp: 14.8,
    baseRH: 74.0,
    baseCO2: 7900,
    baseO2: 1.8,
    baseRespiration: 58.2,
    alert: {
      type: 'critical',
      message: 'CRITICAL: Temperature spike (+10.7°C above target). Accelerated decay and respiration underway.',
    },
  },
  high_respiration: {
    id: 'high_respiration',
    name: 'High Respiration / Peak Ripening',
    tagline: 'Climacteric fruit respiration burst consuming oxygen rapidly',
    baseTemp: 6.5,
    baseRH: 92.0,
    baseCO2: 9200,
    baseO2: 0.9,
    baseRespiration: 68.0,
    alert: {
      type: 'warning',
      message: 'WARNING: Sub-critical oxygen level (0.9% < 1.0% threshold). Risk of anaerobic fermentation and ethanol synthesis.',
    },
  },
  condensation_surge: {
    id: 'condensation_surge',
    name: 'Condensation & Humidity Surge',
    tagline: 'Vapor saturation inside pack causing free water condensation',
    baseTemp: 3.5,
    baseRH: 98.8,
    baseCO2: 3400,
    baseO2: 3.0,
    baseRespiration: 31.0,
    alert: {
      type: 'warning',
      message: 'WARNING: Relative humidity exceeds 98%. Condensation drops likely to trigger surface mold and Botrytis cinerea.',
    },
  },
  map_leak: {
    id: 'map_leak',
    name: 'MAP Package Seal Defect / Leak',
    tagline: 'Pinhole or seam breach allowing atmospheric air equilibration',
    baseTemp: 4.5,
    baseRH: 82.0,
    baseCO2: 850,
    baseO2: 18.5,
    baseRespiration: 36.0,
    alert: {
      type: 'critical',
      message: 'ALERT: Atmospheric air ingress detected. O₂ risen to 18.5% and CO₂ lost. Barrier loss detected.',
    },
  },
};

/** Adds small realistic physical sensor noise */
function jitter(base: number, maxSpread: number): number {
  const noise = (Math.random() - 0.5) * 2 * maxSpread;
  return Number((base + noise).toFixed(2));
}

/** Formats current time into HH:MM:SS */
function getTimeString(date = new Date()): string {
  return date.toTimeString().split(' ')[0];
}

/** Generates initial buffer of 15 readings for charts */
export function generateInitialHistory(scenario: SimulationScenarioId = 'optimal_cold_storage'): TelemetryReading[] {
  const target = SCENARIOS[scenario];
  const items: TelemetryReading[] = [];
  const now = Date.now();

  for (let i = 15; i >= 0; i--) {
    const timestamp = new Date(now - i * 3000);
    items.push({
      timestamp: timestamp.toISOString(),
      timeLabel: getTimeString(timestamp),
      temperatureC: jitter(target.baseTemp, 0.08),
      relativeHumidityPercent: jitter(target.baseRH, 0.25),
      co2Ppm: Math.round(jitter(target.baseCO2, 25)),
      o2Percent: jitter(target.baseO2, 0.05),
      respirationRateMlCo2PerKgPerHr: jitter(target.baseRespiration, 0.35),
    });
  }

  return items;
}

/** Generates a single live tick */
export function generateTick(scenario: SimulationScenarioId): TelemetryReading {
  const target = SCENARIOS[scenario];
  const date = new Date();
  return {
    timestamp: date.toISOString(),
    timeLabel: getTimeString(date),
    temperatureC: jitter(target.baseTemp, 0.08),
    relativeHumidityPercent: Math.min(100, Math.max(0, jitter(target.baseRH, 0.25))),
    co2Ppm: Math.max(350, Math.round(jitter(target.baseCO2, 25))),
    o2Percent: Math.max(0.1, Math.min(21, jitter(target.baseO2, 0.05))),
    respirationRateMlCo2PerKgPerHr: Math.max(1, jitter(target.baseRespiration, 0.35)),
  };
}

/** Formats an ESP32 raw MQTT payload JSON string */
export function formatMqttPayload(reading: TelemetryReading, deviceId = 'ESP32-S3-LAB-01'): string {
  return JSON.stringify(
    {
      device_id: deviceId,
      firmware: 'NutriWrap-Node-v2.4.1',
      protocol: 'MQTT/TLS v1.3',
      timestamp: reading.timestamp,
      signal_rssi_dbm: -58,
      battery_voltage: '5.02V (USB-C)',
      sensors: {
        sht35: {
          temperature_c: reading.temperatureC,
          relative_humidity_pct: reading.relativeHumidityPercent,
          bus: 'I2C_0x45',
          status: 'OK',
        },
        mhz19b: {
          co2_ppm: reading.co2Ppm,
          interface: 'UART_9600',
          status: 'OK',
        },
        ze03_o2: {
          o2_pct: reading.o2Percent,
          interface: 'DAC_ANALOG',
          status: 'OK',
        },
      },
      computed: {
        respiration_rate_ml_co2_kg_hr: reading.respirationRateMlCo2PerKgPerHr,
        method: 'closed_system_gas_accumulation',
      },
    },
    null,
    2,
  );
}
