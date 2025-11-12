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

  // Auto-detect: usa lo stesso protocollo della pagina corrente
  // Se il frontend è HTTPS, usa HTTPS anche per il backend (e viceversa)
  const protocol = window.location.protocol; // 'http:' o 'https:'
  const defaultUrl = `${protocol}//192.168.3.131:3006`;
  console.log('📡 Using production server:', defaultUrl);
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
