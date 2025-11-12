/**
 * VisitsSection Component
 * Gestione completa delle visite (lista, creazione, modifica)
 */

import React, { useState, useEffect } from 'react';
import {
  IoAdd,
  IoCalendar,
  IoSearch,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoPrint
} from 'react-icons/io5';
import { visitsAPI, printerAPI } from '../../../services/api';

const VisitsSection = ({ user, onNewVisit }) => {
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('active'); // Default: visite attive (non terminate)
  const [message, setMessage] = useState({ show: false, type: 'info', text: '' });

  useEffect(() => {
    loadVisits();
  }, []);

  useEffect(() => {
    filterVisits();
  }, [visits, searchTerm, statusFilter]);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const response = await visitsAPI.getAll();
      setVisits(response.data);
    } catch (error) {
      console.error('Error loading visits:', error);
      showMessage('error', 'Errore nel caricamento delle visite');
    } finally {
      setLoading(false);
    }
  };

  const filterVisits = () => {
    let filtered = visits;

    // Filter by status
    if (statusFilter === 'active') {
      // Visite attive: pending, approved, checked_in (escludi checked_out, cancelled, rejected)
      filtered = filtered.filter(v =>
        v.status === 'pending' ||
        v.status === 'approved' ||
        v.status === 'checked_in'
      );
    } else if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.visitor?.firstName?.toLowerCase().includes(term) ||
        v.visitor?.lastName?.toLowerCase().includes(term) ||
        v.visitor?.company?.toLowerCase().includes(term) ||
        v.purpose?.toLowerCase().includes(term)
      );
    }

    setFilteredVisits(filtered);
  };

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: 'info', text: '' }), 4000);
  };

  const handleCheckIn = async (visitId) => {
    try {
      await visitsAPI.checkIn(visitId);
      showMessage('success', 'Check-in effettuato');
      loadVisits();
    } catch (error) {
      showMessage('error', 'Errore durante il check-in');
    }
  };

  const handleCheckOut = async (visitId) => {
    try {
      await visitsAPI.checkOut(visitId);
      showMessage('success', 'Check-out effettuato');
      loadVisits();
    } catch (error) {
      showMessage('error', 'Errore durante il check-out');
    }
  };

  const handlePrintBadge = async (visitId) => {
    try {
      await printerAPI.printBadge(visitId, { copies: 1 });
      showMessage('success', 'Badge aggiunto alla coda di stampa');
    } catch (error) {
      console.error('Error printing badge:', error);
      showMessage('error', 'Errore nella stampa del badge');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef3c7', color: '#d97706', border: '#d97706' };
      case 'approved':
        return { bg: '#dbeafe', color: '#2563eb', border: '#2563eb' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#dc2626', border: '#dc2626' };
      case 'checked_in':
        return { bg: '#d1fae5', color: '#059669', border: '#059669' };
      case 'checked_out':
        return { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
      case 'cancelled':
        return { bg: '#fecaca', color: '#b91c1c', border: '#b91c1c' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return 'In Attesa';
      case 'approved':
        return 'Approvata';
      case 'rejected':
        return 'Rifiutata';
      case 'checked_in':
        return 'Presente';
      case 'checked_out':
        return 'Completata';
      case 'cancelled':
        return 'Cancellata';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Caricamento visite...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestione Visite</h1>
          <p style={styles.subtitle}>{filteredVisits.length} visite trovate</p>
        </div>
        {onNewVisit && (
          <button style={styles.addButton} onClick={onNewVisit}>
            <IoAdd size={24} style={{ marginRight: '8px' }} />
            <span>Nuova Visita</span>
          </button>
        )}
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

      {/* Filters */}
      <div style={styles.filtersBar}>
        {/* Search */}
        <div style={styles.searchBox}>
          <IoSearch size={20} color="#666" />
          <input
            type="text"
            placeholder="Cerca per nome, azienda o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Status Filter */}
        <div style={styles.statusFilters}>
          {[
            { value: 'active', label: 'Attive' },
            { value: 'all', label: 'Tutte' },
            { value: 'pending', label: 'In Attesa' },
            { value: 'approved', label: 'Approvate' },
            { value: 'checked_in', label: 'Presenti' },
            { value: 'checked_out', label: 'Completate' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              style={{
                ...styles.filterButton,
                ...(statusFilter === value ? styles.filterButtonActive : {})
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Visits List */}
      {filteredVisits.length === 0 ? (
        <div style={styles.emptyState}>
          <IoCalendar size={48} color="#ccc" />
          <p style={styles.emptyText}>Nessuna visita trovata</p>
        </div>
      ) : (
        <div style={styles.visitsList}>
          {filteredVisits.map((visit) => {
            const statusStyle = getStatusColor(visit.status);
            return (
              <div key={visit.id} style={styles.visitCard}>
                {/* Visit Info */}
                <div style={styles.visitInfo}>
                  <div style={styles.visitHeader}>
                    <div style={styles.visitTitleRow}>
                      <IoPersonOutline size={20} style={{ marginRight: '8px', flexShrink: 0 }} />
                      <h3 style={styles.visitName}>
                        {visit.visitor?.firstName} {visit.visitor?.lastName}
                      </h3>
                      {/* Status Badge */}
                      <div
                        style={{
                          ...styles.statusBadge,
                          background: statusStyle.bg,
                          color: statusStyle.color,
                          border: `2px solid ${statusStyle.border}`
                        }}
                      >
                        {getStatusLabel(visit.status)}
                      </div>
                    </div>
                  </div>

                  {visit.visitor?.company && (
                    <p style={styles.visitDetail}>
                      <IoBusinessOutline size={16} style={{ marginRight: '6px' }} />
                      {visit.visitor.company}
                    </p>
                  )}

                  <p style={styles.visitDetail}>
                    <IoCalendar size={16} style={{ marginRight: '6px' }} />
                    {new Date(visit.scheduledDate).toLocaleDateString('it-IT')} - {visit.purpose}
                  </p>

                  {visit.actualCheckIn && (
                    <p style={styles.visitDetail}>
                      <IoTimeOutline size={16} style={{ marginRight: '6px' }} />
                      Check-in: {new Date(visit.actualCheckIn).toLocaleTimeString('it-IT', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div style={styles.visitActions}>
                  {(visit.status === 'pending' || visit.status === 'approved') && (
                    <button
                      onClick={() => handleCheckIn(visit.id)}
                      style={{ ...styles.actionButton, ...styles.actionButtonGreen }}
                    >
                      Check-in
                    </button>
                  )}
                  {visit.status === 'checked_in' && (
                    <>
                      <button
                        onClick={() => handlePrintBadge(visit.id)}
                        style={{ ...styles.actionButton, ...styles.actionButtonPrint }}
                      >
                        <IoPrint size={16} style={{ marginRight: '6px' }} />
                        Stampa Badge
                      </button>
                      <button
                        onClick={() => handleCheckOut(visit.id)}
                        style={{ ...styles.actionButton, ...styles.actionButtonBlue }}
                      >
                        Check-out
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px'
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
  addButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    color: '#1a1a1a',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
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
  filtersBar: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  searchBox: {
    flex: 1,
    minWidth: '300px',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    gap: '12px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#1a1a1a',
    background: 'transparent'
  },
  statusFilters: {
    display: 'flex',
    gap: '8px'
  },
  filterButton: {
    padding: '12px 20px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  filterButtonActive: {
    background: '#eff6ff',
    borderColor: '#3b82f6',
    color: '#3b82f6',
    fontWeight: '600'
  },
  visitsList: {
    display: 'grid',
    gap: '12px'
  },
  visitCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    transition: 'all 0.2s ease'
  },
  visitInfo: {
    flex: 1,
    minWidth: 0
  },
  visitHeader: {
    marginBottom: '8px'
  },
  visitTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  visitName: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    minWidth: 0
  },
  statusBadge: {
    flexShrink: 0,
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  visitDetail: {
    display: 'flex',
    alignItems: 'center',
    margin: '4px 0',
    fontSize: '14px',
    color: '#666'
  },
  visitActions: {
    display: 'flex',
    gap: '8px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    border: '2px solid',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  actionButtonGreen: {
    background: '#10b981',
    borderColor: '#10b981',
    color: '#fff'
  },
  actionButtonBlue: {
    background: '#3b82f6',
    borderColor: '#3b82f6',
    color: '#fff'
  },
  actionButtonPrint: {
    background: '#fff',
    borderColor: '#e5e5e5',
    color: '#1a1a1a'
  },
  emptyState: {
    padding: '80px 20px',
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

export default VisitsSection;
