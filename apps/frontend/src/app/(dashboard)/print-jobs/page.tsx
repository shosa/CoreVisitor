'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Replay as ReplayIcon,
  Cancel as CancelIcon,
  DeleteSweep as DeleteSweepIcon,
} from '@mui/icons-material';
import { printerApi, PrintJob } from '@/lib/api';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function PrintJobsPage() {
  const [jobs, setJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [statusFilter]);

  const loadJobs = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await printerApi.getJobs(params);
      setJobs(res.data);
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nel caricamento');
      setLoading(false);
    }
  };

  const handleRetry = async (jobId: string) => {
    try {
      await printerApi.retryJob(jobId);
      setSuccess('Lavoro rimesso in coda');
      await loadJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nel retry');
    }
  };

  const handleCancel = async (jobId: string) => {
    if (!confirm('Sei sicuro di voler annullare questo lavoro?')) return;

    try {
      await printerApi.cancelJob(jobId);
      setSuccess('Lavoro annullato');
      await loadJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nell\'annullamento');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Eliminare tutti i lavori completati più vecchi di 7 giorni?')) return;

    try {
      await printerApi.cleanup();
      setSuccess('Cleanup completato');
      await loadJobs();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nel cleanup');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'printing':
        return 'info';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Lavori di Stampa</Typography>
        <Box display="flex" gap={1}>
          <Button startIcon={<DeleteSweepIcon />} onClick={handleCleanup}>
            Cleanup
          </Button>
          <Button startIcon={<RefreshIcon />} onClick={loadJobs}>
            Aggiorna
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Filter Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Tutti" value="all" />
          <Tab label="In attesa" value="pending" />
          <Tab label="In stampa" value="printing" />
          <Tab label="Completati" value="completed" />
          <Tab label="Falliti" value="failed" />
          <Tab label="Annullati" value="cancelled" />
        </Tabs>
      </Paper>

      {/* Jobs Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Stato</TableCell>
              <TableCell>Visita</TableCell>
              <TableCell>Stampante</TableCell>
              <TableCell>Copie</TableCell>
              <TableCell>Data Creazione</TableCell>
              <TableCell>Data Stampa</TableCell>
              <TableCell>Errore</TableCell>
              <TableCell align="right">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  <Typography color="text.secondary">Nessun lavoro trovato</Typography>
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Chip label={job.type.toUpperCase()} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(job.status)}
                      size="small"
                      color={getStatusColor(job.status) as any}
                    />
                  </TableCell>
                  <TableCell>
                    {job.visitId ? (
                      <Button
                        size="small"
                        href={`/visits/${job.visitId}`}
                        target="_blank"
                      >
                        Vedi Visita
                      </Button>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{job.printerName || 'Predefinita'}</TableCell>
                  <TableCell>{job.copies}</TableCell>
                  <TableCell>
                    {format(new Date(job.createdAt), 'dd/MM/yyyy HH:mm', { locale: it })}
                  </TableCell>
                  <TableCell>
                    {job.printedAt
                      ? format(new Date(job.printedAt), 'dd/MM/yyyy HH:mm', { locale: it })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {job.error ? (
                      <Typography
                        variant="body2"
                        color="error"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={job.error}
                      >
                        {job.error}
                      </Typography>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box display="flex" justifyContent="flex-end" gap={1}>
                      {job.status === 'failed' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleRetry(job.id)}
                          title="Riprova"
                        >
                          <ReplayIcon />
                        </IconButton>
                      )}
                      {(job.status === 'pending' || job.status === 'failed') && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleCancel(job.id)}
                          title="Annulla"
                        >
                          <CancelIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
