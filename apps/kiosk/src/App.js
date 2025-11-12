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
import KioskHome from './components/Kiosk/KioskHome';
import PinEntry from './components/Kiosk/PinEntry';
import ScanQR from './components/Kiosk/ScanQR';
import PageTransition from './components/Common/PageTransition';

// Setup Ionic
setupIonicReact({
  mode: 'md' // Material Design mode
});

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('kiosk-home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Ripristina stato da localStorage al mount
  useEffect(() => {
    const savedScreen = localStorage.getItem('corevisitor_current_screen');
    if (savedScreen && ['kiosk-home', 'pin-entry', 'scan-qr'].includes(savedScreen)) {
      setCurrentScreen(savedScreen);
    }
  }, []);

  // Salva stato corrente in localStorage
  useEffect(() => {
    localStorage.setItem('corevisitor_current_screen', currentScreen);
  }, [currentScreen]);

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

  /**
   * Render schermata corrente
   */
  const renderScreen = () => {
    switch (currentScreen) {
      case 'kiosk-home':
        return (
          <KioskHome
            onSelectOption={handleKioskOption}
          />
        );

      case 'pin-entry':
        return <PinEntry onBack={handleBackToKioskHome} />;

      case 'scan-qr':
        return <ScanQR onBack={handleBackToKioskHome} />;

      default:
        return (
          <KioskHome
            onSelectOption={handleKioskOption}
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
