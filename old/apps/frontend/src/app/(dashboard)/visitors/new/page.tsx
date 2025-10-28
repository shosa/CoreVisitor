'use client';

import { useState } from 'react';
import { Box, Typography, Card, Grid, TextField, Button, Stack, FormControlLabel, Checkbox, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { visitorsApi } from '@/lib/api';
import { DocumentType } from '@/types/visitor';
import { UploadFile } from '@mui/icons-material';

const schema = yup.object().shape({
  firstName: yup.string().required('Il nome è obbligatorio').max(100),
  lastName: yup.string().required('Il cognome è obbligatorio').max(100),
  email: yup.string().email('Email non valida').optional(),
  phone: yup.string().max(20).optional(),
  company: yup.string().max(200).optional(),
  documentType: yup.mixed<DocumentType>().oneOf(Object.values(DocumentType)).optional(),
  documentNumber: yup.string().max(50).optional(),
  licensePlate: yup.string().max(20).optional(),
  privacyConsent: yup.boolean().optional(),
  notes: yup.string().optional(),
  photo: yup.mixed().optional(),
  document: yup.mixed().optional(),
});

export default function NewVisitorPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      documentType: undefined,
      documentNumber: '',
      licensePlate: '',
      privacyConsent: false,
      notes: ''
    }
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    const formData = new FormData();

    // Append text data
    Object.entries(data).forEach(([key, value]) => {
      if (value != null && typeof value !== 'object') {
        formData.append(key, String(value));
      }
    });

    // Append files
    if (photoFile) {
      formData.append('photo', photoFile);
    }
    if (documentFile) {
      formData.append('document', documentFile);
    }

    try {
      await visitorsApi.create(formData);
      enqueueSnackbar('Visitatore creato con successo', { variant: 'success' });
      router.push('/visitors');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Errore durante la creazione del visitatore', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Nuovo Visitatore</Typography>
      </Stack>

      <Card sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Text fields remain the same */}
            <Grid item xs={12} sm={6}><Controller name="firstName" control={control} render={({ field }) => <TextField {...field} fullWidth label="Nome" error={!!errors.firstName} helperText={errors.firstName?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="lastName" control={control} render={({ field }) => <TextField {...field} fullWidth label="Cognome" error={!!errors.lastName} helperText={errors.lastName?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="email" control={control} render={({ field }) => <TextField {...field} fullWidth label="Email" type="email" error={!!errors.email} helperText={errors.email?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="phone" control={control} render={({ field }) => <TextField {...field} fullWidth label="Telefono" error={!!errors.phone} helperText={errors.phone?.message} />} /></Grid>
            <Grid item xs={12}><Controller name="company" control={control} render={({ field }) => <TextField {...field} fullWidth label="Azienda" error={!!errors.company} helperText={errors.company?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="documentType" control={control} render={({ field }) => <FormControl fullWidth error={!!errors.documentType}><InputLabel>Tipo Documento</InputLabel><Select {...field} label="Tipo Documento"><MenuItem value={DocumentType.CARTA_IDENTITA}>Carta d'Identità</MenuItem><MenuItem value={DocumentType.PASSAPORTO}>Passaporto</MenuItem><MenuItem value={DocumentType.PATENTE}>Patente di Guida</MenuItem><MenuItem value={DocumentType.ALTRO}>Altro</MenuItem></Select></FormControl>} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="documentNumber" control={control} render={({ field }) => <TextField {...field} fullWidth label="Numero Documento" error={!!errors.documentNumber} helperText={errors.documentNumber?.message} />} /></Grid>
            
            {/* File Uploads */}
            <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Foto Visitatore</Typography>
                <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                    Carica Foto
                    <input type="file" hidden accept="image/*" onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)} />
                </Button>
                {photoFile && <Typography variant="body2" sx={{ mt: 1 }}>{photoFile.name}</Typography>}
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>Scansione Documento</Typography>
                <Button component="label" variant="outlined" startIcon={<UploadFile />}>
                    Carica Documento
                    <input type="file" hidden accept=".pdf,image/*" onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)} />
                </Button>
                {documentFile && <Typography variant="body2" sx={{ mt: 1 }}>{documentFile.name}</Typography>}
            </Grid>

            <Grid item xs={12}><Controller name="licensePlate" control={control} render={({ field }) => <TextField {...field} fullWidth label="Targa Veicolo" error={!!errors.licensePlate} helperText={errors.licensePlate?.message} />} /></Grid>
            <Grid item xs={12}><Controller name="notes" control={control} render={({ field }) => <TextField {...field} fullWidth label="Note" multiline rows={3} error={!!errors.notes} helperText={errors.notes?.message} />} /></Grid>
            <Grid item xs={12}><Controller name="privacyConsent" control={control} render={({ field }) => <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Dichiaro di aver letto l'informativa sulla privacy e di prestare il consenso al trattamento dei dati personali." />} /></Grid>
            
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => router.back()} color="inherit">Annulla</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Creazione...' : 'Crea Visitatore'}</Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
}
