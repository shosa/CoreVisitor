'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Card, Grid, Stack, Button, Chip, CircularProgress, Alert, Divider, Avatar } from '@mui/material';
import { ArrowBack, Edit, Print, Cancel, Login, Logout, Person, Business } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { visitsApi } from '@/lib/api';
import { Visit, VisitStatus } from '@/types/visitor';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Helper to get status color
const getStatusChipColor = (status: VisitStatus) => {
  switch (status) {
    case VisitStatus.SCHEDULED: return 'info';
    case VisitStatus.CHECKED_IN: return 'success';
    case VisitStatus.CHECKED_OUT: return 'default';
    case VisitStatus.CANCELLED: return 'error';
    case VisitStatus.EXPIRED: return 'warning';
    default: return 'default';
  }
};

export default function VisitDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const id = params.id as string;

  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!visit) {
    return <Alert severity="info">Nessuna visita trovata.</Alert>;
  }

  const canCheckIn = visit.status === VisitStatus.SCHEDULED;
  const canCheckOut = visit.status === VisitStatus.CHECKED_IN;
  const canCancel = visit.status === VisitStatus.SCHEDULED;

  return (
    <Box sx={{ p: 3 }}>
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
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={() => window.open(`/api/visits/${visit.id}/badge`, '_blank')}
            sx={{
              backgroundColor: 'common.black',
              color: 'common.white',
              '&:hover': { backgroundColor: 'grey.800' },
            }}
          >
            Stampa Badge
          </Button>
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
            <Typography><strong>Nome:</strong> {visit.host?.name}</Typography>
            <Typography><strong>Email:</strong> {visit.host?.email}</Typography>
            <Typography><strong>Dipartimento:</strong> {visit.host?.department || '-'}</Typography>
          </Card>
        </Grid>

        {/* Visit Details */}
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Dettagli Visita</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Stato:</strong> <Chip label={visit.status} size="small" color={getStatusChipColor(visit.status)} /></Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Scopo:</strong> {visit.purpose} {visit.purposeNotes ? `(${visit.purposeNotes})` : ''}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Area/Dipartimento:</strong> {visit.department || '-'}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Data Programmata:</strong> {format(new Date(visit.scheduledDate), 'dd/MM/yyyy HH:mm', { locale: it })}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Check-In:</strong> {visit.checkInTime ? format(new Date(visit.checkInTime), 'dd/MM/yyyy HH:mm', { locale: it }) : '-'}</Typography></Grid>
              <Grid item xs={12} sm={6} md={4}><Typography><strong>Check-Out:</strong> {visit.checkOutTime ? format(new Date(visit.checkOutTime), 'dd/MM/yyyy HH:mm', { locale: it }) : '-'}</Typography></Grid>
              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Badge:</strong> {visit.badgeIssued ? `Sì, #${visit.badgeNumber}` : 'No'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Notifica Inviata:</strong> {visit.notificationSent ? 'Sì' : 'No'}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>Note:</strong> {visit.notes || '-'}</Typography></Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
