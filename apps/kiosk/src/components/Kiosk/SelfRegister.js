/**
 * SelfRegister Component
 * Registrazione self-service dal kiosk: dati visitatore + dati visita + riepilogo + stampa badge
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoArrowBack,
  IoChevronForward,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoPerson,
  IoBusiness,
  IoDocumentText,
  IoShield,
  IoSearch,
  IoClose,
} from 'react-icons/io5';
import { kioskAPI } from '../../services/api';

const STEPS = ['Dati Personali', 'Dettagli Visita', 'Riepilogo'];

const VISIT_TYPES = [
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personale' },
  { value: 'delivery', label: 'Consegna' },
  { value: 'maintenance', label: 'Manutenzione' },
  { value: 'interview', label: 'Colloquio' },
  { value: 'other', label: 'Altro' },
];

const SelfRegister = ({ onBack }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [badgeInfo, setBadgeInfo] = useState(null);
  const [error, setError] = useState('');
  const [hosts, setHosts] = useState([]);
  // Ricerca visitatore esistente
  const [visitorSearch, setVisitorSearch] = useState('');
  const [visitorSuggestions, setVisitorSuggestions] = useState([]);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [companyName, setCompanyName] = useState('CoreVisitor');
  const [countdown, setCountdown] = useState(7);

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    visitType: 'business',
    hostId: '',
    purpose: '',
    privacyConsent: false,
  });

  // Carica dati all'avvio
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [hostsRes, settingsRes] = await Promise.all([
          kioskAPI.getHosts(),
          kioskAPI.getSettings(),
        ]);
        setHosts(hostsRes.data?.data || hostsRes.data || []);
        setCompanyName(settingsRes.data?.data?.companyName || 'CoreVisitor');
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  // Countdown dopo successo
  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onBack();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [success, onBack]);

  const handleVisitorSearchChange = (value) => {
    setVisitorSearch(value);
    setSelectedVisitor(null);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (value.trim().length < 2) {
      setVisitorSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await kioskAPI.searchVisitors(value.trim());
        setVisitorSuggestions(res.data?.data || res.data || []);
      } catch (e) {
        setVisitorSuggestions([]);
      }
    }, 300);
    setSearchTimeout(timer);
  };

  const handleSelectExistingVisitor = (visitor) => {
    setSelectedVisitor(visitor);
    setVisitorSearch(`${visitor.firstName} ${visitor.lastName}`);
    setVisitorSuggestions([]);
    setFormData((prev) => ({
      ...prev,
      firstName: visitor.firstName,
      lastName: visitor.lastName,
      email: visitor.email || prev.email,
      company: visitor.company || prev.company,
    }));
  };

  const handleClearVisitor = () => {
    setSelectedVisitor(null);
    setVisitorSearch('');
    setVisitorSuggestions([]);
    setFormData((prev) => ({ ...prev, firstName: '', lastName: '', email: '', company: '' }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep = () => {
    if (step === 0) {
      if (!selectedVisitor && (!formData.firstName.trim() || !formData.lastName.trim())) {
        setError('Inserisci nome e cognome oppure cerca il tuo nome nel campo di ricerca');
        return false;
      }
    }
    if (step === 1) {
      if (!formData.visitType) {
        setError('Seleziona il tipo di visita');
        return false;
      }
      if (!formData.hostId) {
        setError('Seleziona il referente da incontrare');
        return false;
      }
      const host = hosts.find((h) => h.id === formData.hostId);
      if (!host?.departmentId) {
        setError('Il referente selezionato non ha un reparto assegnato. Contatta la reception.');
        return false;
      }
    }
    if (step === 2) {
      if (!formData.privacyConsent) {
        setError('Devi accettare il consenso privacy per procedere');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateStep()) return;

    setLoading(true);
    try {
      const selectedHost = hosts.find((h) => h.id === formData.hostId);
      const payload = selectedVisitor
        ? {
            visitorId: selectedVisitor.id,
            visitType: formData.visitType,
            hostId: formData.hostId,
            hostName: selectedHost ? `${selectedHost.firstName} ${selectedHost.lastName}` : undefined,
            purpose: formData.purpose.trim() || undefined,
            privacyConsent: formData.privacyConsent,
          }
        : {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim() || undefined,
            company: formData.company.trim() || undefined,
            visitType: formData.visitType,
            hostId: formData.hostId,
            hostName: selectedHost ? `${selectedHost.firstName} ${selectedHost.lastName}` : undefined,
            purpose: formData.purpose.trim() || undefined,
            privacyConsent: formData.privacyConsent,
          };

      const res = await kioskAPI.selfRegister(payload);
      setBadgeInfo(res.data?.data || res.data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Errore durante la registrazione. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const selectedHost = hosts.find((h) => h.id === formData.hostId);
  const selectedVisitType = VISIT_TYPES.find((t) => t.value === formData.visitType);

  // --- SUCCESS SCREEN ---
  if (success) {
    return (
      <div style={styles.container}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={styles.successContainer}
        >
          <div style={styles.successIcon}>
            <IoCheckmarkCircle size={80} color="#10b981" />
          </div>
          <h2 style={styles.successTitle}>Registrazione completata!</h2>
          <p style={styles.successSubtitle}>
            Benvenuto, {formData.firstName} {formData.lastName}!
          </p>
          {badgeInfo?.badgeNumber && (
            <div style={styles.badgeBox}>
              <p style={styles.badgeLabel}>Il tuo numero badge</p>
              <p style={styles.badgeNumber}>{badgeInfo.badgeNumber}</p>
              <p style={styles.badgeNote}>Il badge è in fase di stampa</p>
            </div>
          )}
          <p style={styles.countdownText}>Ritorno alla home in {countdown}s...</p>
          <button onClick={onBack} style={styles.homeButton}>
            Torna alla home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <IoArrowBack size={24} />
        </button>
        <div style={styles.headerCenter}>
          <img src="/img/logo.png" alt={companyName} style={styles.logoImage} />
          <p style={styles.headerTitle}>Registrazione Visitatore</p>
        </div>
        <div style={{ width: 44 }} />
      </div>

      {/* Step Indicator */}
      <div style={styles.stepperContainer}>
        {STEPS.map((label, index) => (
          <div key={index} style={styles.stepItem}>
            <div style={{
              ...styles.stepCircle,
              ...(index < step ? styles.stepDone : index === step ? styles.stepActive : styles.stepPending),
            }}>
              {index < step ? <IoCheckmarkCircle size={18} color="#fff" /> : index + 1}
            </div>
            <span style={{
              ...styles.stepLabel,
              color: index === step ? '#1a1a1a' : '#999',
              fontWeight: index === step ? '600' : '400',
            }}>{label}</span>
            {index < STEPS.length - 1 && (
              <div style={{ ...styles.stepLine, background: index < step ? '#10b981' : '#e5e5e5' }} />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {loadingData ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <p style={{ color: '#666', marginTop: 16 }}>Caricamento...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* STEP 0: Dati Personali */}
              {step === 0 && (
                <div style={styles.stepContent}>
                  <div style={styles.stepIcon}>
                    <IoPerson size={32} color="#3b82f6" />
                  </div>
                  <h3 style={styles.stepTitle}>I tuoi dati</h3>
                  <p style={styles.stepSubtitle}>Sei già stato qui? Cerca il tuo nome, altrimenti compilare i campi</p>

                  {/* Ricerca visitatore esistente */}
                  <div style={{ ...styles.formGroup, width: '100%', marginBottom: 24, position: 'relative' }}>
                    <label style={styles.label}>Cerca il tuo nome (se sei già stato registrato)</label>
                    <div style={styles.searchWrapper}>
                      <IoSearch size={20} color="#999" style={styles.searchIcon} />
                      <input
                        style={styles.searchInput}
                        type="text"
                        value={visitorSearch}
                        onChange={(e) => handleVisitorSearchChange(e.target.value)}
                        placeholder="Inizia a digitare nome o cognome..."
                        disabled={!!selectedVisitor}
                      />
                      {selectedVisitor && (
                        <button onClick={handleClearVisitor} style={styles.clearButton} type="button">
                          <IoClose size={20} color="#666" />
                        </button>
                      )}
                    </div>
                    {visitorSuggestions.length > 0 && !selectedVisitor && (
                      <div style={styles.suggestionsBox}>
                        {visitorSuggestions.map((v) => (
                          <button
                            key={v.id}
                            type="button"
                            style={styles.suggestionItem}
                            onClick={() => handleSelectExistingVisitor(v)}
                          >
                            <span style={styles.suggestionName}>{v.firstName} {v.lastName}</span>
                            {v.company && <span style={styles.suggestionSub}>{v.company}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedVisitor && (
                      <div style={styles.selectedVisitorBadge}>
                        <IoCheckmarkCircle size={18} color="#10b981" />
                        <span style={{ marginLeft: 8, fontSize: 14, color: '#166534', fontWeight: '600' }}>
                          Visitatore trovato: {selectedVisitor.firstName} {selectedVisitor.lastName}
                          {selectedVisitor.company ? ` (${selectedVisitor.company})` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Divisore */}
                  <div style={styles.divider}>
                    <div style={styles.dividerLine} />
                    <span style={styles.dividerText}>oppure inserisci i tuoi dati</span>
                    <div style={styles.dividerLine} />
                  </div>

                  <div style={{ ...styles.formGrid, opacity: selectedVisitor ? 0.4 : 1, pointerEvents: selectedVisitor ? 'none' : 'auto' }}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Nome *</label>
                      <input
                        style={styles.input}
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => handleChange('firstName', e.target.value)}
                        placeholder="Es. Mario"
                        disabled={!!selectedVisitor}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Cognome *</label>
                      <input
                        style={styles.input}
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleChange('lastName', e.target.value)}
                        placeholder="Es. Rossi"
                        disabled={!!selectedVisitor}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Azienda</label>
                      <input
                        style={styles.input}
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleChange('company', e.target.value)}
                        placeholder="Nome azienda (opzionale)"
                        disabled={!!selectedVisitor}
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Email</label>
                      <input
                        style={styles.input}
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="email@esempio.it (opzionale)"
                        disabled={!!selectedVisitor}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1: Dettagli Visita */}
              {step === 1 && (
                <div style={styles.stepContent}>
                  <div style={styles.stepIcon}>
                    <IoBusiness size={32} color="#f4845f" />
                  </div>
                  <h3 style={styles.stepTitle}>Dettagli visita</h3>
                  <p style={styles.stepSubtitle}>Seleziona il referente e il tipo di visita</p>

                  <div style={styles.formGrid}>
                    <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                      <label style={styles.label}>Referente da incontrare *</label>
                      <select
                        style={styles.select}
                        value={formData.hostId}
                        onChange={(e) => handleChange('hostId', e.target.value)}
                      >
                        <option value="">Seleziona il referente...</option>
                        {hosts.map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.firstName} {h.lastName}{h.department?.name ? ` — ${h.department.name}` : ''}
                          </option>
                        ))}
                      </select>
                      {selectedHost?.department?.name && (
                        <div style={styles.deptBadge}>
                          Reparto: <strong>{selectedHost.department.name}</strong>
                        </div>
                      )}
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Tipo di Visita *</label>
                      <select
                        style={styles.select}
                        value={formData.visitType}
                        onChange={(e) => handleChange('visitType', e.target.value)}
                      >
                        {VISIT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Motivo visita</label>
                      <textarea
                        style={styles.textarea}
                        value={formData.purpose}
                        onChange={(e) => handleChange('purpose', e.target.value)}
                        placeholder="Motivo (opzionale)"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Riepilogo + Privacy */}
              {step === 2 && (
                <div style={styles.stepContent}>
                  <div style={styles.stepIcon}>
                    <IoDocumentText size={32} color="#10b981" />
                  </div>
                  <h3 style={styles.stepTitle}>Riepilogo e conferma</h3>
                  <p style={styles.stepSubtitle}>Verifica i tuoi dati prima di procedere</p>

                  {/* Summary */}
                  <div style={styles.summaryBox}>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Visitatore</span>
                      <span style={styles.summaryValue}>
                        {selectedVisitor
                          ? `${selectedVisitor.firstName} ${selectedVisitor.lastName}`
                          : `${formData.firstName} ${formData.lastName}`}
                      </span>
                    </div>
                    {(selectedVisitor?.company || formData.company) && (
                      <div style={styles.summaryRow}>
                        <span style={styles.summaryLabel}>Azienda</span>
                        <span style={styles.summaryValue}>{selectedVisitor?.company || formData.company}</span>
                      </div>
                    )}
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Referente</span>
                      <span style={styles.summaryValue}>{selectedHost ? `${selectedHost.firstName} ${selectedHost.lastName}` : '—'}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Reparto</span>
                      <span style={styles.summaryValue}>{selectedHost?.department?.name || '—'}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>Tipo visita</span>
                      <span style={styles.summaryValue}>{selectedVisitType?.label}</span>
                    </div>
                    {formData.purpose && (
                      <div style={styles.summaryRow}>
                        <span style={styles.summaryLabel}>Motivo</span>
                        <span style={styles.summaryValue}>{formData.purpose}</span>
                      </div>
                    )}
                  </div>

                  {/* GDPR */}
                  <div style={styles.gdprBox}>
                    <IoShield size={20} color="#6366f1" style={{ flexShrink: 0 }} />
                    <p style={styles.gdprText}>
                      Ai sensi del Regolamento UE 2016/679 (GDPR), i tuoi dati personali
                      saranno trattati da <strong>{companyName}</strong> esclusivamente
                      per la gestione degli accessi e la sicurezza aziendale. I dati non
                      saranno ceduti a terzi e saranno conservati per il tempo strettamente
                      necessario. Hai diritto di accesso, rettifica e cancellazione dei
                      tuoi dati contattando la reception.
                    </p>
                  </div>

                  <label style={styles.consentRow}>
                    <input
                      type="checkbox"
                      checked={formData.privacyConsent}
                      onChange={(e) => handleChange('privacyConsent', e.target.checked)}
                      style={styles.checkbox}
                    />
                    <span style={styles.consentText}>
                      Ho letto e accetto il trattamento dei dati personali ai sensi del GDPR *
                    </span>
                  </label>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.errorBox}
          >
            <IoCloseCircle size={18} />
            <span style={{ marginLeft: 8 }}>{error}</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <div style={styles.navigation}>
        {step > 0 && (
          <button onClick={() => { setStep((p) => p - 1); setError(''); }} style={styles.backNavButton}>
            <IoArrowBack size={20} style={{ marginRight: 8 }} />
            Indietro
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step < STEPS.length - 1 ? (
          <button onClick={handleNext} style={styles.nextButton} disabled={loadingData}>
            Avanti
            <IoChevronForward size={20} style={{ marginLeft: 8 }} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={loading} style={styles.confirmButton}>
            {loading ? (
              <>
                <div style={styles.spinner} />
                <span style={{ marginLeft: 10 }}>Registrazione...</span>
              </>
            ) : (
              <>
                <IoCheckmarkCircle size={22} style={{ marginRight: 8 }} />
                Conferma e Stampa Badge
              </>
            )}
          </button>
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
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e5e5',
    background: '#fff',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: '2px solid #e5e5e5',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  headerCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoImage: {
    maxHeight: 40,
    maxWidth: 180,
    objectFit: 'contain',
  },
  headerTitle: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginTop: 4,
    margin: 0,
  },
  stepperContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 24px',
    background: '#fff',
    borderBottom: '1px solid #e5e5e5',
    gap: 0,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  stepActive: {
    background: '#1a1a1a',
    color: '#fff',
  },
  stepDone: {
    background: '#10b981',
    color: '#fff',
  },
  stepPending: {
    background: '#e5e5e5',
    color: '#999',
  },
  stepLabel: {
    fontSize: 13,
    whiteSpace: 'nowrap',
  },
  stepLine: {
    width: 40,
    height: 2,
    margin: '0 8px',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    maxWidth: 700,
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: '16px',
    background: '#f8f8f8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px',
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 24,
    margin: '0 0 24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    width: '100%',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  input: {
    padding: '14px 16px',
    border: '2px solid #e5e5e5',
    borderRadius: 12,
    fontSize: 16,
    color: '#1a1a1a',
    outline: 'none',
    background: '#fff',
    width: '100%',
    boxSizing: 'border-box',
  },
  select: {
    padding: '14px 16px',
    border: '2px solid #e5e5e5',
    borderRadius: 12,
    fontSize: 16,
    color: '#1a1a1a',
    outline: 'none',
    background: '#fff',
    width: '100%',
    cursor: 'pointer',
  },
  textarea: {
    padding: '14px 16px',
    border: '2px solid #e5e5e5',
    borderRadius: 12,
    fontSize: 15,
    color: '#1a1a1a',
    outline: 'none',
    background: '#fff',
    width: '100%',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    gridColumn: '1 / -1',
  },
  summaryBox: {
    width: '100%',
    background: '#f9fafb',
    borderRadius: 16,
    padding: '20px 24px',
    marginBottom: 20,
    border: '2px solid #e5e5e5',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #e5e5e5',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '60%',
  },
  gdprBox: {
    width: '100%',
    background: '#eef2ff',
    border: '2px solid #c7d2fe',
    borderRadius: 12,
    padding: '16px',
    display: 'flex',
    gap: 12,
    marginBottom: 20,
  },
  gdprText: {
    fontSize: 13,
    color: '#4338ca',
    lineHeight: '1.6',
    margin: 0,
  },
  consentRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    cursor: 'pointer',
    width: '100%',
    background: '#fff',
    padding: '16px',
    borderRadius: 12,
    border: '2px solid #e5e5e5',
  },
  checkbox: {
    width: 22,
    height: 22,
    cursor: 'pointer',
    flexShrink: 0,
    marginTop: 2,
  },
  consentText: {
    fontSize: 14,
    color: '#1a1a1a',
    lineHeight: '1.5',
    fontWeight: '500',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#fef2f2',
    border: '2px solid #ef4444',
    borderRadius: 12,
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 24px',
    borderTop: '2px solid #e5e5e5',
    background: '#fff',
    gap: 12,
  },
  backNavButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 24px',
    background: '#fff',
    border: '2px solid #e5e5e5',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    cursor: 'pointer',
  },
  nextButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 32px',
    background: '#1a1a1a',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
  },
  confirmButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 32px',
    background: '#10b981',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
  },
  // Success
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '40px 24px',
    textAlign: 'center',
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 12,
    margin: '0 0 12px',
  },
  successSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    margin: '0 0 32px',
  },
  badgeBox: {
    background: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: 16,
    padding: '24px 40px',
    marginBottom: 32,
  },
  badgeLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    margin: '0 0 8px',
  },
  badgeNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 2,
    margin: '0 0 4px',
  },
  badgeNote: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '500',
    margin: 0,
  },
  countdownText: {
    fontSize: 15,
    color: '#999',
    marginBottom: 20,
    margin: '0 0 20px',
  },
  homeButton: {
    padding: '14px 32px',
    background: '#1a1a1a',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    cursor: 'pointer',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  searchInput: {
    padding: '14px 48px',
    border: '2px solid #3b82f6',
    borderRadius: 12,
    fontSize: 16,
    color: '#1a1a1a',
    outline: 'none',
    background: '#fff',
    width: '100%',
    boxSizing: 'border-box',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  suggestionsBox: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 100,
    background: '#fff',
    border: '2px solid #3b82f6',
    borderTop: 'none',
    borderRadius: '0 0 12px 12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    maxHeight: 240,
    overflowY: 'auto',
  },
  suggestionItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    borderBottom: '1px solid #f0f0f0',
    cursor: 'pointer',
    textAlign: 'left',
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  suggestionSub: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  selectedVisitorBadge: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 8,
    padding: '10px 14px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 10,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: '#e5e5e5',
  },
  dividerText: {
    fontSize: 13,
    color: '#999',
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  deptBadge: {
    marginTop: 8,
    padding: '6px 12px',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: 8,
    fontSize: 13,
    color: '#166534',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #e5e5e5',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// Add spin animation
if (typeof document !== 'undefined') {
  const styleEl = document.createElement('style');
  styleEl.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
  if (!document.head.querySelector('style[data-spin]')) {
    styleEl.setAttribute('data-spin', 'true');
    document.head.appendChild(styleEl);
  }
}

export default SelfRegister;
