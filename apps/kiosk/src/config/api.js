/**
 * API Configuration
 * Gestisce la configurazione del server backend
 */

const getBaseURL = () => {
  // Controlla se è salvato in localStorage
  const savedServer = localStorage.getItem('corevisitor_server_url');

  if (savedServer) {
    console.log('📡 Using saved server:', savedServer);
    return savedServer;
  }

  // Fallback per sviluppo web (usa proxy in package.json)
  if (process.env.NODE_ENV === 'development' && !window.Capacitor) {
    console.log('🌐 Development mode - using proxy');
    return 'http://localhost:3006';
  }

  // Fallback default per produzione
  const defaultUrl = 'http://192.168.3.131:3006';
  console.log('⚠️ Using default server:', defaultUrl);
  return defaultUrl;
};

export const apiConfig = {
  get baseURL() {
    return getBaseURL();
  },
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-App-Type': 'visitor-kiosk'
  }
};

export const setServerURL = (url) => {
  // Rimuovi trailing slash
  const cleanUrl = url.replace(/\/$/, '');
  localStorage.setItem('corevisitor_server_url', cleanUrl);
  console.log('✅ Server URL saved:', cleanUrl);
};

export const clearServerURL = () => {
  localStorage.removeItem('corevisitor_server_url');
  console.log('🗑️ Server URL cleared');
};

export const getServerURL = () => {
  return getBaseURL();
};
