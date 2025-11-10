/**
 * ScanQR Component
 * Scanner QR per check-out visitatori in modalità kiosk
 * CoreInWork Style - Clean, minimal, white design
 */

import React, { useState, useEffect } from 'react';
import {
  IoQrCode,
  IoFlashlight,
  IoArrowBack,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoInformationCircle
} from 'react-icons/io5';
import scanner from '../../services/scanner';
import { kioskAPI } from '../../services/api';

const ScanQR = ({ onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, type: 'info', text: '' });

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: 'info', text: '' }), 4000);
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
      showMessage('error', error.message || 'Impossibile avviare lo scanner');
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

        showMessage('success', `${visit.visitor?.full_name || 'Visitatore'} - Uscita registrata con successo`);

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

      showMessage('error', error.response?.data?.message || error.message || 'Impossibile completare il check-out');

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
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <IoArrowBack size={24} />
        </button>
        <h1 style={styles.title}>Scanner QR</h1>
        <button
          onClick={toggleTorch}
          style={{
            ...styles.torchButton,
            ...(torchEnabled ? styles.torchButtonActive : {})
          }}
        >
          <IoFlashlight size={24} />
        </button>
      </div>

      {/* Message */}
      {message.show && (
        <div style={{
          ...styles.message,
          ...(message.type === 'success' ? styles.messageSuccess : styles.messageError)
        }}>
          {message.type === 'success' ? (
            <IoCheckmarkCircle size={20} style={{ marginRight: '8px' }} />
          ) : (
            <IoCloseCircle size={20} style={{ marginRight: '8px' }} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div style={{
          ...styles.resultCard,
          ...(result.success ? styles.resultSuccess : styles.resultError)
        }}>
          <div style={styles.resultIcon}>
            {result.success ? (
              <IoCheckmarkCircle size={80} color="#10b981" />
            ) : (
              <IoCloseCircle size={80} color="#ef4444" />
            )}
          </div>
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
        </div>
      )}

      {/* Scanner Area */}
      {!result && (
        <div style={styles.scannerArea}>
          <div style={styles.scanFrame}>
            <div style={styles.scanIconContainer}>
              <IoQrCode size={120} color="#3b82f6" />
            </div>
            <p style={styles.scanText}>
              {isScanning ? 'Scanner attivo...' : 'Premi il pulsante per scansionare'}
            </p>
          </div>
        </div>
      )}

      {/* Scan Button */}
      {!result && (
        <div style={styles.buttonContainer}>
          <button
            onClick={handleScan}
            disabled={isScanning || loading}
            style={{
              ...styles.scanButton,
              ...(isScanning || loading ? styles.scanButtonDisabled : {})
            }}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                <span>Elaborazione...</span>
              </>
            ) : isScanning ? (
              <>
                <div style={styles.spinner}></div>
                <span>Scanner Attivo</span>
              </>
            ) : (
              <>
                <IoQrCode size={24} style={{ marginRight: '12px' }} />
                <span>Scansiona QR Code</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Instructions */}
      {!result && !isScanning && (
        <div style={styles.instructions}>
          <div style={styles.instructionsHeader}>
            <div style={styles.instructionsIcon}>
              <IoInformationCircle size={24} color="#3b82f6" />
            </div>
            <h3 style={styles.instructionsTitle}>Come funziona</h3>
          </div>
          <ol style={styles.instructionsList}>
            <li>Premi il pulsante "Scansiona QR Code"</li>
            <li>Inquadra il badge del visitatore</li>
            <li>Il check-out verrà registrato automaticamente</li>
          </ol>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '24px',
    background: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
  },
  backButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid #e5e5e5',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
    transition: 'all 0.2s ease',
    fontSize: '0'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  torchButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid #e5e5e5',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    transition: 'all 0.2s ease',
    fontSize: '0'
  },
  torchButtonActive: {
    background: '#fffbeb',
    borderColor: '#f59e0b',
    color: '#f59e0b'
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '15px',
    fontWeight: '500'
  },
  messageSuccess: {
    background: '#f0fdf4',
    color: '#10b981',
    border: '2px solid #10b981'
  },
  messageError: {
    background: '#fef2f2',
    color: '#ef4444',
    border: '2px solid #ef4444'
  },
  resultCard: {
    padding: '48px 32px',
    borderRadius: '16px',
    textAlign: 'center',
    marginBottom: '24px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
  },
  resultSuccess: {
    borderColor: '#10b981',
    background: '#f0fdf4'
  },
  resultError: {
    borderColor: '#ef4444',
    background: '#fef2f2'
  },
  resultIcon: {
    marginBottom: '16px'
  },
  resultTitle: {
    margin: '0 0 12px 0',
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  resultText: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    color: '#666'
  },
  resultTime: {
    margin: 0,
    fontSize: '16px',
    color: '#999'
  },
  scannerArea: {
    marginBottom: '24px'
  },
  scanFrame: {
    padding: '60px 40px',
    borderRadius: '16px',
    border: '3px dashed #e5e5e5',
    textAlign: 'center',
    background: '#fff'
  },
  scanIconContainer: {
    marginBottom: '16px'
  },
  scanText: {
    margin: 0,
    fontSize: '16px',
    color: '#666',
    fontWeight: '500'
  },
  buttonContainer: {
    marginBottom: '24px'
  },
  scanButton: {
    width: '100%',
    height: '64px',
    borderRadius: '12px',
    border: '2px solid #3b82f6',
    background: '#3b82f6',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  scanButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginRight: '12px'
  },
  instructions: {
    padding: '24px',
    borderRadius: '16px',
    background: '#fff',
    border: '2px solid #e5e5e5'
  },
  instructionsHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  instructionsIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px'
  },
  instructionsTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  instructionsList: {
    margin: 0,
    paddingLeft: '24px',
    color: '#666',
    fontSize: '15px',
    lineHeight: '1.8'
  }
};

// Add spinner animation to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.head.querySelector('style[data-spin-animation]')) {
    styleSheet.setAttribute('data-spin-animation', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default ScanQR;
