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
  const [statusFilter, setStatusFilter] = useState('all');
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
    if (statusFilter !== 'all') {
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
      case 'scheduled':
        return { bg: '#fffbeb', color: '#f59e0b', border: '#f59e0b' };
      case 'checked_in':
        return { bg: '#f0fdf4', color: '#10b981', border: '#10b981' };
      case 'checked_out':
        return { bg: '#f5f5f5', color: '#666', border: '#e5e5e5' };
      case 'cancelled':
        return { bg: '#fef2f2', color: '#ef4444', border: '#ef4444' };
      default:
        return { bg: '#f5f5f5', color: '#666', border: '#e5e5e5' };
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Programmata';
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
          {['all', 'scheduled', 'checked_in', 'checked_out'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                ...styles.filterButton,
                ...(statusFilter === status ? styles.filterButtonActive : {})
              }}
            >
              {status === 'all' ? 'Tutte' : getStatusLabel(status)}
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

                {/* Visit Info */}
                <div style={styles.visitInfo}>
                  <h3 style={styles.visitName}>
                    <IoPersonOutline size={20} style={{ marginRight: '8px' }} />
                    {visit.visitor?.firstName} {visit.visitor?.lastName}
                  </h3>

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
                  {visit.status === 'scheduled' && (
                    <button
                      onClick={() => handleCheckIn(visit.id)}
                      style={{ ...styles.actionButton, ...styles.actionButtonGreen }}
                    >
                      Check-in
                    </button>
                  )}
                  {visit.status === 'checked_in' && (
                    <button
                      onClick={() => handleCheckOut(visit.id)}
                      style={{ ...styles.actionButton, ...styles.actionButtonBlue }}
                    >
                      Check-out
                    </button>
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
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    transition: 'all 0.2s ease'
  },
  statusBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    padding: '6px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600'
  },
  visitInfo: {
    flex: 1,
    paddingRight: '120px'
  },
  visitName: {
    display: 'flex',
    alignItems: 'center',
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a'
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
