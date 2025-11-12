/**
 * ScanQR Component
 * Scanner QR per check-out visitatori in modalità kiosk
 * CoreInWork Style - Clean, minimal, white design
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  IoQrCode,
  IoFlashlight,
  IoArrowBack,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoInformationCircle,
  IoPrint
} from 'react-icons/io5';
import scanner from '../../services/scanner';
import { kioskAPI, printerAPI } from '../../services/api';

const ScanQR = ({ onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, type: 'info', text: '' });
  const [cameraSupported, setCameraSupported] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check if camera is supported
    setCameraSupported(scanner.isCameraSupported());
  }, []);

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: 'info', text: '' }), 4000);
  };

  const handleScan = async () => {
    try {
      setIsScanning(true);
      setResult(null);

      console.log('🚀 Starting scan...');

      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Scansiona QR code
      await scanner.scanContinuous(async (code) => {
        console.log('📷 QR Code scanned:', code);

        // Stop scanning immediately
        await scanner.stopScan();
        setIsScanning(false);

        // Process checkout
        await processCheckOut(code);
      }, {
        videoId: 'qr-video',
        canvasId: 'qr-canvas'
      });

      console.log('✅ Scanner started');

    } catch (error) {
      console.error('❌ Scan error:', error);
      showMessage('error', error.message || 'Impossibile avviare lo scanner');
      setIsScanning(false);
    }
  };

  // iOS PWA fallback - scan from image
  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      console.log('📸 Scanning from image...');

      const code = await scanner.scanFromFile(file);

      console.log('✅ QR Code found in image:', code);

      // Process checkout
      await processCheckOut(code);

    } catch (error) {
      console.error('❌ Image scan error:', error);
      showMessage('error', error.message || 'Nessun QR code trovato nell\'immagine');
    } finally {
      setLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadImage = () => {
    fileInputRef.current?.click();
  };

  const processCheckOut = async (badgeCode) => {
    setLoading(true);
    try {
      console.log('🔍 Verifying badge:', badgeCode);

      // Verifica badge
      const verifyResponse = await kioskAPI.verifyBadge(badgeCode);
      console.log('📋 Full verify response:', JSON.stringify(verifyResponse.data, null, 2));

      // Gestisci diversi formati di risposta
      let visit = null;
      let visitId = null;

      if (verifyResponse.data.status === 'error') {
        throw new Error(verifyResponse.data.message || 'Badge non valido');
      }

      // Prova diversi formati di risposta
      if (verifyResponse.data.data) {
        visit = verifyResponse.data.data;
        visitId = visit.id || visit.visit_id;
      } else if (verifyResponse.data.visit) {
        visit = verifyResponse.data.visit;
        visitId = visit.id || visit.visit_id;
      } else if (verifyResponse.data.id) {
        // La risposta è direttamente la visita
        visit = verifyResponse.data;
        visitId = visit.id || visit.visit_id;
      }

      // Validazione: assicurati che visitId esista
      if (!visitId) {
        console.error('❌ Invalid visit data:', verifyResponse.data);
        console.error('❌ Parsed visit:', visit);
        throw new Error('Nessuna visita trovata per questo badge. Verifica che la visita sia in stato checked-in.');
      }

      console.log('✅ Visit found:', visit);
      console.log('✅ Visit ID:', visitId);

      // Check-out
      const checkOutResponse = await kioskAPI.checkOut(visitId, badgeCode);
      console.log('📤 Check-out response:', checkOutResponse.data);

      if (checkOutResponse.data.status === 'success') {
        setResult({
          success: true,
          visitor: visit.visitor,
          visitId: visit.id,
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

      {/* Hidden file input for iOS fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFileSelect}
      />

      {/* Hidden canvas for QR detection */}
      <canvas id="qr-canvas" hidden></canvas>

      {/* Scanner Area */}
      {!result && (
        <div style={styles.scannerArea}>
          {isScanning ? (
            <video
              id="qr-video"
              style={styles.qrVideo}
              playsInline
              autoPlay
            ></video>
          ) : (
            <div style={styles.scanFrame}>
              <div style={styles.scanIconContainer}>
                <IoQrCode size={120} color="#3b82f6" />
              </div>
              <p style={styles.scanText}>
                Premi il pulsante per scansionare
              </p>
            </div>
          )}
        </div>
      )}

      {/* Scan Button */}
      {!result && (
        <div style={styles.buttonContainer}>
          {/* Live Scanner - Only if camera is supported */}
          {cameraSupported && (
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
          )}

          {/* Upload Image Button - Always available as fallback */}
          {!isScanning && (
            <button
              onClick={handleUploadImage}
              disabled={loading}
              style={{
                ...(!cameraSupported ? styles.scanButton : styles.uploadButton),
                ...(loading ? styles.scanButtonDisabled : {})
              }}
            >
              <IoPrint size={20} style={{ marginRight: cameraSupported ? '8px' : '12px' }} />
              <span>{cameraSupported ? 'Carica Immagine' : 'Scansiona da Foto'}</span>
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      {!result && !isScanning && (
        <div style={styles.instructions}>
          <div style={styles.instructionsHeader}>
            <div style={styles.instructionsIcon}>
              <IoInformationCircle size={24} color={!cameraSupported ? "#f59e0b" : "#3b82f6"} />
            </div>
            <h3 style={styles.instructionsTitle}>Come funziona</h3>
          </div>
          {!cameraSupported ? (
            <div style={styles.warningBox}>
              <p style={styles.warningText}>
                ⚠️ Scanner live non disponibile in questa modalità (iOS PWA standalone).
              </p>
              <ol style={styles.instructionsList}>
                <li>Premi il pulsante "Scansiona da Foto"</li>
                <li>Scatta una foto del badge QR o carica un'immagine</li>
                <li>Il check-out verrà registrato automaticamente</li>
              </ol>
            </div>
          ) : (
            <ol style={styles.instructionsList}>
              <li>Premi il pulsante "Scansiona QR Code"</li>
              <li>Inquadra il badge del visitatore</li>
              <li>Il check-out verrà registrato automaticamente</li>
            </ol>
          )}
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
  qrVideo: {
    width: '100%',
    maxWidth: '500px',
    height: 'auto',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '3px solid #3b82f6',
    display: 'block',
    margin: '0 auto'
  },
  scanFrame: {
    padding: '60px 40px',
    borderRadius: '16px',
    border: '3px dashed #e5e5e5',
    textAlign: 'center',
    background: '#fff',
    position: 'relative',
    overflow: 'hidden'
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '500px',
    margin: '0 auto',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '12px'
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none'
  },
  scannerBox: {
    width: '250px',
    height: '250px',
    border: '3px solid #3b82f6',
    borderRadius: '12px',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    animation: 'pulse 2s ease-in-out infinite'
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
  uploadButton: {
    width: '100%',
    height: '56px',
    borderRadius: '12px',
    border: '2px solid #e5e5e5',
    background: '#fff',
    color: '#666',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    marginTop: '12px'
  },
  uploadButtonDisabled: {
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
  },
  warningBox: {
    marginTop: '12px'
  },
  warningText: {
    margin: '0 0 12px 0',
    padding: '12px',
    background: '#fffbeb',
    border: '2px solid #f59e0b',
    borderRadius: '8px',
    color: '#92400e',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '1.6'
  }
};

// Add animations to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% {
        border-color: #3b82f6;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.5);
      }
      50% {
        border-color: #60a5fa;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 40px rgba(59, 130, 246, 0.8);
      }
    }
  `;
  if (!document.head.querySelector('style[data-scan-animation]')) {
    styleSheet.setAttribute('data-scan-animation', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default ScanQR;
