'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { hostsApi, Host } from '@/lib/api';
import { useToast } from '@/components/Toast';

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

export default function HostsPage() {
  const router = useRouter();
  const toast = useToast();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadHosts();
  }, []);

  const loadHosts = async () => {
    try {
      const res = await hostsApi.getAll();
      setHosts(res.data);
    } catch {
      toast.showError('Errore nel caricamento dei referenti');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await hostsApi.delete(id);
      setHosts((prev) => prev.filter((h) => h.id !== id));
      toast.showSuccess('Referente eliminato');
    } catch {
      toast.showError('Errore durante l\'eliminazione');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = hosts.filter((h) =>
    `${h.firstName} ${h.lastName} ${h.department?.name || ''} ${h.email || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
        <span className="text-gray-900 font-medium">Referenti</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referenti Interni</h1>
          <p className="text-sm text-gray-500 mt-1">{hosts.length} referenti totali</p>
        </div>
        <button onClick={() => router.push('/hosts/new')} className="btn btn-primary">
          <PlusIcon />
          Aggiungi Referente
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          className="input max-w-sm"
          placeholder="Cerca per nome, reparto, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {search ? 'Nessun risultato per la ricerca' : 'Nessun referente presente'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Reparto</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Telefono</th>
                <th className="text-left px-6 py-3 font-medium text-gray-600">Stato</th>
                <th className="text-right px-6 py-3 font-medium text-gray-600">Azioni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((host) => (
                <tr key={host.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {host.firstName} {host.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{host.department?.name || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{host.email || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{host.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      host.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {host.isActive ? 'Attivo' : 'Inattivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => router.push(`/hosts/${host.id}/edit`)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifica"
                      >
                        <EditIcon />
                      </button>
                      {deleteConfirm === host.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600">Confermi?</span>
                          <button
                            onClick={() => handleDelete(host.id)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >Sì</button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                          >No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(host.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Elimina"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
