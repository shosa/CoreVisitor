/**
 * UserPopup Component
 * Mostra informazioni utente loggato e opzione logout
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonAvatar,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/react';
import {
  closeOutline,
  personCircleOutline,
  logOutOutline,
  mailOutline,
  callOutline,
  businessOutline
} from 'ionicons/icons';
import theme from '../../styles/theme';

const UserPopup = ({ user, onClose, onLogout }) => {
  const handleLogout = () => {
    onClose();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <IonModal isOpen={true} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Profilo Utente</IonTitle>
          <IonButton slot="end" fill="clear" onClick={onClose}>
            <IonIcon icon={closeOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Avatar e Nome */}
          <div style={styles.header}>
            <IonAvatar style={styles.avatar}>
              <IonIcon icon={personCircleOutline} style={styles.avatarIcon} />
            </IonAvatar>
            <h2 style={styles.name}>{user.full_name || user.name}</h2>
            <p style={styles.role}>{user.role || 'Operatore'}</p>
          </div>

          {/* Informazioni */}
          <IonList>
            {user.email && (
              <IonItem>
                <IonIcon icon={mailOutline} slot="start" />
                <IonLabel>
                  <p>Email</p>
                  <h3>{user.email}</h3>
                </IonLabel>
              </IonItem>
            )}

            {user.phone && (
              <IonItem>
                <IonIcon icon={callOutline} slot="start" />
                <IonLabel>
                  <p>Telefono</p>
                  <h3>{user.phone}</h3>
                </IonLabel>
              </IonItem>
            )}

            {user.department && (
              <IonItem>
                <IonIcon icon={businessOutline} slot="start" />
                <IonLabel>
                  <p>Reparto</p>
                  <h3>{user.department}</h3>
                </IonLabel>
              </IonItem>
            )}
          </IonList>

          {/* Logout Button */}
          {onLogout && (
            <div style={styles.logoutContainer}>
              <IonButton
                expand="block"
                color="danger"
                onClick={handleLogout}
                style={styles.logoutButton}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Disconnetti
              </IonButton>
            </div>
          )}
        </motion.div>
      </IonContent>
    </IonModal>
  );
};

const styles = {
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '32px 16px',
    background: theme.gradients.primary,
    color: theme.colors.textInverse
  },
  avatar: {
    width: '80px',
    height: '80px',
    marginBottom: '16px',
    border: `3px solid ${theme.colors.textInverse}`
  },
  avatarIcon: {
    fontSize: '80px',
    color: theme.colors.textInverse
  },
  name: {
    margin: '0 0 4px 0',
    fontSize: theme.fontSize['2xl'],
    fontWeight: theme.fontWeight.bold
  },
  role: {
    margin: 0,
    fontSize: theme.fontSize.base,
    opacity: 0.9
  },
  logoutContainer: {
    padding: '24px 16px'
  },
  logoutButton: {
    margin: 0
  }
};

export default UserPopup;
