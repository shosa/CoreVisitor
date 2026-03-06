import axios from 'axios';
import { getServerURL as getApiBaseUrl } from '../config/api';

/**
 * HTTP Client con gestione auth token
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'X-App-Type': 'visitor-kiosk',
  }
});

// Interceptor per aggiungere token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Interceptor risposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
    return Promise.reject(error);
  }
);

/**
 * Mobile Auth API
 */
export const mobileAPI = {
  login: (email, password) =>
    api.post('/api/mobile/login', { email, password }),
};

/**
 * Visits API - Endpoint per visite (AUTH REQUIRED)
 */
export const visitsAPI = {
  getAll: (params) => api.get('/api/visits', { params }),
  getOne: (id) => api.get(`/api/visits/${id}`),
  create: (data) => api.post('/api/visits', data),
  update: (id, data) => api.patch(`/api/visits/${id}`, data),
  delete: (id) => api.delete(`/api/visits/${id}`),
  checkIn: (id) => api.post(`/api/visits/${id}/check-in`),
  checkOut: (id) => api.post(`/api/visits/${id}/check-out`),
  cancel: (id) => api.post(`/api/visits/${id}/cancel`),
  getStats: () => api.get('/api/visits/stats'),
  getCurrent: () => api.get('/api/visits/current'),
};

/**
 * Visitors API - Endpoint per visitatori (AUTH REQUIRED)
 */
export const visitorsAPI = {
  getAll: (params) => api.get('/api/visitors', { params }),
  getOne: (id) => api.get(`/api/visitors/${id}`),
  create: (data) => api.post('/api/visitors', data),
  update: (id, data) => api.patch(`/api/visitors/${id}`, data),
  delete: (id) => api.delete(`/api/visitors/${id}`),
  getDocumentUrl: (id) => api.get(`/api/visitors/${id}/document-url`),
};

/**
 * Departments API (AUTH REQUIRED)
 */
export const departmentsAPI = {
  getAll: () => api.get('/api/departments'),
  getOne: (id) => api.get(`/api/departments/${id}`),
  create: (data) => api.post('/api/departments', data),
  update: (id, data) => api.patch(`/api/departments/${id}`, data),
  delete: (id) => api.delete(`/api/departments/${id}`),
};

/**
 * Users API (AUTH REQUIRED)
 */
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getOne: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.patch(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
};

/**
 * Printer API (AUTH REQUIRED)
 */
export const printerAPI = {
  printBadge: (visitId, copies) => api.post('/api/printer/print-badge', { visitId, copies }),
  getQueueStatus: () => api.get('/api/printer/queue-status'),
  getJobs: () => api.get('/api/printer/jobs'),
};

/**
 * Visitor Kiosk API - Endpoint specifici per kiosk (NO AUTH REQUIRED)
 */
export const kioskAPI = {
  verifyPin: (pin) =>
    api.post('/api/kiosk/verify-pin', { pin }),

  checkIn: (pin) =>
    api.post('/api/kiosk/check-in', { pin }),

  verifyBadge: (badgeCode) =>
    api.post('/api/kiosk/verify-badge', { badge_code: badgeCode }),

  checkOut: (visitId, badgeCode) =>
    api.post('/api/kiosk/check-out', {
      visit_id: visitId,
      badge_code: badgeCode
    }),

  uploadSignature: (visitorId, signatureBase64) =>
    api.post('/api/kiosk/upload-signature', { visitorId, signatureBase64 }),

  getStats: () =>
    api.get('/api/kiosk/stats'),

  getSettings: () =>
    api.get('/api/kiosk/settings'),

  getDepartments: () =>
    api.get('/api/kiosk/departments'),

  getHosts: () =>
    api.get('/api/kiosk/hosts'),

  searchVisitors: (q) =>
    api.get('/api/kiosk/visitors/search', { params: { q } }),

  selfRegister: (data) =>
    api.post('/api/kiosk/self-register', data),
};
