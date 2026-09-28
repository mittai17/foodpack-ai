/**
 * Weather Service
 *
 * Fetches expected environmental conditions from Open-Meteo.
 * Uses dynamically provided coordinates — never hardcoded lat/lon.
 *
 * Data source: Open-Meteo (https://api.open-meteo.com)
 * No API key required for free non-commercial use.
 *
 * IMPORTANT: Open-Meteo provides EXTERNAL environmental forecast data.
 * This does NOT represent actual package-internal conditions.
 */

import type { RouteCheckpoint } from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_OPEN_METEO_API_URL ?? 'https://api.open-meteo.com/v1/forecast';

/** Cache to avoid repeated identical requests */
const cache = new Map<string, { data: WeatherPoint; ts: number }>();
const CACHE_TTL_MS = 10 * 60_000; // 10 minutes

interface WeatherPoint {
  temperatureC: number;
  relativeHumidityPercent: number;
  precipitationProbabilityPercent: number;
  windSpeedKmh: number;
}

/**
 * Fetch weather forecast for a single lat/lon coordinate.
 * Caches results to avoid excessive API calls.
 */
async function fetchWeatherForCoord(lat: number, lon: number): Promise<WeatherPoint | null> {
  const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = new URL(BASE_URL);
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lon.toFixed(4));
  url.searchParams.set(
    'hourly',
    'temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m',
  );
  url.searchParams.set('forecast_days', '3');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('wind_speed_unit', 'kmh');

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const json = await res.json();

    const hourly = json.hourly;
    if (!hourly) return null;

    // Use the noon reading of today's forecast as the representative value
    const noonIdx = hourly.time?.findIndex?.((t: string) => t.includes('T12:00')) ?? 12;
    const idx = noonIdx >= 0 ? noonIdx : 12;

    const data: WeatherPoint = {
      temperatureC: hourly.temperature_2m?.[idx] ?? 0,
      relativeHumidityPercent: hourly.relative_humidity_2m?.[idx] ?? 0,
      precipitationProbabilityPercent: hourly.precipitation_probability?.[idx] ?? 0,
      windSpeedKmh: hourly.wind_speed_10m?.[idx] ?? 0,
    };

    cache.set(cacheKey, { data, ts: Date.now() });
    return data;
  } catch {
    return null;
  }
}

/**
 * Enrich route checkpoints with Open-Meteo weather data.
 * Fetches weather for each unique checkpoint coordinate.
 * Falls back to simulated values if API is unavailable.
 */
export async function enrichCheckpointsWithWeather(
  checkpoints: RouteCheckpoint[],
): Promise<RouteCheckpoint[]> {
  const enriched = await Promise.all(
    checkpoints.map(async (cp) => {
      const weather = await fetchWeatherForCoord(cp.latitude, cp.longitude);
      if (weather) {
        return {
          ...cp,
          temperatureC: weather.temperatureC,
          relativeHumidityPercent: weather.relativeHumidityPercent,
          precipitationProbabilityPercent: weather.precipitationProbabilityPercent,
          windSpeedKmh: weather.windSpeedKmh,
          weatherDataSource: 'Open-Meteo' as const,
        };
      }
      // Fallback: simulated values
      return {
        ...cp,
        temperatureC: 28 + Math.random() * 6,
        relativeHumidityPercent: 60 + Math.random() * 25,
        precipitationProbabilityPercent: Math.round(Math.random() * 40),
        windSpeedKmh: 8 + Math.random() * 15,
        weatherDataSource: 'Simulated' as const,
      };
    }),
  );
  return enriched;
}

/** Resolve a weather data source label to a human-readable badge */
export function weatherSourceLabel(source: RouteCheckpoint['weatherDataSource']): string {
  switch (source) {
    case 'Open-Meteo': return 'Open-Meteo';
    case 'Simulated': return 'Simulated / Demo';
    case 'Reference': return 'Reference Data';
  }
}
