import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoBackspace,
  IoArrowBack,
  IoKeypad,
  IoQrCode
} from 'react-icons/io5';
import { kioskAPI } from '../../services/api';

const PinEntry = ({ onBack }) => {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [visitData, setVisitData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Auto-verify quando il PIN è completo
    if (pin.length === 4 && !loading && !visitData) {
      verifyPin();
    }
  }, [pin]);

  const handleNumberClick = (num) => {
    if (pin.length < 4 && !loading && !visitData) {
      setPin(pin + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    if (!loading && !visitData) {
      setPin(pin.slice(0, -1));
      setError('');
    }
  };

  const handleClear = () => {
    if (!loading) {
      setPin('');
      setError('');
      setVisitData(null);
      setSuccess(false);
    }
  };

  const verifyPin = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('🔍 Verifying PIN:', pin);
      const response = await kioskAPI.verifyPin(pin);

      if (response.data.status === 'error') {
        setError(response.data.message || 'PIN non valido');
        setPin('');
        return;
      }

      const visit = response.data.data;
      console.log('✅ Visit found:', visit);

      setVisitData(visit);

    } catch (error) {
      console.error('❌ Error verifying PIN:', error);
      setError(error.response?.data?.message || 'Errore durante la verifica del PIN');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('✅ Processing check-in with PIN:', pin);
      const response = await kioskAPI.checkIn(pin);

      if (response.data.status === 'success') {
        setSuccess(true);

        // Torna alla home dopo 5 secondi
        setTimeout(() => {
          handleClear();
        }, 5000);
      }

    } catch (error) {
      console.error('❌ Check-in error:', error);
      setError(error.response?.data?.message || 'Errore durante il check-in');
      setVisitData(null);
      setPin('');
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
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const keypadButtonVariants = {
    hover: {
      scale: 1.05,
      transition: { duration: 0.15 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
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
        @keyframes btnPress {
          0% {
            background: #9ab3e7ff;
            transform: scale(1);
          }
          50% {
            background: #dbeafe;
            transform: scale(0.95);
          }
          100% {
            background: #f3f4f6;
            transform: scale(1);
          }
        }

        .keypad-btn:active:not(:disabled) {
          animation: btnPress 0.5s ease !important;
        }

        @media (max-width: 1024px) {
          .main-content-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
            padding: 0 20px !important;
          }
        }

        @media (max-width: 768px) {
          .confirmation-card {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .confirmation-card .qr-section {
            border-right: none !important;
            border-bottom: 2px solid #e5e7eb;
            padding: 24px 20px !important;
          }
          .confirmation-card .details-section {
            padding: 24px 20px !important;
          }
          .confirmation-buttons {
            grid-template-columns: 1fr !important;
          }
          .confirmation-wrapper {
            padding: 0 12px !important;
          }
        }
      `}</style>

      {/* Header */}
      <motion.div style={styles.header} variants={itemVariants}>
        <button onClick={onBack} style={styles.backButton}>
          <IoArrowBack size={24} />
        </button>
        <h1 style={styles.title}>Self Check-In</h1>
        <div style={{ width: 40 }}></div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!visitData && !success && (
          <motion.div
            key="pin-input"
            style={styles.mainContent}
            className="main-content-grid"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Left Column - Info Area */}
            <div style={styles.leftColumn}>
            <div style={styles.infoCard}>
              <div style={styles.iconContainer}>
                <IoKeypad size={80} color="#3b82f6" />
              </div>
              <h2 style={styles.infoTitle}>Check-In con PIN</h2>
              <p style={styles.infoDescription}>
                Inserisca il codice PIN a 4 cifre che le è stato comunicato
              </p>

              {/* PIN Display */}
              <div style={styles.pinDisplay}>
                <p style={styles.pinLabel}>Il tuo PIN</p>
                <div style={styles.pinDots}>
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      style={{
                        ...styles.pinDot,
                        ...(pin.length > index ? styles.pinDotFilled : {})
                      }}
                    >
                      {pin.length > index && (
                        <span style={styles.pinNumber}>{pin[index]}</span>
                      )}
                    </div>
                  ))}
                </div>
                {error && (
                  <div style={styles.errorMessage}>
                    <IoCloseCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Numeric Keypad */}
          <div style={styles.rightColumn}>
            <div style={styles.keypad}>
              <div style={styles.keypadGrid}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <motion.button
                    key={num}
                    onClick={() => handleNumberClick(num.toString())}
                    style={styles.keypadButton}
                    className="keypad-btn"
                    disabled={loading}
                    variants={keypadButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {num}
                  </motion.button>
                ))}
                <motion.button
                  onClick={handleClear}
                  style={{ ...styles.keypadButton, ...styles.keypadButtonSecondary }}
                  className="keypad-btn"
                  disabled={loading}
                  variants={keypadButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  C
                </motion.button>
                <motion.button
                  onClick={() => handleNumberClick('0')}
                  style={styles.keypadButton}
                  className="keypad-btn"
                  disabled={loading}
                  variants={keypadButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  0
                </motion.button>
                <motion.button
                  onClick={handleBackspace}
                  style={{ ...styles.keypadButton, ...styles.keypadButtonSecondary }}
                  className="keypad-btn"
                  disabled={loading}
                  variants={keypadButtonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <IoBackspace size={24} />
                </motion.button>
              </div>
            </div>
          </div>

          {loading && (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Verifica in corso...</p>
            </div>
          )}
          </motion.div>
        )}

        {visitData && !success && (
          <motion.div
            key="confirmation"
            style={styles.confirmationContainer}
            className="confirmation-wrapper"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
          {/* Header */}
          <div style={styles.confirmationHeader}>
            <h2 style={styles.confirmationTitle}>Conferma i tuoi dati</h2>
            <p style={styles.confirmationSubtitle}>Verifica che le informazioni siano corrette prima di procedere</p>
          </div>

          {/* Main Card */}
          <div style={styles.mainCard} className="confirmation-card">
            {/* Left Side - QR Code Badge */}
            <div style={styles.qrCodeSection} className="qr-section">
              <div style={styles.qrCodeContainer}>
                <div style={styles.qrPlaceholder}>
                  <IoQrCode size={180} color="#1a1a1a" />
                </div>
              </div>
              <p style={styles.qrCodeLabel}>Badge Visitatore</p>
              {visitData.badgeNumber && (
                <p style={styles.badgeNumber}>{visitData.badgeNumber}</p>
              )}
            </div>

            {/* Right Side - Details */}
            <div style={styles.detailsSection} className="details-section">
              {/* Visitor Info */}
              <div style={styles.visitorInfo}>
                <h3 style={styles.visitorName}>{visitData.visitor.full_name}</h3>
                {visitData.visitor.company && (
                  <p style={styles.companySubtitle}>{visitData.visitor.company}</p>
                )}
              </div>

              {/* Details Grid */}
              <div style={styles.detailsGrid}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Data</span>
                  <span style={styles.detailValue}>
                    {new Date(visitData.scheduledDate).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Dipartimento</span>
                  <span style={styles.detailValue}>{visitData.department.name}</span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Motivo</span>
                  <span style={styles.detailValue}>{visitData.purpose}</span>
                </div>
                {visitData.hostUser && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Referente</span>
                    <span style={styles.detailValue}>
                      {visitData.hostUser.firstName} {visitData.hostUser.lastName}
                    </span>
                  </div>
                )}
              </div>

              {/* Company Footer */}
              <div style={styles.companyFooter}>
                <p style={styles.companyFooterText}>Calzaturificio Emmegiemme Shoes Srl</p>
              </div>
            </div>
          </div>

          {/* Privacy Disclaimer */}
          <div style={styles.privacyDisclaimer}>
            <p style={styles.privacyText}>
              Proseguendo con la registrazione dichiaro di aver letto e compreso l'Informativa Privacy ai sensi del Regolamento UE 2016/679.
            </p>
          </div>

          {/* Confirmation Buttons */}
          <div style={styles.buttonContainer} className="confirmation-buttons">
            <button
              onClick={handleCheckIn}
              disabled={loading}
              style={{
                ...styles.confirmButton,
                ...(loading ? styles.buttonDisabled : {})
              }}
            >
              {loading ? (
                <>
                  <div style={styles.buttonSpinner}></div>
                  <span>Check-in in corso...</span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircle size={24} />
                  <span>Conferma Check-In</span>
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              disabled={loading}
              style={styles.cancelButton}
            >
              Annulla
            </button>
          </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            key="success"
            style={styles.successContainer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              style={styles.successIcon}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
            >
              <IoCheckmarkCircle size={120} color="#10b981" />
            </motion.div>
            <h2 style={styles.successTitle}>Check-In Completato!</h2>
            <p style={styles.successMessage}>
              Benvenuto {visitData?.visitor.full_name}
            </p>
            <p style={styles.successSubMessage}>
              Il tuo badge sta per essere stampato.
              <br />
              Ritiralo presso la reception.
            </p>
            <div style={styles.autoCloseMessage}>
              Reindirizzamento automatico in 5 secondi...
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    position: 'relative'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '40px',
    padding: '0 20px'
  },
  backButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #e5e5e5',
    background: '#fff',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
    textAlign: 'center'
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '40px',
    alignItems: 'center',
    minHeight: 'calc(100vh - 200px)',
    padding: '0 40px'
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
    alignItems: 'center',
    justifyContent: 'center'
  },
  infoCard: {
    width: '100%',
    maxWidth: '500px',
    background: '#fff',
    borderRadius: '24px',
    padding: '48px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    textAlign: 'center'
  },
  iconContainer: {
    width: '140px',
    height: '140px',
    borderRadius: '16px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 32px'
  },
  infoTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '16px',
    letterSpacing: '-0.5px'
  },
  infoDescription: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '40px',
    fontWeight: '500'
  },
  pinDisplay: {
    padding: '32px 0 0',
    borderTop: '2px solid #f3f4f6',
    textAlign: 'center'
  },
  pinLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  pinDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '10px'
  },
  pinDot: {
    width: '60px',
    height: '70px',
    borderRadius: '12px',
    border: '3px solid #e5e5e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    transition: 'all 0.2s ease',
    background: '#f9f9f9'
  },
  pinDotFilled: {
    borderColor: '#3b82f6',
    background: '#eff6ff'
  },
  pinNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#3b82f6'
  },
  errorMessage: {
    marginTop: '20px',
    padding: '12px 20px',
    background: '#fee2e2',
    border: '2px solid #ef4444',
    borderRadius: '8px',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600'
  },
  keypad: {
    width: '100%',
    maxWidth: '400px'
  },
  keypadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px'
  },
  keypadButton: {
    height: '90px',
    fontSize: '32px',
    fontWeight: '700',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    background: '#ffffffff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    transition: 'none',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.5px',
    position: 'relative'
  },
  keypadButtonSecondary: {
    background: '#e5e7eb',
    borderColor: '#d1d5db',
    color: '#6b7280'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255, 255, 255, 0.3)',
    borderTop: '5px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    marginTop: '20px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600'
  },
  confirmationContainer: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    padding: '0 20px'
  },
  confirmationHeader: {
    textAlign: 'center',
    marginBottom: '32px'
  },
  confirmationTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '8px',
    letterSpacing: '-0.5px'
  },
  confirmationSubtitle: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500'
  },
  mainCard: {
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    marginBottom: '24px',
    minHeight: '380px'
  },
  qrCodeSection: {
    background: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    borderRight: '2px solid #e5e7eb'
  },
  qrCodeContainer: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    marginBottom: '16px'
  },
  qrPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  qrCodeLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 8px 0'
  },
  badgeNumber: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1a1a1a',
    margin: 0,
    letterSpacing: '2px',
    fontFamily: 'monospace'
  },
  detailsSection: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    position: 'relative'
  },
  visitorInfo: {
    borderBottom: '2px solid #f3f4f6',
    paddingBottom: '16px'
  },
  visitorName: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px'
  },
  companySubtitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#6b7280',
    margin: 0,
    letterSpacing: '0.2px'
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  detailRow: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gap: '12px',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6'
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  companyFooter: {
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '2px solid #f3f4f6',
    textAlign: 'center'
  },
  companyFooterText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#999',
    margin: 0,
    letterSpacing: '0.3px'
  },
  qrSection: {
    marginTop: 'auto',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '12px',
    textAlign: 'center'
  },
  qrLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#6b7280'
  },
  privacyDisclaimer: {
    maxWidth: '900px',
    margin: '0 auto 16px',
    padding: '0 20px',
    textAlign: 'center'
  },
  privacyText: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: 0,
    fontStyle: 'italic'
  },
  buttonContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 20px'
  },
  confirmButton: {
    height: '64px',
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
    gap: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
    letterSpacing: '0.5px'
  },
  cancelButton: {
    height: '64px',
    borderRadius: '16px',
    border: '3px solid #e5e7eb',
    background: '#fff',
    color: '#6b7280',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.5px'
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },
  buttonSpinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  successContainer: {
    background: '#fff',
    borderRadius: '20px',
    padding: '60px 40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'center'
  },
  successIcon: {
    marginBottom: '30px',
    animation: 'scaleIn 0.5s ease'
  },
  successTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#10b981',
    marginBottom: '16px'
  },
  successMessage: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '16px'
  },
  successSubMessage: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '30px'
  },
  autoCloseMessage: {
    fontSize: '14px',
    color: '#999',
    fontStyle: 'italic'
  }
};

// Add animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes scaleIn {
      0% { transform: scale(0); }
      100% { transform: scale(1); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default PinEntry;
