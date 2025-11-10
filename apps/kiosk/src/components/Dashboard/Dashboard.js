/**
 * Dashboard Component
 * Dashboard principale per modalità completa con visite in corso
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonFab,
  IonFabButton,
  IonIcon,
  IonBadge,
  IonButton,
  IonSpinner
} from '@ionic/react';
import {
  addOutline,
  personOutline,
  businessOutline,
  timeOutline,
  exitOutline,
  refreshOutline
} from 'ionicons/icons';
import { visitsAPI, kioskAPI } from '../../services/api';
import TopBar from '../Common/TopBar';
import Alert from '../Common/Alert';
import theme from '../../styles/theme';

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    current: 0,
    today: 0,
    scheduled: 0,
    monthly: 0
  });
  const [currentVisits, setCurrentVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: 'info', title: '', message: '' });

  const showAlert = (type, title, message) => {
    setAlert({ show: true, type, title, message });
  };

  useEffect(() => {
    loadDashboardData();

    // Auto-refresh ogni 30 secondi
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Carica statistiche e visite in parallelo
      const [statsResponse, visitsResponse] = await Promise.all([
        kioskAPI.getStats().catch(() => ({ data: { data: {} } })),
        visitsAPI.getCurrent().catch(() => ({ data: { data: [] } }))
      ]);

      if (statsResponse.data.data) {
        setStats(statsResponse.data.data);
      }

      if (visitsResponse.data.data) {
        setCurrentVisits(visitsResponse.data.data);
      }
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      showAlert('error', 'Errore', 'Impossibile caricare i dati');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event) => {
    await loadDashboardData();
    event?.detail?.complete();
  };

  const handleCheckOut = async (visitId) => {
    try {
      const response = await visitsAPI.checkOut(visitId);

      if (response.data.status === 'success') {
        showAlert('success', 'Check-out Effettuato', 'Visitatore uscito con successo');
        await loadDashboardData();
      }
    } catch (error) {
      console.error('❌ Check-out error:', error);
      showAlert('error', 'Errore', 'Impossibile effettuare il check-out');
    }
  };

  return (
    <IonPage>
      <TopBar
        title="Dashboard"
        user={user}
        showProfile={true}
        onLogout={onLogout}
      />

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={styles.container}>
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.statsGrid}
          >
            <StatCard
              title="Presenti Ora"
              value={stats.current || 0}
              icon={personOutline}
              color={theme.colors.accent}
            />
            <StatCard
              title="Visite Oggi"
              value={stats.today || 0}
              icon={timeOutline}
              color={theme.colors.success}
            />
            <StatCard
              title="Programmate"
              value={stats.scheduled || 0}
              icon={businessOutline}
              color={theme.colors.warning}
            />
            <StatCard
              title="Totale Mese"
              value={stats.monthly || 0}
              icon={businessOutline}
              color={theme.colors.info}
            />
          </motion.div>

          {/* Current Visits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={styles.section}
          >
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                Visitatori Presenti
                {currentVisits.length > 0 && (
                  <IonBadge color="primary" style={styles.badge}>
                    {currentVisits.length}
                  </IonBadge>
                )}
              </h2>
              <IonButton size="small" fill="clear" onClick={loadDashboardData}>
                <IonIcon icon={refreshOutline} />
              </IonButton>
            </div>

            {loading ? (
              <div style={styles.loadingContainer}>
                <IonSpinner />
                <p style={styles.loadingText}>Caricamento...</p>
              </div>
            ) : currentVisits.length === 0 ? (
              <div style={styles.emptyState}>
                <IonIcon icon={personOutline} style={styles.emptyIcon} />
                <p style={styles.emptyText}>Nessun visitatore presente</p>
              </div>
            ) : (
              <div style={styles.visitsList}>
                {currentVisits.map((visit, index) => (
                  <VisitCard
                    key={visit.id}
                    visit={visit}
                    index={index}
                    onCheckOut={handleCheckOut}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* FAB per nuova visita */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="primary">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

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

// StatCard Component
const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    style={{ ...styles.statCard, borderLeft: `4px solid ${color}` }}
  >
    <div style={styles.statIcon}>
      <IonIcon icon={icon} style={{ color, fontSize: '32px' }} />
    </div>
    <div style={styles.statContent}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statTitle}>{title}</div>
    </div>
  </motion.div>
);

// VisitCard Component
const VisitCard = ({ visit, index, onCheckOut }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    style={styles.visitCard}
  >
    <div style={styles.visitHeader}>
      <div style={styles.visitorAvatar}>
        <IonIcon icon={personOutline} />
      </div>
      <div style={styles.visitInfo}>
        <h3 style={styles.visitorName}>
          {visit.visitor?.full_name || 'N/A'}
        </h3>
        <p style={styles.visitDetail}>
          <IonIcon icon={businessOutline} style={styles.detailIcon} />
          {visit.visitor?.company || 'N/A'}
        </p>
        <p style={styles.visitDetail}>
          <IonIcon icon={timeOutline} style={styles.detailIcon} />
          Check-in: {new Date(visit.check_in_time).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>

    <IonButton
      size="small"
      color="danger"
      fill="outline"
      onClick={() => onCheckOut(visit.id)}
    >
      <IonIcon icon={exitOutline} slot="start" />
      Check-out
    </IonButton>
  </motion.div>
);

const styles = {
  container: {
    padding: '20px',
    paddingBottom: '80px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: theme.colors.background,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadows.sm
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: theme.radius.md,
    background: theme.colors.backgroundGray,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statContent: {
    flex: 1
  },
  statValue: {
    fontSize: theme.fontSize['3xl'],
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    lineHeight: 1
  },
  statTitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: '4px'
  },
  section: {
    marginBottom: '24px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  sectionTitle: {
    margin: 0,
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  badge: {
    fontSize: theme.fontSize.sm
  },
  visitsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  visitCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    background: theme.colors.background,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadows.sm,
    gap: '16px'
  },
  visitHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  visitorAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: theme.radius.full,
    background: theme.gradients.accent,
    color: theme.colors.textInverse,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    flexShrink: 0
  },
  visitInfo: {
    flex: 1
  },
  visitorName: {
    margin: '0 0 4px 0',
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text
  },
  visitDetail: {
    margin: '2px 0',
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  detailIcon: {
    fontSize: '14px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '40px'
  },
  loadingText: {
    marginTop: '12px',
    color: theme.colors.textSecondary
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: theme.colors.background,
    borderRadius: theme.radius.lg,
    border: `2px dashed ${theme.colors.border}`
  },
  emptyIcon: {
    fontSize: '64px',
    color: theme.colors.textLight,
    marginBottom: '16px'
  },
  emptyText: {
    margin: 0,
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary
  }
};

export default Dashboard;
