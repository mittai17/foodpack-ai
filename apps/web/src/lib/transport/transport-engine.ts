/**
 * Transport Risk Engine
 *
 * Rule-based, transparent packaging impact evaluator.
 * Takes route + weather + food properties → produces risk factors & adjustments.
 *
 * Data sources:
 *   - Food Knowledge Base (food sensitivity, storage requirements)
 *   - Open-Meteo forecast (expected temperature, humidity)
 *   - Mapbox route (distance, duration, mode)
 *
 * This engine does NOT invent precise scientific values.
 * All thresholds are clearly documented rule-based interpretations.
 */

import type {
  PackagingImpact,
  RiskFactor,
  RiskLevel,
  RouteCheckpoint,
  TransportMode,
  TransportAssessment,
  AssessmentRating,
} from './types';

// ─── Temperature Risk ──────────────────────────────────────────────────────

function evaluateTemperatureRisk(
  checkpoints: RouteCheckpoint[],
  isFreshProduce: boolean,
): RiskFactor {
  const temps = checkpoints
    .map((c) => c.temperatureC)
    .filter((t): t is number => t !== null);
  if (temps.length === 0) {
    return {
      label: 'Temperature Exposure',
      level: 'moderate',
      reason: 'Temperature data unavailable; moderate risk assumed for planning.',
      supportingInputs: ['No forecast data'],
    };
  }

  const maxTemp = Math.max(...temps);
  const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

  // Thresholds differ for fresh produce vs shelf-stable foods
  let level: RiskLevel;
  let reason: string;

  if (isFreshProduce) {
    if (maxTemp > 30) {
      level = 'high';
      reason = `Peak forecast temperature of ${maxTemp.toFixed(1)}°C substantially exceeds safe range for fresh produce (typically 0–15°C). Rapid quality loss expected without cold chain maintenance.`;
    } else if (maxTemp > 20 || avgTemp > 18) {
      level = 'moderate';
      reason = `Forecast temperatures (avg ${avgTemp.toFixed(1)}°C, peak ${maxTemp.toFixed(1)}°C) are elevated for fresh produce. Increased respiration and quality degradation risk.`;
    } else {
      level = 'low';
      reason = `Forecast temperatures (avg ${avgTemp.toFixed(1)}°C) are within an acceptable range for fresh produce transit.`;
    }
  } else {
    if (maxTemp > 40) {
      level = 'high';
      reason = `Peak forecast temperature of ${maxTemp.toFixed(1)}°C may affect product stability, accelerate oxidation, or cause packaging deformation.`;
    } else if (maxTemp > 30) {
      level = 'moderate';
      reason = `Elevated temperatures (peak ${maxTemp.toFixed(1)}°C) may affect moisture-sensitive or fat-containing products. Barrier properties of packaging should be verified.`;
    } else {
      level = 'low';
      reason = `Forecast temperatures (avg ${avgTemp.toFixed(1)}°C) are within typical ambient range. Standard packaging thermal requirements apply.`;
    }
  }

  return {
    label: 'Temperature Exposure',
    level,
    reason,
    supportingInputs: [
      `Avg forecast: ${avgTemp.toFixed(1)}°C`,
      `Peak forecast: ${maxTemp.toFixed(1)}°C`,
      `Product type: ${isFreshProduce ? 'Fresh produce' : 'Shelf-stable commodity'}`,
    ],
  };
}

// ─── Humidity Risk ─────────────────────────────────────────────────────────

function evaluateHumidityRisk(
  checkpoints: RouteCheckpoint[],
  isFreshProduce: boolean,
): RiskFactor {
  const rhs = checkpoints
    .map((c) => c.relativeHumidityPercent)
    .filter((r): r is number => r !== null);
  if (rhs.length === 0) {
    return {
      label: 'Humidity Exposure',
      level: 'moderate',
      reason: 'Humidity data unavailable; moderate risk assumed.',
      supportingInputs: ['No forecast data'],
    };
  }

  const maxRH = Math.max(...rhs);
  const avgRH = rhs.reduce((a, b) => a + b, 0) / rhs.length;

  let level: RiskLevel;
  let reason: string;

  if (isFreshProduce) {
    // Fresh produce typically benefits from higher humidity to prevent desiccation
    if (avgRH < 60) {
      level = 'high';
      reason = `Low forecast humidity (avg ${avgRH.toFixed(0)}% RH) risks moisture loss and wilting for fresh produce during transit.`;
    } else if (maxRH > 95) {
      level = 'moderate';
      reason = `Very high forecast humidity (peak ${maxRH.toFixed(0)}% RH) may promote condensation and mold growth on fresh produce.`;
    } else {
      level = 'low';
      reason = `Forecast humidity (avg ${avgRH.toFixed(0)}% RH) is within acceptable range for fresh produce.`;
    }
  } else {
    if (avgRH > 85) {
      level = 'high';
      reason = `High forecast humidity (avg ${avgRH.toFixed(0)}% RH) significantly increases moisture ingress risk for non-fresh commodities. High-barrier WVTR packaging required.`;
    } else if (avgRH > 70) {
      level = 'moderate';
      reason = `Moderate-to-high forecast humidity (avg ${avgRH.toFixed(0)}% RH) increases moisture-related packaging requirements for hygroscopic products.`;
    } else {
      level = 'low';
      reason = `Forecast humidity (avg ${avgRH.toFixed(0)}% RH) is within normal range. Standard moisture barrier packaging is appropriate.`;
    }
  }

  return {
    label: 'Humidity Exposure',
    level,
    reason,
    supportingInputs: [
      `Avg forecast: ${avgRH.toFixed(0)}% RH`,
      `Peak forecast: ${maxRH.toFixed(0)}% RH`,
      `Product type: ${isFreshProduce ? 'Fresh produce' : 'Shelf-stable commodity'}`,
    ],
  };
}

// ─── Duration Risk ─────────────────────────────────────────────────────────

function evaluateDurationRisk(
  durationMinutes: number,
  distanceKm: number,
  isFreshProduce: boolean,
): RiskFactor {
  const hours = durationMinutes / 60;
  let level: RiskLevel;
  let reason: string;

  if (isFreshProduce) {
    if (hours > 24) {
      level = 'high';
      reason = `Long transit duration (~${hours.toFixed(1)} h) for fresh produce requires controlled atmosphere or refrigerated transport to maintain quality.`;
    } else if (hours > 8) {
      level = 'moderate';
      reason = `Moderate transit duration (~${hours.toFixed(1)} h) for fresh produce. Packaging must maintain appropriate gas exchange and moisture levels throughout.`;
    } else {
      level = 'low';
      reason = `Transit duration (~${hours.toFixed(1)} h) is short for fresh produce. Standard packaging with appropriate barrier properties should be sufficient.`;
    }
  } else {
    if (hours > 48) {
      level = 'high';
      reason = `Very long transit (~${hours.toFixed(1)} h, ~${distanceKm.toFixed(0)} km) requires robust packaging with strong barrier and mechanical properties.`;
    } else if (hours > 12) {
      level = 'moderate';
      reason = `Moderate transit duration (~${hours.toFixed(1)} h). Packaging should provide adequate protection for the planned journey.`;
    } else {
      level = 'low';
      reason = `Short transit duration (~${hours.toFixed(1)} h). Standard packaging protection is appropriate.`;
    }
  }

  return {
    label: 'Transport Duration',
    level,
    reason,
    supportingInputs: [
      `Distance: ~${distanceKm.toFixed(0)} km`,
      `Estimated duration: ~${hours.toFixed(1)} h`,
      `Product type: ${isFreshProduce ? 'Fresh produce' : 'Shelf-stable commodity'}`,
    ],
  };
}

// ─── Handling / Vibration Risk ─────────────────────────────────────────────

function evaluateHandlingRisk(mode: TransportMode): RiskFactor {
  const riskMap: Record<TransportMode, { level: RiskLevel; reason: string }> = {
    road: {
      level: 'moderate',
      reason: 'Road transport involves vibration from road surface, braking, and cornering. Packaging should provide adequate mechanical protection and cushioning, particularly for fragile or bruise-sensitive items.',
    },
    rail: {
      level: 'low',
      reason: 'Rail transport generally provides stable, low-vibration movement. Mechanical packaging requirements are typically lower than road transport, though loading/unloading impacts should be considered.',
    },
    air: {
      level: 'moderate',
      reason: 'Air transport involves pressure changes, altitude-related temperature fluctuations, and loading/unloading handling. Packaging must accommodate low-pressure environments and multiple handling cycles.',
    },
    sea: {
      level: 'high',
      reason: 'Sea transport can involve significant rolling, vibration from engine, and salt-laden humid environments. Packaging requires strong mechanical integrity and moisture/corrosion resistance.',
    },
  };

  const risk = riskMap[mode];
  return {
    label: 'Handling & Vibration',
    level: risk.level,
    reason: risk.reason,
    supportingInputs: [`Transport mode: ${mode}`, 'Based on typical mode-specific vibration profiles'],
  };
}

// ─── Packaging Adjustments ─────────────────────────────────────────────────

function deriveAdjustments(
  tempRisk: RiskFactor,
  humidityRisk: RiskFactor,
  durationRisk: RiskFactor,
  handlingRisk: RiskFactor,
  mode: TransportMode,
  isFreshProduce: boolean,
): string[] {
  const adjustments: string[] = [];

  if (tempRisk.level === 'high' || tempRisk.level === 'moderate') {
    adjustments.push('Use thermal-insulating outer layer or insulated shipper to buffer temperature fluctuations');
  }
  if (humidityRisk.level === 'high') {
    adjustments.push('Specify high-barrier WVTR packaging to prevent moisture ingress during high-humidity transit');
  } else if (humidityRisk.level === 'moderate') {
    adjustments.push('Use moisture-resistant packaging with appropriate WVTR rating for the planned route conditions');
  }
  if (durationRisk.level === 'high' || durationRisk.level === 'moderate') {
    adjustments.push('Ensure packaging provides continuous protection throughout the planned transit duration');
  }
  if (handlingRisk.level === 'high') {
    adjustments.push('Strengthen mechanical protection with outer corrugated layer or rigid secondary packaging');
  } else if (handlingRisk.level === 'moderate') {
    adjustments.push('Consider cushioning inserts for vibration-sensitive or fragile products during road transit');
  }

  if (isFreshProduce) {
    adjustments.push('Evaluate Modified Atmosphere Packaging (MAP) or microperforated film to manage respiration during transit');
    adjustments.push('Ensure adequate gas exchange to prevent anaerobic conditions in sealed fresh produce packaging');
  } else {
    adjustments.push('Verify oxygen barrier (OTR) rating is adequate for the planned transit duration to prevent oxidation');
  }

  if (mode === 'sea') {
    adjustments.push('Consider moisture-absorbing desiccants inside outer packaging for sea/marine environment transit');
  }
  if (mode === 'air') {
    adjustments.push('Verify packaging integrity at reduced cabin pressure (typical aircraft hold ~75 kPa equivalent)');
  }

  // Deduplicate and return max 6
  return [...new Set(adjustments)].slice(0, 6);
}

// ─── Overall Assessment ────────────────────────────────────────────────────

function deriveAssessment(
  tempRisk: RiskFactor,
  humidityRisk: RiskFactor,
  durationRisk: RiskFactor,
  handlingRisk: RiskFactor,
): TransportAssessment {
  const risks = [tempRisk, humidityRisk, durationRisk, handlingRisk];
  const highCount = risks.filter((r) => r.level === 'high').length;
  const moderateCount = risks.filter((r) => r.level === 'moderate').length;

  let rating: AssessmentRating;
  let summary: string;
  const details: string[] = [];

  if (highCount >= 2) {
    rating = 'warning';
    summary =
      'Multiple high-risk factors identified along this route. Review packaging specifications carefully and consider cold chain or protective logistics solutions before shipment.';
  } else if (highCount === 1 || moderateCount >= 3) {
    rating = 'watch';
    summary =
      'Route conditions present some packaging challenges. Specific adjustments are recommended to ensure product integrity throughout transit. IoT monitoring during shipment is advisable.';
  } else {
    rating = 'suitable';
    summary =
      'Expected route conditions are broadly compatible with standard food transport scenarios. Apply the recommended packaging adjustments and use IoT monitoring to validate actual conditions during transit.';
  }

  if (highCount > 0) {
    details.push(
      `${highCount} high-risk factor${highCount > 1 ? 's' : ''} identified: ${risks.filter((r) => r.level === 'high').map((r) => r.label).join(', ')}.`,
    );
  }
  if (moderateCount > 0) {
    details.push(
      `${moderateCount} moderate-risk factor${moderateCount > 1 ? 's' : ''}: ${risks.filter((r) => r.level === 'moderate').map((r) => r.label).join(', ')}.`,
    );
  }
  details.push(
    'Final packaging material selection should be made using the main FoodPack AI Recommendation Engine.',
  );
  details.push(
    'This transport impact assessment is one input factor — not a standalone packaging specification.',
  );

  return { rating, summary, details };
}

// ─── Public API ────────────────────────────────────────────────────────────

export interface TransportRiskInput {
  checkpoints: RouteCheckpoint[];
  durationMinutes: number;
  distanceKm: number;
  mode: TransportMode;
  isFreshProduce: boolean;
}

export function evaluateTransportRisk(input: TransportRiskInput): PackagingImpact {
  const tempRisk = evaluateTemperatureRisk(input.checkpoints, input.isFreshProduce);
  const humidityRisk = evaluateHumidityRisk(input.checkpoints, input.isFreshProduce);
  const durationRisk = evaluateDurationRisk(
    input.durationMinutes,
    input.distanceKm,
    input.isFreshProduce,
  );
  const handlingRisk = evaluateHandlingRisk(input.mode);
  const adjustments = deriveAdjustments(
    tempRisk,
    humidityRisk,
    durationRisk,
    handlingRisk,
    input.mode,
    input.isFreshProduce,
  );

  return {
    temperatureExposure: tempRisk,
    humidityExposure: humidityRisk,
    durationExposure: durationRisk,
    handlingVibration: handlingRisk,
    adjustments,
  };
}

export function evaluateAssessment(impact: PackagingImpact): TransportAssessment {
  return deriveAssessment(
    impact.temperatureExposure,
    impact.humidityExposure,
    impact.durationExposure,
    impact.handlingVibration,
  );
}
