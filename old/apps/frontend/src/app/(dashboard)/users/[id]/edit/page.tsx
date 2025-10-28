'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Card, Grid, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl, FormControlLabel, Checkbox, CircularProgress, Alert } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { usersApi, UpdateUserDto } from '@/lib/api';
import { UserRole } from '@/types/visitor';

const schema = yup.object().shape({
  name: yup.string().required('Il nome è obbligatorio'),
  email: yup.string().email('Email non valida').required('L\'email è obbligatoria'),
  password: yup.string().optional().min(6, 'La password deve essere di almeno 6 caratteri'),
  role: yup.mixed<UserRole>().oneOf(Object.values(UserRole)).required('Il ruolo è obbligatorio'),
  phone: yup.string().optional(),
  department: yup.string().optional(),
  active: yup.boolean().default(true),
});

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateUserDto>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getOne(id);
      const userData = res.data;
      reset({
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone || '',
        department: userData.department || '',
        active: userData.active,
      });
    } catch (err) {
      setError('Impossibile caricare i dati dell\'utente.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateUserDto) => {
    // Filter out empty password so it doesn't get updated
    const updateData = { ...data };
    if (!updateData.password) {
      delete updateData.password;
    }

    try {
      await usersApi.update(id, updateData);
      enqueueSnackbar('Utente aggiornato con successo', { variant: 'success' });
      router.push('/users');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Errore durante l\'aggiornamento dell\'utente', { variant: 'error' });
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
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Modifica Utente</Typography>
      <Card sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}><Controller name="name" control={control} render={({ field }) => <TextField {...field} fullWidth label="Nome Completo" error={!!errors.name} helperText={errors.name?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="email" control={control} render={({ field }) => <TextField {...field} fullWidth label="Email" type="email" error={!!errors.email} helperText={errors.email?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="password" control={control} render={({ field }) => <TextField {...field} fullWidth label="Nuova Password (opzionale)" type="password" error={!!errors.password} helperText={errors.password?.message} />} /></Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="role" control={control} render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role}><InputLabel>Ruolo</InputLabel><Select {...field} label="Ruolo">{Object.values(UserRole).map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}</Select></FormControl>
              )} />
            </Grid>
            <Grid item xs={12} sm={6}><Controller name="phone" control={control} render={({ field }) => <TextField {...field} fullWidth label="Telefono (Opzionale)" error={!!errors.phone} helperText={errors.phone?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="department" control={control} render={({ field }) => <TextField {...field} fullWidth label="Dipartimento (Opzionale)" error={!!errors.department} helperText={errors.department?.message} />} /></Grid>
            <Grid item xs={12}><Controller name="active" control={control} render={({ field }) => <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Utente Attivo" />} /></Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => router.back()} color="inherit">Annulla</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Salvataggio...' : 'Salva Modifiche'}</Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
}
