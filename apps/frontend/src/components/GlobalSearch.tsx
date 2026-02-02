'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '@/lib/axios';

interface SearchResult {
  id: string;
  type: 'visitor' | 'visit' | 'department';
  title: string;
  subtitle: string;
  url: string;
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        setOpen(true);
        try {
          const [visitorsRes, visitsRes, departmentsRes] = await Promise.all([
            axiosInstance.get(`/visitors/search?q=${encodeURIComponent(query)}`).catch(() => ({ data: [] })),
            axiosInstance.get(`/visits/search?q=${encodeURIComponent(query)}`).catch(() => ({ data: [] })),
            axiosInstance.get(`/departments/search?q=${encodeURIComponent(query)}`).catch(() => ({ data: [] })),
          ]);

          const visitors = (visitorsRes.data?.data || visitorsRes.data || []).map((v: any) => ({
            id: v.id,
            type: 'visitor' as const,
            title: `${v.firstName || ''} ${v.lastName || ''}`.trim(),
            subtitle: v.email || v.company || '',
            url: `/visitors/${v.id}`,
          }));

          const visits = (visitsRes.data?.data || visitsRes.data || []).map((v: any) => ({
            id: v.id,
            type: 'visit' as const,
            title: `${v.visitor?.firstName || ''} ${v.visitor?.lastName || ''}`.trim(),
            subtitle: `${v.department?.name || ''} - ${new Date(v.checkIn).toLocaleDateString()}`,
            url: `/visits/${v.id}`,
          }));

          const departments = (departmentsRes.data?.data || departmentsRes.data || []).map((d: any) => ({
            id: d.id,
            type: 'department' as const,
            title: d.name,
            subtitle: d.description || '',
            url: `/departments/${d.id}`,
          }));

          setResults([...visitors.slice(0, 3), ...visits.slice(0, 3), ...departments.slice(0, 3)]);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleResultClick = (url: string) => {
    router.push(url);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'visitor':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'visit':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'department':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'visitor':
        return 'Visitatore';
      case 'visit':
        return 'Visita';
      case 'department':
        return 'Reparto';
      default:
        return '';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-gray-900 focus-within:border-transparent transition-all">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Cerca visitatori, visite, reparti..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-400"
        />
        {loading && (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin flex-shrink-0" />
        )}
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {results.map((result, index) => (
              <div key={`${result.type}-${result.id}`}>
                {index > 0 && results[index - 1].type !== result.type && (
                  <div className="border-t border-gray-100" />
                )}
                <button
                  onClick={() => handleResultClick(result.url)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-gray-400">{getIcon(result.type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </span>
                      <span className="badge text-xs">{getTypeLabel(result.type)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                  </div>
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {open && query.length >= 2 && results.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 z-50"
          >
            <p className="text-sm text-gray-500 text-center">
              Nessun risultato trovato per "{query}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
