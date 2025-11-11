/**
 * API Configuration for connecting to the backend
 */

// Backend API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Generic API fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Get auth token from Supabase if available
  try {
    // Try to get the token from Supabase session storage
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('sb-') && key.includes('-auth-token')
    );
    
    if (keys.length > 0) {
      const sessionData = localStorage.getItem(keys[0]);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session?.access_token) {
          (defaultHeaders as any)['Authorization'] = `Bearer ${session.access_token}`;
        }
      }
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.error || error.message || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * API Methods
 */
export const api = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: any) =>
      apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    logout: () =>
      apiFetch('/auth/logout', {
        method: 'POST',
      }),
  },

  // Buyer endpoints
  buyer: {
    getServices: () => apiFetch('/buyer/services', { method: 'GET' }),
    getService: (id: string) => apiFetch(`/buyer/services/${id}`, { method: 'GET' }),
    bookService: (data: any) =>
      apiFetch('/buyer/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getBookings: () => apiFetch('/buyer/bookings', { method: 'GET' }),
  },

  // Hustler endpoints
  hustler: {
    getServices: () => apiFetch('/hustler/services', { method: 'GET' }),
    createService: (data: any) =>
      apiFetch('/hustler/services', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateService: (id: string, data: any) =>
      apiFetch(`/hustler/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    toggleServiceStatus: (id: string) =>
      apiFetch(`/hustler/services/${id}/toggle`, {
        method: 'PATCH',
      }),
    requestServiceDeletion: (id: string, reason?: string) =>
      apiFetch(`/hustler/services/${id}/request-delete`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
    getBookings: () => apiFetch('/hustler/bookings', { method: 'GET' }),
  },

  // Admin endpoints
  admin: {
    getUsers: () => apiFetch('/admin/users', { method: 'GET' }),
    getServices: () => apiFetch('/admin/services', { method: 'GET' }),
    approveService: (id: string) =>
      apiFetch(`/admin/services/${id}/approve`, {
        method: 'PATCH',
      }),
    rejectService: (id: string) =>
      apiFetch(`/admin/services/${id}/reject`, {
        method: 'PATCH',
      }),
  },

  // Health check
  health: () => apiFetch('/health', { method: 'GET' }),
};

export default api;

