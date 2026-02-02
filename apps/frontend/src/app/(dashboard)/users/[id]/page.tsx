'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { usersApi, auditLogsApi, AuditLog } from '@/lib/api';
import { User } from '@/types/visitor';

// SVG Icons
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

const UserIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Action Icons
const LoginIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const CreateIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UpdateIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CheckInIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckOutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const BadgeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
  </svg>
);

const getActionIcon = (action: string) => {
  switch (action) {
    case 'login': return <LoginIcon />;
    case 'logout': return <LogoutIcon />;
    case 'create': return <CreateIcon />;
    case 'update': return <UpdateIcon />;
    case 'delete': return <DeleteIcon />;
    case 'check_in': return <CheckInIcon />;
    case 'check_out': return <CheckOutIcon />;
    case 'badge_issued': return <BadgeIcon />;
    default: return <UpdateIcon />;
  }
};

const getActionColor = (action: string): string => {
  switch (action) {
    case 'login': return 'bg-green-500';
    case 'logout': return 'bg-blue-500';
    case 'create': return 'bg-indigo-500';
    case 'update': return 'bg-yellow-500';
    case 'delete': return 'bg-red-500';
    case 'check_in': return 'bg-green-500';
    case 'check_out': return 'bg-blue-500';
    case 'badge_issued': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

const translateAction = (action: string): string => {
  const translations: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    create: 'Creazione',
    update: 'Modifica',
    delete: 'Eliminazione',
    check_in: 'Check-in',
    check_out: 'Check-out',
    badge_issued: 'Badge emesso',
  };
  return translations[action] || action;
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadUser();
      loadAuditLogs();
    }
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getOne(id);
      setUser(res.data);
    } catch (err) {
      setError("Impossibile caricare i dati dell'utente.");
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await auditLogsApi.getByUser(id, 20);
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
        Nessun utente trovato.
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
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
          Home
        </Link>
        <ChevronRightIcon />
        <Link href="/users" className="hover:text-gray-900 transition-colors">
          Utenti
        </Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">{user.firstName} {user.lastName}</span>
      </nav>

      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => router.push('/users')}
          className="btn btn-secondary"
        >
          <ArrowLeftIcon />
          Tutti gli Utenti
        </button>
        <button
          onClick={() => router.push(`/users/${user.id}/edit`)}
          className="btn btn-primary"
        >
          <EditIcon />
          Modifica Utente
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="card p-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4">
            <UserIcon />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
          <p className="text-gray-500">{user.email}</p>
          <span className="badge badge-blue mt-4">{user.role}</span>
        </div>

        {/* User Details Card */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Dettagli Utente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="text-gray-900">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefono</p>
              <p className="text-gray-900">{user.phone || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Dipartimento</p>
              <p className="text-gray-900">{user.department || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stato</p>
              <span className={`badge ${user.isActive ? 'badge-green' : 'badge'}`}>
                {user.isActive ? 'Attivo' : 'Inattivo'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Membro dal</p>
              <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString('it-IT')}</p>
            </div>
          </div>
        </div>

        {/* Activity Log Card */}
        <div className="lg:col-span-3 card p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Log Attivita</h3>
          {logsLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700">
              Nessuna attivita registrata
            </div>
          ) : (
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              <div className="space-y-6">
                {auditLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-4 pl-10"
                  >
                    {/* Timeline Dot */}
                    <div className={`absolute left-0 w-8 h-8 rounded-full ${getActionColor(log.action)} text-white flex items-center justify-center`}>
                      {getActionIcon(log.action)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 rounded-xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">{translateAction(log.action)}</p>
                          <p className="text-sm text-gray-500">
                            {log.entityType}: {log.entityName || log.entityId || '-'}
                          </p>
                          {log.details && (
                            <p className="text-xs text-gray-400 mt-1">{log.details}</p>
                          )}
                          {log.ipAddress && (
                            <p className="text-xs text-gray-400">IP: {log.ipAddress}</p>
                          )}
                        </div>
                        <div className="text-sm text-gray-400 whitespace-nowrap">
                          <p>
                            {new Date(log.createdAt).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p>
                            {new Date(log.createdAt).toLocaleTimeString('it-IT', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
