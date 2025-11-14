/**
 * Main App Component
 * Gestisce navigation state-based tra le varie schermate
 */

import React, { useState, useEffect } from 'react';
import { setupIonicReact } from '@ionic/react';
import { motion, AnimatePresence } from 'framer-motion';
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// Components
import KioskHome from './components/Kiosk/KioskHome';
import PinEntry from './components/Kiosk/PinEntry';
import ScanQR from './components/Kiosk/ScanQR';

// Setup Ionic
setupIonicReact({
  mode: 'md' // Material Design mode
});

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('kiosk-home');

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
    setCurrentScreen(newScreen);
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
   * Page transition variants
   */
  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      y: 20
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -20,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1]
      }
    }
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
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={styles.screenContainer}
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const styles = {
  app: {
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  screenContainer: {
    width: '100%',
    height: '100%'
  }
};

export default App;
