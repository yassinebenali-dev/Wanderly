const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getToken(): string | null {
  return localStorage.getItem('wanderly_token');
}

export function setToken(token: string): void {
  localStorage.setItem('wanderly_token', token);
}

export function removeToken(): void {
  localStorage.removeItem('wanderly_token');
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

export const API_URL = BASE_URL;