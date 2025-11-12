import React from 'react';
import {
  IoKeypad,
  IoQrCode,
  IoArrowBack,
  IoSettingsOutline
} from 'react-icons/io5';

const KioskHome = ({ onSelectOption, onBack }) => {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <IoArrowBack size={24} />
        </button>
        <h1 style={styles.title}>CoreVisitor Kiosk</h1>
        <div style={{ width: 40 }}></div>
      </div>

      {/* Welcome Message */}
      <div style={styles.welcomeContainer}>
        <h2 style={styles.welcomeTitle}>Benvenuto!</h2>
        <p style={styles.welcomeSubtitle}>
          Seleziona un'opzione per effettuare il check-in
        </p>
      </div>

      {/* Options */}
      <div style={styles.optionsContainer}>
        {/* PIN Entry Option */}
        <button
          onClick={() => onSelectOption('pin')}
          style={styles.optionButton}
        >
          <div style={styles.optionIcon}>
            <IoKeypad size={64} color="#3b82f6" />
          </div>
          <h3 style={styles.optionTitle}>Check-In con PIN</h3>
          <p style={styles.optionDescription}>
            Inserisci il PIN a 4 cifre ricevuto via email
          </p>
        </button>

        {/* QR Code Option */}
        <button
          onClick={() => onSelectOption('qr')}
          style={styles.optionButton}
        >
          <div style={styles.optionIcon}>
            <IoQrCode size={64} color="#10b981" />
          </div>
          <h3 style={styles.optionTitle}>Check-Out con QR</h3>
          <p style={styles.optionDescription}>
            Scansiona il QR code del tuo badge per uscire
          </p>
        </button>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Non hai ricevuto il PIN? Contatta la reception
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px'
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
  welcomeContainer: {
    textAlign: 'center',
    marginBottom: '60px',
    padding: '0 20px'
  },
  welcomeTitle: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '16px',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
  },
  welcomeSubtitle: {
    fontSize: '20px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500'
  },
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    padding: '0 20px'
  },
  optionButton: {
    background: '#fff',
    border: 'none',
    borderRadius: '20px',
    padding: '40px 30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '320px'
  },
  optionIcon: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    transition: 'all 0.3s ease'
  },
  optionTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '12px'
  },
  optionDescription: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    maxWidth: '280px'
  },
  footer: {
    marginTop: 'auto',
    padding: '40px 20px 20px',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500'
  }
};

export default KioskHome;
