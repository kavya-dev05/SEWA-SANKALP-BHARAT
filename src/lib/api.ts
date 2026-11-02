/// <reference types="vite/client" />
/**
 * Central API utility for Sewa Sankalp Bharat / SAHYOG.
 *
 * In development, all /api/* calls are proxied by Vite to localhost:3000.
 * In production (Vercel), VITE_API_URL is set to the Railway backend URL,
 * so every call hits https://<backend>.railway.app/api/*.
 */

// Set VITE_API_URL in your Vercel project env vars to the Railway backend URL.
// Example: https://sahyog-backend.railway.app
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

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
