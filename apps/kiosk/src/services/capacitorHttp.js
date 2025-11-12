/**
 * Capacitor HTTP Service (Placeholder per PWA)
 * In modalità PWA questo file non viene usato (api.js usa direttamente Axios)
 * Manteniamo il file per compatibilità ma senza dipendenze Capacitor
 */

import { apiConfig } from '../config/api';

class CapacitorHttpService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
    console.warn('CapacitorHttp service loaded but not used in PWA mode');
  }

  async request() {
    throw new Error('CapacitorHttp not available in PWA mode. Use Axios instead.');
  }

  get() { return this.request(); }
  post() { return this.request(); }
  put() { return this.request(); }
  patch() { return this.request(); }
  delete() { return this.request(); }
}

export default new CapacitorHttpService();
