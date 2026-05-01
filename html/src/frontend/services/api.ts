import { reactive } from 'vue';

export type Role = 'basic' | 'admin';

export interface User {
  id: string;
  name: string;
  role: Role;
}

export interface Contact {
  id: string;
  name: string;
  contact: string;
  email_address: string;
  picture: string;
  created_by: string;
}

export interface UserPayload {
  name: string;
  password?: string;
  role: Role;
}

interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

interface ErrorResponse {
  error?: {
    message?: string;
    details?: Record<string, string> | string;
  };
}

// Get API base URL from environment or use current origin
const getApiBaseUrl = (): string => {
  // In development, use a relative API path so Vite proxy handles requests and avoids CORS.
  if (import.meta.env.MODE === 'development') {
    return '';
  }

  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl;

  // Fallback to __API_BASE_URL__ (build-time variable)
  if (typeof __API_BASE_URL__ !== 'undefined') {
    const buildUrl = __API_BASE_URL__;
    if (buildUrl) return buildUrl;
  }

  // Default: use current origin
  return '';
};

const API_BASE_URL = getApiBaseUrl();
const apiUrl = (path: string) => API_BASE_URL ? `${API_BASE_URL}${path}` : path;

export class ApiError extends Error {
  constructor(
    message: string,
    public details?: Record<string, string> | string
  ) {
    super(message);
  }
}

const formatErrorMessage = (payload: ErrorResponse | null) => {
  const details = payload?.error?.details;

  if (details && typeof details === 'object') {
    const messages = Object.values(details).filter(Boolean);
    if (messages.length > 0) {
      return messages.join('\n');
    }
  }

  if (typeof details === 'string' && details) {
    return details;
  }

  return payload?.error?.message ?? 'Request failed';
};

export const authState = reactive({
  user: JSON.parse(localStorage.getItem('user') ?? 'null') as User | null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token')
});

const persistAuth = (auth: AuthResponse | null) => {
  authState.user = auth?.user ?? null;
  authState.accessToken = auth?.access_token ?? null;
  authState.refreshToken = auth?.refresh_token ?? null;

  if (!auth) {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return;
  }

  localStorage.setItem('user', JSON.stringify(auth.user));
  localStorage.setItem('access_token', auth.access_token);
  localStorage.setItem('refresh_token', auth.refresh_token);
};

const request = async <T>(path: string, options: RequestInit = {}, retry = true): Promise<T> => {
  const headers = new Headers(options.headers);
  headers.set('content-type', 'application/json');

  if (authState.accessToken) {
    headers.set('authorization', `Bearer ${authState.accessToken}`);
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers
  });

  if (response.status === 401 && retry && authState.refreshToken) {
    try {
      const auth = await refreshSession();
      persistAuth(auth);
      return request<T>(path, options, false);
    } catch {
      persistAuth(null);
      window.location.assign('/login');
    }
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as ErrorResponse | null;
    throw new ApiError(formatErrorMessage(payload), payload?.error?.details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

const refreshSession = () =>
  request<AuthResponse>(
    '/api/auth/refresh',
    {
      method: 'POST',
      body: JSON.stringify({ refresh_token: authState.refreshToken })
    },
    false
  );

export const api = {
  async login(name: string, password: string) {
    const auth = await request<AuthResponse>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ name, password })
      },
      false
    );
    persistAuth(auth);
  },
  logout() {
    persistAuth(null);
  },
  users: () => request<User[]>('/api/users'),
  createUser: (payload: { name: string; password: string; role: Role }) =>
    request<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateUser: (id: string, payload: UserPayload) =>
    request<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteUser: (id: string) =>
    request<void>(`/api/users/${id}`, {
      method: 'DELETE'
    }),
  contacts: () => request<Contact[]>('/api/contacts'),
  contact: (id: string) => request<Contact>(`/api/contacts/${id}`),
  createContact: (payload: Omit<Contact, 'id'>) =>
    request<Contact>('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateContact: (id: string, payload: Omit<Contact, 'id'>) =>
    request<Contact>(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  deleteContact: (id: string) =>
    request<void>(`/api/contacts/${id}`, {
      method: 'DELETE'
    })
};
