'use client';

import { Box, Typography, Card, Grid, TextField, Button, Stack, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { departmentsApi, CreateDepartmentDto } from '@/lib/api';
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

export default function NewDepartmentPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateDepartmentDto>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      floor: 0,
      area: '',
      color: '#607d8b',
      icon: 'Business',
    }
  });

  const onSubmit = async (data: CreateDepartmentDto) => {
    try {
      await departmentsApi.create(data);
      enqueueSnackbar('Reparto creato con successo', { variant: 'success' });
      router.push('/departments');
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Errore durante la creazione del reparto", { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }}>Nuovo Reparto</Typography>
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
                <Button type="submit" variant="contained" disabled={isSubmitting}>{isSubmitting ? 'Creazione...' : 'Crea Reparto'}</Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Card>
    </Box>
  );
}
