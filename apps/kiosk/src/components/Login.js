/**
 * Login Component
 * Autenticazione per modalità completa
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IonContent,
  IonPage,
  IonButton,
  IonInput,
  IonIcon,
  IonSpinner,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import {
  arrowBackOutline,
  personOutline,
  lockClosedOutline,
  logInOutline
} from 'ionicons/icons';
import { mobileAPI } from '../services/api';
import theme from '../styles/theme';
import Alert from './Common/Alert';

const Login = ({ onBack, onLoginSuccess }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });

  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await mobileAPI.getUsers();

      if (response.data.status === 'success') {
        const usersList = response.data.data || [];
        // Filtra solo utenti abilitati per visitor kiosk
        const filteredUsers = usersList.filter(
          (u) => u.enabled_modules?.includes('visitor-kiosk') || u.role === 'receptionist' || u.role === 'security'
        );
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error('❌ Error loading users:', error);
      showAlert('error', 'Errore', 'Impossibile caricare gli utenti');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!selectedUser || !password) {
      showAlert('warning', 'Attenzione', 'Seleziona un utente e inserisci la password');
      return;
    }

    try {
      setLoading(true);

      const response = await mobileAPI.login(selectedUser, password);

      if (response.data.status === 'success') {
        const userData = response.data.data;
        showAlert('success', 'Accesso Effettuato', `Benvenuto ${userData.full_name}!`);

        // Salva dati utente
        localStorage.setItem('user', JSON.stringify(userData));

        setTimeout(() => {
          onLoginSuccess(userData);
        }, 1000);
      } else {
        throw new Error(response.data.message || 'Credenziali non valide');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      showAlert(
        'error',
        'Errore Login',
        error.response?.data?.message || error.message || 'Credenziali non valide'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={styles.container}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.header}
          >
            <button onClick={onBack} style={styles.backButton}>
              <IonIcon icon={arrowBackOutline} />
            </button>
          </motion.div>

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            style={styles.logoContainer}
          >
            <h1 style={styles.logo}>CoreVisitor</h1>
            <p style={styles.subtitle}>Modalità Completa</p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={styles.formContainer}
          >
            <form onSubmit={handleLogin} style={styles.form}>
              {/* User Select */}
              <div style={styles.inputGroup}>
                <IonItem style={styles.item}>
                  <IonIcon icon={personOutline} slot="start" />
                  <IonLabel position="floating">Seleziona Utente</IonLabel>
                  <IonSelect
                    value={selectedUser}
                    onIonChange={(e) => setSelectedUser(e.detail.value)}
                    disabled={loadingUsers || loading}
                  >
                    {users.map((user) => (
                      <IonSelectOption key={user.id} value={user.username}>
                        {user.full_name} ({user.role})
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </div>

              {/* Password Input */}
              <div style={styles.inputGroup}>
                <IonItem style={styles.item}>
                  <IonIcon icon={lockClosedOutline} slot="start" />
                  <IonLabel position="floating">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={password}
                    onIonInput={(e) => setPassword(e.detail.value)}
                    disabled={loading}
                  />
                </IonItem>
              </div>

              {/* Login Button */}
              <IonButton
                expand="block"
                size="large"
                type="submit"
                disabled={loading || loadingUsers || !selectedUser || !password}
                style={styles.loginButton}
              >
                {loading ? (
                  <>
                    <IonSpinner name="crescent" style={{ marginRight: '12px' }} />
                    Accesso...
                  </>
                ) : (
                  <>
                    <IonIcon icon={logInOutline} style={{ marginRight: '12px' }} />
                    Accedi
                  </>
                )}
              </IonButton>
            </form>
          </motion.div>

          {/* Loading Users */}
          {loadingUsers && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={styles.loadingContainer}
            >
              <IonSpinner name="crescent" />
              <p style={styles.loadingText}>Caricamento utenti...</p>
            </motion.div>
          )}

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={styles.footer}
          >
            <p style={styles.footerText}>CoreSuite © 2025</p>
          </motion.div>
        </div>

        {/* Alert */}
        <Alert
          show={alert.show}
          type={alert.type}
          title={alert.title}
          message={alert.message}
          duration={4000}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      </IonContent>
    </IonPage>
  );
};

const styles = {
  container: {
    minHeight: '100%',
    padding: '20px',
    background: theme.gradients.background,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    marginBottom: '20px'
  },
  backButton: {
    width: '44px',
    height: '44px',
    borderRadius: theme.radius.full,
    border: 'none',
    background: theme.colors.background,
    boxShadow: theme.shadows.sm,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: theme.colors.text
  },
  logoContainer: {
    textAlign: 'center',
    marginBottom: '48px'
  },
  logo: {
    fontSize: theme.fontSize['4xl'],
    fontWeight: theme.fontWeight.extrabold,
    margin: '0 0 8px 0',
    background: theme.gradients.primary,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  subtitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    margin: 0,
    fontWeight: theme.fontWeight.medium
  },
  formContainer: {
    maxWidth: '400px',
    width: '100%',
    margin: '0 auto',
    flex: 1
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  inputGroup: {
    marginBottom: '8px'
  },
  item: {
    '--background': theme.colors.background,
    '--border-radius': theme.radius.md,
    '--padding-start': '16px',
    '--padding-end': '16px',
    boxShadow: theme.shadows.sm
  },
  loginButton: {
    '--background': theme.colors.accent,
    '--border-radius': theme.radius.lg,
    height: '56px',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    marginTop: '16px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  loadingText: {
    margin: 0,
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary
  },
  footer: {
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: '40px'
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    margin: 0
  }
};

export default Login;
