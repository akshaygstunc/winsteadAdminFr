const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getAuthHeaders() {
  if (typeof window === 'undefined') return {};
  const token = window.localStorage.getItem('luxury_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error((await res.text()) || 'API request failed');
  }

  if (res.status === 204) {
    return null as T;
  }

  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
