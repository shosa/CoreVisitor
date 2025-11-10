/**
 * ScanQR Component
 * Scanner QR per check-out visitatori in modalità kiosk
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IonContent,
  IonPage,
  IonButton,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import {
  qrCodeOutline,
  flashlightOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
  closeCircleOutline
} from 'ionicons/icons';
import scanner from '../../services/scanner';
import { kioskAPI } from '../../services/api';
import theme from '../../styles/theme';
import Alert from '../Common/Alert';

const ScanQR = ({ onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });

  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setResult(null);

      // Scansiona QR code
      const code = await scanner.scan();

      if (code) {
        console.log('📷 QR Code scanned:', code);
        await processCheckOut(code);
      }
    } catch (error) {
      console.error('❌ Scan error:', error);
      showAlert('error', 'Errore Scanner', error.message || 'Impossibile avviare lo scanner');
    } finally {
      setIsScanning(false);
    }
  };

  const processCheckOut = async (badgeCode) => {
    setLoading(true);
    try {
      // Verifica badge
      const verifyResponse = await kioskAPI.verifyBadge(badgeCode);

      if (verifyResponse.data.status === 'error') {
        throw new Error(verifyResponse.data.message || 'Badge non valido');
      }

      const visit = verifyResponse.data.data;

      // Check-out
      const checkOutResponse = await kioskAPI.checkOut(visit.id, badgeCode);

      if (checkOutResponse.data.status === 'success') {
        setResult({
          success: true,
          visitor: visit.visitor,
          checkOutTime: new Date().toLocaleTimeString('it-IT')
        });

        showAlert(
          'success',
          'Check-out Effettuato',
          `${visit.visitor?.full_name || 'Visitatore'} - Uscita registrata con successo`
        );

        // Torna a scan dopo 3 secondi
        setTimeout(() => {
          setResult(null);
        }, 3000);
      } else {
        throw new Error(checkOutResponse.data.message || 'Errore durante il check-out');
      }
    } catch (error) {
      console.error('❌ Check-out error:', error);
      setResult({
        success: false,
        error: error.message || 'Errore sconosciuto'
      });

      showAlert(
        'error',
        'Errore Check-out',
        error.response?.data?.message || error.message || 'Impossibile completare il check-out'
      );

      // Torna a scan dopo 3 secondi
      setTimeout(() => {
        setResult(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const toggleTorch = async () => {
    try {
      const newState = !torchEnabled;
      await scanner.toggleTorch(newState);
      setTorchEnabled(newState);
    } catch (error) {
      console.error('❌ Torch error:', error);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup: ferma scanner quando componente viene smontato
      scanner.stopScan();
    };
  }, []);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={styles.container}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.header}
          >
            <button onClick={onBack} style={styles.backButton}>
              <IonIcon icon={arrowBackOutline} />
            </button>
            <h1 style={styles.title}>Scanner QR</h1>
            <button
              onClick={toggleTorch}
              style={{
                ...styles.torchButton,
                ...(torchEnabled ? styles.torchButtonActive : {})
              }}
            >
              <IonIcon icon={flashlightOutline} />
            </button>
          </motion.div>

          {/* Result Display */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{
                  ...styles.resultCard,
                  ...(result.success ? styles.resultSuccess : styles.resultError)
                }}
              >
                <IonIcon
                  icon={result.success ? checkmarkCircleOutline : closeCircleOutline}
                  style={styles.resultIcon}
                />
                {result.success ? (
                  <>
                    <h2 style={styles.resultTitle}>Check-out Effettuato!</h2>
                    <p style={styles.resultText}>{result.visitor?.full_name}</p>
                    <p style={styles.resultTime}>Uscita: {result.checkOutTime}</p>
                  </>
                ) : (
                  <>
                    <h2 style={styles.resultTitle}>Errore</h2>
                    <p style={styles.resultText}>{result.error}</p>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanner Area */}
          {!result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.scannerArea}
            >
              <div style={styles.scanFrame}>
                <IonIcon icon={qrCodeOutline} style={styles.scanIcon} />
                <p style={styles.scanText}>
                  {isScanning ? 'Scanner attivo...' : 'Premi il pulsante per scansionare'}
                </p>
              </div>
            </motion.div>
          )}

          {/* Scan Button */}
          {!result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.buttonContainer}
            >
              <IonButton
                expand="block"
                size="large"
                onClick={handleScan}
                disabled={isScanning || loading}
                style={styles.scanButton}
              >
                {loading ? (
                  <>
                    <IonSpinner name="crescent" style={{ marginRight: '12px' }} />
                    Elaborazione...
                  </>
                ) : isScanning ? (
                  <>
                    <IonSpinner name="crescent" style={{ marginRight: '12px' }} />
                    Scanner Attivo
                  </>
                ) : (
                  <>
                    <IonIcon icon={qrCodeOutline} style={{ marginRight: '12px' }} />
                    Scansiona QR Code
                  </>
                )}
              </IonButton>
            </motion.div>
          )}

          {/* Instructions */}
          {!result && !isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={styles.instructions}
            >
              <h3 style={styles.instructionsTitle}>Come funziona:</h3>
              <ol style={styles.instructionsList}>
                <li>Premi il pulsante "Scansiona QR Code"</li>
                <li>Inquadra il badge del visitatore</li>
                <li>Il check-out verrà registrato automaticamente</li>
              </ol>
            </motion.div>
          )}
        </div>

        {/* Alert */}
        <Alert
          show={alert.show}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          duration={4000}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      </IonContent>
    </IonPage>
  );
};

const styles = {
  container: {
    minHeight: '100%',
    padding: '20px',
    background: theme.gradients.background
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px'
  },
  backButton: {
    width: '44px',
    height: '44px',
    borderRadius: theme.radius.full,
    border: 'none',
    background: theme.colors.background,
    boxShadow: theme.shadows.sm,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: theme.colors.text
  },
  title: {
    margin: 0,
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text
  },
  torchButton: {
    width: '44px',
    height: '44px',
    borderRadius: theme.radius.full,
    border: 'none',
    background: theme.colors.background,
    boxShadow: theme.shadows.sm,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: theme.colors.textSecondary,
    transition: `all ${theme.transitions.base}`
  },
  torchButtonActive: {
    background: theme.colors.warning,
    color: theme.colors.textInverse
  },
  resultCard: {
    padding: '40px 32px',
    borderRadius: theme.radius.xl,
    textAlign: 'center',
    marginBottom: '32px',
    boxShadow: theme.shadows.lg
  },
  resultSuccess: {
    background: theme.gradients.success,
    color: theme.colors.textInverse
  },
  resultError: {
    background: theme.gradients.accent,
    color: theme.colors.textInverse
  },
  resultIcon: {
    fontSize: '80px',
    marginBottom: '16px'
  },
  resultTitle: {
    margin: '0 0 12px 0',
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold
  },
  resultText: {
    margin: '0 0 8px 0',
    fontSize: theme.fontSize.xl,
    opacity: 0.9
  },
  resultTime: {
    margin: 0,
    fontSize: theme.fontSize.lg,
    opacity: 0.8
  },
  scannerArea: {
    marginBottom: '32px'
  },
  scanFrame: {
    padding: '60px 40px',
    borderRadius: theme.radius.xl,
    border: `3px dashed ${theme.colors.border}`,
    textAlign: 'center',
    background: theme.colors.background
  },
  scanIcon: {
    fontSize: '120px',
    color: theme.colors.accent,
    marginBottom: '16px'
  },
  scanText: {
    margin: 0,
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium
  },
  buttonContainer: {
    marginBottom: '32px'
  },
  scanButton: {
    '--background': theme.colors.accent,
    '--border-radius': theme.radius.lg,
    height: '64px',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold
  },
  instructions: {
    padding: '24px',
    borderRadius: theme.radius.lg,
    background: theme.colors.background,
    boxShadow: theme.shadows.sm
  },
  instructionsTitle: {
    margin: '0 0 16px 0',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text
  },
  instructionsList: {
    margin: 0,
    paddingLeft: '20px',
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.base,
    lineHeight: '1.8'
  }
};

export default ScanQR;
