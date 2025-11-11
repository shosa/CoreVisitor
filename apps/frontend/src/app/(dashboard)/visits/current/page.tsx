'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { LogoutOutlined, QrCode2, Refresh, AddCircle, Close, Print } from '@mui/icons-material';
import { visitsApi, printerApi } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useSnackbar } from 'notistack';

export default function CurrentVisitsPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);

  const loadVisits = async () => {
    try {
      const res = await visitsApi.getCurrent();
      setVisits(res.data);
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
    const interval = setInterval(loadVisits, 30000); // Auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleCheckOut = async (id: string) => {
    try {
      await visitsApi.checkOut(id);
      loadVisits();
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const handlePrintBadge = async (id: string) => {
    try {
      const res = await visitsApi.getBadge(id);
      setSelectedBadge(res.data);
      setBadgeModalOpen(true);
    } catch (error) {
      console.error('Error getting badge:', error);
      alert('Errore nel caricamento del badge');
    }
  };

  const handlePrint = async () => {
    if (!selectedBadge?.visitId) {
      enqueueSnackbar('Informazioni visita non disponibili', { variant: 'error' });
      return;
    }

    try {
      // Add badge to print queue
      await printerApi.printBadge(selectedBadge.visitId, { copies: 1 });
      enqueueSnackbar('Badge aggiunto alla coda di stampa', { variant: 'success' });
      setBadgeModalOpen(false);
    } catch (error) {
      console.error('Error printing badge:', error);
      enqueueSnackbar('Errore nella stampa del badge', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Visite', href: '/visits' },
          { label: 'In Corso' },
        ]}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Visite in Corso
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip label={`${visits.length} presenti`} color="primary" />
          <IconButton onClick={loadVisits}>
            <Refresh />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() => router.push('/visits/new')}
          >
            Nuova Visita
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Typography>Caricamento...</Typography>
      ) : visits.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary">
              Nessun visitatore presente al momento
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Visitatore</TableCell>
                <TableCell>Azienda</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Reparto/Area</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Badge</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {visit.visitor?.firstName[0]}
                        {visit.visitor?.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {visit.visitor?.firstName} {visit.visitor?.lastName}
                        </Typography>
                        {visit.visitor?.email && (
                          <Typography variant="caption" color="text.secondary">
                            {visit.visitor.email}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{visit.visitor?.company || '-'}</TableCell>
                  <TableCell>
                    {visit.hostUser
                      ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}`
                      : visit.hostName || '-'}
                  </TableCell>
                  <TableCell>
                    {visit.department?.name || '-'}
                    {visit.department?.area && (
                      <>
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {visit.department.area}
                        </Typography>
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={visit.purpose} size="small" />
                  </TableCell>
                  <TableCell>
                    {visit.checkInTime &&
                      new Date(visit.checkInTime).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    {visit.badgeNumber && (
                      <Chip label={visit.badgeNumber} size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        onClick={() => handlePrintBadge(visit.id)}
                        sx={{
                          bgcolor: 'black',
                          color: 'white',
                          borderRadius: '6px',
                          '&:hover': { bgcolor: 'grey.800' },
                        }}
                      >
                        <QrCode2 fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleCheckOut(visit.id)}
                        sx={{
                          bgcolor: 'black',
                          color: 'white',
                          borderRadius: '6px',
                          '&:hover': { bgcolor: 'grey.800' },
                        }}
                      >
                        <LogoutOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Badge Modal */}
      <Dialog open={badgeModalOpen} onClose={() => setBadgeModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Badge Visitatore
            </Typography>
            <IconButton onClick={() => setBadgeModalOpen(false)} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedBadge && (
            <Stack spacing={3} alignItems="center" sx={{ py: 2 }}>
              {/* QR Code */}
              {selectedBadge.qrCode && (
                <Box
                  component="img"
                  src={selectedBadge.qrCode}
                  alt="Badge QR Code"
                  sx={{ width: 300, height: 300, border: '2px solid', borderColor: 'divider', borderRadius: 2 }}
                />
              )}

              {/* Visitor Info */}
              <Box sx={{ textAlign: 'center', width: '100%' }}>
                <Typography variant="h5" fontWeight="bold">
                  {selectedBadge.visitor?.name}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {selectedBadge.visitor?.company || 'N/A'}
                </Typography>
              </Box>

              {/* Badge Details */}
              <Stack spacing={1} sx={{ width: '100%', bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Numero Badge:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedBadge.badgeNumber}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Host:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedBadge.host}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Valido fino a:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {selectedBadge.validUntil &&
                      new Date(selectedBadge.validUntil).toLocaleString('it-IT')}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBadgeModalOpen(false)}>Chiudi</Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{
              bgcolor: 'black',
              '&:hover': { bgcolor: 'grey.800' },
            }}
          >
            Stampa Badge
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
