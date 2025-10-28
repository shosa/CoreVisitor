'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Card, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Stack, Chip, CircularProgress, Alert } from '@mui/material';
import { Add, Visibility, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { usersApi } from '@/lib/api';
import { User } from '@/types/visitor';

export default function UsersPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersApi.getAll();
      setUsers(res.data);
    } catch (err) {
      setError('Impossibile caricare gli utenti.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente?')) return;

    try {
      await usersApi.delete(id);
      enqueueSnackbar('Utente eliminato con successo', { variant: 'success' });
      loadUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      enqueueSnackbar("Errore durante l'eliminazione dell'utente", { variant: 'error' });
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Gestione Utenti</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => router.push('/users/new')}
          sx={{
            backgroundColor: 'common.black',
            color: 'common.white',
            '&:hover': { backgroundColor: 'grey.800' },
          }}
        >
          Nuovo Utente
        </Button>
      </Stack>

      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Ruolo</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow hover key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Chip label={user.role} size="small" /></TableCell>
                  <TableCell><Chip label={user.active ? 'Attivo' : 'Inattivo'} color={user.active ? 'success' : 'default'} size="small" /></TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton 
                        size="small" 
                        onClick={() => router.push(`/users/${user.id}`)}
                        sx={{
                          backgroundColor: 'common.black',
                          color: 'common.white',
                          borderRadius: 1,
                          '&:hover': { backgroundColor: 'grey.800' },
                        }}
                      ><Visibility fontSize="small" /></IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(user.id)}
                        sx={{
                          backgroundColor: 'common.black',
                          color: 'common.white',
                          borderRadius: 1,
                          '&:hover': { backgroundColor: 'grey.800' },
                        }}
                      ><Delete fontSize="small" /></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
