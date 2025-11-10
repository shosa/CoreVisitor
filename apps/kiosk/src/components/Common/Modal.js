/**
 * Modal Component
 * Modal riutilizzabile con animazioni Framer Motion
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import theme from '../../styles/theme';

const Modal = ({
  show = false,
  title,
  children,
  onClose,
  maxWidth = '500px',
  showCloseButton = true,
  footer = null
}) => {
  if (!show) return null;

  return (
    <AnimatePresence>
      <div style={styles.overlay}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={styles.backdrop}
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          style={{ ...styles.modal, maxWidth }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div style={styles.header}>
              {title && <h2 style={styles.title}>{title}</h2>}
              {showCloseButton && (
                <button onClick={onClose} style={styles.closeButton}>
                  <IonIcon icon={closeOutline} style={styles.closeIcon} />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div style={styles.body}>{children}</div>

          {/* Footer */}
          {footer && <div style={styles.footer}>{footer}</div>}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: theme.zIndex.modal,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px'
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.overlay
  },
  modal: {
    position: 'relative',
    width: '100%',
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadows['2xl'],
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: `1px solid ${theme.colors.border}`,
    flexShrink: 0
  },
  title: {
    margin: 0,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text
  },
  closeButton: {
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    transition: `background ${theme.transitions.fast}`,
    marginLeft: '16px'
  },
  closeIcon: {
    fontSize: '24px',
    color: theme.colors.textSecondary
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
    flex: 1
  },
  footer: {
    padding: '16px 24px',
    borderTop: `1px solid ${theme.colors.border}`,
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    flexShrink: 0
  }
};

export default Modal;
