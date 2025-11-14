import React from 'react';
import { motion } from 'framer-motion';
import {
  IoKeypad,
  IoQrCode
} from 'react-icons/io5';

const KioskHome = ({ onSelectOption }) => {
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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
      transition: {
        duration: 0.2
      }
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
      {/* Logo / Header */}
      <motion.div style={styles.header} variants={itemVariants}>
        <div style={styles.logo}>
          <h1 style={styles.logoText}>CoreVisitor</h1>
          <p style={styles.logoSubtext}>Self-Service Kiosk</p>
        </div>
      </motion.div>

      {/* Welcome Message */}
      <motion.div style={styles.welcomeContainer} variants={itemVariants}>
        <h2 style={styles.welcomeTitle}>Benvenuto</h2>
        <p style={styles.welcomeSubtitle}>
          Calzaturificio Emmegiemme Shoes
        </p>
      </motion.div>

      {/* Options */}
      <div style={styles.optionsContainer}>
        {/* PIN Entry Option */}
        <motion.button
          onClick={() => onSelectOption('pin')}
          style={styles.optionButton}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div style={styles.optionIconBlue}>
            <IoKeypad size={64} color="#3b82f6" />
          </div>
          <h3 style={styles.optionTitle}>Check-In con PIN</h3>
          <p style={styles.optionDescription}>
            Inserisci il PIN a 4 cifre ricevuto via email
          </p>
        </motion.button>

        {/* QR Code Option */}
        <motion.button
          onClick={() => onSelectOption('qr')}
          style={styles.optionButton}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <div style={styles.optionIconGreen}>
            <IoQrCode size={64} color="#10b981" />
          </div>
          <h3 style={styles.optionTitle}>Check-Out con QR</h3>
          <p style={styles.optionDescription}>
            Scansiona il QR code del tuo badge per uscire
          </p>
        </motion.button>
      </div>

      {/* Footer */}
      <motion.div style={styles.footer} variants={itemVariants}>
        <p style={styles.footerText}>
          Non hai ricevuto il PIN? Contatta la reception
        </p>
      </motion.div>
    </motion.div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
    display: 'flex',
    flexDirection: 'column',
    padding: '40px 20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px'
  },
  logo: {
    textAlign: 'center'
  },
  logoText: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
    marginBottom: '8px'
  },
  logoSubtext: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#999',
    margin: 0
  },
  welcomeContainer: {
    textAlign: 'center',
    marginBottom: '60px',
    padding: '0 20px'
  },
  welcomeTitle: {
    fontSize: '48px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '12px',
    letterSpacing: '-1px'
  },
  welcomeSubtitle: {
    fontSize: '18px',
    color: '#666',
    fontWeight: '500'
  },
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
    padding: '0 20px'
  },
  optionButton: {
    background: '#fff',
    border: 'none',
    borderRadius: '16px',
    padding: '40px 32px',
    cursor: 'pointer',
    transition: 'all 0.25s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '300px'
  },
  optionIconBlue: {
    width: '100px',
    height: '100px',
    borderRadius: '12px',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    transition: 'all 0.25s ease'
  },
  optionIconGreen: {
    width: '100px',
    height: '100px',
    borderRadius: '12px',
    background: '#f0fdf4',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    transition: 'all 0.25s ease'
  },
  optionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '12px'
  },
  optionDescription: {
    fontSize: '15px',
    color: '#666',
    lineHeight: '1.5',
    maxWidth: '260px',
    fontWeight: '500'
  },
  footer: {
    marginTop: 'auto',
    padding: '40px 20px 20px',
    textAlign: 'center'
  },
  footerText: {
    fontSize: '13px',
    color: '#999',
    fontWeight: '500'
  }
};

export default KioskHome;
