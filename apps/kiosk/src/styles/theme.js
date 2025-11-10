/**
 * Theme Configuration
 * Palette colori e stili globali CoreVisitor
 */

export const theme = {
  // Colori primari
  colors: {
    primary: '#1a1a1a',
    primaryLight: '#2d2d2d',
    primaryDark: '#0a0a0a',

    accent: '#3b82f6',
    accentLight: '#60a5fa',
    accentDark: '#2563eb',

    success: '#10b981',
    successLight: '#34d399',
    successDark: '#059669',

    warning: '#f59e0b',
    warningLight: '#fbbf24',
    warningDark: '#d97706',

    danger: '#ef4444',
    dangerLight: '#f87171',
    dangerDark: '#dc2626',

    info: '#06b6d4',
    infoLight: '#22d3ee',
    infoDark: '#0891b2',

    // Sfondi
    background: '#ffffff',
    backgroundGray: '#f5f5f5',
    backgroundDark: '#f0f0f0',

    // Testi
    text: '#1a1a1a',
    textSecondary: '#6b7280',
    textLight: '#9ca3af',
    textInverse: '#ffffff',

    // Bordi
    border: '#e5e7eb',
    borderLight: '#f3f4f6',
    borderDark: '#d1d5db',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayDark: 'rgba(0, 0, 0, 0.7)'
  },

  // Gradienti
  gradients: {
    primary: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    accent: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    background: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
    overlay: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 100%)'
  },

  // Ombre
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
    none: 'none'
  },

  // Bordi arrotondati
  radius: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    full: '9999px'
  },

  // Spaziature
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  },

  // Typography
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px'
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },

  // Transizioni
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070
  }
};

export default theme;
