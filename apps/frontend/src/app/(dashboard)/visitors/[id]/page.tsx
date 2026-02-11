'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { visitorsApi } from '@/lib/api';
import { Visitor } from '@/types/visitor';
import { translateDocumentType, translateVisitStatus } from '@/lib/translations';

// Icons
const PersonIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const ZoomInIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

export default function VisitorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const id = params.id as string;

  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentMimeType, setDocumentMimeType] = useState<string | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(false);

  useEffect(() => {
    if (id) {
      loadVisitor();
    }
  }, [id]);

  const loadVisitor = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await visitorsApi.getOne(id);
      setVisitor(res.data);
    } catch (err) {
      setError('Impossibile caricare i dati del visitatore.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async () => {
    if (!visitor?.documents || visitor.documents.length === 0) {
      toast.showWarning('Nessun documento disponibile');
      return;
    }

    setLoadingDocument(true);
    try {
      const docRes = await visitorsApi.getDocumentUrl(id);
      setDocumentUrl(docRes.data.url);
      // Salva il mimeType dal documento più recente
      setDocumentMimeType(visitor.documents[0].mimeType);
      setIsDocumentModalOpen(true);
    } catch (err) {
      console.error('Errore nel caricamento del documento:', err);
      toast.showError('Errore nel caricamento del documento');
    } finally {
      setLoadingDocument(false);
    }
  };

  const handleDelete = async () => {
    if (!visitor) return;

    const hasDocuments = visitor.documents && visitor.documents.length > 0;
    const hasVisits = visitor.visits && visitor.visits.length > 0;

    let message = 'Sei sicuro di voler eliminare questo visitatore?\n\n';
    if (hasDocuments) {
      message += 'Verranno eliminati permanentemente:\n';
      message += `- ${visitor.documents.length} documento/i allegato/i\n`;
    }
    if (hasVisits) {
      message += `- ${visitor.visits.length} visita/e associata/e\n`;
    }
    message += '\nQuesta azione è irreversibile.';

    if (!confirm(message)) return;

    try {
      await visitorsApi.delete(visitor.id);
      toast.showSuccess('Visitatore eliminato con successo');
      router.push('/visitors');
    } catch (error) {
      console.error('Error deleting visitor:', error);
      toast.showError("Errore durante l'eliminazione");
    }
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl">
          Nessun visitatore trovato.
        </div>
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
        <Link href="/visitors" className="text-gray-500 hover:text-gray-700 transition-colors">
          Visitatori
        </Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">{visitor.firstName} {visitor.lastName}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          onClick={() => router.push('/visitors')}
          className="btn btn-secondary"
        >
          <ArrowLeftIcon />
          Tutti i Visitatori
        </button>
        <div className="flex flex-wrap gap-2">
          {visitor.documents && visitor.documents.length > 0 && (
            <button
              onClick={handleViewDocument}
              disabled={loadingDocument}
              className="btn btn-primary"
            >
              {loadingDocument ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <DocumentIcon />
              )}
              Vedi Documento
            </button>
          )}
          <button
            onClick={handleDelete}
            className="btn btn-primary"
          >
            <TrashIcon />
            Elimina
          </button>
          <button
            onClick={() => router.push(`/visitors/${visitor.id}/edit`)}
            className="btn btn-primary"
          >
            <EditIcon />
            Modifica
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6 flex flex-col items-center">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center">
              <PersonIcon className="w-20 h-20 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {visitor.firstName} {visitor.lastName}
          </h2>
          <p className="text-gray-500">{visitor.company || 'N/A'}</p>
          {visitor.privacyConsent && (
            <span className="badge badge-green mt-2">Consenso Privacy Fornito</span>
          )}
        </div>

        {/* Details Card */}
        <div className="md:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Dettagli Visitatore</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{visitor.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefono</p>
              <p className="font-medium text-gray-900">{visitor.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Azienda</p>
              <p className="font-medium text-gray-900">{visitor.company || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Targa</p>
              <p className="font-medium text-gray-900">{visitor.licensePlate || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Documento</p>
              <p className="font-medium text-gray-900">
                {visitor.documentType
                  ? `${translateDocumentType(visitor.documentType)}: ${visitor.documentNumber}`
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Registrato il</p>
              <p className="font-medium text-gray-900">
                {new Date(visitor.createdAt).toLocaleString('it-IT')}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-gray-500">Note</p>
              <p className="font-medium text-gray-900">{visitor.notes || '-'}</p>
            </div>
          </div>
        </div>

        {/* Visits History */}
        <div className="md:col-span-3 card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cronologia Visite</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ospite
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scopo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stato
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visitor.visits && visitor.visits.length > 0 ? (
                  visitor.visits.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {new Date(visit.scheduledDate).toLocaleString('it-IT')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {visit.host?.name || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {visit.purpose}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="badge">{translateVisitStatus(visit.status)}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <button
                          onClick={() => router.push(`/visits/${visit.id}`)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Vedi
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Nessuna visita registrata.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Document Modal */}
      <AnimatePresence>
        {isDocumentModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setIsDocumentModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Documento di {visitor.firstName} {visitor.lastName}
                </h3>
                <button
                  onClick={() => setIsDocumentModalOpen(false)}
                  className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <XIcon />
                </button>
              </div>
              <div className="p-4 flex justify-center items-center min-h-[500px]">
                {documentUrl && (
                  <>
                    {documentMimeType === 'application/pdf' ? (
                      <iframe
                        src={documentUrl}
                        className="w-full h-[80vh] border-0 rounded-lg"
                        title="Documento visitatore"
                      />
                    ) : (
                      <img
                        src={documentUrl}
                        alt="Documento"
                        className="max-w-full max-h-[80vh] object-contain rounded-lg"
                      />
                    )}
                  </>
                )}
              </div>
              <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
                <button
                  onClick={() => window.open(documentUrl || '', '_blank')}
                  disabled={!documentUrl}
                  className="btn btn-secondary"
                >
                  <ExternalLinkIcon />
                  Apri in nuova finestra
                </button>
                <button
                  onClick={() => setIsDocumentModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Chiudi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
