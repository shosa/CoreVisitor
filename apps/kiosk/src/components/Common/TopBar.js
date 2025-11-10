/**
 * TopBar Component
 * Barra di navigazione superiore con back button, titolo, user info
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonAvatar,
  IonBadge
} from '@ionic/react';
import {
  arrowBack,
  personCircleOutline,
  logOutOutline,
  settingsOutline
} from 'ionicons/icons';
import theme from '../../styles/theme';
import UserPopup from './UserPopup';

const TopBar = ({
  title,
  user = null,
  onBack = null,
  showProfile = true,
  showSettings = false,
  onSettings = null,
  breadcrumb = [],
  color = 'primary'
}) => {
  const [showUserPopup, setShowUserPopup] = useState(false);

  return (
    <>
      <IonHeader>
        <IonToolbar color={color}>
          <IonButtons slot="start">
            {onBack && (
              <IonButton onClick={onBack}>
                <IonIcon icon={arrowBack} />
              </IonButton>
            )}
          </IonButtons>

          <IonTitle>
            {breadcrumb.length > 0 ? (
              <div style={styles.breadcrumb}>
                {breadcrumb.map((item, index) => (
                  <span key={index}>
                    {index > 0 && <span style={styles.separator}> / </span>}
                    <span
                      style={{
                        ...styles.breadcrumbItem,
                        ...(index === breadcrumb.length - 1 ? styles.breadcrumbActive : {})
                      }}
                    >
                      {item}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              title
            )}
          </IonTitle>

          <IonButtons slot="end">
            {showSettings && (
              <IonButton onClick={onSettings}>
                <IonIcon icon={settingsOutline} />
              </IonButton>
            )}

            {showProfile && user && (
              <IonButton onClick={() => setShowUserPopup(true)}>
                <IonAvatar style={styles.avatar}>
                  <IonIcon icon={personCircleOutline} style={styles.avatarIcon} />
                </IonAvatar>
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      {/* User Popup */}
      {showUserPopup && user && (
        <UserPopup user={user} onClose={() => setShowUserPopup(false)} />
      )}
    </>
  );
};

const styles = {
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 500
  },
  breadcrumbItem: {
    opacity: 0.7
  },
  breadcrumbActive: {
    opacity: 1,
    fontWeight: 600
  },
  separator: {
    margin: '0 8px',
    opacity: 0.5
  },
  avatar: {
    width: '32px',
    height: '32px'
  },
  avatarIcon: {
    fontSize: '32px',
    color: theme.colors.textInverse
  }
};

export default TopBar;
