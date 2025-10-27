'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { Box, Typography, Card, Grid, Stack, Button, Chip, CircularProgress, Alert } from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
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
import { departmentsApi } from '@/lib/api';
import { Department } from '@/types/visitor';
import Breadcrumbs from '@/components/Breadcrumbs';

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
  Default: <Business />,
};

const renderIcon = (iconName?: string) => {
  if (!iconName || !iconMap[iconName]) {
    return iconMap.Default;
  }
  const icon = iconMap[iconName];
  return <icon.type sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />;
};

export default function DepartmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const id = params.id as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDepartment();
    }
  }, [id]);

  const loadDepartment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await departmentsApi.getOne(id);
      setDepartment(res.data);
    } catch (err) {
      setError('Impossibile caricare i dati del dipartimento.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Sei sicuro di voler eliminare questo reparto?')) return;
    try {
      await departmentsApi.delete(id);
      enqueueSnackbar('Reparto eliminato con successo', { variant: 'success' });
      router.push('/departments');
    } catch (err) {
      enqueueSnackbar("Errore durante l'eliminazione del reparto", { variant: 'error' });
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!department) {
    return <Alert severity="info">Nessun dipartimento trovato.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Reparti', href: '/departments' },
          { label: department.name }
        ]}
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/departments')}>
          Tutti i Dipartimenti
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
            onClick={() => router.push(`/departments/${department.id}/edit`)}
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
          <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {renderIcon(department.icon)}
            <Typography variant="h5" fontWeight="bold">
              {department.name}
            </Typography>
            <Chip
              label={department.active ? 'Attivo' : 'Non Attivo'}
              color={department.active ? 'success' : 'default'}
              sx={{ mt: 1 }}
            />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Dettagli Dipartimento</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}><Typography><strong>Descrizione:</strong> {department.description || '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Piano:</strong> {department.floor ?? 'N/A'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Area:</strong> {department.area || 'N/A'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Colore:</strong> 
                <Box component="span" sx={{ ml: 1, width: 20, height: 20, backgroundColor: department.color || 'transparent', display: 'inline-block', verticalAlign: 'middle', border: '1px solid grey' }} />
              </Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Creato il:</strong> {new Date(department.createdAt).toLocaleDateString('it-IT')}</Typography></Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
