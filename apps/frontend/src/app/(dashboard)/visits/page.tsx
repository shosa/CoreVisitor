'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { visitsApi, departmentsApi, exportApi } from '@/lib/api';
import { Visit, VisitStatus, Department } from '@/types/visitor';
import { format, startOfDay, endOfDay } from 'date-fns';
import { translateVisitStatus, translateVisitType } from '@/lib/translations';
import { it } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

// SVG Icons
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const VisibilityIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const AddCircleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const FileDownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const FilterListIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// Get badge color class based on visit status
const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'checked_in':
      return 'badge-green';
    case 'checked_out':
      return 'badge-blue';
    case 'pending':
      return 'badge-yellow';
    case 'approved':
      return 'badge-blue';
    case 'cancelled':
      return 'badge-red';
    case 'expired':
      return 'badge';
    default:
      return 'badge';
  }
};

export default function VisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterVisits();
  }, [visits, statusFilter, searchQuery, departmentFilter, dateFrom, dateTo]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      const [visitsRes, deptsRes] = await Promise.all([
        visitsApi.getAll(),
        departmentsApi.getAll(),
      ]);
      setVisits(visitsRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVisits = () => {
    let filtered = visits;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((v) => v.status === statusFilter);
    }

    // Filter by department
    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter((v) => v.department === departmentFilter);
    }

    // Filter by date range
    if (dateFrom) {
      const from = startOfDay(new Date(dateFrom));
      filtered = filtered.filter((v) => new Date(v.scheduledDate) >= from);
    }
    if (dateTo) {
      const to = endOfDay(new Date(dateTo));
      filtered = filtered.filter((v) => new Date(v.scheduledDate) <= to);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.visitor?.firstName?.toLowerCase().includes(query) ||
          v.visitor?.lastName?.toLowerCase().includes(query) ||
          v.visitor?.company?.toLowerCase().includes(query) ||
          v.hostName?.toLowerCase().includes(query) ||
          (v.hostUser && `${v.hostUser.firstName} ${v.hostUser.lastName}`.toLowerCase().includes(query)) ||
          v.badgeNumber?.toLowerCase().includes(query) ||
          v.department?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredVisits(filtered);
  };

  const handleExportCSV = () => {
    const headers = [
      'Data/Ora',
      'Visitatore',
      'Azienda',
      'Host',
      'Reparto',
      'Area',
      'Motivo',
      'Badge',
      'Stato',
      'Check-in',
      'Check-out',
    ];

    const rows = filteredVisits.map((v) => [
      format(new Date(v.scheduledDate), 'dd/MM/yyyy HH:mm'),
      `${v.visitor?.firstName} ${v.visitor?.lastName}`,
      v.visitor?.company || '',
      v.hostUser ? `${v.hostUser.firstName} ${v.hostUser.lastName}` : v.hostName || '',
      v.department?.name || '',
      v.department?.area || '',
      v.purpose,
      v.badgeNumber || '',
      v.status,
      v.actualCheckIn ? format(new Date(v.actualCheckIn), 'dd/MM/yyyy HH:mm') : '',
      v.actualCheckOut ? format(new Date(v.actualCheckOut), 'dd/MM/yyyy HH:mm') : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visite_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
    setExportMenuOpen(false);
  };

  const handleExportPDF = async () => {
    try {
      const params: { dateFrom?: string; dateTo?: string; status?: string } = {};
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await exportApi.visits(params);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `registro-visite-${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
    setExportMenuOpen(false);
  };

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
  };


  const activeFiltersCount =
    (statusFilter !== 'ALL' ? 1 : 0) +
    (departmentFilter !== 'ALL' ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  const tabs = [
    { label: 'Tutte', value: 'ALL' },
    { label: 'In Corso', value: VisitStatus.CHECKED_IN },
    { label: 'Programmate', value: VisitStatus.SCHEDULED },
    { label: 'Completate', value: VisitStatus.CHECKED_OUT },
    { label: 'Cancellate', value: VisitStatus.CANCELLED },
  ];

  return (
    <div className="p-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:text-gray-700 transition-colors">
          Home
        </Link>
        <ChevronRightIcon />
        <span className="text-gray-900 font-medium">Visite</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tutte le Visite</h1>
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge badge-blue">{filteredVisits.length} visite</span>
          <button
            onClick={loadData}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            title="Aggiorna"
          >
            <RefreshIcon />
          </button>
          <div className="relative" ref={exportMenuRef}>
            <button
              className="btn btn-secondary"
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
            >
              <FileDownloadIcon />
              Esporta
            </button>
            <AnimatePresence>
              {exportMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 card p-2 z-10"
                >
                  <button
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FileDownloadIcon />
                    Esporta CSV
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FileDownloadIcon />
                    Esporta PDF
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => router.push('/visits/new')}
          >
            <AddCircleIcon />
            Nuova Visita
          </button>
        </div>
      </div>

      {/* Search and Filters Card */}
      <div className="card mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon />
              </span>
              <input
                type="text"
                className="input pl-10"
                placeholder="Cerca per visitatore, azienda, host, badge, reparto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <FilterListIcon />
              Filtri
              {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </button>
          </div>

          {/* Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="label">Reparto</label>
                    <select
                      className="input"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                    >
                      <option value="ALL">Tutti</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Da Data</label>
                    <input
                      type="date"
                      className="input"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">A Data</label>
                    <input
                      type="date"
                      className="input"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      className="btn btn-secondary w-full"
                      onClick={handleClearFilters}
                      disabled={activeFiltersCount === 0}
                    >
                      Azzera Filtri
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-100 overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  statusFilter === tab.value
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card p-8 text-center text-gray-500">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4"></div>
          Caricamento...
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Data/Ora</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Visitatore</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Azienda</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Host</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reparto</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Motivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Badge/PIN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stato</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      Nessuna visita trovata
                    </td>
                  </tr>
                ) : (
                  filteredVisits.map((visit) => (
                    <motion.tr
                      key={visit.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {format(new Date(visit.scheduledDate), 'dd/MM/yyyy HH:mm', {
                          locale: it,
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {visit.visitor?.firstName} {visit.visitor?.lastName}
                        </span>
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
                        <div className="text-sm text-gray-700">{visit.department?.name || '-'}</div>
                        {visit.department?.area && (
                          <div className="text-xs text-gray-500">{visit.department.area}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="badge">{visit.purpose}</span>
                      </td>
                      <td className="px-4 py-3">
                        {visit.badgeNumber ? (
                          <span className="badge badge-green">Badge: {visit.badgeNumber}</span>
                        ) : visit.checkInPin ? (
                          <span className="badge badge-blue font-mono font-bold">PIN: {visit.checkInPin}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${getStatusBadgeClass(visit.status)}`}>
                          {translateVisitStatus(visit.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => router.push(`/visits/${visit.id}`)}
                          className="inline-flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          <VisibilityIcon />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
