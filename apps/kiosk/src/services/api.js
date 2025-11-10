/**
 * API Service
 * Gestisce tutte le chiamate al backend
 * Utilizza CapacitorHttp in mobile, Axios in web
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

/**
 * Mobile API - Endpoint unificati per app mobile
 */
export const mobileAPI = {
  /**
   * Login unificato per tutte le app mobile
   */
  login: (username, password) =>
    api.post('/api/mobile/login', {
      action: 'login',
      username,
      password,
      app_type: 'visitor-kiosk'
    }),

  /**
   * Ottieni profilo utente corrente
   */
  getProfile: (userId) =>
    api.post('/api/mobile/login', {
      action: 'profile',
      user_id: userId,
      app_type: 'visitor-kiosk'
    }),

  /**
   * Ottieni lista utenti (per selezione operatore)
   */
  getUsers: () =>
    api.post('/api/mobile/login', {
      action: 'get_users',
      app_type: 'visitor-kiosk'
    })
};

/**
 * Visitor Kiosk API - Endpoint specifici per kiosk visitatori
 */
export const kioskAPI = {
  /**
   * Verifica badge QR code e ottieni info visita
   */
  verifyBadge: (badgeCode) =>
    api.post('/api/kiosk/verify-badge', { badge_code: badgeCode }),

  /**
   * Check-out visitatore da QR code
   */
  checkOut: (visitId, badgeCode) =>
    api.post('/api/kiosk/check-out', {
      visit_id: visitId,
      badge_code: badgeCode
    }),

  /**
   * Ottieni visitatori attualmente presenti
   */
  getCurrentVisitors: () =>
    api.get('/api/kiosk/current-visitors'),

  /**
   * Ottieni statistiche dashboard
   */
  getStats: () =>
    api.get('/api/kiosk/stats')
};

/**
 * Visitors API - Endpoint per gestione visitatori (modalità full)
 */
export const visitorsAPI = {
  /**
   * Ottieni lista visitatori
   */
  getAll: (params) =>
    api.get('/api/visitors', { params }),

  /**
   * Ottieni dettaglio visitatore
   */
  getById: (id) =>
    api.get(`/api/visitors/${id}`),

  /**
   * Crea nuovo visitatore
   */
  create: (data) =>
    api.post('/api/visitors', data),

  /**
   * Aggiorna visitatore
   */
  update: (id, data) =>
    api.patch(`/api/visitors/${id}`, data),

  /**
   * Elimina visitatore
   */
  delete: (id) =>
    api.delete(`/api/visitors/${id}`),

  /**
   * Cerca visitatori
   */
  search: (query) =>
    api.get('/api/visitors/search', { params: { q: query } })
};

/**
 * Visits API - Endpoint per gestione visite (modalità full)
 */
export const visitsAPI = {
  /**
   * Ottieni lista visite
   */
  getAll: (params) =>
    api.get('/api/visits', { params }),

  /**
   * Ottieni dettaglio visita
   */
  getById: (id) =>
    api.get(`/api/visits/${id}`),

  /**
   * Crea nuova visita
   */
  create: (data) =>
    api.post('/api/visits', data),

  /**
   * Aggiorna visita
   */
  update: (id, data) =>
    api.patch(`/api/visits/${id}`, data),

  /**
   * Check-in visita
   */
  checkIn: (id) =>
    api.post(`/api/visits/${id}/check-in`),

  /**
   * Check-out visita
   */
  checkOut: (id) =>
    api.post(`/api/visits/${id}/check-out`),

  /**
   * Annulla visita
   */
  cancel: (id) =>
    api.post(`/api/visits/${id}/cancel`),

  /**
   * Ottieni badge visita
   */
  getBadge: (id) =>
    api.get(`/api/visits/${id}/badge`),

  /**
   * Ottieni visite correnti
   */
  getCurrent: () =>
    api.get('/api/visits/current'),

  /**
   * Ottieni statistiche
   */
  getStats: () =>
    api.get('/api/visits/stats')
};

/**
 * Departments API - Endpoint per reparti
 */
export const departmentsAPI = {
  getAll: () => api.get('/api/departments'),
  getById: (id) => api.get(`/api/departments/${id}`)
};

/**
 * Health check - Verifica connessione server
 */
export const healthCheck = () => {
  return api.get('/api/health').catch(() => ({ data: { status: 'error' } }));
};

export default api;
