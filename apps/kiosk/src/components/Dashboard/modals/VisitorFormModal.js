/**
 * VisitorFormModal Component
 * Form modale per creare un nuovo visitatore con foto e documento
 */

import React, { useState } from 'react';
import {
  IoClose,
  IoCamera,
  IoImage,
  IoDocument,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoPerson,
  IoMail,
  IoCall,
  IoBusiness
} from 'react-icons/io5';
import camera from '../../../services/camera';
import { visitorsAPI } from '../../../services/api';

const VisitorFormModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    documentType: 'id_card',
    documentNumber: '',
    licensePlate: '',
    notes: '',
    privacyConsent: false
  });

  const [photo, setPhoto] = useState(null);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, type: 'info', text: '' });

  if (!show) return null;

  const showMessage = (type, text) => {
    setMessage({ show: true, type, text });
    setTimeout(() => setMessage({ show: false, type: 'info', text: '' }), 4000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTakePhoto = async () => {
    try {
      const result = await camera.takePhoto();
      setPhoto(result);
      showMessage('success', 'Foto acquisita');
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handlePickPhoto = async () => {
    try {
      const result = await camera.pickFromGallery();
      setPhoto(result);
      showMessage('success', 'Foto selezionata');
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleTakeDocument = async () => {
    try {
      const result = await camera.takePhoto();
      setDocument(result);
      showMessage('success', 'Documento acquisito');
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await camera.pickFromGallery();
      setDocument(result);
      showMessage('success', 'Documento selezionato dalla galleria');
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validazione
    if (!formData.firstName || !formData.lastName) {
      showMessage('error', 'Nome e cognome sono obbligatori');
      return;
    }

    if (!formData.privacyConsent) {
      showMessage('error', 'Devi accettare il consenso privacy');
      return;
    }

    setLoading(true);

    try {
      // Prepara FormData per l'upload
      const submitData = new FormData();

      // Aggiungi campi del form
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Aggiungi foto se presente
      if (photo) {
        const photoBlob = camera.base64ToBlob(photo.base64, `image/${photo.format}`);
        submitData.append('photo', photoBlob, `photo.${photo.format}`);
      }

      // Aggiungi documento se presente
      if (document) {
        const docBlob = camera.base64ToBlob(document.base64, `image/${document.format}`);
        submitData.append('document', docBlob, `document.${document.format}`);
      }

      // Invia al backend
      await visitorsAPI.create(submitData);

      showMessage('success', 'Visitatore creato con successo');
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error creating visitor:', error);
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
          <h2 style={styles.title}>Nuovo Visitatore</h2>
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
          <form onSubmit={handleSubmit}>
            {/* Photo Section */}
            <div style={styles.photoSection}>
              <label style={styles.label}>Foto Visitatore</label>
              <div style={styles.photoContainer}>
                {photo ? (
                  <img src={photo.dataUrl} alt="Foto visitatore" style={styles.photoPreview} />
                ) : (
                  <div style={styles.photoPlaceholder}>
                    <IoPerson size={48} color="#ccc" />
                  </div>
                )}
                <div style={styles.photoButtons}>
                  <button type="button" onClick={handleTakePhoto} style={styles.photoButton}>
                    <IoCamera size={20} />
                    <span>Scatta</span>
                  </button>
                  <button type="button" onClick={handlePickPhoto} style={styles.photoButton}>
                    <IoImage size={20} />
                    <span>Galleria</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nome *</label>
                <div style={styles.inputWrapper}>
                  <IoPerson size={20} color="#666" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    style={styles.input}
                    placeholder="Nome"
                    required
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Cognome *</label>
                <div style={styles.inputWrapper}>
                  <IoPerson size={20} color="#666" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    style={styles.input}
                    placeholder="Cognome"
                    required
                  />
                </div>
              </div>
            </div>

            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.inputWrapper}>
                  <IoMail size={20} color="#666" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={styles.input}
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Telefono</label>
                <div style={styles.inputWrapper}>
                  <IoCall size={20} color="#666" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={styles.input}
                    placeholder="+39 ..."
                  />
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Azienda</label>
              <div style={styles.inputWrapper}>
                <IoBusiness size={20} color="#666" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  style={styles.input}
                  placeholder="Nome azienda"
                />
              </div>
            </div>

            {/* Document Section */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Documento</label>
              <div style={styles.documentContainer}>
                {document ? (
                  <div style={styles.documentPreview}>
                    <img src={document.dataUrl} alt="Documento" style={styles.documentImage} />
                    <button type="button" onClick={() => setDocument(null)} style={styles.removeButton}>
                      <IoCloseCircle size={20} />
                      <span>Rimuovi</span>
                    </button>
                  </div>
                ) : (
                  <div style={styles.buttonGroup}>
                    <button type="button" onClick={handleTakeDocument} style={styles.documentButton}>
                      <IoCamera size={20} />
                      <span>Scatta Foto</span>
                    </button>
                    <button type="button" onClick={handlePickDocument} style={styles.documentButtonSecondary}>
                      <IoImage size={20} />
                      <span>Da Galleria</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Document Info */}
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo Documento</label>
                <select
                  value={formData.documentType}
                  onChange={(e) => handleInputChange('documentType', e.target.value)}
                  style={styles.select}
                >
                  <option value="id_card">Carta d'Identità</option>
                  <option value="passport">Passaporto</option>
                  <option value="driving_license">Patente</option>
                  <option value="other">Altro</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Numero Documento</label>
                <input
                  type="text"
                  value={formData.documentNumber}
                  onChange={(e) => handleInputChange('documentNumber', e.target.value)}
                  style={styles.input}
                  placeholder="AB123456"
                />
              </div>
            </div>

            {/* Additional Info */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Targa (opzionale)</label>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => handleInputChange('licensePlate', e.target.value)}
                style={styles.input}
                placeholder="AA123BB"
              />
            </div>

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

            {/* Privacy Consent */}
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={formData.privacyConsent}
                onChange={(e) => handleInputChange('privacyConsent', e.target.checked)}
                style={styles.checkbox}
                required
              />
              <label style={styles.checkboxLabel}>
                Accetto il trattamento dei dati personali *
              </label>
            </div>

            {/* Actions */}
            <div style={styles.actions}>
              <button type="button" onClick={onClose} style={styles.cancelButton}>
                Annulla
              </button>
              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? 'Creazione...' : 'Crea Visitatore'}
              </button>
            </div>
          </form>
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
    maxWidth: '700px',
    maxHeight: '90vh',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    zIndex: 2001,
    display: 'flex',
    flexDirection: 'column',
    animation: 'modalSlideIn 0.3s ease'
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
  photoSection: {
    marginBottom: '24px'
  },
  photoContainer: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  photoPreview: {
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '2px solid #e5e5e5'
  },
  photoPlaceholder: {
    width: '120px',
    height: '120px',
    borderRadius: '12px',
    border: '2px dashed #e5e5e5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb'
  },
  photoButtons: {
    display: 'flex',
    gap: '8px',
    flexDirection: 'column'
  },
  photoButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '10px',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
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
    background: '#fff',
    transition: 'all 0.2s ease'
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
  documentContainer: {
    padding: '16px',
    border: '2px dashed #e5e5e5',
    borderRadius: '12px',
    textAlign: 'center'
  },
  documentPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  documentImage: {
    width: '100%',
    maxWidth: '300px',
    height: 'auto',
    borderRadius: '8px',
    border: '2px solid #e5e5e5'
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  documentButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#3b82f6',
    border: '2px solid #3b82f6',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  documentButtonSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: '10px',
    color: '#666',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  removeButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: '#fef2f2',
    border: '2px solid #ef4444',
    borderRadius: '10px',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '14px',
    color: '#666',
    cursor: 'pointer'
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
    background: '#10b981',
    border: '2px solid #10b981',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

// Add animations
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translate(-50%, -48%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }
  `;
  if (!document.head.querySelector('style[data-modal-animation]')) {
    styleSheet.setAttribute('data-modal-animation', 'true');
    document.head.appendChild(styleSheet);
  }
}

export default VisitorFormModal;
