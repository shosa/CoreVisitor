'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Card, Grid, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { visitsApi } from '@/lib/api';
import { Visit } from '@/types/visitor';
import Breadcrumbs from '@/components/Breadcrumbs';

const schema = yup.object().shape({
  purpose: yup.string().required('Lo scopo è obbligatorio'),
  purposeNotes: yup.string().optional(),
  departmentId: yup.number().optional(),
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
  const [departments, setDepartments] = useState<any[]>([]);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (id) {
      loadVisit();
      loadDepartments();
    }
  }, [id]);

  const loadDepartments = async () => {
    try {
      const { departmentsApi } = await import('@/lib/api');
      const res = await departmentsApi.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const loadVisit = async () => {
    setLoading(true);
    try {
      const res = await visitsApi.getOne(id);
      const visitData = res.data;
      setVisit(visitData);
      reset({
        purpose: visitData.purpose || '',
        purposeNotes: visitData.purposeNotes || '',
        departmentId: visitData.departmentId || '',
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
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Visite', href: '/visits' },
          { label: visit?.purpose || id, href: `/visits/${id}` },
          { label: 'Modifica' }
        ]}
      />
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
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Scopo della visita"
                                        error={!!errors.purpose}
                                        helperText={errors.purpose?.message}
                                    />
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
                            <Controller
                                name="departmentId"
                                control={control}
                                render={({ field }) => (
                                    <FormControl fullWidth error={!!errors.departmentId}>
                                        <InputLabel>Dipartimento/Area di destinazione</InputLabel>
                                        <Select {...field} label="Dipartimento/Area di destinazione">
                                            <MenuItem value="">Nessuno</MenuItem>
                                            {departments.map(dept => (
                                                <MenuItem key={dept.id} value={dept.id}>
                                                    {dept.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                            />
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
                    <Typography>
                        {visit?.hostUser
                            ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}`
                            : visit?.hostName || 'N/A'}
                    </Typography>
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
