'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  InputAdornment,
  Avatar,
  Chip,
} from '@mui/material';
import { Search, Add, Visibility, Edit, Delete, Person } from '@mui/icons-material';
import { visitorsApi } from '@/lib/api';
import { Visitor } from '@/types/visitor';
import { useRouter } from 'next/navigation';
import { useSnackbar } from 'notistack';
import { translateDocumentType } from '@/lib/translations';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function VisitorsPage() {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    filterVisitors();
  }, [visitors, searchQuery]);

  const loadVisitors = async () => {
    try {
      const res = await visitorsApi.getAll();
      setVisitors(res.data);
    } catch (error) {
      console.error('Error loading visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVisitors = () => {
    if (!searchQuery) {
      setFilteredVisitors(visitors);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = visitors.filter(
      (v) =>
        v.firstName?.toLowerCase().includes(query) ||
        v.lastName?.toLowerCase().includes(query) ||
        v.email?.toLowerCase().includes(query) ||
        v.company?.toLowerCase().includes(query) ||
        v.phone?.includes(query)
    );
    setFilteredVisitors(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo visitatore?')) return;

    try {
      await visitorsApi.delete(id);
      loadVisitors();
    } catch (error) {
      console.error('Error deleting visitor:', error);
      enqueueSnackbar("Errore durante l'eliminazione del visitatore", { variant: 'error' });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Visitatori' },
        ]}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Visitatori
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => router.push('/visitors/new')}
          sx={{
            backgroundColor: 'common.black',
            color: 'common.white',
            '&:hover': { backgroundColor: 'grey.800' },
          }}
        >
          Nuovo Visitatore
        </Button>
      </Stack>

      <Card sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Cerca per nome, cognome, email, azienda, telefono..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Card>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {visitors.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Totale Visitatori
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              {visitors.filter((v) => v.company).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Con Azienda
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Typography>Caricamento...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Visitatore</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Telefono</TableCell>
                <TableCell>Azienda</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Visite</TableCell>
                <TableCell>Registrato</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVisitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Nessun visitatore trovato
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {visitor.firstName} {visitor.lastName}
                          </Typography>
                          {visitor.privacyConsent && (
                            <Chip label="Consenso" size="small" color="success" />
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{visitor.email || '-'}</TableCell>
                    <TableCell>{visitor.phone || '-'}</TableCell>
                    <TableCell>{visitor.company || '-'}</TableCell>
                    <TableCell>
                      {visitor.documentType && visitor.documentNumber ? (
                        <>
                          {translateDocumentType(visitor.documentType)}
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {visitor.documentNumber}
                          </Typography>
                        </>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={visitor.visits?.length || 0}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(visitor.createdAt).toLocaleDateString('it-IT')}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={() => router.push(`/visitors/${visitor.id}`)}
                          sx={{
                            bgcolor: 'black',
                            color: 'white',
                            borderRadius: '6px',
                            '&:hover': { bgcolor: 'grey.800' },
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(visitor.id)}
                          sx={{
                            bgcolor: 'black',
                            color: 'white',
                            borderRadius: '6px',
                            '&:hover': { bgcolor: 'grey.800' },
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
