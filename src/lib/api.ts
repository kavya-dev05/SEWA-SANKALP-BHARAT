/// <reference types="vite/client" />
/**
 * Central API utility for Sewa Sankalp Bharat / SAHYOG.
 *
 * In development, all /api/* calls are proxied by Vite to localhost:3000.
 * In production (Vercel), VITE_API_URL is used.
 * If VITE_API_URL is not set, it defaults to the deployed Render backend URL.
 */

const DEFAULT_RENDER_BACKEND = 'https://sahyog-backend.onrender.com';

const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();

// On localhost during dev, empty base lets Vite dev server proxy /api to :3000.
// In production, fallback to Render backend if env var is missing.
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

const BASE = (
  rawApiUrl || (!isLocalhost ? DEFAULT_RENDER_BACKEND : '')
).replace(/\/$/, '');

/**
 * Build a full URL for an API path.
 * @param path — must start with "/api/"
 */
export function apiUrl(path: string): string {
  return `${BASE}${path}`;
}

/**
 * Authenticated fetch helper.
 * Automatically attaches Content-Type + Authorization headers.
 */
export async function authFetch(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(apiUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}
