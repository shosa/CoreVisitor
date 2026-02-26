/**
 * API Configuration
 * Gestisce la configurazione del server backend
 */

const getBaseURL = () => {
  // Controlla se è salvato in localStorage (override manuale runtime)
  const savedServer = localStorage.getItem('corevisitor_server_url');

  if (savedServer) {
    console.log('[CONSOLE]: Utilizzo server salvato:', savedServer);
    return savedServer;
  }

  // Usa variabile d'ambiente iniettata al build-time da REACT_APP_API_URL
  // Se è un path relativo (es. '/api' o '') usa direttamente il proxy nginx
  if (process.env.REACT_APP_API_URL !== undefined) {
    const envUrl = process.env.REACT_APP_API_URL;
    console.log('[CONSOLE]: Utilizzo REACT_APP_API_URL:', envUrl || '(path relativo)');
    return envUrl;
  }

  // Fallback: auto-detect dal protocollo della pagina
  const protocol = window.location.protocol;
  const defaultUrl = `${protocol}//192.168.3.40:3006`;
  console.log('[CONSOLE]: Utilizzo fallback hardcoded:', defaultUrl);
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
  console.log('[CONSOLE]: Salvato Server URL:', cleanUrl);
};

export const clearServerURL = () => {
  localStorage.removeItem('corevisitor_server_url');
  console.log('[CONSOLE]: Rimosso Server URL');
};

export const getServerURL = () => {
  return getBaseURL();
};
