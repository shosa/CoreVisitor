'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search, Visibility, Edit, Delete } from '@mui/icons-material';
import { visitsApi } from '@/lib/api';
import { Visit, VisitStatus } from '@/types/visitor';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export default function VisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVisits();
  }, []);

  useEffect(() => {
    filterVisits();
  }, [visits, statusFilter, searchQuery]);

  const loadVisits = async () => {
    try {
      const res = await visitsApi.getAll();
      setVisits(res.data);
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

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.visitor?.firstName?.toLowerCase().includes(query) ||
          v.visitor?.lastName?.toLowerCase().includes(query) ||
          v.visitor?.company?.toLowerCase().includes(query) ||
          v.host?.name?.toLowerCase().includes(query) ||
          v.badgeNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredVisits(filtered);
  };

  const getStatusColor = (status: VisitStatus) => {
    switch (status) {
      case VisitStatus.CHECKED_IN:
        return 'success';
      case VisitStatus.SCHEDULED:
        return 'warning';
      case VisitStatus.CHECKED_OUT:
        return 'default';
      case VisitStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: VisitStatus) => {
    switch (status) {
      case VisitStatus.CHECKED_IN:
        return 'Presente';
      case VisitStatus.SCHEDULED:
        return 'Programmata';
      case VisitStatus.CHECKED_OUT:
        return 'Completata';
      case VisitStatus.CANCELLED:
        return 'Cancellata';
      default:
        return status;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Tutte le Visite
        </Typography>
        <Chip label={`${filteredVisits.length} visite`} color="primary" />
      </Stack>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Cerca per visitatore, azienda, host, badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Tabs
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Tutte" value="ALL" />
          <Tab label="In Corso" value={VisitStatus.CHECKED_IN} />
          <Tab label="Programmate" value={VisitStatus.SCHEDULED} />
          <Tab label="Completate" value={VisitStatus.CHECKED_OUT} />
          <Tab label="Cancellate" value={VisitStatus.CANCELLED} />
        </Tabs>
      </Card>

      {loading ? (
        <Typography>Caricamento...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data/Ora</TableCell>
                <TableCell>Visitatore</TableCell>
                <TableCell>Azienda</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Reparto</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Badge</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Nessuna visita trovata
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>
                      {format(new Date(visit.scheduledDate), 'dd/MM/yyyy HH:mm', {
                        locale: it,
                      })}
                    </TableCell>
                    <TableCell>
                      {visit.visitor?.firstName} {visit.visitor?.lastName}
                    </TableCell>
                    <TableCell>{visit.visitor?.company || '-'}</TableCell>
                    <TableCell>{visit.host?.name}</TableCell>
                    <TableCell>
                      {visit.department}
                      {visit.area && (
                        <>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {visit.area}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={visit.purpose} size="small" />
                    </TableCell>
                    <TableCell>
                      {visit.badgeNumber && (
                        <Chip label={visit.badgeNumber} size="small" color="success" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(visit.status)}
                        size="small"
                        color={getStatusColor(visit.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/visits/${visit.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
