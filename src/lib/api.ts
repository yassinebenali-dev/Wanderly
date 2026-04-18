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

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  } catch (err: any) {
    // Gestion de l'erreur de connexion au serveur
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error('Erreur serveur, veuillez réessayer plus tard');
    }
    throw err;
  }
};

export const API_URL = BASE_URL;

