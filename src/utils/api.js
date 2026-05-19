const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

let accessToken = localStorage.getItem('edms_token') || '';

export function setAccessToken(token) {
  accessToken = token || '';
  if (accessToken) localStorage.setItem('edms_token', accessToken);
  else localStorage.removeItem('edms_token');
}

export function getAccessToken() {
  return accessToken;
}

async function parseResponse(response) {
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.detail || message;
    } catch {
      // Keep the HTTP status text when the backend returns a non-JSON error.
    }
    throw new Error(message);
  }
  if (response.status === 204) return null;
  return response.json();
}

export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  return parseResponse(response);
}

export function downloadUrl(path) {
  return `${API_URL}${path}`;
}
