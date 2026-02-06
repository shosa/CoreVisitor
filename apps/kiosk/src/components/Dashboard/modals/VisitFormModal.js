/**
 * VisitFormModal Component
 * Form modale per creare una nuova visita
 */

import React, { useState, useEffect } from 'react';
import {
  IoClose,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoPerson,
  IoCalendar,
  IoTime,
  IoBusiness,
  IoText
} from 'react-icons/io5';
import { visitsAPI, visitorsAPI, departmentsAPI, usersAPI } from '../../../services/api';

const VisitFormModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    visitorId: '',
    departmentId: '',
    visitType: 'business',
    purpose: '',
    hostName: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeStart: '09:00',
    scheduledTimeEnd: '',
    notes: ''
  });

  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('');
  const [showVisitorDropdown, setShowVisitorDropdown] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState({ show: false, type: 'info', text: '' });

  useEffect(() => {
    if (show) {
      loadFormData();
    }
  }, [show]);

  if (!show) return null;

  const loadFormData = async () => {
    setLoadingData(true);
    try {
      const [visitorsRes, depsRes, usersRes] = await Promise.all([
        visitorsAPI.getAll(),
        departmentsAPI.getAll(),
        usersAPI.getAll()
      ]);

      setVisitors(visitorsRes.data);
      setDepartments(depsRes.data);
      setHosts(usersRes.data);
    } catch (error) {
      console.error('Error loading form data:', error);
      showMessage('error', 'Errore nel caricamento dei dati');
    } finally {
      setLoadingData(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: 'info', text: '' }), 4000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVisitorSearch = (value) => {
    setVisitorSearchTerm(value);
    setShowVisitorDropdown(true);

    if (!value.trim()) {
      setFilteredVisitors([]);
      return;
    }

    const term = value.toLowerCase();
    const filtered = visitors
      .filter(v =>
        v.firstName?.toLowerCase().includes(term) ||
        v.lastName?.toLowerCase().includes(term) ||
        v.company?.toLowerCase().includes(term) ||
        v.email?.toLowerCase().includes(term)
      )
      .slice(0, 10); // Mostra solo i primi 10 risultati

    setFilteredVisitors(filtered);
  };

  const handleSelectVisitor = (visitor) => {
    setSelectedVisitor(visitor);
    setFormData(prev => ({ ...prev, visitorId: visitor.id }));
    setVisitorSearchTerm(`${visitor.firstName} ${visitor.lastName}${visitor.company ? ` - ${visitor.company}` : ''}`);
    setShowVisitorDropdown(false);
    setFilteredVisitors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validazione
    if (!formData.visitorId) {
      showMessage('error', 'Seleziona un visitatore');
      return;
    }

    if (!formData.departmentId) {
      showMessage('error', 'Seleziona un reparto');
      return;
    }

    if (!formData.purpose) {
      showMessage('error', 'Inserisci il motivo della visita');
      return;
    }

    setLoading(true);

    try {
      // Prepara i dati per l'API
      const submitData = {
        visitorId: formData.visitorId,
        departmentId: formData.departmentId,
        visitType: formData.visitType,
        purpose: formData.purpose,
        hostName: formData.hostName,
        scheduledDate: formData.scheduledDate,
        scheduledTimeStart: `${formData.scheduledDate}T${formData.scheduledTimeStart}:00`,
        scheduledTimeEnd: formData.scheduledTimeEnd
          ? `${formData.scheduledDate}T${formData.scheduledTimeEnd}:00`
          : undefined,
        notes: formData.notes
      };

      await visitsAPI.create(submitData);

      showMessage('success', 'Visita creata con successo');
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error creating visit:', error);
      showMessage('error', error.response?.data?.message || 'Errore durante la creazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Nuova Visita</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <IoClose size={28} />
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

        {/* Content */}
        <div style={styles.content}>
          {loadingData ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Caricamento...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Visitor Selection - Autocomplete */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Visitatore *</label>
                <div style={{ position: 'relative' }}>
                  <div style={styles.inputWrapper}>
                    <IoPerson size={20} color="#666" />
                    <input
                      type="text"
                      value={visitorSearchTerm}
                      onChange={(e) => handleVisitorSearch(e.target.value)}
                      onFocus={() => setShowVisitorDropdown(true)}
                      style={styles.input}
                      placeholder="Cerca visitatore per nome, azienda o email..."
                      required={!selectedVisitor}
                    />
                  </div>

                  {/* Dropdown con risultati */}
                  {showVisitorDropdown && filteredVisitors.length > 0 && (
                    <div style={styles.dropdown}>
                      {filteredVisitors.map(visitor => (
                        <div
                          key={visitor.id}
                          onClick={() => handleSelectVisitor(visitor)}
                          style={styles.dropdownItem}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={styles.dropdownItemMain}>
                            {visitor.firstName} {visitor.lastName}
                          </div>
                          {visitor.company && (
                            <div style={styles.dropdownItemSub}>{visitor.company}</div>
                          )}
                          {visitor.email && (
                            <div style={styles.dropdownItemSub}>{visitor.email}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Messaggio se non ci sono risultati */}
                  {showVisitorDropdown && visitorSearchTerm && filteredVisitors.length === 0 && (
                    <div style={styles.dropdown}>
                      <div style={styles.dropdownEmpty}>
                        Nessun visitatore trovato
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Department Selection */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Reparto *</label>
                <div style={styles.inputWrapper}>
                  <IoBusiness size={20} color="#666" />
                  <select
                    value={formData.departmentId}
                    onChange={(e) => handleInputChange('departmentId', e.target.value)}
                    style={styles.select}
                    required
                  >
                    <option value="">Seleziona reparto</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Visit Type */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo Visita *</label>
                <select
                  value={formData.visitType}
                  onChange={(e) => handleInputChange('visitType', e.target.value)}
                  style={styles.selectFull}
                  required
                >
                  <option value="business">Business</option>
                  <option value="personal">Personale</option>
                  <option value="interview">Colloquio</option>
                  <option value="delivery">Consegna</option>
                  <option value="maintenance">Manutenzione</option>
                  <option value="other">Altro</option>
                </select>
              </div>

              {/* Purpose */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Motivo della Visita *</label>
                <div style={styles.inputWrapper}>
                  <IoText size={20} color="#666" />
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange('purpose', e.target.value)}
                    style={styles.input}
                    placeholder="Es. Riunione, Consegna pacchi..."
                    required
                  />
                </div>
              </div>

              {/* Host */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Persona da incontrare</label>
                <div style={styles.inputWrapper}>
                  <IoPerson size={20} color="#666" />
                  <select
                    value={formData.hostName}
                    onChange={(e) => handleInputChange('hostName', e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Seleziona (opzionale)</option>
                    {hosts.map(host => (
                      <option key={host.id} value={`${host.firstName} ${host.lastName}`}>
                        {host.firstName} {host.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date and Time */}
              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Data *</label>
                  <div style={styles.inputWrapper}>
                    <IoCalendar size={20} color="#666" />
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Ora Inizio *</label>
                  <div style={styles.inputWrapper}>
                    <IoTime size={20} color="#666" />
                    <input
                      type="time"
                      value={formData.scheduledTimeStart}
                      onChange={(e) => handleInputChange('scheduledTimeStart', e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Ora Fine (opzionale)</label>
                <div style={styles.inputWrapper}>
                  <IoTime size={20} color="#666" />
                  <input
                    type="time"
                    value={formData.scheduledTimeEnd}
                    onChange={(e) => handleInputChange('scheduledTimeEnd', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Notes */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Note</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  style={styles.textarea}
                  placeholder="Note aggiuntive..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div style={styles.actions}>
                <button type="button" onClick={onClose} style={styles.cancelButton}>
                  Annulla
                </button>
                <button type="submit" disabled={loading} style={styles.submitButton}>
                  {loading ? 'Creazione...' : 'Crea Visita'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    animation: 'fadeIn 0.2s ease'
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    zIndex: 2001,
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px',
    borderBottom: '2px solid #e5e5e5'
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  closeButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid #e5e5e5',
    background: '#fff',
    color: '#666',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    fontSize: '0'
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px'
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
    margin: '0 24px 16px',
    fontSize: '14px',
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px'
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
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px'
  },
  formGroup: {
    marginBottom: '16px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    background: '#fff'
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#1a1a1a',
    background: 'transparent'
  },
  select: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#1a1a1a',
    background: 'transparent',
    cursor: 'pointer'
  },
  selectFull: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#1a1a1a',
    background: '#fff',
    cursor: 'pointer',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    fontSize: '15px',
    color: '#1a1a1a',
    background: '#fff',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 1000
  },
  dropdownItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #f5f5f5',
    transition: 'background 0.2s ease'
  },
  dropdownItemMain: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px'
  },
  dropdownItemSub: {
    fontSize: '13px',
    color: '#666',
    marginTop: '2px'
  },
  dropdownEmpty: {
    padding: '20px',
    textAlign: 'center',
    color: '#999',
    fontSize: '14px'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '24px',
    borderTop: '2px solid #e5e5e5'
  },
  cancelButton: {
    padding: '12px 24px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '12px',
    color: '#666',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  submitButton: {
    padding: '12px 24px',
    background: '#3b82f6',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default VisitFormModal;
