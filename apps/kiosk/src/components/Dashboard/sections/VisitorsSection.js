/**
 * VisitorsSection Component
 * Gestione completa dei visitatori (lista, creazione, modifica)
 */

import React, { useState, useEffect } from 'react';
import {
  IoPeople,
  IoSearch,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoBusinessOutline,
  IoMailOutline,
  IoCallOutline,
  IoAdd
} from 'react-icons/io5';
import { visitorsAPI } from '../../../services/api';

const VisitorsSection = ({ user, onNewVisitor }) => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState({ show: false, type: 'info', text: '' });

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    filterVisitors();
  }, [visitors, searchTerm]);

  const loadVisitors = async () => {
    setLoading(true);
    try {
      const response = await visitorsAPI.getAll();
      setVisitors(response.data);
    } catch (error) {
      console.error('Error loading visitors:', error);
      showMessage('error', 'Errore nel caricamento dei visitatori');
    } finally {
      setLoading(false);
    }
  };

  const filterVisitors = () => {
    let filtered = visitors;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(v =>
        v.firstName?.toLowerCase().includes(term) ||
        v.lastName?.toLowerCase().includes(term) ||
        v.company?.toLowerCase().includes(term) ||
        v.email?.toLowerCase().includes(term)
      );
    }

    setFilteredVisitors(filtered);
  };

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: 'info', text: '' }), 4000);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Caricamento visitatori...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestione Visitatori</h1>
          <p style={styles.subtitle}>{filteredVisitors.length} visitatori registrati</p>
        </div>
        {onNewVisitor && (
          <button style={styles.addButton} onClick={onNewVisitor}>
            <IoAdd size={24} style={{ marginRight: '8px' }} />
            <span>Nuovo Visitatore</span>
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

      {/* Search */}
      <div style={styles.searchBox}>
        <IoSearch size={20} color="#666" />
        <input
          type="text"
          placeholder="Cerca per nome, azienda o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Visitors Grid */}
      {filteredVisitors.length === 0 ? (
        <div style={styles.emptyState}>
          <IoPeople size={48} color="#ccc" />
          <p style={styles.emptyText}>Nessun visitatore trovato</p>
        </div>
      ) : (
        <div style={styles.visitorsList}>
          {filteredVisitors.map((visitor) => (
            <div key={visitor.id} style={styles.visitorCard}>
              {/* Avatar/Initials */}
              <div style={styles.visitorAvatar}>
                {visitor.firstName?.[0]}{visitor.lastName?.[0]}
              </div>

              {/* Visitor Info */}
              <div style={styles.visitorInfo}>
                <h3 style={styles.visitorName}>
                  {visitor.firstName} {visitor.lastName}
                </h3>

                {visitor.company && (
                  <p style={styles.visitorDetail}>
                    <IoBusinessOutline size={16} style={{ marginRight: '6px' }} />
                    {visitor.company}
                  </p>
                )}

                {visitor.email && (
                  <p style={styles.visitorDetail}>
                    <IoMailOutline size={16} style={{ marginRight: '6px' }} />
                    {visitor.email}
                  </p>
                )}

                {visitor.phone && (
                  <p style={styles.visitorDetail}>
                    <IoCallOutline size={16} style={{ marginRight: '6px' }} />
                    {visitor.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
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
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    gap: '12px',
    marginBottom: '24px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#1a1a1a',
    background: 'transparent'
  },
  visitorsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px'
  },
  visitorCard: {
    display: 'flex',
    padding: '20px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  },
  visitorAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#3b82f6',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '600',
    marginRight: '16px',
    flexShrink: 0
  },
  visitorInfo: {
    flex: 1,
    minWidth: 0
  },
  visitorName: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  visitorDetail: {
    display: 'flex',
    alignItems: 'center',
    margin: '4px 0',
    fontSize: '14px',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
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

export default VisitorsSection;
