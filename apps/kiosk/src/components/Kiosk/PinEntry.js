import React, { useState, useEffect } from 'react';
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoBackspace,
  IoArrowBack,
  IoPersonCircle
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <IoArrowBack size={24} />
        </button>
        <h1 style={styles.title}>Self Check-In</h1>
        <div style={{ width: 40 }}></div>
      </div>

      {!visitData && !success && (
        <>
          {/* PIN Display */}
          <div style={styles.pinDisplay}>
            <p style={styles.pinLabel}>Inserisci il tuo PIN</p>
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

          {/* Numeric Keypad */}
          <div style={styles.keypad}>
            <div style={styles.keypadGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumberClick(num.toString())}
                  style={styles.keypadButton}
                  disabled={loading}
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleClear}
                style={{ ...styles.keypadButton, ...styles.keypadButtonSecondary }}
                disabled={loading}
              >
                C
              </button>
              <button
                onClick={() => handleNumberClick('0')}
                style={styles.keypadButton}
                disabled={loading}
              >
                0
              </button>
              <button
                onClick={handleBackspace}
                style={{ ...styles.keypadButton, ...styles.keypadButtonSecondary }}
                disabled={loading}
              >
                <IoBackspace size={24} />
              </button>
            </div>
          </div>

          {loading && (
            <div style={styles.loadingOverlay}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Verifica in corso...</p>
            </div>
          )}
        </>
      )}

      {visitData && !success && (
        <div style={styles.confirmationContainer}>
          {/* Visitor Photo */}
          <div style={styles.visitorPhotoContainer}>
            {visitData.visitor.photoPath ? (
              <img
                src={`${process.env.REACT_APP_API_URL || 'http://192.168.3.131:3006'}/uploads/visitors/${visitData.visitor.photoPath}`}
                alt={visitData.visitor.full_name}
                style={styles.visitorPhoto}
              />
            ) : (
              <IoPersonCircle size={120} color="#3b82f6" />
            )}
          </div>

          {/* Visit Details */}
          <div style={styles.visitDetails}>
            <h2 style={styles.visitorName}>{visitData.visitor.full_name}</h2>
            {visitData.visitor.company && (
              <p style={styles.visitorCompany}>{visitData.visitor.company}</p>
            )}

            <div style={styles.detailsGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Dipartimento</span>
                <span style={styles.detailValue}>{visitData.department.name}</span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Motivo</span>
                <span style={styles.detailValue}>{visitData.purpose}</span>
              </div>
              {visitData.hostUser && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Referente</span>
                  <span style={styles.detailValue}>
                    {visitData.hostUser.firstName} {visitData.hostUser.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Buttons */}
          <div style={styles.buttonContainer}>
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
        </div>
      )}

      {success && (
        <div style={styles.successContainer}>
          <div style={styles.successIcon}>
            <IoCheckmarkCircle size={120} color="#10b981" />
          </div>
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
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    border: 'none',
    background: 'rgba(255, 255, 255, 0.2)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#fff',
    margin: 0,
    textAlign: 'center'
  },
  pinDisplay: {
    background: '#fff',
    borderRadius: '20px',
    padding: '40px 30px',
    marginBottom: '30px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    textAlign: 'center'
  },
  pinLabel: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '20px'
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
    background: '#fff',
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)'
  },
  keypadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px'
  },
  keypadButton: {
    height: '80px',
    fontSize: '28px',
    fontWeight: '700',
    border: 'none',
    borderRadius: '12px',
    background: '#f3f4f6',
    color: '#1a1a1a',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  keypadButtonSecondary: {
    background: '#e5e7eb',
    color: '#666'
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
    background: '#fff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    maxWidth: '600px',
    margin: '0 auto',
    width: '100%'
  },
  visitorPhotoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  visitorPhoto: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #3b82f6'
  },
  visitDetails: {
    marginBottom: '30px'
  },
  visitorName: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: '8px'
  },
  visitorCompany: {
    fontSize: '16px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '30px'
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  confirmButton: {
    width: '100%',
    height: '60px',
    borderRadius: '12px',
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.2s ease'
  },
  cancelButton: {
    width: '100%',
    height: '50px',
    borderRadius: '12px',
    border: '2px solid #e5e5e5',
    background: '#fff',
    color: '#666',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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
