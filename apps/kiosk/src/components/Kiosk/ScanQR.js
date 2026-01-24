/**
 * BarcodeInput Component
 * Input manuale codice a barre per check-out visitatori in modalità kiosk
 * Ottimizzato per lettori barcode USB
 * CoreInWork Style - Clean, minimal, white design
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoBarcode,
  IoArrowBack,
  IoCheckmarkCircle,
  IoCloseCircle
} from 'react-icons/io5';
import { kioskAPI } from '../../services/api';

const ScanQR = ({ onBack }) => {
  const [badgeInput, setBadgeInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, type: 'info', text: '' });
  const inputRef = useRef(null);

  // Auto-focus sul campo input al mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Re-focus dopo ogni operazione
  useEffect(() => {
    if (!loading && !result && inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading, result]);

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: 'info', text: '' }), 4000);
  };

  const handleInputChange = (e) => {
    setBadgeInput(e.target.value.toUpperCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!badgeInput.trim()) {
      showMessage('error', 'Inserisci il numero badge');
      return;
    }

    await processCheckOut(badgeInput.trim());
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

        // Reset input e torna allo stato iniziale dopo 3 secondi
        setBadgeInput('');
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

      // Reset input e torna allo stato iniziale dopo 3 secondi
      setBadgeInput('');
      setTimeout(() => {
        setResult(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <motion.div
      style={styles.container}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div style={styles.header} variants={itemVariants}>
        <button onClick={onBack} style={styles.backButton}>
          <IoArrowBack size={24} />
        </button>
        <h1 style={styles.title}>CHECK-OUT</h1>
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

      {/* Main Content */}
      {!result && (
        <motion.div style={styles.mainContent} variants={itemVariants}>
          {/* Icon Container */}
          <div style={styles.iconContainer}>
            <div style={styles.barcodeIcon}>
              <IoBarcode size={120} color="#10b981" />
            </div>
          </div>

          {/* Instructions */}
          <p style={styles.instructions}>
            Scansiona il codice a barre del badge o inserisci manualmente il numero
          </p>

          {/* Input Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            <input
              ref={inputRef}
              type="text"
              value={badgeInput}
              onChange={handleInputChange}
              placeholder="Numero Badge (es. VIS-XXX-XXX)"
              style={styles.input}
              disabled={loading}
              autoComplete="off"
              autoCapitalize="characters"
            />

            <motion.button
              type="submit"
              disabled={loading || !badgeInput.trim()}
              style={{
                ...styles.submitButton,
                ...(loading || !badgeInput.trim() ? styles.submitButtonDisabled : {})
              }}
              whileHover={!loading && badgeInput.trim() ? { scale: 1.02 } : {}}
              whileTap={!loading && badgeInput.trim() ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  <span>Elaborazione...</span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircle size={24} style={{ marginRight: '12px' }} />
                  <span>Conferma Check-Out</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Help Text */}
          <p style={styles.helpText}>
            Il lettore barcode inserirà automaticamente il codice nel campo
          </p>
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
    marginBottom: '40px'
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
    fontSize: '32px',
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
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    maxWidth: '600px',
    margin: '0 auto'
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
    maxWidth: '600px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: '40px'
  },
  iconContainer: {
    marginBottom: '40px'
  },
  barcodeIcon: {
    width: '160px',
    height: '160px',
    borderRadius: '20px',
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
  },
  instructions: {
    fontSize: '18px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '32px',
    fontWeight: '500',
    lineHeight: '1.6'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  input: {
    width: '100%',
    height: '70px',
    fontSize: '20px',
    padding: '0 24px',
    borderRadius: '12px',
    border: '3px solid #e5e7eb',
    background: '#fff',
    color: '#1a1a1a',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: '1px',
    fontFamily: 'monospace',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  submitButton: {
    width: '100%',
    height: '80px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    fontSize: '20px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
    letterSpacing: '0.5px'
  },
  submitButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  helpText: {
    fontSize: '14px',
    color: '#999',
    textAlign: 'center',
    marginTop: '24px',
    fontWeight: '500'
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

// Add animation to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    input:focus {
      border-color: #10b981 !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
    }
  `;
  if (!document.head.querySelector('style[data-checkout-animation]')) {
    styleSheet.setAttribute('data-checkout-animation', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default ScanQR;
