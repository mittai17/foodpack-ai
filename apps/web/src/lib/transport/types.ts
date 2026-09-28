/**
 * Transport Analysis — Type Definitions
 *
 * Strongly-typed models for the Transport Analysis module.
 * Keeps data sources (Mapbox, Open-Meteo, IoT, Food KB) clearly separate.
 */

// ─── Transport Mode ────────────────────────────────────────────────────────
export type TransportMode = 'road' | 'rail' | 'air' | 'sea';

// ─── Named Location (Mapbox geocoding result) ──────────────────────────────
export interface GeoLocation {
  name: string;
  latitude: number;
  longitude: number;
  /** Full formatted address from Mapbox */
  fullName?: string;
}

// ─── Mapbox Geocoding Suggestion ──────────────────────────────────────────
export interface GeocodingSuggestion {
  id: string;
  name: string;
  fullName: string;
  latitude: number;
  longitude: number;
}

// ─── Route Checkpoint (per-stop data) ─────────────────────────────────────
export interface RouteCheckpoint {
  name: string;
  latitude: number;
  longitude: number;
  /** km from source */
  distanceFromSourceKm: number;
  /** ISO timestamp of estimated arrival */
  estimatedArrival: string;
  /** Data source label */
  weatherDataSource: 'Open-Meteo' | 'Simulated' | 'Reference';
  temperatureC: number | null;
  relativeHumidityPercent: number | null;
  precipitationProbabilityPercent: number | null;
  windSpeedKmh: number | null;
}

// ─── Route (from Mapbox) ──────────────────────────────────────────────────
export interface TransportRoute {
  /** km */
  distanceKm: number;
  /** minutes */
  durationMinutes: number;
  /** GeoJSON LineString coordinates [lng, lat][] */
  geometry: [number, number][];
  checkpoints: RouteCheckpoint[];
  /** Was route calculated by Mapbox routing engine or estimated? */
  routingMethod: 'mapbox' | 'estimated';
}

// ─── Risk Level ────────────────────────────────────────────────────────────
export type RiskLevel = 'low' | 'moderate' | 'high';

export interface RiskFactor {
  label: string;
  level: RiskLevel;
  reason: string;
  /** Key inputs that determined the level */
  supportingInputs: string[];
}

// ─── Packaging Impact ─────────────────────────────────────────────────────
export interface PackagingImpact {
  temperatureExposure: RiskFactor;
  humidityExposure: RiskFactor;
  durationExposure: RiskFactor;
  handlingVibration: RiskFactor;
  /** Actionable recommendations for packaging adjustments */
  adjustments: string[];
}

// ─── IoT Validation Snapshot ──────────────────────────────────────────────
export interface IoTValidationSnapshot {
  temperatureC: number;
  relativeHumidityPercent: number;
  co2Ppm: number;
  o2Percent: number;
  timestamp: string;
  /** 'real' when connected to an ESP32, 'simulated' for demo mode */
  source: 'real' | 'simulated';
  status: {
    temperature: 'normal' | 'watch' | 'warning';
    humidity: 'normal' | 'watch' | 'warning';
    co2: 'normal' | 'watch' | 'warning';
    o2: 'normal' | 'watch' | 'warning';
  };
}

// ─── Overall Assessment ───────────────────────────────────────────────────
export type AssessmentRating = 'suitable' | 'watch' | 'warning';

export interface TransportAssessment {
  rating: AssessmentRating;
  summary: string;
  details: string[];
}

// ─── Full Transport Analysis Result ───────────────────────────────────────
export interface TransportAnalysisResult {
  id: string;
  source: GeoLocation;
  destination: GeoLocation;
  transportMode: TransportMode;
  departureTime: string;
  foodSlug?: string;
  foodName?: string;
  isFreshProduce?: boolean;
  route: TransportRoute;
  packagingImpact: PackagingImpact;
  iotValidation: IoTValidationSnapshot;
  assessment: TransportAssessment;
  createdAt: string;
}

// ─── Route Input Form ─────────────────────────────────────────────────────
export interface RouteInput {
  source: GeoLocation;
  destination: GeoLocation;
  transportMode: TransportMode;
  departureTime: string;
  foodSlug?: string;
  foodName?: string;
  isFreshProduce?: boolean;
}

// ─── Analysis Step (for progress display) ─────────────────────────────────
export type AnalysisStep =
  | 'idle'
  | 'geocoding'
  | 'routing'
  | 'weather'
  | 'evaluating'
  | 'complete'
  | 'error';
