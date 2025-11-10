/**
 * OverviewSection Component
 * Panoramica con KPI e visite correnti
 */

import React, { useState, useEffect } from 'react';
import {
  IoPeople,
  IoCalendar,
  IoTrendingUp,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoRefresh,
  IoBusiness,
  IoLocationOutline,
  IoConstruct,
  IoMedkit,
  IoCart,
  IoDesktop,
  IoFlask,
  IoCafe,
  IoHammer,
  IoSchool,
  IoHome,
  IoCog,
  IoRocket,
  IoGlobe,
  IoServer,
  IoBriefcase,
  IoWallet,
  IoBarChart,
  IoAlbums,
  IoStorefront,
  IoHardwareChip
} from 'react-icons/io5';
import { visitsAPI, departmentsAPI } from '../../../services/api';

// Mappa delle icone dall'enum del backend
const iconMap = {
  // Enum values dal backend
  'Business': IoBusiness,
  'Engineering': IoConstruct,
  'Healthcare': IoMedkit,
  'Sales': IoCart,
  'IT': IoDesktop,
  'Research': IoFlask,
  'HR': IoPeople,
  'Finance': IoWallet,
  'Marketing': IoRocket,
  'Operations': IoCog,
  'Logistics': IoAlbums,
  'Customer_Service': IoStorefront,
  'Production': IoHammer,
  'Quality': IoCheckmarkCircle,
  'Warehouse': IoServer,
  'Administration': IoBriefcase,
  'Legal': IoSchool,
  'Procurement': IoCart,
  'Planning': IoCalendar,
  'Biotech': IoHardwareChip,
  'Other': IoLocationOutline
};

const OverviewSection = ({ user }) => {
  const [stats, setStats] = useState({
    current: 0,
    today: 0,
    scheduled: 0,
    monthly: 0
  });
  const [currentVisits, setCurrentVisits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentVisits, setDepartmentVisits] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ show: false, type: 'info', text: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carica stats (con fallback se non disponibile)
      let statsData = { current: 0, today: 0, scheduled: 0, monthly: 0 };
      try {
        const statsRes = await visitsAPI.getStats();
        const rawData = statsRes.data;

        // Mappa i nomi dei campi dal backend
        statsData = {
          current: rawData.currentVisitors ?? 0,
          today: rawData.todayVisits ?? 0,
          scheduled: rawData.scheduledToday ?? 0,
          monthly: rawData.totalThisMonth ?? 0
        };
      } catch (err) {
        console.warn('Stats endpoint not available, using defaults:', err);
      }

      // Carica visite correnti (con fallback)
      let visitsData = [];
      try {
        const visitsRes = await visitsAPI.getCurrent();
        visitsData = visitsRes.data || [];
      } catch (err) {
        console.warn('Current visits endpoint not available:', err);
        // Fallback: prendi tutte le visite con status checked_in
        try {
          const allVisitsRes = await visitsAPI.getAll({ status: 'checked_in' });
          visitsData = allVisitsRes.data || [];
        } catch (err2) {
          console.error('Cannot load visits:', err2);
        }
      }

      // Carica reparti
      const depsRes = await departmentsAPI.getAll();

      setStats(statsData);
      setCurrentVisits(visitsData);
      setDepartments(depsRes.data || []);

      // Raggruppa visite per reparto
      const visitsByDept = {};
      visitsData.forEach(visit => {
        const deptId = visit.departmentId;
        if (!visitsByDept[deptId]) {
          visitsByDept[deptId] = [];
        }
        visitsByDept[deptId].push(visit);
      });
      setDepartmentVisits(visitsByDept);
    } catch (error) {
      console.error('Error loading data:', error);
      showMessage('error', 'Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: 'info', text: '' }), 4000);
  };

  const handleCheckOut = async (visitId) => {
    try {
      await visitsAPI.checkOut(visitId);
      showMessage('success', 'Check-out effettuato con successo');
      loadData();
    } catch (error) {
      showMessage('error', 'Errore durante il check-out');
    }
  };

  const kpiCards = [
    { label: 'Presenti Ora', value: stats.current ?? 0, icon: IoPeople, color: '#10b981', bgColor: '#f0fdf4' },
    { label: 'Visite Oggi', value: stats.today ?? 0, icon: IoCalendar, color: '#3b82f6', bgColor: '#eff6ff' },
    { label: 'Programmate', value: stats.scheduled ?? 0, icon: IoCalendar, color: '#f59e0b', bgColor: '#fffbeb' },
    { label: 'Totale Mese', value: stats.monthly ?? 0, icon: IoTrendingUp, color: '#8b5cf6', bgColor: '#f5f3ff' }
  ];

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Caricamento...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Benvenuto, {user.full_name || user.firstName}</p>
        </div>
        <button onClick={loadData} style={styles.refreshButton}>
          <IoRefresh size={20} />
        </button>
      </div>

      {/* Message */}
      {message.show && (
        <div style={{
          ...styles.message,
          ...(message.type === 'success' ? styles.messageSuccess : styles.messageError)
        }}>
          {message.type === 'success' ? (
            <IoCheckmarkCircle size={20} style={{ marginRight: '8px' }} />
          ) : (
            <IoCloseCircle size={20} style={{ marginRight: '8px' }} />
          )}
          <span>{message.text}</span>
        </div>
      )}

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

      {/* Mappa Reparti */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <IoBusiness size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Mappa Reparti
        </h2>
        {departments.length === 0 ? (
          <div style={styles.emptyState}>
            <IoBusiness size={48} color="#ccc" />
            <p style={styles.emptyText}>Nessun reparto configurato</p>
          </div>
        ) : (
          <div style={styles.departmentsGrid}>
            {departments.map((dept) => {
              const visitsCount = departmentVisits[dept.id]?.length || 0;
              const hasVisitors = visitsCount > 0;
              const deptColor = dept.color || '#3b82f6'; // Colore del reparto o blu di default

              // Genera colore di sfondo chiaro dal colore del reparto
              const hexToRgb = (hex) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16)
                } : { r: 59, g: 130, b: 246 };
              };

              const rgb = hexToRgb(deptColor);
              const lightBg = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
              const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`;

              // Ottieni l'icona del reparto o usa quella di default
              const DeptIcon = dept.icon && iconMap[dept.icon] ? iconMap[dept.icon] : IoLocationOutline;

              return (
                <div
                  key={dept.id}
                  style={{
                    ...styles.departmentCard,
                    ...(hasVisitors ? {
                      borderColor: deptColor,
                      boxShadow: `0 4px 12px ${shadowColor}`
                    } : {})
                  }}
                >
                  <div style={styles.departmentHeader}>
                    <div style={{
                      ...styles.departmentIcon,
                      backgroundColor: hasVisitors ? lightBg : '#f9fafb'
                    }}>
                      <DeptIcon size={28} color={hasVisitors ? deptColor : '#666'} />
                    </div>
                    <div style={styles.departmentInfo}>
                      <h3 style={styles.departmentName}>{dept.name}</h3>
                      {dept.location && (
                        <p style={styles.departmentLocation}>{dept.location}</p>
                      )}
                    </div>
                  </div>

                  <div style={styles.departmentStats}>
                    <div style={styles.departmentStat}>
                      <IoPeople size={20} color={hasVisitors ? deptColor : '#999'} />
                      <span style={{
                        ...styles.departmentStatValue,
                        color: hasVisitors ? deptColor : '#666'
                      }}>
                        {visitsCount}
                      </span>
                      <span style={styles.departmentStatLabel}>
                        {visitsCount === 1 ? 'visitatore' : 'visitatori'}
                      </span>
                    </div>
                  </div>

                  {/* Lista visitatori nel reparto */}
                  {hasVisitors && (
                    <div style={styles.departmentVisitors}>
                      {departmentVisits[dept.id].map(visit => (
                        <div key={visit.id} style={styles.departmentVisitorItem}>
                          <div style={{
                            ...styles.visitorInitials,
                            background: deptColor
                          }}>
                            {visit.visitor?.firstName?.[0]}{visit.visitor?.lastName?.[0]}
                          </div>
                          <div style={styles.visitorInfo}>
                            <span style={styles.visitorName}>
                              {visit.visitor?.firstName} {visit.visitor?.lastName}
                            </span>
                            {visit.visitor?.company && (
                              <span style={styles.visitorCompany}>{visit.visitor.company}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Current Visits */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Visitatori Presenti</h2>
        {currentVisits.length === 0 ? (
          <div style={styles.emptyState}>
            <IoPeople size={48} color="#ccc" />
            <p style={styles.emptyText}>Nessun visitatore presente</p>
          </div>
        ) : (
          <div style={styles.visitsList}>
            {currentVisits.map((visit) => (
              <div key={visit.id} style={styles.visitCard}>
                <div style={styles.visitInfo}>
                  <h3 style={styles.visitName}>
                    {visit.visitor?.firstName} {visit.visitor?.lastName}
                  </h3>
                  <p style={styles.visitDetail}>
                    Azienda: {visit.visitor?.company || 'N/A'}
                  </p>
                  <p style={styles.visitDetail}>
                    Motivo: {visit.purpose}
                  </p>
                  <p style={styles.visitDetail}>
                    Check-in: {new Date(visit.actualCheckIn).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <button
                  onClick={() => handleCheckOut(visit.id)}
                  style={styles.checkOutButton}
                >
                  Check-out
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px'
  },
  title: {
    margin: '0 0 4px 0',
    fontSize: '32px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  subtitle: {
    margin: 0,
    fontSize: '16px',
    color: '#666'
  },
  refreshButton: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '2px solid #e5e5e5',
    background: '#fff',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease'
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '24px',
    fontSize: '15px',
    fontWeight: '500'
  },
  messageSuccess: {
    background: '#f0fdf4',
    color: '#10b981',
    border: '2px solid #10b981'
  },
  messageError: {
    background: '#fef2f2',
    color: '#ef4444',
    border: '2px solid #ef4444'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  kpiCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '16px',
    transition: 'all 0.2s ease'
  },
  kpiIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px'
  },
  kpiContent: {
    flex: 1
  },
  kpiLabel: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    color: '#666',
    fontWeight: '500'
  },
  kpiValue: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  section: {
    marginBottom: '32px'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 16px 0',
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  departmentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px'
  },
  departmentCard: {
    padding: '20px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '16px',
    transition: 'all 0.3s ease'
  },
  departmentCardActive: {
    borderColor: '#3b82f6',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
  },
  departmentHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '16px'
  },
  departmentIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12px',
    transition: 'all 0.3s ease'
  },
  departmentInfo: {
    flex: 1
  },
  departmentName: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  departmentLocation: {
    margin: 0,
    fontSize: '14px',
    color: '#666'
  },
  departmentStats: {
    display: 'flex',
    gap: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f5f5f5'
  },
  departmentStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  departmentStatValue: {
    fontSize: '20px',
    fontWeight: '600'
  },
  departmentStatLabel: {
    fontSize: '14px',
    color: '#666'
  },
  departmentVisitors: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  departmentVisitorItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  visitorInitials: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#3b82f6',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    marginRight: '12px',
    flexShrink: 0
  },
  visitorInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0
  },
  visitorName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  visitorCompany: {
    fontSize: '12px',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  visitsList: {
    display: 'grid',
    gap: '12px'
  },
  visitCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '12px'
  },
  visitInfo: {
    flex: 1
  },
  visitName: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  visitDetail: {
    margin: '4px 0',
    fontSize: '14px',
    color: '#666'
  },
  checkOutButton: {
    padding: '12px 24px',
    background: '#10b981',
    border: '2px solid #10b981',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  emptyState: {
    padding: '60px 20px',
    textAlign: 'center',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '16px'
  },
  emptyText: {
    margin: '16px 0 0 0',
    fontSize: '16px',
    color: '#999'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e5e5e5',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  loadingText: {
    marginTop: '16px',
    fontSize: '16px',
    color: '#666'
  }
};

export default OverviewSection;
