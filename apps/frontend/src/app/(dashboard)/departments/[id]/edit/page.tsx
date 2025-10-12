'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Card, Grid, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl, CircularProgress, Alert } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useSnackbar } from 'notistack';
import { departmentsApi, UpdateDepartmentDto } from '@/lib/api';
import {
  Business,
  HomeWork,
  MeetingRoom,
  Warehouse,
  LocalShipping,
  Engineering,
  Biotech,
  Computer,
  Store,
  HelpCenter,
} from '@mui/icons-material';

const iconMap: { [key: string]: React.ReactElement } = {
  Business: <Business />,
  HomeWork: <HomeWork />,
  MeetingRoom: <MeetingRoom />,
  Warehouse: <Warehouse />,
  LocalShipping: <LocalShipping />,
  Engineering: <Engineering />,
  Biotech: <Biotech />,
  Computer: <Computer />,
  Store: <Store />,
  HelpCenter: <HelpCenter />,
};

const schema = yup.object().shape({
  name: yup.string().required('Il nome è obbligatorio'),
  description: yup.string().optional(),
  floor: yup.number().optional(),
  area: yup.string().optional(),
  color: yup.string().matches(/^#[0-9a-fA-F]{6}$/, 'Formato colore non valido (es. #RRGGBB)').optional(),
  icon: yup.string().optional(),
});

export default function EditDepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UpdateDepartmentDto>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (id) {
      loadDepartment();
    }
  }, [id]);

  const loadDepartment = async () => {
    setLoading(true);
    try {
      const res = await departmentsApi.getOne(id);
      const deptData = res.data;
      reset({
        name: deptData.name,
        description: deptData.description,
        floor: deptData.floor,
        area: deptData.area,
        color: deptData.color,
        icon: deptData.icon,
      });
    } catch (err) {
      setError('Impossibile caricare i dati del reparto.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UpdateDepartmentDto) => {
    try {
      await departmentsApi.update(id, data);
      enqueueSnackbar('Reparto aggiornato con successo', { variant: 'success' });
      router.push('/departments');
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Errore durante l'aggiornamento del reparto", { variant: 'error' });
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
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Modifica Reparto</Typography>
      <Card sx={{ p: 4 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}><Controller name="name" control={control} render={({ field }) => <TextField {...field} fullWidth label="Nome Reparto" error={!!errors.name} helperText={errors.name?.message} />} /></Grid>
            <Grid item xs={12}><Controller name="description" control={control} render={({ field }) => <TextField {...field} fullWidth label="Descrizione" multiline rows={2} error={!!errors.description} helperText={errors.description?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="floor" control={control} render={({ field }) => <TextField {...field} fullWidth label="Piano" type="number" error={!!errors.floor} helperText={errors.floor?.message} />} /></Grid>
            <Grid item xs={12} sm={6}><Controller name="area" control={control} render={({ field }) => <TextField {...field} fullWidth label="Area" error={!!errors.area} helperText={errors.area?.message} />} /></Grid>
                        <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel shrink>Colore</InputLabel>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        borderRadius: 1,
                        p: 1,
                        mt: 2.5,
                      }}
                    >
                      <input type="color" {...field} style={{ border: 'none', width: '40px', height: '40px', backgroundColor: 'transparent' }} />
                      <Typography sx={{ ml: 2 }}>{field.value}</Typography>
                    </Box>
                  )}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.icon}>
                    <InputLabel>Icona</InputLabel>
                    <Select {...field} label="Icona">
                      {Object.keys(iconMap).map(iconName => (
                        <MenuItem key={iconName} value={iconName}>
                          <Stack direction="row" alignItems="center" spacing={2}> 
                            {iconMap[iconName]} 
                            <Typography>{iconName}</Typography> 
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
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
