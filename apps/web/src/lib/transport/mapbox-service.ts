/**
 * Mapbox Service
 *
 * Handles geocoding (location search/autocomplete) and routing.
 * Only uses the public Mapbox access token — safe for browser use.
 *
 * Data source: Mapbox (geocoding + routing)
 */

import type { GeocodingSuggestion, GeoLocation, TransportMode, TransportRoute, RouteCheckpoint } from './types';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';
const GEOCODING_BASE = 'https://api.mapbox.com/search/geocode/v6';
const DIRECTIONS_BASE = 'https://api.mapbox.com/directions/v5/mapbox';

/** Mapbox routing profile for each transport mode */
function routingProfile(mode: TransportMode): string {
  switch (mode) {
    case 'road': return 'driving';
    case 'rail': return 'driving'; // No dedicated rail profile — marked as estimated
    case 'air': return 'driving';  // Haversine fallback used instead
    case 'sea': return 'driving';  // Haversine fallback used instead
    default: return 'driving';
  }
}

/** Haversine great-circle distance in km */
function haversineKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Average speed (km/h) used for duration estimation when not using road routing */
const SPEED_KMH: Record<TransportMode, number> = {
  road: 60,
  rail: 80,
  air: 800,
  sea: 30,
};

/**
 * Geocode / autocomplete a location query.
 * Returns up to 5 suggestions ranked by relevance.
 */
export async function geocodeLocation(query: string): Promise<GeocodingSuggestion[]> {
  if (!query.trim() || !TOKEN) return [];

  const url = new URL(`${GEOCODING_BASE}/forward`);
  url.searchParams.set('q', query);
  url.searchParams.set('access_token', TOKEN);
  url.searchParams.set('limit', '5');
  url.searchParams.set('types', 'place,locality,region,country,address');
  url.searchParams.set('language', 'en');

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Mapbox geocoding error: ${res.status}`);
  const json = await res.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (json.features ?? []).map((f: any) => ({
    id: f.id ?? f.properties?.mapbox_id ?? Math.random().toString(),
    name: f.properties?.name ?? f.place_name ?? '',
    fullName: f.properties?.full_address ?? f.place_name ?? '',
    latitude: f.geometry?.coordinates?.[1] ?? 0,
    longitude: f.geometry?.coordinates?.[0] ?? 0,
  }));
}

/**
 * Calculate a route between source and destination using Mapbox Directions API.
 * For modes where Mapbox has no specific profile (rail, air, sea),
 * falls back to a straight-line distance + speed estimate, clearly marked.
 */
export async function getRoute(
  source: GeoLocation,
  destination: GeoLocation,
  mode: TransportMode,
  departureTime: string,
): Promise<TransportRoute> {
  const useRoadRouting = mode === 'road';

  if (useRoadRouting && TOKEN) {
    try {
      const profile = routingProfile(mode);
      const coords = `${source.longitude},${source.latitude};${destination.longitude},${destination.latitude}`;
      const url = new URL(`${DIRECTIONS_BASE}/${profile}/${coords}`);
      url.searchParams.set('access_token', TOKEN);
      url.searchParams.set('geometries', 'geojson');
      url.searchParams.set('overview', 'full');
      url.searchParams.set('steps', 'false');

      const res = await fetch(url.toString(), { signal: AbortSignal.timeout(12000) });
      if (!res.ok) throw new Error(`Mapbox directions error: ${res.status}`);
      const json = await res.json();
      const route = json.routes?.[0];
      if (!route) throw new Error('No route returned');

      const distanceKm = route.distance / 1000;
      const durationMinutes = route.duration / 60;
      const geometry: [number, number][] = route.geometry?.coordinates ?? [];

      const checkpoints = buildCheckpoints(
        source, destination, geometry, distanceKm, durationMinutes, departureTime,
      );

      return {
        distanceKm,
        durationMinutes,
        geometry,
        checkpoints,
        routingMethod: 'mapbox',
      };
    } catch (_err) {
      // Fall through to estimated routing
    }
  }

  // ── Estimated routing (rail / air / sea / fallback) ──────────────────────
  const distanceKm = haversineKm(source.latitude, source.longitude, destination.latitude, destination.longitude);
  const speed = SPEED_KMH[mode];
  const durationMinutes = (distanceKm / speed) * 60;

  // Straight-line geometry with interpolated intermediate points
  const geometry = interpolateGeometry(
    [source.longitude, source.latitude],
    [destination.longitude, destination.latitude],
    20,
  );

  const checkpoints = buildCheckpoints(
    source, destination, geometry, distanceKm, durationMinutes, departureTime,
  );

  return {
    distanceKm,
    durationMinutes,
    geometry,
    checkpoints,
    routingMethod: 'estimated',
  };
}

/**
 * Interpolate geometry points along a great-circle path.
 */
function interpolateGeometry(
  start: [number, number],
  end: [number, number],
  steps: number,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push([
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
    ]);
  }
  return pts;
}

/**
 * Build 3–5 representative checkpoints along the route geometry.
 * Weather will be fetched for each checkpoint separately.
 */
function buildCheckpoints(
  source: GeoLocation,
  destination: GeoLocation,
  geometry: [number, number][],
  totalDistanceKm: number,
  totalDurationMinutes: number,
  departureTime: string,
): RouteCheckpoint[] {
  const departure = new Date(departureTime);
  const CHECKPOINT_COUNT = 4; // source + 2 intermediate + destination
  const checkpoints: RouteCheckpoint[] = [];

  for (let i = 0; i < CHECKPOINT_COUNT; i++) {
    const fraction = i / (CHECKPOINT_COUNT - 1);
    const geomIdx = Math.round(fraction * (geometry.length - 1));
    const coord = geometry[geomIdx] ?? [source.longitude, source.latitude];
    const distFromSource = fraction * totalDistanceKm;
    const minutesElapsed = fraction * totalDurationMinutes;
    const arrival = new Date(departure.getTime() + minutesElapsed * 60_000);

    const isSource = i === 0;
    const isDestination = i === CHECKPOINT_COUNT - 1;

    checkpoints.push({
      name: isSource ? source.name : isDestination ? destination.name : `Checkpoint ${i}`,
      latitude: coord[1],
      longitude: coord[0],
      distanceFromSourceKm: Math.round(distFromSource),
      estimatedArrival: arrival.toISOString(),
      weatherDataSource: 'Open-Meteo',
      temperatureC: null,
      relativeHumidityPercent: null,
      precipitationProbabilityPercent: null,
      windSpeedKmh: null,
    });
  }

  return checkpoints;
}
