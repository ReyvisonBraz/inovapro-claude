const TOKEN_KEY = "financeflow_token";

/**
 * Get the stored JWT token
 */
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store the JWT token
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove the JWT token (logout)
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user has a stored token
 */
export function hasToken(): boolean {
  return !!getToken();
}

/**
 * Build headers with auth token
 */
function authHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Centralized API service with automatic JWT auth headers.
 * All methods throw on non-OK responses.
 */
export const api = {
  get: async (url: string) => {
    const res = await fetch(url, {
      headers: authHeaders(),
    });
    if (res.status === 401) {
      clearToken();
      window.location.reload();
      throw new Error("Session expired");
    }
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    return res.json();
  },

  post: async (url: string, data: unknown) => {
    const res = await fetch(url, {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      clearToken();
      window.location.reload();
      throw new Error("Session expired");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `API error: ${res.statusText}`);
    }
    return res.json();
  },

  put: async (url: string, data: unknown) => {
    const res = await fetch(url, {
      method: "PUT",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      clearToken();
      window.location.reload();
      throw new Error("Session expired");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `API error: ${res.statusText}`);
    }
    return res.json();
  },

  patch: async (url: string, data: unknown) => {
    const res = await fetch(url, {
      method: "PATCH",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(data),
    });
    if (res.status === 401) {
      clearToken();
      window.location.reload();
      throw new Error("Session expired");
    }
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `API error: ${res.statusText}`);
    }
    return res.json();
  },

  delete: async (url: string) => {
    const res = await fetch(url, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.status === 401) {
      clearToken();
      window.location.reload();
      throw new Error("Session expired");
    }
    if (!res.ok) throw new Error(`API error: ${res.statusText}`);
    return res.json();
  },
};
