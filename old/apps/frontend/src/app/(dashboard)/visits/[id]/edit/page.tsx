'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Card, Grid, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { visitsApi } from '@/lib/api';
import { Visit, VisitPurpose } from '@/types/visitor';

const schema = yup.object().shape({
  purpose: yup.mixed<VisitPurpose>().oneOf(Object.values(VisitPurpose)).required('Lo scopo è obbligatorio'),
  purposeNotes: yup.string().optional(),
  department: yup.string().optional(),
  scheduledDate: yup.string().required('La data di inizio è obbligatoria'),
  scheduledEndDate: yup.string().optional(),
  notes: yup.string().optional(),
});

export default function EditVisitPage() {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visit, setVisit] = useState<Visit | null>(null);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (id) {
      loadVisit();
    }
  }, [id]);

  const loadVisit = async () => {
    setLoading(true);
    try {
      const res = await visitsApi.getOne(id);
      const visitData = res.data;
      setVisit(visitData);
      reset({
        purpose: visitData.purpose,
        purposeNotes: visitData.purposeNotes || '',
        department: visitData.department || '',
        scheduledDate: new Date(visitData.scheduledDate).toISOString().slice(0, 16), // Format for datetime-local input
        scheduledEndDate: visitData.scheduledEndDate ? new Date(visitData.scheduledEndDate).toISOString().slice(0, 16) : '',
        notes: visitData.notes || ''
      });
    } catch (err) {
      setError('Impossibile caricare i dati della visita.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    try {
      await visitsApi.update(id, {
        ...data,
        scheduledDate: new Date(data.scheduledDate).toISOString(),
        scheduledEndDate: data.scheduledEndDate ? new Date(data.scheduledEndDate).toISOString() : undefined,
      });
      enqueueSnackbar('Visita aggiornata con successo', { variant: 'success' });
      router.push(`/visits/${id}`);
    } catch (error) {
      enqueueSnackbar('Errore durante l\'aggiornamento della visita', { variant: 'error' });
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
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Modifica Visita</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Card sx={{ p: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="purpose"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.purpose}>
                                        <InputLabel>Scopo della visita</InputLabel>
                                        <Select {...field} label="Scopo della visita">
                                            {Object.values(VisitPurpose).map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller name="purposeNotes" control={control} render={({ field }) => <TextField {...field} fullWidth label="Note sullo scopo" error={!!errors.purposeNotes} helperText={errors.purposeNotes?.message} />} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="scheduledDate"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Data e ora programmata"
                                        type="datetime-local"
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.scheduledDate}
                                        helperText={errors.scheduledDate?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="scheduledEndDate"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Data e ora fine (opzionale)"
                                        type="datetime-local"
                                        InputLabelProps={{ shrink: true }}
                                        error={!!errors.scheduledEndDate}
                                        helperText={errors.scheduledEndDate?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller name="department" control={control} render={({ field }) => <TextField {...field} fullWidth label="Dipartimento/Area di destinazione" error={!!errors.department} helperText={errors.department?.message} />} />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller name="notes" control={control} render={({ field }) => <TextField {...field} fullWidth label="Note aggiuntive" multiline rows={4} error={!!errors.notes} helperText={errors.notes?.message} />} />
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                <Card sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Dettagli Fissi</Typography>
                    <Typography variant="subtitle1" fontWeight="bold">Visitatore</Typography>
                    <Typography sx={{ mb: 2 }}>{visit?.visitor?.firstName} {visit?.visitor?.lastName}</Typography>
                    <Typography variant="subtitle1" fontWeight="bold">Ospite</Typography>
                    <Typography>{visit?.host?.name}</Typography>
                </Card>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => router.back()} color="inherit">Annulla</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}</Button>
              </Stack>
            </Grid>
        </Grid>
      </form>
    </Box>
  );
}
