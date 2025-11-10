/**
 * Capacitor HTTP Service
 * Wrapper per CapacitorHttp che simula l'API di Axios
 * Utilizzato in modalità mobile per bypassare CORS
 */

import { CapacitorHttp } from '@capacitor/core';
import { apiConfig } from '../config/api';

class CapacitorHttpService {
  constructor() {
    this.baseURL = apiConfig.baseURL;
  }

  async request(method, url, data = null, customHeaders = {}) {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;

      const options = {
        url: fullUrl,
        method: method.toUpperCase(),
        headers: {
          ...apiConfig.headers,
          ...customHeaders
        }
      };

      // Aggiungi body per POST/PUT/PATCH
      if (data && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
        options.data = data;
        options.headers['Content-Type'] = 'application/json';
      }

      // Aggiungi query params per GET/DELETE
      if (data && ['GET', 'DELETE'].includes(options.method)) {
        options.params = data;
      }

      console.log(`📱 Capacitor HTTP ${method.toUpperCase()}:`, fullUrl);

      const response = await CapacitorHttp.request(options);

      // Simula formato Axios
      return {
        status: response.status,
        statusText: response.status === 200 ? 'OK' : 'Error',
        data: response.data,
        headers: response.headers,
        config: options
      };
    } catch (error) {
      console.error('❌ Capacitor HTTP Error:', error);

      // Simula formato errore Axios
      throw {
        response: {
          status: error.status || 500,
          data: error.data || { message: error.message },
          headers: error.headers || {}
        },
        message: error.message || 'Network error'
      };
    }
  }

  get(url, config = {}) {
    return this.request('GET', url, config.params, config.headers);
  }

  post(url, data, config = {}) {
    return this.request('POST', url, data, config.headers);
  }

  put(url, data, config = {}) {
    return this.request('PUT', url, data, config.headers);
  }

  patch(url, data, config = {}) {
    return this.request('PATCH', url, data, config.headers);
  }

  delete(url, config = {}) {
    return this.request('DELETE', url, config.params, config.headers);
  }
}

export default new CapacitorHttpService();
