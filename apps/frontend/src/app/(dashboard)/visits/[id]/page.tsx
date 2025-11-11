'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Grid,
  Stack,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { ArrowBack, Edit, Print, Cancel, Login, Logout, Person, Business, Close, QrCode2 } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { visitsApi, printerApi } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { translateVisitStatus, getVisitStatusColor, translateVisitType } from '@/lib/translations';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function VisitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const id = params.id as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [badgeData, setBadgeData] = useState<any>(null);

  const loadVisit = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await visitsApi.getOne(id);
      setVisit(res.data);
    } catch (err) {
      setError('Impossibile caricare i dati della visita.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisit();
  }, [id]);

  const handleAction = async (action: 'checkIn' | 'checkOut' | 'cancel') => {
    try {
      await visitsApi[action](id);
      enqueueSnackbar(`Azione eseguita con successo`, { variant: 'success' });
      loadVisit(); // Refresh data
    } catch (err) {
      enqueueSnackbar(`Errore durante l'esecuzione dell'azione`, { variant: 'error' });
      console.error(err);
    }
  };

  const handleOpenBadge = async () => {
    try {
      const res = await visitsApi.getBadge(id);
      setBadgeData(res.data);
      setBadgeModalOpen(true);
    } catch (err) {
      enqueueSnackbar('Errore nel caricamento del badge', { variant: 'error' });
      console.error(err);
    }
  };

  const handlePrintBadge = () => {
    window.print();
  };

  const handlePrintBadgeToQueue = async () => {
    try {
      await printerApi.printBadge(id, { copies: 1 });
      enqueueSnackbar('Badge aggiunto alla coda di stampa', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar('Errore nella stampa del badge', { variant: 'error' });
      console.error(err);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!visit) {
    return <Alert severity="info">Nessuna visita trovata.</Alert>;
  }

  const canCheckIn = visit.status === 'pending';
  const canCheckOut = visit.status === 'checked_in';
  const canCancel = visit.status === 'pending';

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Visite', href: '/visits' },
          { label: visit.purpose || visit.id }
        ]}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/visits')}>
          Tutte le Visite
        </Button>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {canCheckIn && (
            <Button
              variant="contained"
              startIcon={<Login />}
              onClick={() => handleAction('checkIn')}
              sx={{
                backgroundColor: 'common.black',
                color: 'common.white',
                '&:hover': { backgroundColor: 'grey.800' },
              }}
            >
              Check-In
            </Button>
          )}
          {canCheckOut && (
            <Button
              variant="contained"
              startIcon={<Logout />}
              onClick={() => handleAction('checkOut')}
              sx={{
                backgroundColor: 'error.main',
                color: 'common.white',
                '&:hover': { backgroundColor: 'error.dark' },
              }}
            >
              Check-Out
            </Button>
          )}
          {canCancel && (
            <Button
              variant="contained"
              startIcon={<Cancel />}
              onClick={() => handleAction('cancel')}
              sx={{
                backgroundColor: 'common.black',
                color: 'common.white',
                '&:hover': { backgroundColor: 'grey.800' },
              }}
            >
              Annulla
            </Button>
          )}
          {visit.badgeIssued && (
            <>
              <Button
                variant="contained"
                startIcon={<QrCode2 />}
                onClick={handleOpenBadge}
                sx={{
                  backgroundColor: 'common.black',
                  color: 'common.white',
                  '&:hover': { backgroundColor: 'grey.800' },
                }}
              >
                Visualizza Badge
              </Button>
              <Button
                variant="contained"
                startIcon={<Print />}
                onClick={handlePrintBadgeToQueue}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'common.white',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                Stampa Badge
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => router.push(`/visits/${visit.id}/edit`)}
            sx={{
              backgroundColor: 'common.black',
              color: 'common.white',
              '&:hover': { backgroundColor: 'grey.800' },
            }}
          >
            Modifica
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Visitor & Host Info */}
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}><Person /></Avatar>
              <Typography variant="h6">Visitatore</Typography>
            </Stack>
            <Typography><strong>Nome:</strong> {visit.visitor?.firstName} {visit.visitor?.lastName}</Typography>
            <Typography><strong>Azienda:</strong> {visit.visitor?.company || '-'}</Typography>
            <Typography><strong>Email:</strong> {visit.visitor?.email || '-'}</Typography>
            <Button
              size="small"
              onClick={() => router.push(`/visitors/${visit.visitorId}`)}
              sx={{
                mt: 1,
                backgroundColor: 'common.black',
                color: 'common.white',
                '&:hover': { backgroundColor: 'grey.800' },
              }}
            >
              Vedi Profilo
            </Button>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main' }}><Business /></Avatar>
              <Typography variant="h6">Ospite</Typography>
            </Stack>
            <Typography>
              <strong>Nome:</strong>{' '}
              {visit.hostUser
                ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}`
                : visit.hostName || '-'}
            </Typography>
          </Card>
        </Grid>

        {/* Visit Details */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Dettagli Visita</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography><strong>Stato:</strong></Typography>
                  <Chip label={translateVisitStatus(visit.status)} size="small" color={getVisitStatusColor(visit.status)} />
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Scopo:</strong> {visit.purpose}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Tipo Visita:</strong> {translateVisitType(visit.visitType)}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Dipartimento:</strong> {visit.department?.name || '-'}</Typography></Grid>
              {visit.department?.area && (
                <Grid item xs={12} sm={6} md={4}><Typography><strong>Area:</strong> {visit.department.area}</Typography></Grid>
              )}
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Data Programmata:</strong> {new Date(visit.scheduledDate).toLocaleString('it-IT')}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Check-In:</strong> {visit.actualCheckIn ? new Date(visit.actualCheckIn).toLocaleString('it-IT') : '-'}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Check-Out:</strong> {visit.actualCheckOut ? new Date(visit.actualCheckOut).toLocaleString('it-IT') : '-'}</Typography></Grid>
              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Badge:</strong> {visit.badgeIssued ? `Sì, #${visit.badgeNumber}` : 'No'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Notifica Inviata:</strong> {visit.notificationSent ? 'Sì' : 'No'}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>Note:</strong> {visit.notes || '-'}</Typography></Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {/* Badge Modal */}
      <Dialog
        open={badgeModalOpen}
        onClose={() => setBadgeModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            '@media print': {
              boxShadow: 'none',
              margin: 0,
            }
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Badge Visitatore
            </Typography>
            <IconButton onClick={() => setBadgeModalOpen(false)} size="small" className="no-print">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {badgeData && (
            <Box
              sx={{
                textAlign: 'center',
                py: 3,
                border: '4px solid',
                borderColor: 'primary.main',
                borderRadius: 3,
                bgcolor: 'grey.50',
                '@media print': {
                  border: '2px solid black',
                }
              }}
            >
              {/* Header */}
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary.main"
                sx={{ mb: 3 }}
              >
                VISITATORE
              </Typography>

              {/* Visitor Info */}
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
                {badgeData.visitor?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {badgeData.visitor?.company || 'N/A'}
              </Typography>

              {/* QR Code */}
              {badgeData.qrCode && (
                <Box
                  component="img"
                  src={badgeData.qrCode}
                  alt="Badge QR Code"
                  sx={{
                    width: 250,
                    height: 250,
                    margin: '0 auto',
                    display: 'block',
                    border: '2px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'white',
                    p: 1
                  }}
                />
              )}

              {/* Badge Details */}
              <Stack spacing={1} sx={{ mt: 3, px: 3 }}>
                <Typography variant="body2">
                  <strong>Badge:</strong> {badgeData.badgeNumber}
                </Typography>
                <Typography variant="body2">
                  <strong>Host:</strong> {badgeData.host}
                </Typography>
                <Typography variant="body2">
                  <strong>Valido fino:</strong>{' '}
                  {badgeData.validUntil &&
                    new Date(badgeData.validUntil).toLocaleString('it-IT')}
                </Typography>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="no-print">
          <Button onClick={() => setBadgeModalOpen(false)}>
            Chiudi
          </Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrintBadge}
            sx={{
              bgcolor: 'black',
              '&:hover': { bgcolor: 'grey.800' },
            }}
          >
            Stampa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
