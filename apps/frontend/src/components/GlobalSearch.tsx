'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  InputBase,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material';
import { Search, Person, Event, Business } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
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
          // Ricerca parallela su visitatori, visite e reparti
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
        return <Person fontSize="small" />;
      case 'visit':
        return <Event fontSize="small" />;
      case 'department':
        return <Business fontSize="small" />;
      default:
        return <Search fontSize="small" />;
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
    <Box ref={searchRef} sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 0.75,
          bgcolor: 'white',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            borderColor: 'primary.main',
          },
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 2px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <Search sx={{ color: 'text.secondary', mr: 1 }} />
        <InputBase
          placeholder="Cerca visitatori, visite, reparti..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          sx={{
            flex: 1,
            color: 'text.primary',
            '& ::placeholder': {
              color: 'text.secondary',
              opacity: 0.7,
            },
          }}
        />
        {loading && <CircularProgress size={20} sx={{ color: 'primary.main' }} />}
      </Paper>

      {open && results.length > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            maxHeight: 400,
            overflow: 'auto',
            zIndex: 1300,
          }}
        >
          <List disablePadding>
            {results.map((result, index) => (
              <Box key={`${result.type}-${result.id}`}>
                {index > 0 && results[index - 1].type !== result.type && <Divider />}
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleResultClick(result.url)}>
                    <ListItemIcon sx={{ minWidth: 40 }}>{getIcon(result.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                            {result.title}
                          </Typography>
                          <Chip label={getTypeLabel(result.type)} size="small" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Box>
                      }
                      secondary={result.subtitle}
                      secondaryTypographyProps={{
                        noWrap: true,
                        fontSize: '0.75rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Box>
            ))}
          </List>
        </Paper>
      )}

      {open && query.length >= 2 && results.length === 0 && !loading && (
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: 0,
            right: 0,
            p: 3,
            zIndex: 1300,
          }}
        >
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Nessun risultato trovato per "{query}"
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
