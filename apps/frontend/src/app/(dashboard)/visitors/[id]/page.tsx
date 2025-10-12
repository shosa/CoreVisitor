'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Card, Grid, Stack, Button, Avatar, Chip, CircularProgress, Alert } from '@mui/material';
import { Person, Edit, Delete, ArrowBack } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { visitorsApi } from '@/lib/api';
import { Visitor } from '@/types/visitor';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function VisitorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const id = params.id as string;

  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadVisitor();
    }
  }, [id]);

  const loadVisitor = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await visitorsApi.getOne(id);
      setVisitor(res.data);
    } catch (err) {
      setError('Impossibile caricare i dati del visitatore.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!visitor || !confirm('Sei sicuro di voler eliminare questo visitatore? L\'azione è irreversibile.')) return;

    try {
      await visitorsApi.delete(visitor.id);
      enqueueSnackbar('Visitatore eliminato con successo', { variant: 'success' });
      router.push('/visitors');
    } catch (error) {
      console.error('Error deleting visitor:', error);
      enqueueSnackbar("Errore durante l'eliminazione", { variant: 'error' });
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!visitor) {
    return <Alert severity="info">Nessun visitatore trovato.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/visitors')}>
          Tutti i Visitatori
        </Button>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Delete />}
            onClick={handleDelete}
            sx={{
              backgroundColor: 'common.black',
              color: 'common.white',
              '&:hover': { backgroundColor: 'grey.800' },
            }}
          >
            Elimina
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => router.push(`/visitors/${visitor.id}/edit`)}
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
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main' }}>
              <Person sx={{ fontSize: 80 }} />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
              {visitor.firstName} {visitor.lastName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {visitor.company || 'N/A'}
            </Typography>
            {visitor.privacyConsent && (
              <Chip label="Consenso Privacy Fornito" size="small" color="success" sx={{ mt: 1 }} />
            )}
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Dettagli Visitatore</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><Typography><strong>Email:</strong> {visitor.email || '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Telefono:</strong> {visitor.phone || '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Azienda:</strong> {visitor.company || '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Targa:</strong> {visitor.licensePlate || '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Documento:</strong> {visitor.documentType ? `${visitor.documentType}: ${visitor.documentNumber}` : '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Registrato il:</strong> {format(new Date(visitor.createdAt), 'dd/MM/yyyy HH:mm', { locale: it })}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>Note:</strong> {visitor.notes || '-'}</Typography></Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Cronologia Visite</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Ospite</TableCell>
                  <TableCell>Scopo</TableCell>
                  <TableCell>Stato</TableCell>
                  <TableCell align="right">Azioni</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visitor.visits && visitor.visits.length > 0 ? (
                  visitor.visits.map((visit) => (
                    <TableRow hover key={visit.id}>
                      <TableCell>{format(new Date(visit.scheduledDate), 'dd/MM/yyyy HH:mm', { locale: it })}</TableCell>
                      <TableCell>{visit.host?.name || '-'}</TableCell>
                      <TableCell>{visit.purpose}</TableCell>
                      <TableCell><Chip label={visit.status} size="small" /></TableCell> {/* Add color later if needed */}
                      <TableCell align="right">
                        <Button size="small" onClick={() => router.push(`/visits/${visit.id}`)}>Vedi</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Nessuna visita registrata.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Grid>
    </Grid>
  </Box>
);
}
