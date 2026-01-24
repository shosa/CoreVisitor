/**
 * ScanBarcode Component
 * Scanner codici a barre per check-out visitatori in modalità kiosk
 * CoreInWork Style - Clean, minimal, white design
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoBarcode,
  IoArrowBack,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoCamera
} from 'react-icons/io5';
import scanner from '../../services/scanner';
import { kioskAPI, printerAPI } from '../../services/api';

const ScanQR = ({ onBack }) => {
  const [isScanning, setIsScanning] = useState(false);
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

      // Scansiona codice a barre
      await scanner.scanContinuous(async (code) => {
        console.log('📷 Barcode scanned:', code);

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

      console.log('✅ Barcode found in image:', code);

      // Process checkout
      await processCheckOut(code);

    } catch (error) {
      console.error('❌ Image scan error:', error);
      showMessage('error', error.message || 'Nessun codice a barre trovato nell\'immagine');
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

  useEffect(() => {
    return () => {
      // Cleanup: ferma scanner quando componente viene smontato
      scanner.stopScan();
    };
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.03,
      boxShadow: '0 12px 28px rgba(16, 185, 129, 0.4)',
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.98
    }
  };

  return (
    <motion.div
      style={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <style>{`
        @media (max-width: 1024px) {
          .scan-content-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 0 20px !important;
          }
        }
      `}</style>

      {/* Header */}
      <motion.div style={styles.header} variants={itemVariants}>
        <button onClick={onBack} style={styles.backButton}>
          <IoArrowBack size={24} />
        </button>
        <h1 style={styles.title}>Scanner Codice a Barre Check-Out</h1>
        <div style={{ width: '40px' }}></div>
      </motion.div>

      {/* Message */}
      <AnimatePresence>
        {message.show && (
          <motion.div
            style={{
              ...styles.message,
              ...(message.type === 'success' ? styles.messageSuccess : styles.messageError)
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {message.type === 'success' ? (
              <IoCheckmarkCircle size={20} style={{ marginRight: '8px' }} />
            ) : (
              <IoCloseCircle size={20} style={{ marginRight: '8px' }} />
            )}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Display */}
      <AnimatePresence>
        {result && (
          <motion.div
            style={{
              ...styles.resultCard,
              ...(result.success ? styles.resultSuccess : styles.resultError)
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              style={styles.resultIcon}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
            >
              {result.success ? (
                <IoCheckmarkCircle size={80} color="#10b981" />
              ) : (
                <IoCloseCircle size={80} color="#ef4444" />
              )}
            </motion.div>
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

      {/* Hidden file input for iOS fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFileSelect}
      />

      {/* Hidden canvas for barcode detection */}
      <canvas id="qr-canvas" hidden></canvas>

      {/* Main Content - 2 Column Layout */}
      {!result && (
        <motion.div
          style={styles.mainContent}
          className="scan-content-grid"
          variants={itemVariants}
        >
          {/* Left Column - Scanner Area */}
          <div style={styles.leftColumn}>
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
                  <IoBarcode size={120} color="#10b981" />
                </div>
                <p style={styles.scanText}>
                  Premi il pulsante per scansionare il codice a barre
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div style={styles.rightColumn}>
            {/* Live Scanner - Only if camera is supported */}
            {cameraSupported && (
              <motion.button
                onClick={handleScan}
                disabled={isScanning || loading}
                style={{
                  ...styles.scanButton,
                  ...(isScanning || loading ? styles.scanButtonDisabled : {})
                }}
                variants={buttonVariants}
                whileHover={!isScanning && !loading ? "hover" : {}}
                whileTap={!isScanning && !loading ? "tap" : {}}
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
                    <IoBarcode size={24} style={{ marginRight: '12px' }} />
                    <span>Scansiona Codice a Barre</span>
                  </>
                )}
              </motion.button>
            )}

            {/* Upload Image Button - Always available as fallback */}
            {!isScanning && (
              <motion.button
                onClick={handleUploadImage}
                disabled={loading}
                style={{
                  ...(!cameraSupported ? styles.scanButton : styles.uploadButton),
                  ...(loading ? styles.scanButtonDisabled : {})
                }}
                variants={buttonVariants}
                whileHover={!loading ? "hover" : {}}
                whileTap={!loading ? "tap" : {}}
              >
                <IoCamera size={20} style={{ marginRight: cameraSupported ? '8px' : '12px' }} />
                <span>{cameraSupported ? 'Carica Immagine' : 'Scansiona da Foto'}</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

    </motion.div>
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
    width: '40px',
    height: '40px',
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
    fontWeight: '700',
    color: '#1a1a1a'
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
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '32px',
    marginBottom: '24px',
    alignItems: 'center',
    minHeight: 'calc(100vh - 200px)'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qrVideo: {
    width: '100%',
    maxWidth: '500px',
    aspectRatio: '1/1',
    borderRadius: '16px',
    overflow: 'hidden',
    border: '3px dashed #10b981',
    display: 'block',
    objectFit: 'cover'
  },
  scanFrame: {
    width: '100%',
    maxWidth: '500px',
    aspectRatio: '1/1',
    borderRadius: '16px',
    border: '3px dashed #10b981',
    textAlign: 'center',
    background: '#fff',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px'
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
    border: '3px dashed #10b981',
    borderRadius: '12px',
    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
    animation: 'pulse 2s ease-in-out infinite'
  },
  scanIconContainer: {
    width: '140px',
    height: '140px',
    borderRadius: '16px',
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px'
  },
  scanText: {
    margin: 0,
    fontSize: '18px',
    color: '#666',
    fontWeight: '500',
    lineHeight: '1.5'
  },
  scanButton: {
    width: '100%',
    height: '80px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
    letterSpacing: '0.5px'
  },
  scanButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  uploadButton: {
    width: '100%',
    height: '80px',
    borderRadius: '16px',
    border: '3px solid #e5e7eb',
    background: '#fff',
    color: '#6b7280',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
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
        border-color: #10b981;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.5);
      }
      50% {
        border-color: #34d399;
        box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 40px rgba(16, 185, 129, 0.8);
      }
    }
  `;
  if (!document.head.querySelector('style[data-scan-animation]')) {
    styleSheet.setAttribute('data-scan-animation', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default ScanQR;
