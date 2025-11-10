/**
 * FullDashboard Component
 * Dashboard completa con tutte le funzionalità (gestione visite e visitatori)
 * CoreInWork Style
 */

import React, { useState } from 'react';
import {
  IoHome,
  IoPeople,
  IoCalendar,
  IoLogOut,
  IoPersonCircle,
  IoAdd,
  IoClose,
  IoPersonAdd,
  IoCalendarOutline,
  IoMenu,
  IoChevronBack,
  IoChevronForward
} from 'react-icons/io5';
import VisitsSection from './sections/VisitsSection';
import VisitorsSection from './sections/VisitorsSection';
import OverviewSection from './sections/OverviewSection';
import VisitorFormModal from './modals/VisitorFormModal';
import VisitFormModal from './modals/VisitFormModal';

const FullDashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [showVisitorForm, setShowVisitorForm] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const sections = [
    { id: 'overview', label: 'Dashboard', icon: IoHome },
    { id: 'visits', label: 'Visite', icon: IoCalendar },
    { id: 'visitors', label: 'Visitatori', icon: IoPeople }
  ];

  const fabActions = [
    { id: 'new-visitor', label: 'Nuovo Visitatore', icon: IoPersonAdd, color: '#10b981' },
    { id: 'new-visit', label: 'Nuova Visita', icon: IoCalendarOutline, color: '#3b82f6' }
  ];

  const handleFabAction = (actionId) => {
    setFabOpen(false);
    if (actionId === 'new-visitor') {
      setShowVisitorForm(true);
    } else if (actionId === 'new-visit') {
      setShowVisitForm(true);
    }
  };

  const handleFormSuccess = () => {
    // Forza il refresh delle sezioni incrementando la key
    setRefreshKey(prev => prev + 1);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection key={`overview-${refreshKey}`} user={user} />;
      case 'visits':
        return (
          <VisitsSection
            key={`visits-${refreshKey}`}
            user={user}
            onNewVisit={() => setShowVisitForm(true)}
          />
        );
      case 'visitors':
        return (
          <VisitorsSection
            key={`visitors-${refreshKey}`}
            user={user}
            onNewVisitor={() => setShowVisitorForm(true)}
          />
        );
      default:
        return <OverviewSection key={`overview-${refreshKey}`} user={user} />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Sidebar Navigation */}
      <div style={{
        ...styles.sidebar,
        ...(sidebarCollapsed ? styles.sidebarCollapsed : {})
      }}>
        {/* Logo/Title & Toggle */}
        <div style={styles.sidebarHeader}>
          {!sidebarCollapsed && <h2 style={styles.sidebarTitle}>CoreVisitor</h2>}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={styles.toggleButton}
            title={sidebarCollapsed ? 'Espandi menu' : 'Comprimi menu'}
          >
            {sidebarCollapsed ? <IoChevronForward size={20} /> : <IoChevronBack size={20} />}
          </button>
        </div>

        {/* Navigation Buttons */}
        <nav style={styles.nav}>
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                style={{
                  ...styles.navButton,
                  ...(isActive ? styles.navButtonActive : {}),
                  ...(sidebarCollapsed ? styles.navButtonCollapsed : {})
                }}
                title={sidebarCollapsed ? section.label : ''}
              >
                <Icon size={22} />
                {!sidebarCollapsed && <span style={{ marginLeft: '12px' }}>{section.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div style={styles.sidebarFooter}>
          {!sidebarCollapsed && (
            <div style={styles.userInfo}>
              <div style={styles.userAvatar}>
                <IoPersonCircle size={24} />
              </div>
              <div style={styles.userDetails}>
                <div style={styles.userName}>{user.full_name || user.firstName}</div>
                <div style={styles.userRole}>{user.role}</div>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            style={{
              ...styles.logoutButton,
              ...(sidebarCollapsed ? styles.logoutButtonCollapsed : {})
            }}
            title={sidebarCollapsed ? 'Esci' : ''}
          >
            <IoLogOut size={20} />
            {!sidebarCollapsed && <span style={{ marginLeft: '8px' }}>Esci</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {renderSection()}
      </div>

      {/* Floating Action Button (FAB) */}
      <div style={styles.fabContainer}>
        {/* FAB Actions Menu */}
        {fabOpen && (
          <div style={styles.fabMenu}>
            {fabActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleFabAction(action.id)}
                  style={{
                    ...styles.fabMenuItem,
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <div style={{ ...styles.fabMenuIcon, background: action.color }}>
                    <Icon size={20} color="#fff" />
                  </div>
                  <span style={styles.fabMenuLabel}>{action.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          style={{
            ...styles.fab,
            ...(fabOpen ? styles.fabOpen : {})
          }}
        >
          {fabOpen ? <IoClose size={28} /> : <IoAdd size={28} />}
        </button>
      </div>

      {/* Backdrop when FAB is open */}
      {fabOpen && (
        <div
          style={styles.fabBackdrop}
          onClick={() => setFabOpen(false)}
        />
      )}

      {/* Modals */}
      <VisitorFormModal
        show={showVisitorForm}
        onClose={() => setShowVisitorForm(false)}
        onSuccess={handleFormSuccess}
      />

      <VisitFormModal
        show={showVisitForm}
        onClose={() => setShowVisitForm(false)}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
};

const styles = {
  container: {
    position: 'relative',
    display: 'flex',
    height: '100vh',
    background: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  sidebar: {
    width: '280px',
    background: '#fff',
    borderRight: '2px solid #e5e5e5',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    flexShrink: 0,
    transition: 'all 0.3s ease'
  },
  sidebarCollapsed: {
    width: '80px',
    padding: '24px 12px'
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    paddingLeft: '12px'
  },
  sidebarTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  },
  toggleButton: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: '2px solid #e5e5e5',
    background: '#fff',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '14px 16px',
    background: 'transparent',
    border: '2px solid transparent',
    borderRadius: '12px',
    color: '#666',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    whiteSpace: 'nowrap'
  },
  navButtonCollapsed: {
    justifyContent: 'center',
    padding: '14px 8px'
  },
  navButtonActive: {
    background: '#eff6ff',
    borderColor: '#3b82f6',
    color: '#3b82f6',
    fontWeight: '600'
  },
  sidebarFooter: {
    marginTop: '24px',
    paddingTop: '24px',
    borderTop: '2px solid #e5e5e5'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    marginBottom: '12px',
    background: '#f9fafb',
    borderRadius: '12px'
  },
  userAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#e5e5e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    marginRight: '12px'
  },
  userDetails: {
    flex: 1
  },
  userName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '2px'
  },
  userRole: {
    fontSize: '13px',
    color: '#666',
    textTransform: 'capitalize'
  },
  logoutButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    background: '#fff',
    border: '2px solid #ef4444',
    borderRadius: '12px',
    color: '#ef4444',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  logoutButtonCollapsed: {
    padding: '12px 8px'
  },
  mainContent: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto'
  },
  // FAB Styles
  fabContainer: {
    position: 'fixed',
    bottom: '32px',
    right: '32px',
    zIndex: 1000
  },
  fab: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#3b82f6',
    border: 'none',
    color: '#fff',
    fontSize: '0',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4)',
    transition: 'all 0.3s ease',
    transform: 'rotate(0deg)'
  },
  fabOpen: {
    transform: 'rotate(135deg)',
    background: '#ef4444'
  },
  fabMenu: {
    position: 'absolute',
    bottom: '80px',
    right: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  fabMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '32px',
    padding: '12px 16px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    animation: 'fabSlideIn 0.3s ease forwards',
    opacity: 0,
    transform: 'translateY(20px)',
    whiteSpace: 'nowrap'
  },
  fabMenuLabel: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  fabMenuIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  fabBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.2)',
    zIndex: 999
  }
};

// Add FAB animation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fabSlideIn {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  if (!document.head.querySelector('style[data-fab-animation]')) {
    styleSheet.setAttribute('data-fab-animation', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default FullDashboard;
