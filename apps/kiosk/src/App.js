/**
 * Main App Component
 * Gestisce navigation state-based tra le varie schermate
 */

import React, { useState, useEffect } from 'react';
import { setupIonicReact } from '@ionic/react';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// Components
import ModeSelection from './components/ModeSelection';
import KioskHome from './components/Kiosk/KioskHome';
import PinEntry from './components/Kiosk/PinEntry';
import ScanQR from './components/Kiosk/ScanQR';
import Login from './components/Login';
import FullDashboard from './components/Dashboard/FullDashboard';
import PageTransition from './components/Common/PageTransition';

// Setup Ionic
setupIonicReact({
  mode: 'md' // Material Design mode
});

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('mode-selection');
  const [user, setUser] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Ripristina stato da localStorage al mount
  useEffect(() => {
    const savedScreen = localStorage.getItem('corevisitor_current_screen');
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);

        // Se c'è un utente salvato, vai alla dashboard
        if (savedScreen === 'dashboard') {
          setCurrentScreen('dashboard');
        }
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    } else if (savedScreen && savedScreen !== 'mode-selection') {
      setCurrentScreen(savedScreen);
    }
  }, []);

  // Salva stato corrente in localStorage
  useEffect(() => {
    localStorage.setItem('corevisitor_current_screen', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  /**
   * Transizione tra schermate con animazione
   */
  const transitionToScreen = (newScreen) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentScreen(newScreen);
      setIsTransitioning(false);
    }, 300);
  };

  /**
   * Handlers per navigation
   */
  const handleSelectMode = (mode) => {
    if (mode === 'kiosk') {
      transitionToScreen('kiosk-home');
    } else if (mode === 'full') {
      transitionToScreen('login');
    }
  };

  const handleKioskOption = (option) => {
    if (option === 'pin') {
      transitionToScreen('pin-entry');
    } else if (option === 'qr') {
      transitionToScreen('scan-qr');
    }
  };

  const handleBackToKioskHome = () => {
    transitionToScreen('kiosk-home');
  };

  const handleBackToModeSelection = () => {
    setUser(null);
    transitionToScreen('mode-selection');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    transitionToScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    transitionToScreen('mode-selection');
  };

  /**
   * Render schermata corrente
   */
  const renderScreen = () => {
    switch (currentScreen) {
      case 'mode-selection':
        return (
          <ModeSelection
            onSelectMode={handleSelectMode}
            onSettings={() => {
              // TODO: Implementare schermata impostazioni server
              console.log('Settings clicked');
            }}
          />
        );

      case 'kiosk-home':
        return (
          <KioskHome
            onSelectOption={handleKioskOption}
            onBack={handleBackToModeSelection}
          />
        );

      case 'pin-entry':
        return <PinEntry onBack={handleBackToKioskHome} />;

      case 'scan-qr':
        return <ScanQR onBack={handleBackToKioskHome} />;

      case 'login':
        return (
          <Login
            onBack={handleBackToModeSelection}
            onLoginSuccess={handleLoginSuccess}
          />
        );

      case 'dashboard':
        return <FullDashboard user={user} onLogout={handleLogout} />;

      default:
        return (
          <ModeSelection
            onSelectMode={handleSelectMode}
            onSettings={() => console.log('Settings clicked')}
          />
        );
    }
  };

  return (
    <div style={styles.app}>
      <PageTransition type="fade" duration={0.3}>
        {!isTransitioning && renderScreen()}
      </PageTransition>
    </div>
  );
};

const styles = {
  app: {
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  }
};

export default App;
