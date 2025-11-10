/**
 * Alert Component
 * Toast/Alert animato con Framer Motion
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import {
  checkmarkCircleOutline,
  alertCircleOutline,
  warningOutline,
  informationCircleOutline,
  closeOutline
} from 'ionicons/icons';
import theme from '../../styles/theme';

const Alert = ({
  show = false,
  type = 'info',
  title,
  message,
  duration = 4000,
  onClose
}) => {
  useEffect(() => {
    if (show && duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const config = {
    success: {
      icon: checkmarkCircleOutline,
      color: theme.colors.success,
      bg: `${theme.colors.success}15`
    },
    error: {
      icon: alertCircleOutline,
      color: theme.colors.danger,
      bg: `${theme.colors.danger}15`
    },
    warning: {
      icon: warningOutline,
      color: theme.colors.warning,
      bg: `${theme.colors.warning}15`
    },
    info: {
      icon: informationCircleOutline,
      color: theme.colors.info,
      bg: `${theme.colors.info}15`
    }
  };

  const alertConfig = config[type] || config.info;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{
            ...styles.container,
            backgroundColor: alertConfig.bg,
            borderLeft: `4px solid ${alertConfig.color}`
          }}
        >
          <IonIcon
            icon={alertConfig.icon}
            style={{ ...styles.icon, color: alertConfig.color }}
          />

          <div style={styles.content}>
            {title && <div style={styles.title}>{title}</div>}
            {message && <div style={styles.message}>{message}</div>}
          </div>

          {onClose && (
            <button onClick={onClose} style={styles.closeButton}>
              <IonIcon icon={closeOutline} style={styles.closeIcon} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: theme.zIndex.modal,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.lg,
    maxWidth: '90%',
    minWidth: '300px',
    backgroundColor: theme.colors.background
  },
  icon: {
    fontSize: '28px',
    flexShrink: 0
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: '4px'
  },
  message: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: '1.4'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    transition: `background ${theme.transitions.fast}`
  },
  closeIcon: {
    fontSize: '20px',
    color: theme.colors.textSecondary
  }
};

export default Alert;
