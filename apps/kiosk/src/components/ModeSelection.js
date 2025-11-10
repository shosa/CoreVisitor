/**
 * ModeSelection Component
 * Schermata iniziale per scegliere tra modalità Kiosk e Full
 */

import React from 'react';
import { motion } from 'framer-motion';
import { IonContent, IonPage, IonIcon } from '@ionic/react';
import {
  qrCodeOutline,
  gridOutline,
  settingsOutline
} from 'ionicons/icons';
import theme from '../styles/theme';

const ModeSelection = ({ onSelectMode, onSettings }) => {
  const modes = [
    {
      id: 'kiosk',
      title: 'Modalità Kiosk',
      description: 'Scanner QR per check-out rapido visitatori',
      icon: qrCodeOutline,
      color: theme.colors.accent,
      gradient: theme.gradients.accent
    },
    {
      id: 'full',
      title: 'Modalità Completa',
      description: 'Gestione completa visitatori e visite',
      icon: gridOutline,
      color: theme.colors.primary,
      gradient: theme.gradients.primary
    }
  ];

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={styles.container}>
          {/* Logo/Header */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={styles.header}
          >
            <h1 style={styles.title}>CoreVisitor</h1>
            <p style={styles.subtitle}>Gestione Visitatori</p>
          </motion.div>

          {/* Mode Cards */}
          <div style={styles.modesContainer}>
            {modes.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectMode(mode.id)}
                style={{
                  ...styles.modeCard,
                  background: mode.gradient
                }}
              >
                <div style={styles.iconContainer}>
                  <IonIcon icon={mode.icon} style={styles.modeIcon} />
                </div>
                <h2 style={styles.modeTitle}>{mode.title}</h2>
                <p style={styles.modeDescription}>{mode.description}</p>

                {/* Arrow indicator */}
                <motion.div
                  initial={{ x: 0 }}
                  whileHover={{ x: 10 }}
                  style={styles.arrow}
                >
                  →
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Settings Button */}
          {onSettings && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={onSettings}
              style={styles.settingsButton}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <IonIcon icon={settingsOutline} style={styles.settingsIcon} />
            </motion.button>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={styles.footer}
          >
            <p style={styles.footerText}>CoreSuite © 2025</p>
          </motion.div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const styles = {
  container: {
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: theme.gradients.background
  },
  header: {
    textAlign: 'center',
    marginBottom: '60px'
  },
  title: {
    fontSize: theme.fontSize['5xl'],
    fontWeight: theme.fontWeight.extrabold,
    margin: '0 0 8px 0',
    background: theme.gradients.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.textSecondary,
    margin: 0,
    fontWeight: theme.fontWeight.medium
  },
  modesContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    width: '100%',
    maxWidth: '500px'
  },
  modeCard: {
    position: 'relative',
    padding: '40px 32px',
    borderRadius: theme.radius.xl,
    boxShadow: theme.shadows.lg,
    cursor: 'pointer',
    color: theme.colors.textInverse,
    overflow: 'hidden',
    transition: `all ${theme.transitions.base}`
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    borderRadius: theme.radius.full,
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    backdropFilter: 'blur(10px)'
  },
  modeIcon: {
    fontSize: '48px',
    color: theme.colors.textInverse
  },
  modeTitle: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold,
    margin: '0 0 8px 0'
  },
  modeDescription: {
    fontSize: theme.fontSize.base,
    margin: 0,
    opacity: 0.9,
    lineHeight: '1.5'
  },
  arrow: {
    position: 'absolute',
    right: '32px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    opacity: 0.7
  },
  settingsButton: {
    position: 'fixed',
    top: '24px',
    right: '24px',
    width: '56px',
    height: '56px',
    borderRadius: theme.radius.full,
    border: 'none',
    background: theme.colors.background,
    boxShadow: theme.shadows.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10
  },
  settingsIcon: {
    fontSize: '28px',
    color: theme.colors.textSecondary
  },
  footer: {
    marginTop: '60px',
    textAlign: 'center'
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    margin: 0
  }
};

export default ModeSelection;
