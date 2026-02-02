'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { visitsApi, printerApi } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { useToast } from '@/components/Toast';

// Icons
const ChevronRightIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const QRCodeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PrintIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function CurrentVisitsPage() {
  const router = useRouter();
  const toast = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const loadVisits = async () => {
    try {
      const res = await visitsApi.getCurrent();
      setVisits(res.data);
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
    const interval = setInterval(loadVisits, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckOut = async (id: string) => {
    try {
      await visitsApi.checkOut(id);
      toast.showSuccess('Check-out effettuato');
      loadVisits();
    } catch (error) {
      console.error('Error checking out:', error);
      toast.showError('Errore durante il check-out');
    }
  };

  const handlePrintBadge = async (id: string) => {
    try {
      const res = await visitsApi.getBadge(id);
      setSelectedBadge(res.data);
      setBadgeModalOpen(true);
    } catch (error) {
      console.error('Error getting badge:', error);
      toast.showError('Errore nel caricamento del badge');
    }
  };

  const handlePrint = async () => {
    if (!selectedBadge?.visitId) {
      toast.showError('Informazioni visita non disponibili');
      return;
    }

    try {
      await printerApi.printBadge(selectedBadge.visitId, { copies: 1 });
      toast.showSuccess('Badge aggiunto alla coda di stampa');
      setBadgeModalOpen(false);
    } catch (error) {
      console.error('Error printing badge:', error);
      toast.showError('Errore nella stampa del badge');
    }
  };

  return (
    <div className="p-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-4">
        <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">Home</Link>
        <ChevronRightIcon />
        <Link href="/visits" className="text-gray-500 hover:text-gray-700 transition-colors">Visite</Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">In Corso</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Visite in Corso</h1>
        <div className="flex items-center gap-3">
          <span className="badge badge-blue">{visits.length} presenti</span>
          <button
            onClick={loadVisits}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            title="Aggiorna"
          >
            <RefreshIcon />
          </button>
          <button
            onClick={() => router.push('/visits/new')}
            className="btn btn-primary"
          >
            <PlusIcon />
            Nuova Visita
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="card p-8 text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4"></div>
          Caricamento...
        </div>
      ) : visits.length === 0 ? (
        <div className="card p-8 text-center text-gray-500">
          Nessun visitatore presente al momento
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Visitatore</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Azienda</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Host</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reparto/Area</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Motivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Check-in</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Badge</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <motion.tr
                    key={visit.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          {visit.visitor?.firstName?.[0]}{visit.visitor?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {visit.visitor?.firstName} {visit.visitor?.lastName}
                          </p>
                          {visit.visitor?.email && (
                            <p className="text-sm text-gray-500">{visit.visitor.email}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {visit.visitor?.company || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {visit.hostUser
                        ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}`
                        : visit.hostName || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{visit.department?.name || '-'}</p>
                      {visit.department?.area && (
                        <p className="text-xs text-gray-500">{visit.department.area}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge">{visit.purpose}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {visit.checkInTime &&
                        new Date(visit.checkInTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      {visit.badgeNumber && (
                        <span className="badge badge-green">{visit.badgeNumber}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePrintBadge(visit.id)}
                          className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                          title="Badge"
                        >
                          <QRCodeIcon />
                        </button>
                        <button
                          onClick={() => handleCheckOut(visit.id)}
                          className="p-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                          title="Check-out"
                        >
                          <LogoutIcon />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                {selectedBadge && (
                  <div className="space-y-4">
                    {selectedBadge.qrCode && (
                      <img
                        src={selectedBadge.qrCode}
                        alt="Badge QR Code"
                        className="w-64 h-auto mx-auto border-2 border-gray-200 rounded-xl"
                      />
                    )}
                    <div className="text-center">
                      <p className="text-xl font-bold text-gray-900">{selectedBadge.visitor?.name}</p>
                      <p className="text-gray-500">{selectedBadge.visitor?.company || 'N/A'}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Numero Badge:</span>
                        <span className="font-medium text-gray-900">{selectedBadge.badgeNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Host:</span>
                        <span className="font-medium text-gray-900">{selectedBadge.host}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Valido fino a:</span>
                        <span className="font-medium text-gray-900">
                          {selectedBadge.validUntil && new Date(selectedBadge.validUntil).toLocaleString('it-IT')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                <button onClick={() => setBadgeModalOpen(false)} className="btn btn-secondary">
                  Chiudi
                </button>
                <button onClick={handlePrint} className="btn btn-primary">
                  <PrintIcon />
                  Stampa Badge
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
