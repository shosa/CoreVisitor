/**
 * Login Component - Stile CoreInWork
 * Form login pulito e minimalista
 */

import React, { useState } from 'react';
import { IoPersonCircle, IoMail, IoLockClosed, IoLogIn, IoAlertCircle } from 'react-icons/io5';
import { mobileAPI } from '../services/api';

const Login = ({ onBack, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Inserisci email e password');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Inserisci un indirizzo email valido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await mobileAPI.login(email, password);

      if (response.data.access_token && response.data.user) {
        const userData = {
          ...response.data.user,
          full_name: `${response.data.user.firstName} ${response.data.user.lastName}`
        };

        localStorage.setItem('user', JSON.stringify(userData));
        onLoginSuccess(userData);
      } else {
        setError('Risposta del server non valida');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.response?.data?.message || 'Credenziali non valide');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <IoPersonCircle size={48} color="white" />
          </div>
          <h1 style={styles.title}>CoreVisitor</h1>
          <p style={styles.subtitle}>Modalità Completa</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>
              <IoMail size={18} />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={loading}
              autoComplete="email"
              onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)'}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>
              <IoLockClosed size={18} />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="Inserisci la tua password"
              disabled={loading}
              autoComplete="current-password"
              onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)'}
            />
          </div>

          {error && (
            <div style={styles.errorCard}>
              <IoAlertCircle size={20} color="#f44336" />
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonLoading : {}),
            }}
            disabled={loading}
            onMouseOver={(e) => !loading && (e.target.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? (
              <>
                <div style={styles.buttonSpinner}></div>
                Accesso in corso...
              </>
            ) : (
              <>
                <IoLogIn size={20} />
                Accedi
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <button
            type="button"
            onClick={onBack}
            style={styles.backButton}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ← Indietro
          </button>
          <p style={styles.footerText}>CoreSuite - Visitor Management</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    border: '2px solid rgba(0, 0, 0, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
    padding: '48px',
    maxWidth: '450px',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  iconContainer: {
    width: '80px',
    height: '80px',
    background: '#1a1a1a',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    color: '#1a1a1a',
  },
  subtitle: {
    color: '#666',
    fontSize: '16px',
    margin: 0,
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  input: {
    padding: '14px 16px',
    fontSize: '15px',
    border: '2px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '12px',
    backgroundColor: '#fff',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    outline: 'none',
  },
  errorCard: {
    backgroundColor: 'rgba(244, 67, 54, 0.08)',
    border: '2px solid rgba(244, 67, 54, 0.2)',
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  errorText: {
    color: '#f44336',
    fontSize: '14px',
    fontWeight: '500',
    margin: 0,
  },
  submitButton: {
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    backgroundColor: '#1a1a1a',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  submitButtonLoading: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  buttonSpinner: {
    border: '2px solid #fff',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    animation: 'spin 1s linear infinite',
  },
  footer: {
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  backButton: {
    backgroundColor: 'transparent',
    color: '#666',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    padding: '12px 20px',
    fontSize: '14px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    width: '100%',
    fontWeight: '500',
  },
  footerText: {
    color: '#999',
    fontSize: '13px',
    margin: 0,
    textAlign: 'center',
  },
};

export default Login;
