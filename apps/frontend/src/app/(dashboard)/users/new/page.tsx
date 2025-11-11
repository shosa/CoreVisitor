'use client';

import { Box, Typography, Card, Grid, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl, FormControlLabel, Checkbox } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { usersApi, CreateUserDto } from '@/lib/api';
import { UserRole } from '@/types/visitor';
import Breadcrumbs from '@/components/Breadcrumbs';

const schema = yup.object().shape({
  firstName: yup.string().required('Il nome è obbligatorio'),
  lastName: yup.string().required('Il cognome è obbligatorio'),
  email: yup.string().email('Email non valida').required('L\'email è obbligatoria'),
  password: yup.string().min(6, 'La password deve essere di almeno 6 caratteri').required('La password è obbligatoria'),
  role: yup.mixed<UserRole>().oneOf(Object.values(UserRole)).required('Il ruolo è obbligatorio'),
  phone: yup.string().optional(),
  department: yup.string().optional(),
  isActive: yup.boolean().default(true),
});

export default function NewUserPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateUserDto>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: UserRole.RECEPTIONIST,
      phone: '',
      department: '',
      isActive: true,
    }
  });

  const onSubmit = async (data: CreateUserDto) => {
    try {
      await usersApi.create(data);
      enqueueSnackbar('Utente creato con successo', { variant: 'success' });
      router.push('/users');
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Errore durante la creazione dell\'utente', { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Utenti', href: '/users' },
          { label: 'Nuovo' }
        ]}
      />
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Nuovo Utente</Typography>
      <Card sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}><Controller name="firstName" control={control} render={({ field }) => <TextField {...field} fullWidth label="Nome" error={!!errors.firstName} helperText={errors.firstName?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="lastName" control={control} render={({ field }) => <TextField {...field} fullWidth label="Cognome" error={!!errors.lastName} helperText={errors.lastName?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="email" control={control} render={({ field }) => <TextField {...field} fullWidth label="Email" type="email" error={!!errors.email} helperText={errors.email?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="password" control={control} render={({ field }) => <TextField {...field} fullWidth label="Password" type="password" error={!!errors.password} helperText={errors.password?.message} />} /></Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.role}>
                    <InputLabel>Ruolo</InputLabel>
                    <Select {...field} label="Ruolo">
                      {Object.values(UserRole).map(role => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}><Controller name="phone" control={control} render={({ field }) => <TextField {...field} fullWidth label="Telefono (Opzionale)" error={!!errors.phone} helperText={errors.phone?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="department" control={control} render={({ field }) => <TextField {...field} fullWidth label="Dipartimento (Opzionale)" error={!!errors.department} helperText={errors.department?.message} />} /></Grid>
            <Grid item xs={12}>
              <Controller name="isActive" control={control} render={({ field }) => <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label="Utente Attivo" />} />
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button onClick={() => router.back()} color="inherit">Annulla</Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Creazione...' : 'Crea Utente'}</Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
}
