'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
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
  ListItemButton,
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
  TrendingUp,
  Map,
} from '@mui/icons-material';
import Widget from '@/components/Widget';
import { visitsApi, departmentsApi } from '@/lib/api';
import { Visit, VisitStats, Department } from '@/types/visitor';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

// Helper function to format distance to now (simple implementation)
const formatDistanceToNow = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  let interval = seconds / 31536000; // years
  if (interval > 1) return Math.floor(interval) + ' anni fa';
  interval = seconds / 2592000; // months
  if (interval > 1) return Math.floor(interval) + ' mesi fa';
  interval = seconds / 86400; // days
  if (interval > 1) return Math.floor(interval) + ' giorni fa';
  interval = seconds / 3600; // hours
  if (interval > 1) return Math.floor(interval) + ' ore fa';
  interval = seconds / 60; // minutes
  if (interval > 1) return Math.floor(interval) + ' minuti fa';
  return Math.floor(seconds) + ' secondi fa';
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Widget>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Widget>
  );
}

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
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard' },
        ]}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
        <Tooltip title="Aggiorna dati">
          <IconButton onClick={loadData}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Visitatori Presenti"
            value={stats?.currentVisitors || 0}
            icon={<People sx={{ fontSize: 28 }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Visite Oggi"
            value={stats?.todayVisits || 0}
            icon={<EventAvailable sx={{ fontSize: 28 }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Programmate Oggi"
            value={stats?.scheduledToday || 0}
            icon={<CalendarMonth sx={{ fontSize: 28 }} />}
            color="#ed6c02"
            subtitle="Da effettuare"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Visite Mese"
            value={stats?.totalThisMonth || 0}
            icon={<TrendingUp sx={{ fontSize: 28 }} />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Mappa Interattiva Reparti */}
        <Grid item xs={12} lg={8}>
          <Widget
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                <Map />
                <span>Mappa Reparti - Visitatori in Tempo Reale</span>
              </Stack>
            }
          >
            <Grid container spacing={2}>
              {departments.map((dept) => {
                const visitsInDept = visitsByDepartment[dept.name] || [];
                const hasVisitors = visitsInDept.length > 0;

                return (
                  <Grid item xs={12} sm={6} md={4} key={dept.id}>
                    <Paper
                      elevation={hasVisitors ? 4 : 1}
                      sx={{
                        p: 2,
                        bgcolor: dept.color || '#e0e0e0',
                        color: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        border: hasVisitors ? '2px solid' : '1px solid',
                        borderColor: hasVisitors ? 'white' : 'transparent',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => router.push('/visits/current')}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" fontWeight="bold">
                            {dept.name}
                          </Typography>
                          <Business />
                        </Stack>

                        {dept.floor !== null && (
                          <Typography variant="caption">
                            Piano {dept.floor} • {dept.area}
                          </Typography>
                        )}

                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'rgba(255,255,255,0.2)',
                            borderRadius: 1,
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <People sx={{ fontSize: 32 }} />
                            <Typography variant="h4" fontWeight="bold">
                              {visitsInDept.length}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                            {visitsInDept.length === 0
                              ? 'Nessun visitatore'
                              : visitsInDept.length === 1
                              ? '1 visitatore presente'
                              : `${visitsInDept.length} visitatori presenti`}
                          </Typography>
                        </Box>

                        {visitsInDept.length > 0 && (
                          <Box sx={{ pt: 1, borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                            {visitsInDept.slice(0, 3).map((visit) => (
                              <Typography
                                key={visit.id}
                                variant="caption"
                                sx={{ display: 'block', mb: 0.3 }}
                              >
                                • {visit.visitor?.firstName} {visit.visitor?.lastName}
                                {visit.visitor?.company && ` (${visit.visitor.company})`}
                              </Typography>
                            ))}
                            {visitsInDept.length > 3 && (
                              <Typography variant="caption" fontWeight="bold">
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
          </Widget>
        </Grid>

        {/* Lista Visitatori Presenti */}
        <Grid item xs={12} lg={4}>
          <Widget
            title="Visitatori Presenti"
            action={<Chip label={currentVisits.length} color="primary" size="small" />}
          >
            {currentVisits.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                Nessun visitatore presente
              </Typography>
            ) : (
              <>
                <List sx={{ maxHeight: 500, overflow: 'auto', mb: 2 }}>
                  {currentVisits.map((visit) => (
                    <ListItem
                      key={visit.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: 'background.paper',
                      }}
                      secondaryAction={
                        <Tooltip title="Check-out">
                          <IconButton
                            edge="end"
                            size="small"
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
                          {visit.visitor?.firstName[0]}
                          {visit.visitor?.lastName[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={600}>
                            {visit.visitor?.firstName} {visit.visitor?.lastName}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={0.3} sx={{ mt: 0.5 }}>
                            {visit.visitor?.company && (
                              <Typography variant="caption" color="text.secondary">
                                {visit.visitor.company}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              Host: {visit.host?.name}
                            </Typography>
                            <Typography variant="caption" color="success.main">
                              Entrato{' '}
                              {visit.checkInTime &&
                                formatDistanceToNow(new Date(visit.checkInTime))}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Stack spacing={1}>
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
                    Vedi Tutte
                  </Button>
                </Stack>
              </>
            )}
          </Widget>
        </Grid>
      </Grid>
    </Box>
  );
}

