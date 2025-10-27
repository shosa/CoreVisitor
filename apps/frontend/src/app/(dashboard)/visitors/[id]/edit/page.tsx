'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Card, Grid, TextField, Button, Stack, FormControlLabel, Checkbox, Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { visitorsApi } from '@/lib/api';
import { Visitor, DocumentType } from '@/types/visitor';
import { UploadFile } from '@mui/icons-material';
import Breadcrumbs from '@/components/Breadcrumbs';

const schema = yup.object().shape({
  firstName: yup.string().required('Il nome è obbligatorio').max(100),
  lastName: yup.string().required('Il cognome è obbligatorio').max(100),
  email: yup.string().email('Email non valida').optional(),
  phone: yup.string().max(20).optional(),
  company: yup.string().max(200).optional(),
  documentType: yup.mixed<DocumentType>().oneOf(Object.values(DocumentType)).optional(),
  documentNumber: yup.string().max(50).optional(),
  documentExpiry: yup.string().optional(),
  licensePlate: yup.string().max(20).optional(),
  privacyConsent: yup.boolean().optional(),
  notes: yup.string().optional(),
});

export default function EditVisitorPage() {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [visitor, setVisitor] = useState<Visitor | null>(null);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (id) {
      loadVisitor();
    }
  }, [id]);

  const mapBackendToFrontendDocType = (backendType: string | undefined): DocumentType | undefined => {
    if (!backendType) return undefined;
    const mapping: Record<string, DocumentType> = {
      'id_card': DocumentType.CARTA_IDENTITA,
      'passport': DocumentType.PASSAPORTO,
      'driving_license': DocumentType.PATENTE,
      'other': DocumentType.ALTRO,
    };
    return mapping[backendType] || backendType as DocumentType;
  };

  const loadVisitor = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await visitorsApi.getOne(id);
      const visitorData = res.data;
      setVisitor(visitorData);
      // Populate the form with existing data
      reset({
        firstName: visitorData.firstName,
        lastName: visitorData.lastName,
        email: visitorData.email || '',
        phone: visitorData.phone || '',
        company: visitorData.company || '',
        documentType: mapBackendToFrontendDocType(visitorData.documentType),
        documentNumber: visitorData.documentNumber || '',
        documentExpiry: visitorData.documentExpiry ? new Date(visitorData.documentExpiry).toISOString().split('T')[0] : '',
        licensePlate: visitorData.licensePlate || '',
        privacyConsent: visitorData.privacyConsent || false,
        notes: visitorData.notes || ''
      });
    } catch (err) {
      setError('Impossibile caricare i dati del visitatore.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    try {
      await visitorsApi.update(id, data);
      enqueueSnackbar('Visitatore aggiornato con successo', { variant: 'success' });
      router.push(`/visitors/${id}`);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Errore durante l\'aggiornamento del visitatore', { variant: 'error' });
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      {visitor && (
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Visitatori', href: '/visitors' },
            { label: `${visitor.firstName} ${visitor.lastName}`, href: `/visitors/${id}` },
            { label: 'Modifica' },
          ]}
        />
      )}

      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>
        Modifica Visitatore
      </Typography>

      <Card sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Form fields are identical to the NewVisitorPage */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Nome" error={!!errors.firstName} helperText={errors.firstName?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Cognome" error={!!errors.lastName} helperText={errors.lastName?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Email" type="email" error={!!errors.email} helperText={errors.email?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Telefono" error={!!errors.phone} helperText={errors.phone?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Azienda" error={!!errors.company} helperText={errors.company?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="documentType"
                control={control}
                render={({ field }) => (
                    <FormControl fullWidth error={!!errors.documentType}>
                        <InputLabel>Tipo Documento</InputLabel>
                        <Select {...field} label="Tipo Documento">
                            <MenuItem value={DocumentType.CARTA_IDENTITA}>Carta d'Identità</MenuItem>
                            <MenuItem value={DocumentType.PASSAPORTO}>Passaporto</MenuItem>
                            <MenuItem value={DocumentType.PATENTE}>Patente di Guida</MenuItem>
                            <MenuItem value={DocumentType.ALTRO}>Altro</MenuItem>
                        </Select>
                    </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="documentNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Numero Documento" error={!!errors.documentNumber} helperText={errors.documentNumber?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="documentExpiry"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Scadenza Documento" type="date" InputLabelProps={{ shrink: true }} error={!!errors.documentExpiry} helperText={errors.documentExpiry?.message} />
                )}
              />
            </Grid>

            {/* File Uploads */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Foto Visitatore</Typography>
              <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                Carica Nuova Foto
                <input type="file" hidden accept="image/*" onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)} />
              </Button>
              {photoFile && <Typography variant="body2" sx={{ mt: 1 }}>{photoFile.name}</Typography>}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Scansione Documento</Typography>
              <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                Carica Nuovo Documento
                <input type="file" hidden accept=".pdf,image/*" onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)} />
              </Button>
              {documentFile && <Typography variant="body2" sx={{ mt: 1 }}>{documentFile.name}</Typography>}
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="licensePlate"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Targa Veicolo" error={!!errors.licensePlate} helperText={errors.licensePlate?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label="Note" multiline rows={3} error={!!errors.notes} helperText={errors.notes?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
                <Controller
                    name="privacyConsent"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Checkbox {...field} checked={field.value} />}
                            label="Dichiaro di aver letto l'informativa sulla privacy e di prestare il consenso al trattamento dei dati personali."
                        />
                    )}
                />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => router.back()} color="inherit">
                  Annulla
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
}
