import { useAuthStore } from '../stores/auth';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
let isRefreshing = false;
let refreshPromise = null;
async function refreshWithLock() {
    if (isRefreshing) {
        return refreshPromise;
    }
    isRefreshing = true;
    const auth = useAuthStore();
    refreshPromise = auth.refreshAccessToken();
    try {
        return await refreshPromise;
    }
    finally {
        isRefreshing = false;
        refreshPromise = null;
    }
}
async function handleResponse(response, retryRequest) {
    if (response.status === 401) {
        // Try to refresh token
        const refreshed = await refreshWithLock();
        if (refreshed && retryRequest) {
            // Retry the original request with new token
            const newResponse = await retryRequest();
            if (!newResponse.ok) {
                const errorData = await newResponse.json().catch(() => ({ detail: 'An unexpected error occurred' }));
                throw { detail: errorData.detail, status_code: newResponse.status };
            }
            return newResponse.json();
        }
        // Refresh failed, redirect to login
        const auth = useAuthStore();
        await auth.login();
        throw { detail: 'Authentication required', status_code: response.status };
    }
    if (response.status === 403) {
        const auth = useAuthStore();
        await auth.login();
        throw { detail: 'Authentication required', status_code: response.status };
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'An unexpected error occurred' }));
        throw { detail: errorData.detail, status_code: response.status };
    }
    return response.json();
}
const getHeaders = (isFormData = false) => {
    const token = localStorage.getItem('mia_access_token');
    const headers = {};
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};
export const apiClient = {
    async get(endpoint) {
        const makeRequest = () => fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders()
        });
        const response = await makeRequest();
        return handleResponse(response, makeRequest);
    },
    async post(endpoint, data, options) {
        const isFormData = data instanceof FormData;
        const makeRequest = () => fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { ...getHeaders(isFormData), ...options?.headers },
            body: isFormData ? data : JSON.stringify(data)
        });
        const response = await makeRequest();
        return handleResponse(response, makeRequest);
    },
    async put(endpoint, data, options) {
        const isFormData = data instanceof FormData;
        const makeRequest = () => fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: { ...getHeaders(isFormData), ...options?.headers },
            body: isFormData ? data : JSON.stringify(data)
        });
        const response = await makeRequest();
        return handleResponse(response, makeRequest);
    },
    async patch(endpoint, data, options) {
        const isFormData = data instanceof FormData;
        const makeRequest = () => fetch(`${BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: { ...getHeaders(isFormData), ...options?.headers },
            body: isFormData ? data : JSON.stringify(data)
        });
        const response = await makeRequest();
        return handleResponse(response, makeRequest);
    },
    async delete(endpoint) {
        const makeRequest = () => fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        const response = await makeRequest();
        return handleResponse(response, makeRequest);
    }
};
