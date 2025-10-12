'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack,
  Avatar,
} from '@mui/material';
import { LogoutOutlined, QrCode2, Refresh } from '@mui/icons-material';
import { visitsApi } from '@/lib/api';
import { Visit } from '@/types/visitor';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function CurrentVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  const loadVisits = async () => {
    try {
      const res = await visitsApi.getCurrent();
      setVisits(res.data);
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
    const interval = setInterval(loadVisits, 30000); // Auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleCheckOut = async (id: string) => {
    try {
      await visitsApi.checkOut(id);
      loadVisits();
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  const handlePrintBadge = async (id: string) => {
    try {
      const res = await visitsApi.getBadge(id);
      // TODO: Aprire modale con badge per stampa
      console.log('Badge data:', res.data);
    } catch (error) {
      console.error('Error getting badge:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Visite in Corso
        </Typography>
        <Stack direction="row" spacing={2}>
          <Chip label={`${visits.length} presenti`} color="primary" />
          <IconButton onClick={loadVisits}>
            <Refresh />
          </IconButton>
        </Stack>
      </Stack>

      {loading ? (
        <Typography>Caricamento...</Typography>
      ) : visits.length === 0 ? (
        <Card>
          <CardContent>
            <Typography align="center" color="text.secondary">
              Nessun visitatore presente al momento
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Visitatore</TableCell>
                <TableCell>Azienda</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Reparto/Area</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Check-in</TableCell>
                <TableCell>Badge</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visits.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {visit.visitor?.firstName[0]}
                        {visit.visitor?.lastName[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {visit.visitor?.firstName} {visit.visitor?.lastName}
                        </Typography>
                        {visit.visitor?.email && (
                          <Typography variant="caption" color="text.secondary">
                            {visit.visitor.email}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>{visit.visitor?.company || '-'}</TableCell>
                  <TableCell>{visit.host?.name}</TableCell>
                  <TableCell>
                    {visit.department}
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      {visit.area}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={visit.purpose} size="small" />
                  </TableCell>
                  <TableCell>
                    {visit.checkInTime &&
                      format(new Date(visit.checkInTime), 'HH:mm', { locale: it })}
                  </TableCell>
                  <TableCell>
                    {visit.badgeNumber && (
                      <Chip label={visit.badgeNumber} size="small" color="success" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handlePrintBadge(visit.id)}
                      >
                        <QrCode2 />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleCheckOut(visit.id)}
                      >
                        <LogoutOutlined />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
