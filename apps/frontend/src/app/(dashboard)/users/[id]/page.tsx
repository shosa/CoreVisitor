'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Card, Grid, Stack, Button, Chip, CircularProgress, Alert, Avatar } from '@mui/material';
import { ArrowBack, Edit, Person } from '@mui/icons-material';
import { usersApi } from '@/lib/api';
import { User } from '@/types/visitor';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    setLoading(true);
    try {
      const res = await usersApi.getOne(id);
      setUser(res.data);
    } catch (err) {
      setError("Impossibile caricare i dati dell'utente.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!user) {
    return <Alert severity="info">Nessun utente trovato.</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => router.push('/users')}>
          Tutti gli Utenti
        </Button>
        <Button
          variant="contained"
          startIcon={<Edit />}
          onClick={() => router.push(`/users/${user.id}/edit`)}
          sx={{
            backgroundColor: 'common.black',
            color: 'common.white',
            '&:hover': { backgroundColor: 'grey.800' },
          }}
        >
          Modifica Utente
        </Button>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ width: 100, height: 100, mb: 2 }}><Person sx={{ fontSize: 60 }} /></Avatar>
            <Typography variant="h5" fontWeight="bold">{user.name}</Typography>
            <Typography color="text.secondary">{user.email}</Typography>
            <Chip label={user.role} color="primary" sx={{ mt: 2 }} />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Dettagli Utente</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><Typography><strong>Nome:</strong> {user.name}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Email:</strong> {user.email}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Telefono:</strong> {user.phone || '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Dipartimento:</strong> {user.department || '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Stato:</strong> <Chip label={user.active ? 'Attivo' : 'Inattivo'} color={user.active ? 'success' : 'default'} size="small" /></Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Membro dal:</strong> {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: it })}</Typography></Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
