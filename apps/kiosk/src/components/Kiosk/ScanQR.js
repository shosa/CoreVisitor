/**
 * ScanQR / CheckOut Component
 * Check-out visitatori tramite tastierino numerico (badge a 6 cifre)
 * Stessa UX del check-in con PIN
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoBackspace,
  IoArrowBack,
  IoBarcode,
} from 'react-icons/io5';
import { kioskAPI } from '../../services/api';
import { useTranslation } from '../../context/LanguageContext';

const ScanQR = ({ onBack }) => {
  const { t } = useTranslation();
  const [badge, setBadge] = useState('');
  const [loading, setLoading] = useState(false);
  const [visitData, setVisitData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Auto-verify quando il badge è completo (6 cifre)
    if (badge.length === 6 && !loading && !visitData) {
      verifyBadge();
    }
  }, [badge]);

  const handleNumberClick = (num) => {
    if (badge.length < 6 && !loading && !visitData) {
      setBadge(badge + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    if (!loading && !visitData) {
      setBadge(badge.slice(0, -1));
      setError('');
    }
  };

  const handleClear = () => {
    if (!loading) {
      setBadge('');
      setError('');
      setVisitData(null);
      setSuccess(false);
    }
  };

  const verifyBadge = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await kioskAPI.verifyBadge(badge);

      if (response.data.status === 'error') {
        setError(response.data.message || 'Badge non valido');
        setBadge('');
        return;
      }

      const visit = response.data.data;
      setVisitData(visit);

    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante la verifica del badge');
      setBadge('');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    setError('');

    try {
      const visitId = visitData.id || visitData.visit_id;
      const response = await kioskAPI.checkOut(visitId, badge);

      if (response.data.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          onBack();
        }, 3000);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il check-out');
      setVisitData(null);
      setBadge('');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
  };

  const keypadButtonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.15 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } }
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
          0% { background: #6ee7b7; transform: scale(1); }
          50% { background: #d1fae5; transform: scale(0.95); }
          100% { background: #f3f4f6; transform: scale(1); }
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
      `}</style>

      {/* Header */}
      <motion.div style={styles.header} variants={itemVariants}>
        <button onClick={onBack} style={styles.backButton}>
          <IoArrowBack size={24} />
        </button>
        <h1 style={styles.title}>{t('qr_page_title')}</h1>
        <div style={{ width: 40 }} />
      </motion.div>

      <AnimatePresence mode="wait">
        {!visitData && !success && (
          <motion.div
            key="badge-input"
            style={styles.mainContent}
            className="main-content-grid"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Left Column */}
            <div style={styles.leftColumn}>
              <div style={styles.infoCard}>
                <div style={styles.iconContainer}>
                  <IoBarcode size={80} color="#10b981" />
                </div>
                <h2 style={styles.infoTitle}>{t('qr_card_title')}</h2>
                <p style={styles.infoDescription}>
                  {t('qr_card_desc')}
                </p>

                {/* Badge Display */}
                <div style={styles.pinDisplay}>
                  <p style={styles.pinLabel}>{t('qr_badge_label')}</p>
                  <div style={styles.pinDots}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <div
                        key={index}
                        style={{
                          ...styles.pinDot,
                          ...(badge.length > index ? styles.pinDotFilled : {})
                        }}
                      >
                        {badge.length > index && (
                          <span style={styles.pinNumber}>{badge[index]}</span>
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

            {/* Right Column — Keypad */}
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
                <div style={styles.spinner} />
                <p style={styles.loadingText}>{t('qr_loading_verify')}</p>
              </div>
            )}
          </motion.div>
        )}

        {visitData && !success && (
          <motion.div
            key="confirmation"
            style={styles.confirmationContainer}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={styles.confirmationHeader}>
              <h2 style={styles.confirmationTitle}>{t('qr_confirm_title')}</h2>
              <p style={styles.confirmationSubtitle}>{t('qr_confirm_subtitle')}</p>
            </div>

            <div style={styles.mainCard}>
              {/* Left — Badge */}
              <div style={styles.qrCodeSection}>
                <div style={styles.qrCodeContainer}>
                  <IoBarcode size={120} color="#10b981" />
                </div>
                <p style={styles.qrCodeLabel}>{t('qr_badge_section_label')}</p>
                <p style={styles.badgeNumber}>{visitData.badgeNumber}</p>
              </div>

              {/* Right — Details */}
              <div style={styles.detailsSection}>
                <div style={styles.visitorInfo}>
                  <h3 style={styles.visitorName}>{visitData.visitor?.full_name}</h3>
                  {visitData.visitor?.company && (
                    <p style={styles.companySubtitle}>{visitData.visitor.company}</p>
                  )}
                </div>

                <div style={styles.detailsGrid}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>{t('qr_field_checkin')}</span>
                    <span style={styles.detailValue}>
                      {visitData.actualCheckIn
                        ? new Date(visitData.actualCheckIn).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </span>
                  </div>
                  {visitData.department && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>{t('qr_field_dept')}</span>
                      <span style={styles.detailValue}>{visitData.department.name}</span>
                    </div>
                  )}
                  {visitData.hostUser && (
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>{t('qr_field_host')}</span>
                      <span style={styles.detailValue}>
                        {visitData.hostUser.firstName} {visitData.hostUser.lastName}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.buttonContainer}>
              <button
                onClick={handleCheckOut}
                disabled={loading}
                style={{ ...styles.confirmButton, ...(loading ? styles.buttonDisabled : {}) }}
              >
                {loading ? (
                  <><div style={styles.buttonSpinner} /><span>{t('qr_btn_confirming')}</span></>
                ) : (
                  <><IoCheckmarkCircle size={24} /><span>{t('qr_btn_confirm')}</span></>
                )}
              </button>
              <button onClick={handleClear} disabled={loading} style={styles.cancelButton}>
                {t('qr_btn_cancel')}
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
              transition={{ delay: 0.2, duration: 0.5, type: 'spring', stiffness: 200 }}
            >
              <IoCheckmarkCircle size={120} color="#10b981" />
            </motion.div>
            <h2 style={styles.successTitle}>{t('qr_success_title')}</h2>
            <p style={styles.successMessage}>
              {t('qr_success_msg')}, {visitData?.visitor?.full_name}!
            </p>
            <p style={styles.successSubMessage}>
              {t('qr_success_sub')}
            </p>
            <div style={styles.autoCloseMessage}>
              {t('qr_redirect')}
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
    paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 16px))',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '40px',
    padding: '0 20px',
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
    transition: 'all 0.2s ease',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
    textAlign: 'center',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 400px',
    gap: '40px',
    alignItems: 'center',
    minHeight: 'calc(100vh - 200px)',
    padding: '0 40px',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    width: '100%',
    maxWidth: '500px',
    background: '#fff',
    borderRadius: '24px',
    padding: '48px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    textAlign: 'center',
  },
  iconContainer: {
    width: '140px',
    height: '140px',
    borderRadius: '16px',
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 32px',
  },
  infoTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '16px',
    letterSpacing: '-0.5px',
  },
  infoDescription: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '40px',
    fontWeight: '500',
  },
  pinDisplay: {
    padding: '32px 0 0',
    borderTop: '2px solid #f3f4f6',
    textAlign: 'center',
  },
  pinLabel: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  pinDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  pinDot: {
    width: '48px',
    height: '58px',
    borderRadius: '12px',
    border: '3px solid #e5e5e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a1a1a',
    transition: 'all 0.2s ease',
    background: '#f9f9f9',
  },
  pinDotFilled: {
    borderColor: '#10b981',
    background: '#f0fdf4',
  },
  pinNumber: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#10b981',
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
    fontWeight: '600',
  },
  keypad: {
    width: '100%',
    maxWidth: '400px',
  },
  keypadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
  },
  keypadButton: {
    height: '90px',
    fontSize: '32px',
    fontWeight: '700',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
    cursor: 'pointer',
    transition: 'none',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.5px',
    position: 'relative',
  },
  keypadButtonSecondary: {
    background: '#e5e7eb',
    borderColor: '#d1d5db',
    color: '#6b7280',
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
    zIndex: 1000,
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid rgba(255, 255, 255, 0.3)',
    borderTop: '5px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
  },
  confirmationContainer: {
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    padding: '0 20px',
  },
  confirmationHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  confirmationTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  confirmationSubtitle: {
    fontSize: '16px',
    color: '#666',
    fontWeight: '500',
  },
  mainCard: {
    background: '#fff',
    borderRadius: '20px',
    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.15)',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    marginBottom: '24px',
    minHeight: '300px',
  },
  qrCodeSection: {
    background: '#f0fdf4',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    borderRight: '2px solid #d1fae5',
  },
  qrCodeContainer: {
    marginBottom: '16px',
  },
  qrCodeLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 8px 0',
  },
  badgeNumber: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#10b981',
    margin: 0,
    letterSpacing: '6px',
    fontFamily: 'monospace',
  },
  detailsSection: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  visitorInfo: {
    borderBottom: '2px solid #f3f4f6',
    paddingBottom: '16px',
  },
  visitorName: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1a1a1a',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  companySubtitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#6b7280',
    margin: 0,
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  detailRow: {
    display: 'grid',
    gridTemplateColumns: '120px 1fr',
    gap: '12px',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  buttonContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 20px',
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
    boxShadow: '0 10px 20px rgba(16, 185, 129, 0.3)',
    letterSpacing: '0.5px',
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
    letterSpacing: '0.5px',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  buttonSpinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255, 255, 255, 0.3)',
    borderTop: '3px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  successContainer: {
    background: '#fff',
    borderRadius: '20px',
    padding: '60px 40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    margin: '0 auto',
    textAlign: 'center',
  },
  successIcon: {
    marginBottom: '30px',
  },
  successTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#10b981',
    marginBottom: '16px',
  },
  successMessage: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '16px',
  },
  successSubMessage: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  autoCloseMessage: {
    fontSize: '14px',
    color: '#999',
    fontStyle: 'italic',
  },
};

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  if (!document.head.querySelector('style[data-checkout-animation]')) {
    styleSheet.setAttribute('data-checkout-animation', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default ScanQR;
