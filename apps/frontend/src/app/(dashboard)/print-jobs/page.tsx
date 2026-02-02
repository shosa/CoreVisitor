'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { printerApi, PrintJob } from '@/lib/api';
import { useToast } from '@/components/Toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// SVG Icons
const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const DeleteSweepIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ReplayIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CancelIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const statusTabs = [
  { label: 'Tutti', value: 'all' },
  { label: 'In attesa', value: 'pending' },
  { label: 'In stampa', value: 'printing' },
  { label: 'Completati', value: 'completed' },
  { label: 'Falliti', value: 'failed' },
  { label: 'Annullati', value: 'cancelled' },
];

export default function PrintJobsPage() {
  const toast = useToast();
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadJobs = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await printerApi.getJobs(params);
      setJobs(res.data);
      setLoading(false);
    } catch (err: any) {
      toast.showError(err.response?.data?.message || 'Errore nel caricamento');
      setLoading(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    try {
      await printerApi.retryJob(jobId);
      toast.showSuccess('Lavoro rimesso in coda');
      await loadJobs();
    } catch (err: any) {
      toast.showError(err.response?.data?.message || 'Errore nel retry');
    }
  };

  const handleCancel = async (jobId: string) => {
    if (!confirm('Sei sicuro di voler annullare questo lavoro?')) return;

    try {
      await printerApi.cancelJob(jobId);
      toast.showSuccess('Lavoro annullato');
      await loadJobs();
    } catch (err: any) {
      toast.showError(err.response?.data?.message || 'Errore nell\'annullamento');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Eliminare tutti i lavori completati più vecchi di 7 giorni?')) return;

    try {
      await printerApi.cleanup();
      toast.showSuccess('Cleanup completato');
      await loadJobs();
    } catch (err: any) {
      toast.showError(err.response?.data?.message || 'Errore nel cleanup');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-yellow';
      case 'printing':
        return 'badge-blue';
      case 'completed':
        return 'badge-green';
      case 'failed':
        return 'badge-red';
      case 'cancelled':
        return '';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In attesa';
      case 'printing':
        return 'In stampa';
      case 'completed':
        return 'Completato';
      case 'failed':
        return 'Fallito';
      case 'cancelled':
        return 'Annullato';
      default:
        return status;
    }
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm mb-4">
        <Link href="/" className="text-gray-500 hover:text-gray-700 transition-colors">
          Home
        </Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">Lavori di Stampa</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lavori di Stampa</h1>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handleCleanup}>
            <DeleteSweepIcon />
            Cleanup
          </button>
          <button className="btn btn-secondary" onClick={loadJobs}>
            <RefreshIcon />
            Aggiorna
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="card mb-6 p-1 inline-flex flex-wrap gap-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stato</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Visita</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Stampante</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Copie</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Data Creazione</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Data Stampa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Errore</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Nessun lavoro trovato
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <motion.tr
                    key={job.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="badge">{job.type.toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${getStatusBadge(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {job.visitId ? (
                        <Link
                          href={`/visits/${job.visitId}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Vedi Visita
                        </Link>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {job.printerName || 'Predefinita'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{job.copies}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {format(new Date(job.createdAt), 'dd/MM/yyyy HH:mm', { locale: it })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {job.printedAt
                        ? format(new Date(job.printedAt), 'dd/MM/yyyy HH:mm', { locale: it })
                        : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      {job.error ? (
                        <span
                          className="text-sm text-red-600 max-w-[200px] block overflow-hidden text-ellipsis whitespace-nowrap"
                          title={job.error}
                        >
                          {job.error}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {job.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(job.id)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Riprova"
                          >
                            <ReplayIcon />
                          </button>
                        )}
                        {(job.status === 'pending' || job.status === 'failed') && (
                          <button
                            onClick={() => handleCancel(job.id)}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            title="Annulla"
                          >
                            <CancelIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
