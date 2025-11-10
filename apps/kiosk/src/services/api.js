/**
 * API Service
 * Gestisce tutte le chiamate al backend con autenticazione JWT
 */

import axios from 'axios';
import capacitorHttp from './capacitorHttp';
import { apiConfig } from '../config/api';

// Rileva se siamo in ambiente Capacitor
const isCapacitor = typeof window !== 'undefined' && window.Capacitor !== undefined;

// Seleziona il client HTTP appropriato
let api;

if (isCapacitor) {
  console.log('📱 Using Capacitor HTTP for mobile app');
  api = capacitorHttp;
} else {
  console.log('🌐 Using Axios for web app');
  api = axios.create({
    baseURL: apiConfig.baseURL,
    timeout: apiConfig.timeout,
    headers: apiConfig.headers
  });
}

// Add auth interceptor for Axios (web)
if (!isCapacitor && api.interceptors) {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// Wrap capacitorHttp to add auth headers
const apiWithAuth = {
  get: async (url, options = {}) => {
    const token = localStorage.getItem('auth_token');
    if (token && isCapacitor) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return api.get(url, options);
  },
  post: async (url, data, options = {}) => {
    const token = localStorage.getItem('auth_token');
    if (token && isCapacitor) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return api.post(url, data, options);
  },
  patch: async (url, data, options = {}) => {
    const token = localStorage.getItem('auth_token');
    if (token && isCapacitor) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return api.patch(url, data, options);
  },
  delete: async (url, options = {}) => {
    const token = localStorage.getItem('auth_token');
    if (token && isCapacitor) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return api.delete(url, options);
  }
};

const httpClient = isCapacitor ? apiWithAuth : api;

/**
 * Mobile API - Autenticazione
 */
export const mobileAPI = {
  /**
   * Login utente - USA L'ENDPOINT STANDARD /api/auth/login
   * Salva il token JWT per le richieste successive
   */
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });

    // Salva il token JWT
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
      console.log('✅ Auth token saved');
    }

    return response;
  }
};

/**
 * Visitor Kiosk API - Endpoint specifici per kiosk (NO AUTH REQUIRED)
 */
export const kioskAPI = {
  verifyBadge: (badgeCode) =>
    api.post('/api/kiosk/verify-badge', { badge_code: badgeCode }),

  checkOut: (visitId, badgeCode) =>
    api.post('/api/kiosk/check-out', {
      visit_id: visitId,
      badge_code: badgeCode
    }),

  getCurrentVisitors: () =>
    api.get('/api/kiosk/current-visitors'),

  getStats: () =>
    api.get('/api/kiosk/stats')
};

/**
 * Visits API - Endpoint per visite (AUTH REQUIRED)
 */
export const visitsAPI = {
  getAll: (params) =>
    httpClient.get('/api/visits', { params }),

  getById: (id) =>
    httpClient.get(`/api/visits/${id}`),

  create: (data) =>
    httpClient.post('/api/visits', data),

  update: (id, data) =>
    httpClient.patch(`/api/visits/${id}`, data),

  checkIn: (id) =>
    httpClient.post(`/api/visits/${id}/check-in`),

  checkOut: (id) =>
    httpClient.post(`/api/visits/${id}/check-out`),

  cancel: (id) =>
    httpClient.post(`/api/visits/${id}/cancel`),

  getCurrent: () =>
    httpClient.get('/api/visits/current'),

  getStats: () =>
    httpClient.get('/api/visits/stats')
};

/**
 * Departments API
 */
export const departmentsAPI = {
  getAll: () => httpClient.get('/api/departments'),
  getById: (id) => httpClient.get(`/api/departments/${id}`)
};

export default api;
