'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { visitsApi, printerApi } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { translateVisitStatus, translateVisitType } from '@/lib/translations';
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

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PrintIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const LoginIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const CancelIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const QRCodeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const MoreIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PersonIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const BusinessIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Status badge helper
const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'checked_in': return 'badge-green';
    case 'checked_out': return 'badge-blue';
    case 'pending': return 'badge-yellow';
    case 'approved': return 'badge-blue';
    case 'rejected':
    case 'cancelled': return 'badge-red';
    default: return 'badge';
  }
};

export default function VisitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const id = params.id as string;
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [badgeData, setBadgeData] = useState<any>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => void;
    severity: 'warning' | 'error';
  } | null>(null);

  useEffect(() => {
    if (id) loadVisit();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadVisit = async () => {
    setLoading(true);
    try {
      const res = await visitsApi.getOne(id);
      setVisit(res.data);
    } catch (err) {
      setError('Impossibile caricare i dati della visita.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'checkIn' | 'checkOut' | 'cancel') => {
    try {
      await visitsApi[action](id);
      toast.showSuccess('Azione eseguita con successo');
      loadVisit();
    } catch (err) {
      toast.showError("Errore durante l'esecuzione dell'azione");
      console.error(err);
    }
  };

  const handleOpenBadge = async () => {
    try {
      const res = await visitsApi.getBadge(id);
      setBadgeData(res.data);
      setBadgeModalOpen(true);
    } catch (err) {
      toast.showError('Errore nel caricamento del badge');
      console.error(err);
    }
  };

  const handlePrintBadge = async () => {
    try {
      await printerApi.printBadge(id, { copies: 1 });
      toast.showSuccess('Badge aggiunto alla coda di stampa');
      setBadgeModalOpen(false);
    } catch (err) {
      toast.showError('Errore nella stampa del badge');
      console.error(err);
    }
  };

  const handleReactivate = async () => {
    try {
      await visitsApi.reactivate(id);
      toast.showSuccess('Visita riattivata con successo');
      loadVisit();
      setMoreMenuOpen(false);
    } catch (err: any) {
      toast.showError(err.response?.data?.message || 'Errore durante la riattivazione');
      console.error(err);
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await visitsApi.duplicate(id);
      toast.showSuccess('Visita duplicata con successo');
      setMoreMenuOpen(false);
      router.push(`/visits/${res.data.id}`);
    } catch (err: any) {
      toast.showError(err.response?.data?.message || 'Errore durante la duplicazione');
      console.error(err);
    }
  };

  const handleSendNotification = async () => {
    try {
      await visitsApi.sendNotification(id);
      toast.showSuccess('Notifica inviata con successo');
      setMoreMenuOpen(false);
    } catch (err: any) {
      toast.showError(err.response?.data?.message || "Errore durante l'invio della notifica");
      console.error(err);
    }
  };

  const handleHardDelete = async () => {
    try {
      await visitsApi.hardDelete(id);
      toast.showSuccess('Visita eliminata definitivamente');
      router.push('/visits');
    } catch (err: any) {
      toast.showError(err.response?.data?.message || "Errore durante l'eliminazione");
      console.error(err);
    }
  };

  const openConfirm = (title: string, message: string, action: () => void, severity: 'warning' | 'error' = 'warning') => {
    setConfirmAction({ title, message, action, severity });
    setConfirmModalOpen(true);
    setMoreMenuOpen(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>
      </div>
    );
  }

  if (!visit) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">Nessuna visita trovata.</div>
      </div>
    );
  }

  const canCheckIn = visit.status === 'pending';
  const canCheckOut = visit.status === 'checked_in';
  const canCancel = visit.status === 'pending';
  const canReactivate = visit.status === 'cancelled' || visit.status === 'checked_out';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">Home</Link>
        <ChevronRightIcon />
        <Link href="/visits" className="text-gray-500 hover:text-gray-700 transition-colors">Visite</Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">{visit.purpose || visit.id}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button onClick={() => router.push('/visits')} className="btn btn-secondary">
          <ArrowLeftIcon />
          Tutte le Visite
        </button>
        <div className="flex flex-wrap gap-2">
          {canCheckIn && (
            <button onClick={() => handleAction('checkIn')} className="btn btn-primary">
              <LoginIcon />
              Check-In
            </button>
          )}
          {canCheckOut && (
            <button onClick={() => handleAction('checkOut')} className="btn btn-primary bg-red-600 hover:bg-red-700">
              <LogoutIcon />
              Check-Out
            </button>
          )}
          {canCancel && (
            <button onClick={() => handleAction('cancel')} className="btn btn-primary">
              <CancelIcon />
              Annulla
            </button>
          )}
          {visit.badgeIssued && (
            <>
              <button onClick={handleOpenBadge} className="btn btn-primary">
                <QRCodeIcon />
                Visualizza Badge
              </button>
              <button onClick={handlePrintBadge} className="btn btn-secondary">
                <PrintIcon />
                Stampa
              </button>
            </>
          )}
          <button onClick={() => router.push(`/visits/${visit.id}/edit`)} className="btn btn-primary">
            <EditIcon />
            Modifica
          </button>
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className="p-2 border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <MoreIcon />
            </button>
            <AnimatePresence>
              {moreMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-56 card p-2 z-20"
                >
                  {canReactivate && (
                    <button
                      onClick={() => openConfirm('Riattiva Visita', 'Sei sicuro di voler riattivare questa visita?', handleReactivate)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RefreshIcon />
                      Riattiva Visita
                    </button>
                  )}
                  <button
                    onClick={handleDuplicate}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <CopyIcon />
                    Duplica Visita
                  </button>
                  <button
                    onClick={handleSendNotification}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <EmailIcon />
                    Invia Notifica Email
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => openConfirm('Elimina Definitivamente', 'ATTENZIONE: Questa azione eliminerà definitivamente la visita.', handleHardDelete, 'error')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <TrashIcon />
                    Elimina Definitivamente
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Visitor Card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <PersonIcon />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Visitatore</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-500">Nome:</span> <span className="font-medium">{visit.visitor?.firstName} {visit.visitor?.lastName}</span></p>
            <p><span className="text-gray-500">Azienda:</span> <span className="font-medium">{visit.visitor?.company || '-'}</span></p>
            <p><span className="text-gray-500">Email:</span> <span className="font-medium">{visit.visitor?.email || '-'}</span></p>
          </div>
          <button
            onClick={() => router.push(`/visitors/${visit.visitorId}`)}
            className="btn btn-primary mt-4 text-sm"
          >
            Vedi Profilo
          </button>
        </div>

        {/* Host Card */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white">
              <BusinessIcon />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Ospite</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-500">Nome:</span>{' '}
              <span className="font-medium">
                {visit.hostUser
                  ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}`
                  : visit.hostName || '-'}
              </span>
            </p>
          </div>
        </div>

        {/* Visit Details Card */}
        <div className="md:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dettagli Visita</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Stato</p>
              <span className={`badge ${getStatusBadgeClass(visit.status)} mt-1`}>
                {translateVisitStatus(visit.status)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Scopo</p>
              <p className="font-medium text-gray-900">{visit.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Tipo Visita</p>
              <p className="font-medium text-gray-900">{translateVisitType(visit.visitType)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dipartimento</p>
              <p className="font-medium text-gray-900">{visit.department?.name || '-'}</p>
            </div>
            {visit.department?.area && (
              <div>
                <p className="text-sm text-gray-500">Area</p>
                <p className="font-medium text-gray-900">{visit.department.area}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Data Programmata</p>
              <p className="font-medium text-gray-900">{new Date(visit.scheduledDate).toLocaleString('it-IT')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-In</p>
              <p className="font-medium text-gray-900">{visit.actualCheckIn ? new Date(visit.actualCheckIn).toLocaleString('it-IT') : '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Check-Out</p>
              <p className="font-medium text-gray-900">{visit.actualCheckOut ? new Date(visit.actualCheckOut).toLocaleString('it-IT') : '-'}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Badge</p>
              <p className="font-medium text-gray-900">{visit.badgeIssued ? `Sì, #${visit.badgeNumber}` : 'No'}</p>
            </div>
            {visit.checkInPin && !visit.badgeIssued && (
              <div>
                <p className="text-sm text-gray-500">PIN Check-In</p>
                <span className="inline-block mt-1 px-3 py-1 bg-blue-600 text-white rounded-lg font-mono font-bold text-lg tracking-widest">
                  {visit.checkInPin}
                </span>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">Notifica Inviata</p>
              <p className="font-medium text-gray-900">{visit.notificationSent ? 'Sì' : 'No'}</p>
            </div>
          </div>

          {visit.notes && (
            <>
              <div className="border-t border-gray-100 my-4"></div>
              <div>
                <p className="text-sm text-gray-500">Note</p>
                <p className="font-medium text-gray-900">{visit.notes}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Badge Modal */}
      <AnimatePresence>
        {badgeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setBadgeModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Badge Visitatore</h3>
                <button
                  onClick={() => setBadgeModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XIcon />
                </button>
              </div>
              <div className="p-6">
                {badgeData && (
                  <div className="text-center py-4 border-4 border-blue-600 rounded-2xl bg-gray-50">
                    <h2 className="text-2xl font-bold text-blue-600 mb-4">VISITATORE</h2>
                    <p className="text-xl font-bold text-gray-900">{badgeData.visitor?.name}</p>
                    <p className="text-gray-500 mb-4">{badgeData.visitor?.company || 'N/A'}</p>
                    {badgeData.qrCode && (
                      <img
                        src={badgeData.qrCode}
                        alt="Badge QR Code"
                        className="w-48 h-48 mx-auto border-2 border-gray-200 rounded-xl bg-white p-2"
                      />
                    )}
                    <div className="mt-4 space-y-1 text-sm">
                      <p><span className="font-medium">Badge:</span> {badgeData.badgeNumber}</p>
                      <p><span className="font-medium">Host:</span> {badgeData.host}</p>
                      <p><span className="font-medium">Valido fino:</span> {badgeData.validUntil && new Date(badgeData.validUntil).toLocaleString('it-IT')}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                <button onClick={() => setBadgeModalOpen(false)} className="btn btn-secondary">
                  Chiudi
                </button>
                <button onClick={handlePrintBadge} className="btn btn-primary">
                  <PrintIcon />
                  Stampa
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModalOpen && confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setConfirmModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirmAction.title}</h3>
                <div className={`p-4 rounded-xl mb-4 ${confirmAction.severity === 'error' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                  {confirmAction.message}
                </div>
              </div>
              <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                <button onClick={() => setConfirmModalOpen(false)} className="btn btn-secondary">
                  Annulla
                </button>
                <button
                  onClick={() => {
                    confirmAction.action();
                    setConfirmModalOpen(false);
                  }}
                  className={`btn btn-primary ${confirmAction.severity === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'}`}
                >
                  Conferma
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
