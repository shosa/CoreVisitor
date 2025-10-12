'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  People,
  EventAvailable,
  CalendarMonth,
  LoginOutlined,
  LogoutOutlined,
  Refresh,
  Person,
  Business,
} from '@mui/icons-material';
import { visitsApi, departmentsApi } from '@/lib/api';
import { Visit, VisitStats, Department } from '@/types/visitor';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [currentVisits, setCurrentVisits] = useState<Visit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [statsRes, visitsRes, deptsRes] = await Promise.all([
        visitsApi.getStats(),
        visitsApi.getCurrent(),
        departmentsApi.getAll(),
      ]);
      setStats(statsRes.data);
      setCurrentVisits(visitsRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh ogni 30 secondi
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckOut = async (visitId: string) => {
    try {
      await visitsApi.checkOut(visitId);
      loadData();
    } catch (error) {
      console.error('Error checking out:', error);
    }
  };

  // Raggruppa visite per reparto per la mappa
  const visitsByDepartment = currentVisits.reduce((acc, visit) => {
    const dept = visit.department || 'Non specificato';
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(visit);
    return acc;
  }, {} as Record<string, Visit[]>);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Caricamento...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header con refresh */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard Visitatori
        </Typography>
        <Tooltip title="Aggiorna dati">
          <IconButton onClick={loadData}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <People sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats?.currentVisitors || 0}
                  </Typography>
                  <Typography variant="body2">Visitatori Presenti</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <EventAvailable sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats?.todayVisits || 0}
                  </Typography>
                  <Typography variant="body2">Visite Oggi</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <CalendarMonth sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats?.scheduledToday || 0}
                  </Typography>
                  <Typography variant="body2">Programmate Oggi</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <EventAvailable sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h3" fontWeight="bold">
                    {stats?.totalThisMonth || 0}
                  </Typography>
                  <Typography variant="body2">Questo Mese</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Mappa Interattiva Reparti */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                🗺️ Mappa Reparti - Visitatori Presenti
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Visualizzazione in tempo reale dei visitatori per reparto
              </Typography>

              <Grid container spacing={2}>
                {departments.map((dept) => {
                  const visitsInDept = visitsByDepartment[dept.name] || [];
                  const hasVisitors = visitsInDept.length > 0;

                  return (
                    <Grid item xs={12} sm={6} md={4} key={dept.id}>
                      <Paper
                        elevation={hasVisitors ? 8 : 1}
                        sx={{
                          p: 2,
                          bgcolor: dept.color || '#e0e0e0',
                          color: 'white',
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          border: hasVisitors ? '3px solid #fff' : 'none',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            elevation: 12,
                          },
                        }}
                        onClick={() => router.push('/visits/current')}
                      >
                        <Stack spacing={1}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="h6" fontWeight="bold">
                              {dept.name}
                            </Typography>
                            <Business />
                          </Stack>

                          {dept.floor !== null && (
                            <Typography variant="caption">
                              Piano {dept.floor} - {dept.area}
                            </Typography>
                          )}

                          <Box sx={{ mt: 2 }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={1}
                            >
                              <People />
                              <Typography variant="h4" fontWeight="bold">
                                {visitsInDept.length}
                              </Typography>
                            </Stack>
                            <Typography variant="caption">
                              {visitsInDept.length === 0
                                ? 'Nessun visitatore'
                                : visitsInDept.length === 1
                                ? '1 visitatore presente'
                                : `${visitsInDept.length} visitatori presenti`}
                            </Typography>
                          </Box>

                          {/* Lista visitatori nel reparto */}
                          {visitsInDept.length > 0 && (
                            <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                              {visitsInDept.slice(0, 3).map((visit) => (
                                <Typography
                                  key={visit.id}
                                  variant="caption"
                                  sx={{ display: 'block' }}
                                >
                                  • {visit.visitor?.firstName}{' '}
                                  {visit.visitor?.lastName}
                                  {visit.visitor?.company &&
                                    ` (${visit.visitor.company})`}
                                </Typography>
                              ))}
                              {visitsInDept.length > 3 && (
                                <Typography variant="caption">
                                  + altri {visitsInDept.length - 3}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Lista Visitatori Presenti con Quick Actions */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="h6" fontWeight="bold">
                  Visitatori Presenti
                </Typography>
                <Chip
                  label={currentVisits.length}
                  color="primary"
                  size="small"
                />
              </Stack>

              {currentVisits.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  Nessun visitatore presente
                </Typography>
              ) : (
                <List sx={{ maxHeight: 600, overflow: 'auto' }}>
                  {currentVisits.map((visit) => (
                    <ListItem
                      key={visit.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                      }}
                      secondaryAction={
                        <Tooltip title="Check-out">
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => handleCheckOut(visit.id)}
                          >
                            <LogoutOutlined />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="bold">
                            {visit.visitor?.firstName} {visit.visitor?.lastName}
                          </Typography>
                        }
                        secondaryTypographyProps={{ component: 'div' }}
                        secondary={
                          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            {visit.visitor?.company && (
                              <Typography variant="caption">
                                🏢 {visit.visitor.company}
                              </Typography>
                            )}
                            <Typography variant="caption">
                              👤 Host: {visit.host?.name}
                            </Typography>
                            <Typography variant="caption">
                              📍 {visit.department} - {visit.area}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                              ⏱️ Entrato{' '}
                              {visit.checkInTime &&
                                formatDistanceToNow(new Date(visit.checkInTime), {
                                  addSuffix: true,
                                  locale: it,
                                })}
                            </Typography>
                            {visit.badgeNumber && (
                              <Chip
                                label={visit.badgeNumber}
                                size="small"
                                sx={{ width: 'fit-content' }}
                              />
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              {/* Quick Actions */}
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<LoginOutlined />}
                  onClick={() => router.push('/visits/new')}
                >
                  Nuova Visita
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => router.push('/visits/current')}
                >
                  Vedi Tutte le Visite in Corso
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
