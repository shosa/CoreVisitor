'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Widget from '@/components/Widget';
import { visitsApi, departmentsApi } from '@/lib/api';
import { Visit, VisitStats, Department } from '@/types/visitor';

const formatDistanceToNow = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' anni fa';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' mesi fa';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' giorni fa';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' ore fa';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' minuti fa';
  return Math.floor(seconds) + ' secondi fa';
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Widget>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {icon}
        </div>
      </div>
    </Widget>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [currentVisits, setCurrentVisits] = useState<Visit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapFullscreen, setMapFullscreen] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, visitsRes, deptsRes] = await Promise.all([
        visitsApi.getStats(),
        visitsApi.getCurrent(),
        departmentsApi.getAll(),
      ]);
      setStats(statsRes.data);
      setCurrentVisits(visitsRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckOut = async (visitId: string) => {
    try {
      await visitsApi.checkOut(visitId);
      loadData();
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const visitsByDepartment = currentVisits.reduce((acc, visit) => {
    const dept = visit.department || 'Non specificato';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(visit);
    return acc;
  }, {} as Record<string, Visit[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-2">
        <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Dashboard</span>
      </nav>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={loadData}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Aggiorna dati"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Visitatori Presenti"
          value={stats?.currentVisitors || 0}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          color="#1976d2"
        />
        <StatCard
          title="Visite Oggi"
          value={stats?.todayVisits || 0}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="#2e7d32"
        />
        <StatCard
          title="Programmate Oggi"
          value={stats?.scheduledToday || 0}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="#ed6c02"
          subtitle="Da effettuare"
        />
        <StatCard
          title="Visite Mese"
          value={stats?.totalThisMonth || 0}
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          color="#9c27b0"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mappa Reparti */}
        <div className="lg:col-span-2">
          <Widget
            title={
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Mappa Reparti - Visitatori in Tempo Reale
              </span>
            }
            action={
              <button
                onClick={() => setMapFullscreen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Espandi a schermo intero"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const visitsInDept = visitsByDepartment[dept.name] || [];
                const hasVisitors = visitsInDept.length > 0;

                return (
                  <div
                    key={dept.id}
                    onClick={() => router.push('/visits/current')}
                    className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                      hasVisitors ? 'shadow-lg ring-2 ring-white' : 'shadow'
                    }`}
                    style={{ backgroundColor: dept.color || '#9ca3af', color: 'white' }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{dept.name}</h3>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>

                    {dept.floor !== null && (
                      <p className="text-sm opacity-80 mb-2">
                        Piano {dept.floor} • {dept.area}
                      </p>
                    )}

                    <div className="p-3 bg-white/20 rounded-lg mb-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-3xl font-bold">{visitsInDept.length}</span>
                      </div>
                      <p className="text-sm mt-1">
                        {visitsInDept.length === 0
                          ? 'Nessun visitatore'
                          : visitsInDept.length === 1
                          ? '1 visitatore presente'
                          : `${visitsInDept.length} visitatori presenti`}
                      </p>
                    </div>

                    {visitsInDept.length > 0 && (
                      <div className="pt-2 border-t border-white/30">
                        {visitsInDept.slice(0, 3).map((visit) => (
                          <p key={visit.id} className="text-xs opacity-90 mb-0.5">
                            • {visit.visitor?.firstName} {visit.visitor?.lastName}
                            {visit.visitor?.company && ` (${visit.visitor.company})`}
                          </p>
                        ))}
                        {visitsInDept.length > 3 && (
                          <p className="text-xs font-bold mt-1">+ altri {visitsInDept.length - 3}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Widget>
        </div>

        {/* Lista Visitatori Presenti */}
        <div>
          <Widget
            title="Visitatori Presenti"
            action={<span className="badge badge-blue">{currentVisits.length}</span>}
          >
            {currentVisits.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nessun visitatore presente</p>
            ) : (
              <>
                <div className="space-y-3 max-h-[400px] overflow-y-auto mb-4">
                  {currentVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {visit.visitor?.firstName?.[0]}
                        {visit.visitor?.lastName?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {visit.visitor?.firstName} {visit.visitor?.lastName}
                        </p>
                        {visit.visitor?.company && (
                          <p className="text-xs text-gray-500 truncate">{visit.visitor.company}</p>
                        )}
                        <p className="text-xs text-gray-500">Host: {visit.host?.name}</p>
                        <p className="text-xs text-green-600">
                          Entrato {visit.checkInTime && formatDistanceToNow(new Date(visit.checkInTime))}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCheckOut(visit.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Check-out"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/visits/new')}
                    className="btn btn-primary w-full"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Nuova Visita
                  </button>
                  <button
                    onClick={() => router.push('/visits/current')}
                    className="btn btn-secondary w-full"
                  >
                    Vedi Tutte
                  </button>
                </div>
              </>
            )}
          </Widget>
        </div>
      </div>

      {/* Fullscreen Map Modal */}
      <AnimatePresence>
        {mapFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setMapFullscreen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Mappa Reparti</h2>
                    <p className="text-sm text-gray-500">Panoramica visitatori in tempo reale</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {currentVisits.length} visitatori presenti
                  </span>
                  <button
                    onClick={() => setMapFullscreen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {departments.map((dept) => {
                    const visitsInDept = visitsByDepartment[dept.name] || [];
                    const hasVisitors = visitsInDept.length > 0;

                    return (
                      <motion.div
                        key={dept.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-2xl overflow-hidden ${
                          hasVisitors ? 'ring-2 ring-offset-2' : ''
                        }`}
                        style={{
                          backgroundColor: dept.color || '#9ca3af',
                          ringColor: dept.color || '#9ca3af'
                        }}
                      >
                        {/* Department Header */}
                        <div className="p-4 text-white">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-xl">{dept.name}</h3>
                              {dept.floor !== null && (
                                <p className="text-sm opacity-80">
                                  Piano {dept.floor} {dept.area && `• ${dept.area}`}
                                </p>
                              )}
                            </div>
                            <div className="p-2 bg-white/20 rounded-lg">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                          </div>

                          {/* Visitor Count */}
                          <div className="flex items-center gap-3 p-3 bg-white/20 rounded-xl">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <div>
                              <p className="text-4xl font-bold">{visitsInDept.length}</p>
                              <p className="text-sm opacity-80">
                                {visitsInDept.length === 0
                                  ? 'Nessun visitatore'
                                  : visitsInDept.length === 1
                                  ? 'visitatore presente'
                                  : 'visitatori presenti'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Visitor List */}
                        {visitsInDept.length > 0 && (
                          <div className="bg-white p-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Visitatori</p>
                            <div className="space-y-3">
                              {visitsInDept.map((visit) => (
                                <div
                                  key={visit.id}
                                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
                                    style={{ backgroundColor: dept.color || '#9ca3af' }}
                                  >
                                    {visit.visitor?.firstName?.[0]}
                                    {visit.visitor?.lastName?.[0]}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm truncate">
                                      {visit.visitor?.firstName} {visit.visitor?.lastName}
                                    </p>
                                    {visit.visitor?.company && (
                                      <p className="text-xs text-gray-500 truncate">{visit.visitor.company}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-xs text-gray-400">
                                        Host: {visit.host?.name || '-'}
                                      </span>
                                      <span className="text-xs text-green-600">
                                        {visit.checkInTime && formatDistanceToNow(new Date(visit.checkInTime))}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleCheckOut(visit.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                    title="Check-out"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Empty State */}
                        {visitsInDept.length === 0 && (
                          <div className="bg-white/10 p-4 text-white text-center">
                            <p className="text-sm opacity-80">Nessun visitatore in questo reparto</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Summary Footer */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 justify-center">
                    {departments.map((dept) => {
                      const count = (visitsByDepartment[dept.name] || []).length;
                      return (
                        <div
                          key={dept.id}
                          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: dept.color || '#9ca3af' }}
                          />
                          <span className="text-sm text-gray-700">{dept.name}</span>
                          <span className="text-sm font-bold text-gray-900">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
