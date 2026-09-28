import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const DEV_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const PROD_API_URL = 'https://api.foodpackai.com';

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

const TOKEN_KEY = 'foodpack_access_token';

/** Retrieve stored JWT */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/** Store JWT */
export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/** Clear stored JWT */
export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export interface ApiError {
  message: string;
  statusCode: number;
}

/** Core fetch wrapper — attaches auth header, parses JSON, throws on error */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err: ApiError = {
      message: data?.message ?? `Request failed: ${res.status}`,
      statusCode: res.status,
    };
    throw err;
  }

  return data as T;
}

/** GET convenience */
export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

/** POST convenience */
export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** PATCH convenience */
export function apiPatch<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

/** DELETE convenience */
export function apiDelete<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'DELETE' });
}
