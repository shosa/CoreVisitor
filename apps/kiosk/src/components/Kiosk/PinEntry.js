import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoBackspace,
  IoArrowBack,
  IoKeypad,
  IoQrCode,
  IoPencil,
  IoRefresh,
} from 'react-icons/io5';
import { kioskAPI } from '../../services/api';
import { useTranslation } from '../../context/LanguageContext';

// step: 'pin' | 'confirm' | 'signature' | 'success'
const PinEntry = ({ onBack }) => {
  const { lang, t } = useTranslation();
  const [step, setStep] = useState('pin');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [visitData, setVisitData] = useState(null);
  const [error, setError] = useState('');
  const [companyName, setCompanyName] = useState('');
  const sigCanvasRef = useRef(null);

  useEffect(() => {
    fetch('/api/kiosk/settings')
      .then(r => r.json())
      .then(res => {
        if (res.data?.companyName) setCompanyName(res.data.companyName);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (pin.length === 4 && step === 'pin' && !loading) {
      verifyPin();
    }
  }, [pin]);

  const handleNumberClick = (num) => {
    if (pin.length < 4 && step === 'pin' && !loading) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleBackspace = () => {
    if (step === 'pin' && !loading) {
      setPin(prev => prev.slice(0, -1));
      setError('');
    }
  };

  const handleReset = () => {
    setPin('');
    setError('');
    setVisitData(null);
    setStep('pin');
  };

  const verifyPin = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await kioskAPI.verifyPin(pin);
      if (response.data.status === 'error') {
        setError(response.data.message || t('pin_err_invalid_pin'));
        setPin('');
        return;
      }
      setVisitData(response.data.data);
      setStep('confirm');
    } catch (err) {
      setError(err.response?.data?.message || t('pin_err_verify'));
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const doCheckIn = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await kioskAPI.checkIn(pin);
      if (response.data.status === 'success') {
        setStep('success');
        setTimeout(() => onBack(), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || t('pin_err_checkin'));
      setStep('pin');
      setVisitData(null);
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    // Check if visitor has a signature
    if (!visitData?.visitor?.signaturePath) {
      setStep('signature');
    } else {
      doCheckIn();
    }
  };

  const handleSignatureSubmit = async () => {
    if (!sigCanvasRef.current || sigCanvasRef.current.isEmpty()) {
      setError(t('pin_err_signature_required') || 'Firma obbligatoria');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const signatureBase64 = sigCanvasRef.current.toDataURL('image/png');
      await kioskAPI.uploadSignature(visitData.visitor.id, signatureBase64);
      await doCheckIn();
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante il salvataggio della firma');
      setLoading(false);
    }
  };

  const dateLocale = lang === 'en' ? 'en-GB' : 'it-IT';

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
          0% { background: #9ab3e7ff; transform: scale(1); }
          50% { background: #dbeafe; transform: scale(0.95); }
          100% { background: #f3f4f6; transform: scale(1); }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          }
          .confirmation-card .qr-section {
            border-right: none !important;
            border-bottom: 2px solid #e5e7eb;
          }
          .confirmation-buttons {
            grid-template-columns: 1fr !important;
          }
        }
        .sig-canvas {
          width: 100% !important;
          height: 100% !important;
        }
      `}</style>

      {/* Header */}
      <motion.div style={styles.header} variants={itemVariants}>
        <button
          onClick={step === 'pin' ? onBack : handleReset}
          style={styles.backButton}
        >
          <IoArrowBack size={24} />
        </button>
        <h1 style={styles.title}>{t('pin_page_title')}</h1>
        <div style={{ width: 40 }} />
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── STEP: PIN ── */}
        {step === 'pin' && (
          <motion.div
            key="pin-input"
            style={styles.mainContent}
            className="main-content-grid"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Left: info + display */}
            <div style={styles.leftColumn}>
              <div style={styles.infoCard}>
                <div style={styles.iconContainer}>
                  <IoKeypad size={80} color="#3b82f6" />
                </div>
                <h2 style={styles.infoTitle}>{t('pin_card_title')}</h2>
                <p style={styles.infoDescription}>{t('pin_card_desc')}</p>

                <div style={styles.pinDisplay}>
                  <p style={styles.pinLabel}>{t('pin_label')}</p>
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

            {/* Right: keypad */}
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
                    onClick={handleReset}
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
                <p style={styles.loadingText}>{t('pin_loading_verify')}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP: CONFIRM ── */}
        {step === 'confirm' && visitData && (
          <motion.div
            key="confirmation"
            style={styles.fullPageStep}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={styles.confirmationHeader}>
              <h2 style={styles.confirmationTitle}>{t('pin_confirm_title')}</h2>
              <p style={styles.confirmationSubtitle}>{t('pin_confirm_subtitle')}</p>
            </div>

            <div style={styles.mainCard} className="confirmation-card">
              {/* QR side */}
              <div style={styles.qrCodeSection} className="qr-section">
                <div style={styles.qrCodeContainer}>
                  <div style={styles.qrPlaceholder}>
                    <IoQrCode size={180} color="#1a1a1a" />
                  </div>
                </div>
                <p style={styles.qrCodeLabel}>{t('pin_badge_label')}</p>
                {visitData.badgeNumber && (
                  <p style={styles.badgeNumber}>{visitData.badgeNumber}</p>
                )}
              </div>

              {/* Details side */}
              <div style={styles.detailsSection}>
                <div style={styles.visitorInfo}>
                  <h3 style={styles.visitorName}>{visitData.visitor.full_name}</h3>
                  {visitData.visitor.company && (
                    <p style={styles.companySubtitle}>{visitData.visitor.company}</p>
                  )}
                </div>

                <div style={styles.detailsGrid}>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>{t('pin_field_date')}</span>
                    <span style={styles.detailValue}>
                      {new Date(visitData.scheduledDate).toLocaleDateString(dateLocale, {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>{t('pin_field_dept')}</span>
                    <span style={styles.detailValue}>
                      {visitData.department?.name}
                      {visitData.host && (
                        <span style={{ color: '#6b7280', fontWeight: '500' }}>
                          {' '}({visitData.host.firstName} {visitData.host.lastName})
                        </span>
                      )}
                    </span>
                  </div>
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>{t('pin_field_reason')}</span>
                    <span style={styles.detailValue}>{visitData.purpose}</span>
                  </div>
                </div>

                <div style={styles.companyFooter}>
                  <p style={styles.companyFooterText}>{companyName}</p>
                </div>
              </div>
            </div>

            <div style={styles.privacyDisclaimer}>
              <p style={styles.privacyText}>{t('pin_privacy')}</p>
            </div>

            {error && (
              <div style={{ ...styles.errorMessage, maxWidth: 860, margin: '0 auto 16px', padding: '12px 20px' }}>
                <IoCloseCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div style={styles.buttonContainer} className="confirmation-buttons">
              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{ ...styles.confirmButton, ...(loading ? styles.buttonDisabled : {}) }}
              >
                {loading ? (
                  <>
                    <div style={styles.buttonSpinner} />
                    <span>{t('pin_btn_confirming')}</span>
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircle size={24} />
                    <span>{t('pin_btn_confirm')}</span>
                  </>
                )}
              </button>
              <button onClick={handleReset} disabled={loading} style={styles.cancelButton}>
                {t('pin_btn_cancel')}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP: SIGNATURE ── */}
        {step === 'signature' && visitData && (
          <motion.div
            key="signature"
            style={styles.sigStep}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Compact header row */}
            <div style={styles.sigHeader}>
              <div style={styles.sigHeaderLeft}>
                <div style={styles.sigHeaderIcon}>
                  <IoPencil size={22} color="#3b82f6" />
                </div>
                <div>
                  <h2 style={styles.sigTitle}>{t('pin_sig_title') || 'Firma richiesta'}</h2>
                  <p style={styles.sigSubtitle}>{visitData.visitor.full_name}</p>
                </div>
              </div>
              <button
                onClick={() => sigCanvasRef.current?.clear()}
                style={styles.clearSigButton}
              >
                <IoRefresh size={16} />
                <span>{t('pin_sig_clear') || 'Cancella'}</span>
              </button>
            </div>

            {/* Canvas — altezza fissa esplicita per iPad */}
            <div style={styles.sigCanvasWrap}>
              <SignatureCanvas
                ref={sigCanvasRef}
                canvasProps={{
                  style: { display: 'block', width: '100%', height: '320px' },
                  width: 900,
                  height: 320,
                }}
                backgroundColor="#fafafa"
                penColor="#1a1a1a"
              />
              <div style={styles.sigWatermark}>
                <IoPencil size={48} color="rgba(0,0,0,0.04)" />
              </div>
            </div>

            {error && (
              <div style={{ ...styles.errorMessage, margin: '8px 0' }}>
                <IoCloseCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Buttons inline sotto canvas */}
            <div style={styles.sigButtons} className="confirmation-buttons">
              <button
                onClick={handleSignatureSubmit}
                disabled={loading}
                style={{ ...styles.confirmButton, height: '56px', ...(loading ? styles.buttonDisabled : {}) }}
              >
                {loading ? (
                  <>
                    <div style={styles.buttonSpinner} />
                    <span>{t('pin_btn_confirming')}</span>
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircle size={22} />
                    <span>{t('pin_btn_confirm')}</span>
                  </>
                )}
              </button>
              <button onClick={() => setStep('confirm')} disabled={loading} style={{ ...styles.cancelButton, height: '56px' }}>
                {t('pin_btn_cancel')}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step === 'success' && (
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
            <h2 style={styles.successTitle}>{t('pin_success_title')}</h2>
            <p style={styles.successMessage}>
              {t('pin_success_msg')} {visitData?.visitor.full_name}
            </p>
            <p style={styles.successSubMessage}>
              {t('pin_success_sub').split('\n').map((line, i) => (
                <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
              ))}
            </p>
            <div style={styles.autoCloseMessage}>
              {t('pin_redirect')}
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
    padding: '0 40px',
    position: 'relative'
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
    marginTop: '20px'
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
    zIndex: 1000,
    borderRadius: '12px'
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
  // Full page step wrapper (confirm + signature)
  fullPageStep: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '960px',
    width: '100%',
    margin: '0 auto',
    padding: '0 20px'
  },
  confirmationHeader: {
    textAlign: 'center',
    marginBottom: '28px'
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
    marginBottom: '20px',
    minHeight: '360px'
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
    gap: '24px'
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
    margin: 0
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
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
    paddingTop: '16px',
    borderTop: '2px solid #f3f4f6',
    textAlign: 'center'
  },
  companyFooterText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#999',
    margin: 0
  },
  privacyDisclaimer: {
    textAlign: 'center',
    marginBottom: '16px'
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
    maxWidth: '960px',
    margin: '0 auto',
    width: '100%'
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
  // Signature step
  sigStep: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '960px',
    margin: '0 auto',
    padding: '0 20px',
    gap: '12px'
  },
  sigHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fff',
    borderRadius: '16px',
    padding: '16px 20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  sigHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  sigHeaderIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  sigTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1a1a1a',
    margin: 0,
    letterSpacing: '-0.3px'
  },
  sigSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    fontWeight: '600'
  },
  sigCanvasWrap: {
    border: '2.5px solid #3b82f6',
    borderRadius: '16px',
    overflow: 'hidden',
    background: '#fafafa',
    touchAction: 'none',
    position: 'relative',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.12)'
  },
  sigWatermark: {
    position: 'absolute',
    bottom: '12px',
    right: '12px',
    pointerEvents: 'none'
  },
  clearSigButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: '1.5px solid #d1d5db',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '14px',
    color: '#6b7280',
    cursor: 'pointer',
    fontWeight: '600',
    flexShrink: 0
  },
  sigButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%'
  },
  // Success
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
    marginBottom: '30px'
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

export default PinEntry;
