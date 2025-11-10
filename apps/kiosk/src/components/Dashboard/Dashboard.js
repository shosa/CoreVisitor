/**
 * Dashboard Component - Stile CoreInWork
 * Dashboard pulita e minimalista con visite in corso
 */

import React, { useState, useEffect } from 'react';
import { IoPersonCircle, IoPeople, IoCalendar, IoTrendingUp, IoLogOut, IoRefresh, IoArrowForward, IoAlertCircle, IoCheckmarkCircle } from 'react-icons/io5';
import { visitsAPI } from '../../services/api';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({ current: 0, today: 0, scheduled: 0, monthly: 0 });
  const [currentVisits, setCurrentVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsResponse, visitsResponse] = await Promise.all([
        visitsAPI.getStats().catch(() => ({ data: {} })),
        visitsAPI.getCurrent().catch(() => ({ data: [] }))
      ]);

      setStats(statsResponse.data || { current: 0, today: 0, scheduled: 0, monthly: 0 });
      setCurrentVisits(Array.isArray(visitsResponse.data) ? visitsResponse.data : []);
    } catch (err) {
      console.error('❌ Error loading dashboard:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async (visitId) => {
    try {
      await visitsAPI.checkOut(visitId);
      setSuccess('Check-out effettuato con successo');
      setTimeout(() => setSuccess(''), 3000);
      await loadDashboardData();
    } catch (err) {
      console.error('❌ Check-out error:', err);
      setError('Errore durante il check-out');
    }
  };

  const kpiCards = [
    { label: 'Presenti Ora', value: stats.current, icon: IoPeople, color: '#10b981', bgColor: '#f0fdf4' },
    { label: 'Visite Oggi', value: stats.today, icon: IoCalendar, color: '#3b82f6', bgColor: '#eff6ff' },
    { label: 'Programmate', value: stats.scheduled, icon: IoCalendar, color: '#f59e0b', bgColor: '#fffbeb' },
    { label: 'Totale Mese', value: stats.monthly, icon: IoTrendingUp, color: '#8b5cf6', bgColor: '#f5f3ff' }
  ];

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .visit-card {
          background: white;
          border: 2px solid #e5e5e5;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.25s ease;
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .visit-card:hover {
          border-color: #1a1a1a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .checkout-button {
          background: #10b981;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .checkout-button:hover {
          background: #059669;
          transform: translateY(-2px);
        }
      `}</style>

      {/* Top Bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <h1 style={styles.title}>CoreVisitor</h1>
          <span style={styles.subtitle}>Dashboard</span>
        </div>
        <div style={styles.topBarRight}>
          <div style={styles.userInfo}>
            <IoPersonCircle size={20} />
            <span style={styles.userName}>{user.full_name}</span>
          </div>
          <button
            onClick={loadDashboardData}
            style={styles.refreshButton}
            title="Aggiorna"
          >
            <IoRefresh size={18} />
          </button>
          <button
            onClick={onLogout}
            style={styles.logoutButton}
            title="Logout"
          >
            <IoLogOut size={18} />
            Esci
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Alerts */}
        {error && (
          <div style={styles.errorCard}>
            <IoAlertCircle size={20} color="#f44336" />
            <span style={styles.errorText}>{error}</span>
            <button onClick={() => setError('')} style={styles.closeButton}>×</button>
          </div>
        )}

        {success && (
          <div style={styles.successCard}>
            <IoCheckmarkCircle size={20} color="#10b981" />
            <span style={styles.successText}>{success}</span>
          </div>
        )}

        {loading && (
          <div style={styles.loadingCard}>
            <div style={styles.spinner}></div>
            <p>Caricamento dati...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* KPI Cards */}
            <div style={styles.kpiGrid}>
              {kpiCards.map((kpi) => {
                const Icon = kpi.icon;
                return (
                  <div key={kpi.label} style={styles.kpiCard}>
                    <div style={{ ...styles.kpiIcon, backgroundColor: kpi.bgColor }}>
                      <Icon size={24} color={kpi.color} />
                    </div>
                    <div style={styles.kpiContent}>
                      <p style={styles.kpiLabel}>{kpi.label}</p>
                      <h3 style={styles.kpiValue}>{kpi.value}</h3>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Visits */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Visite in Corso</h2>

              {currentVisits.length === 0 ? (
                <div style={styles.emptyCard}>
                  <IoPeople size={48} color="#999" />
                  <p style={styles.emptyText}>Nessuna visita in corso</p>
                </div>
              ) : (
                <div style={styles.visitsGrid}>
                  {currentVisits.map((visit) => (
                    <div key={visit.id} className="visit-card">
                      <div style={styles.visitInfo}>
                        <h4 style={styles.visitName}>
                          {visit.visitor?.firstName} {visit.visitor?.lastName}
                        </h4>
                        <p style={styles.visitDetail}>
                          {visit.visitor?.company || 'Nessuna azienda'}
                        </p>
                        <p style={styles.visitDetail}>
                          Host: {visit.hostUser?.firstName} {visit.hostUser?.lastName}
                        </p>
                      </div>
                      <button
                        className="checkout-button"
                        onClick={() => handleCheckOut(visit.id)}
                      >
                        <IoArrowForward size={16} />
                        Check-out
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
    display: 'flex',
    flexDirection: 'column',
  },
  topBar: {
    background: 'white',
    borderBottom: '1px solid #e5e5e5',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  },
  topBarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#f5f5f5',
    borderRadius: '8px',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  refreshButton: {
    background: 'transparent',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  logoutButton: {
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
  },
  content: {
    flex: 1,
    padding: '24px',
    maxWidth: '1400px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
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
    flex: 1,
  },
  successCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    border: '2px solid rgba(16, 185, 129, 0.2)',
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  successText: {
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '500',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#f44336',
  },
  loadingCard: {
    background: 'white',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  spinner: {
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #1a1a1a',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    animation: 'fadeIn 0.5s ease-out',
  },
  kpiCard: {
    background: 'white',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  kpiIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  kpiContent: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: '13px',
    color: '#666',
    margin: '0 0 4px 0',
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
  },
  emptyCard: {
    background: 'white',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  emptyText: {
    fontSize: '16px',
    color: '#999',
    margin: 0,
  },
  visitsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  visitInfo: {
    flex: 1,
  },
  visitName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 6px 0',
  },
  visitDetail: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 4px 0',
  },
};

export default Dashboard;
