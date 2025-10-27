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
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions
} from '@mui/material';
import { Person, Edit, Delete, ArrowBack, Visibility, VisibilityOff, ZoomIn, Description } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { visitorsApi } from '@/lib/api';
import { Visitor } from '@/types/visitor';
import { translateDocumentType, translateVisitStatus } from '@/lib/translations';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function VisitorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const id = params.id as string;

  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isThumbnailBlurred, setIsThumbnailBlurred] = useState(true);
  const [isModalPhotoBlurred, setIsModalPhotoBlurred] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [documentMimeType, setDocumentMimeType] = useState<string | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(false);

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
      console.log('📸 Visitor data:', res.data);
      console.log('📸 photoPath:', res.data.photoPath);
      console.log('📄 documents:', res.data.documents);
      console.log('📄 documentScanPath:', res.data.documentScanPath);

      // Carica la foto se presente
      if (res.data.photoPath) {
        try {
          console.log('📸 Fetching photo URL...');
          const photoRes = await visitorsApi.getPhotoUrl(id);
          console.log('📸 Photo URL response:', photoRes.data);
          setPhotoUrl(photoRes.data.url);
        } catch (err) {
          console.error('❌ Errore nel caricamento della foto:', err);
        }
      } else {
        console.log('📸 No photoPath found in visitor data');
      }
    } catch (err) {
      setError('Impossibile caricare i dati del visitatore.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = async () => {
    if (!visitor?.documents || visitor.documents.length === 0) {
      enqueueSnackbar('Nessun documento disponibile', { variant: 'warning' });
      return;
    }

    setLoadingDocument(true);
    try {
      const docRes = await visitorsApi.getDocumentUrl(id);
      setDocumentUrl(docRes.data.url);
      // Salva il mimeType dal documento più recente
      setDocumentMimeType(visitor.documents[0].mimeType);
      setIsDocumentModalOpen(true);
    } catch (err) {
      console.error('Errore nel caricamento del documento:', err);
      enqueueSnackbar('Errore nel caricamento del documento', { variant: 'error' });
    } finally {
      setLoadingDocument(false);
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
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Visitatori', href: '/visitors' },
          { label: `${visitor.firstName} ${visitor.lastName}` },
        ]}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/visitors')}>
          Tutti i Visitatori
        </Button>
        <Stack direction="row" spacing={2}>
          {visitor.documents && visitor.documents.length > 0 && (
            <Button
              variant="contained"
              startIcon={loadingDocument ? <CircularProgress size={20} color="inherit" /> : <Description />}
              onClick={handleViewDocument}
              disabled={loadingDocument}
              sx={{
                backgroundColor: 'primary.main',
                color: 'common.white',
                '&:hover': { backgroundColor: 'primary.dark' },
              }}
            >
              Vedi Documento
            </Button>
          )}
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
            <Box sx={{ position: 'relative', mb: 2 }}>
              {photoUrl ? (
                <Avatar
                  src={photoUrl}
                  alt={`${visitor.firstName} ${visitor.lastName}`}
                  sx={{
                    width: 120,
                    height: 120,
                    filter: isThumbnailBlurred ? 'blur(10px)' : 'none',
                    transition: 'filter 0.3s ease-in-out'
                  }}
                />
              ) : (
                <Avatar sx={{ width: 120, height: 120, bgcolor: 'primary.main' }}>
                  <Person sx={{ fontSize: 80 }} />
                </Avatar>
              )}
              {photoUrl && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    position: 'absolute',
                    bottom: -10,
                    right: -10,
                    bgcolor: 'white',
                    borderRadius: '20px',
                    boxShadow: 2,
                    p: 0.5
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setIsThumbnailBlurred(!isThumbnailBlurred)}
                    sx={{
                      bgcolor: 'grey.100',
                      '&:hover': { bgcolor: 'grey.200' },
                    }}
                  >
                    {isThumbnailBlurred ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setIsPhotoModalOpen(true)}
                    sx={{
                      bgcolor: 'grey.100',
                      '&:hover': { bgcolor: 'grey.200' },
                    }}
                  >
                    <ZoomIn fontSize="small" />
                  </IconButton>
                </Stack>
              )}
            </Box>
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
              <Grid item xs={12} sm={6}><Typography><strong>Documento:</strong> {visitor.documentType ? `${translateDocumentType(visitor.documentType)}: ${visitor.documentNumber}` : '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Registrato il:</strong> {new Date(visitor.createdAt).toLocaleString('it-IT')}</Typography></Grid>
              <Grid item xs={12}><Typography><strong>Note:</strong> {visitor.notes || '-'}</Typography></Grid>
            </Grid>
          </Card>
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
                        <TableCell>{new Date(visit.scheduledDate).toLocaleString('it-IT')}</TableCell>
                        <TableCell>{visit.host?.name || '-'}</TableCell>
                        <TableCell>{visit.purpose}</TableCell>
                        <TableCell><Chip label={translateVisitStatus(visit.status)} size="small" /></TableCell>
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

      {/* Modal per foto ingrandita */}
      <Dialog
        open={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              Foto di {visitor.firstName} {visitor.lastName}
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsModalPhotoBlurred(!isModalPhotoBlurred)}
              sx={{
                bgcolor: 'grey.100',
                '&:hover': { bgcolor: 'grey.200' },
              }}
            >
              {isModalPhotoBlurred ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
            }}
          >
            {photoUrl && (
              <Box
                component="img"
                src={photoUrl}
                alt={`${visitor.firstName} ${visitor.lastName}`}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: 2,
                  filter: isModalPhotoBlurred ? 'blur(10px)' : 'none',
                  transition: 'filter 0.3s ease-in-out'
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsPhotoModalOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>

      {/* Modal per documento */}
      <Dialog
        open={isDocumentModalOpen}
        onClose={() => setIsDocumentModalOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Documento di {visitor.firstName} {visitor.lastName}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 500,
            }}
          >
            {documentUrl && (
              <>
                {documentMimeType === 'application/pdf' ? (
                  <iframe
                    src={documentUrl}
                    style={{
                      width: '100%',
                      height: '80vh',
                      border: 'none',
                      borderRadius: '8px'
                    }}
                    title="Documento visitatore"
                  />
                ) : (
                  <Box
                    component="img"
                    src={documentUrl}
                    alt="Documento"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '80vh',
                      objectFit: 'contain',
                      borderRadius: 2,
                    }}
                  />
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => window.open(documentUrl || '', '_blank')}
            disabled={!documentUrl}
          >
            Apri in nuova finestra
          </Button>
          <Button onClick={() => setIsDocumentModalOpen(false)}>Chiudi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
