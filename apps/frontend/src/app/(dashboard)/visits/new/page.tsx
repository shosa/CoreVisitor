'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { visitorsApi, visitsApi, departmentsApi } from '@/lib/api';
import { Visitor, Department } from '@/types/visitor';
import { useToast } from '@/components/Toast';

// Icons
const ChevronRightIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const steps = ['Seleziona/Crea Visitatore', 'Dettagli Visita', 'Conferma'];

export default function NewVisitPage() {
  const router = useRouter();
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  // State per visitatore
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [visitorSearch, setVisitorSearch] = useState('');
  const [showVisitorDropdown, setShowVisitorDropdown] = useState(false);
  const [newVisitor, setNewVisitor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    documentType: '',
    documentNumber: '',
    documentExpiry: '',
    licensePlate: '',
    privacyConsent: false,
  });

  // State per visita
  const [departments, setDepartments] = useState<Department[]>([]);
  const [visitData, setVisitData] = useState({
    hostName: '',
    visitType: 'business',
    purpose: '',
    departmentId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeStart: new Date().toISOString().slice(0, 16),
    scheduledTimeEnd: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [visitorsRes, deptsRes] = await Promise.all([
        visitorsApi.getAll(),
        departmentsApi.getAll(),
      ]);
      setVisitors(visitorsRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const filteredVisitors = visitors.filter((v) =>
    `${v.firstName} ${v.lastName} ${v.company || ''}`
      .toLowerCase()
      .includes(visitorSearch.toLowerCase())
  );

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        if (selectedVisitor) return true;
        if (!newVisitor.firstName.trim() || !newVisitor.lastName.trim()) {
          setError('Nome e Cognome sono obbligatori');
          return false;
        }
        if (!newVisitor.documentType || !newVisitor.documentNumber.trim()) {
          setError('Tipo e Numero documento sono obbligatori');
          return false;
        }
        return true;
      case 1:
        if (!visitData.departmentId) {
          setError('Seleziona un reparto');
          return false;
        }
        if (!visitData.visitType) {
          setError('Seleziona il tipo di visita');
          return false;
        }
        if (!visitData.purpose.trim()) {
          setError('Il motivo della visita è obbligatorio');
          return false;
        }
        if (!visitData.scheduledTimeStart) {
          setError('Data/Ora inizio è obbligatoria');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    setError('');
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleCreateVisit = async () => {
    setLoading(true);
    setError('');

    try {
      let visitorId = selectedVisitor?.id;

      if (!visitorId && newVisitor.firstName && newVisitor.lastName) {
        const formData = new FormData();
        Object.entries(newVisitor).forEach(([key, value]) => {
          if (value != null && typeof value !== 'object') {
            formData.append(key, value.toString());
          }
        });
        if (photoFile) formData.append('photo', photoFile);
        if (documentFile) formData.append('document', documentFile);

        const visitorRes = await visitorsApi.create(formData);
        visitorId = visitorRes.data.id;
      }

      if (!visitorId) {
        setError('Seleziona o crea un visitatore');
        setLoading(false);
        return;
      }

      const visitPayload: any = {
        visitorId,
        departmentId: visitData.departmentId,
        visitType: visitData.visitType,
        purpose: visitData.purpose,
        hostName: visitData.hostName,
        scheduledDate: visitData.scheduledDate,
        scheduledTimeStart: visitData.scheduledTimeStart,
        notes: visitData.notes,
      };

      if (visitData.scheduledTimeEnd) {
        visitPayload.scheduledTimeEnd = visitData.scheduledTimeEnd;
      }

      await visitsApi.create(visitPayload);
      toast.showSuccess('Visita creata con successo');
      router.push('/visits');
    } catch (error: any) {
      console.error('Error creating visit:', error);
      setError(error.response?.data?.message || 'Errore durante la creazione');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Visitatore Esistente */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Visitatore Esistente</h3>
              <div className="relative">
                <input
                  type="text"
                  className="input"
                  placeholder="Cerca visitatore per nome, cognome o azienda..."
                  value={visitorSearch}
                  onChange={(e) => {
                    setVisitorSearch(e.target.value);
                    setShowVisitorDropdown(true);
                  }}
                  onFocus={() => setShowVisitorDropdown(true)}
                />
                {showVisitorDropdown && visitorSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredVisitors.length === 0 ? (
                      <div className="px-4 py-3 text-gray-500 text-sm">
                        Nessun visitatore trovato
                      </div>
                    ) : (
                      filteredVisitors.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                          onClick={() => {
                            setSelectedVisitor(v);
                            setVisitorSearch(`${v.firstName} ${v.lastName}`);
                            setShowVisitorDropdown(false);
                          }}
                        >
                          <p className="font-medium text-gray-900">
                            {v.firstName} {v.lastName}
                          </p>
                          {v.company && (
                            <p className="text-sm text-gray-500">{v.company}</p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedVisitor && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">
                      {selectedVisitor.firstName} {selectedVisitor.lastName}
                    </p>
                    {selectedVisitor.company && (
                      <p className="text-sm text-blue-700">{selectedVisitor.company}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={() => {
                      setSelectedVisitor(null);
                      setVisitorSearch('');
                    }}
                  >
                    Rimuovi
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Oppure crea nuovo</span>
              </div>
            </div>

            {/* Nuovo Visitatore */}
            <div className={selectedVisitor ? 'opacity-50 pointer-events-none' : ''}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Nuovo Visitatore</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nome *</label>
                  <input
                    type="text"
                    className="input"
                    value={newVisitor.firstName}
                    onChange={(e) => setNewVisitor({ ...newVisitor, firstName: e.target.value })}
                    disabled={!!selectedVisitor}
                  />
                </div>
                <div>
                  <label className="label">Cognome *</label>
                  <input
                    type="text"
                    className="input"
                    value={newVisitor.lastName}
                    onChange={(e) => setNewVisitor({ ...newVisitor, lastName: e.target.value })}
                    disabled={!!selectedVisitor}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className="input"
                    value={newVisitor.email}
                    onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })}
                    disabled={!!selectedVisitor}
                  />
                </div>
                <div>
                  <label className="label">Telefono</label>
                  <input
                    type="tel"
                    className="input"
                    value={newVisitor.phone}
                    onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                    disabled={!!selectedVisitor}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Azienda</label>
                  <input
                    type="text"
                    className="input"
                    value={newVisitor.company}
                    onChange={(e) => setNewVisitor({ ...newVisitor, company: e.target.value })}
                    disabled={!!selectedVisitor}
                  />
                </div>
                <div>
                  <label className="label">Tipo Documento *</label>
                  <select
                    className="input"
                    value={newVisitor.documentType}
                    onChange={(e) => setNewVisitor({ ...newVisitor, documentType: e.target.value })}
                    disabled={!!selectedVisitor}
                  >
                    <option value="">Seleziona tipo documento</option>
                    <option value="CARTA_IDENTITA">Carta d'Identità</option>
                    <option value="PASSAPORTO">Passaporto</option>
                    <option value="PATENTE">Patente</option>
                    <option value="ALTRO">Altro</option>
                  </select>
                </div>
                <div>
                  <label className="label">Numero Documento *</label>
                  <input
                    type="text"
                    className="input"
                    value={newVisitor.documentNumber}
                    onChange={(e) => setNewVisitor({ ...newVisitor, documentNumber: e.target.value })}
                    disabled={!!selectedVisitor}
                  />
                </div>
                <div>
                  <label className="label">Scadenza Documento</label>
                  <input
                    type="date"
                    className="input"
                    value={newVisitor.documentExpiry}
                    onChange={(e) => setNewVisitor({ ...newVisitor, documentExpiry: e.target.value })}
                    disabled={!!selectedVisitor}
                  />
                </div>
                <div>
                  <label className="label">Targa Veicolo</label>
                  <input
                    type="text"
                    className="input"
                    value={newVisitor.licensePlate}
                    onChange={(e) => setNewVisitor({ ...newVisitor, licensePlate: e.target.value })}
                    disabled={!!selectedVisitor}
                  />
                </div>
                <div>
                  <label className="label">Foto Visitatore</label>
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    <UploadIcon />
                    <span className="text-sm text-gray-600">
                      {photoFile ? photoFile.name : 'Carica Foto'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
                      disabled={!!selectedVisitor}
                    />
                  </label>
                </div>
                <div>
                  <label className="label">Scansione Documento</label>
                  <label className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    <UploadIcon />
                    <span className="text-sm text-gray-600">
                      {documentFile ? documentFile.name : 'Carica Documento'}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,image/*"
                      onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)}
                      disabled={!!selectedVisitor}
                    />
                  </label>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newVisitor.privacyConsent}
                      onChange={(e) => setNewVisitor({ ...newVisitor, privacyConsent: e.target.checked })}
                      disabled={!!selectedVisitor}
                      className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      Dichiaro di aver letto l'informativa sulla privacy e di prestare il consenso al trattamento dei dati personali.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label">Host / Referente</label>
              <input
                type="text"
                className="input"
                placeholder="Nome della persona da visitare"
                value={visitData.hostName}
                onChange={(e) => setVisitData({ ...visitData, hostName: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Tipo Visita *</label>
              <select
                className="input"
                value={visitData.visitType}
                onChange={(e) => setVisitData({ ...visitData, visitType: e.target.value })}
              >
                <option value="business">Business</option>
                <option value="personal">Personale</option>
                <option value="delivery">Consegna</option>
                <option value="maintenance">Manutenzione</option>
                <option value="interview">Colloquio</option>
                <option value="other">Altro</option>
              </select>
            </div>
            <div>
              <label className="label">Reparto *</label>
              <select
                className="input"
                value={visitData.departmentId}
                onChange={(e) => setVisitData({ ...visitData, departmentId: e.target.value })}
              >
                <option value="">Seleziona reparto</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Motivo della Visita *</label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="Descrivi brevemente il motivo della visita"
                value={visitData.purpose}
                onChange={(e) => setVisitData({ ...visitData, purpose: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Data/Ora Inizio *</label>
              <input
                type="datetime-local"
                className="input"
                value={visitData.scheduledTimeStart}
                onChange={(e) => setVisitData({ ...visitData, scheduledTimeStart: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Data/Ora Fine (opzionale)</label>
              <input
                type="datetime-local"
                className="input"
                value={visitData.scheduledTimeEnd}
                onChange={(e) => setVisitData({ ...visitData, scheduledTimeEnd: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Note</label>
              <textarea
                className="input resize-none"
                rows={3}
                value={visitData.notes}
                onChange={(e) => setVisitData({ ...visitData, notes: e.target.value })}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Riepilogo</h3>

            <div className="card p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-1">Visitatore</p>
              <p className="font-medium text-gray-900">
                {selectedVisitor
                  ? `${selectedVisitor.firstName} ${selectedVisitor.lastName}`
                  : `${newVisitor.firstName} ${newVisitor.lastName}`}
              </p>
              {(selectedVisitor?.company || newVisitor.company) && (
                <p className="text-sm text-gray-500">
                  {selectedVisitor?.company || newVisitor.company}
                </p>
              )}
            </div>

            <div className="card p-4 border border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Dettagli Visita</p>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Host:</span> {visitData.hostName || '-'}</p>
                <p><span className="font-medium">Tipo:</span> {visitData.visitType}</p>
                <p><span className="font-medium">Motivo:</span> {visitData.purpose}</p>
                <p><span className="font-medium">Reparto:</span> {departments.find((d) => d.id === visitData.departmentId)?.name || '-'}</p>
                <p><span className="font-medium">Inizio:</span> {new Date(visitData.scheduledTimeStart).toLocaleString('it-IT')}</p>
                {visitData.scheduledTimeEnd && (
                  <p><span className="font-medium">Fine:</span> {new Date(visitData.scheduledTimeEnd).toLocaleString('it-IT')}</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">
          Home
        </Link>
        <ChevronRightIcon />
        <Link href="/visits" className="text-gray-500 hover:text-gray-700 transition-colors">
          Visite
        </Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">Nuova</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Registra Nuova Visita</h1>

      <div className="card p-6">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((label, index) => (
            <div key={label} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                    index < activeStep
                      ? 'bg-green-500 text-white'
                      : index === activeStep
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < activeStep ? <CheckIcon /> : index + 1}
                </div>
                <span
                  className={`ml-3 text-sm font-medium hidden sm:block ${
                    index <= activeStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    index < activeStep ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* Step Content */}
        {renderStepContent(activeStep)}

        {/* Actions */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleBack}
            disabled={activeStep === 0}
            className="btn btn-secondary disabled:opacity-50"
          >
            <ArrowLeftIcon />
            Indietro
          </button>

          {activeStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
            >
              Avanti
              <ArrowRightIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateVisit}
              disabled={loading}
              className="btn btn-primary bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Creazione...
                </>
              ) : (
                <>
                  <SaveIcon />
                  Crea Visita
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
