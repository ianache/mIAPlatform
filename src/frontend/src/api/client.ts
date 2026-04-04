import { ApiError } from '../types';
import { useAuthStore } from '../stores/auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshWithLock(): Promise<boolean> {
  if (isRefreshing) {
    return refreshPromise!;
  }

  isRefreshing = true;
  const auth = useAuthStore();
  refreshPromise = auth.refreshAccessToken();

  try {
    return await refreshPromise;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

async function handleResponse<T>(response: Response, retryRequest?: () => Promise<Response>): Promise<T> {
  if (response.status === 401) {
    // Try to refresh token
    const refreshed = await refreshWithLock();

    if (refreshed && retryRequest) {
      // Retry the original request with new token
      const newResponse = await retryRequest();
      if (!newResponse.ok) {
        const errorData = await newResponse.json().catch(() => ({ detail: 'An unexpected error occurred' }));
        throw { detail: errorData.detail, status_code: newResponse.status } as ApiError;
      }
      return newResponse.json();
    }

    // Refresh failed, redirect to login
    const auth = useAuthStore();
    await auth.login();
    throw { detail: 'Authentication required', status_code: response.status } as ApiError;
  }

  if (response.status === 403) {
    const auth = useAuthStore();
    await auth.login();
    throw { detail: 'Authentication required', status_code: response.status } as ApiError;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'An unexpected error occurred' }));
    throw { detail: errorData.detail, status_code: response.status } as ApiError;
  }

  return response.json();
}

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('mia_access_token');
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const makeRequest = () => fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders()
    });
    const response = await makeRequest();
    return handleResponse<T>(response, makeRequest);
  },
  async post<T>(endpoint: string, data: any, options?: { headers?: Record<string, string> }): Promise<T> {
    const isFormData = data instanceof FormData;
    const makeRequest = () => fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { ...getHeaders(isFormData), ...options?.headers },
      body: isFormData ? data : JSON.stringify(data)
    });
    const response = await makeRequest();
    return handleResponse<T>(response, makeRequest);
  },
  async put<T>(endpoint: string, data: any, options?: { headers?: Record<string, string> }): Promise<T> {
    const isFormData = data instanceof FormData;
    const makeRequest = () => fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: { ...getHeaders(isFormData), ...options?.headers },
      body: isFormData ? data : JSON.stringify(data)
    });
    const response = await makeRequest();
    return handleResponse<T>(response, makeRequest);
  },
  async patch<T>(endpoint: string, data: any, options?: { headers?: Record<string, string> }): Promise<T> {
    const isFormData = data instanceof FormData;
    const makeRequest = () => fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { ...getHeaders(isFormData), ...options?.headers },
      body: isFormData ? data : JSON.stringify(data)
    });
    const response = await makeRequest();
    return handleResponse<T>(response, makeRequest);
  },
  async delete<T>(endpoint: string): Promise<T> {
    const makeRequest = () => fetch(`${BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    const response = await makeRequest();
    return handleResponse<T>(response, makeRequest);
  }
};
