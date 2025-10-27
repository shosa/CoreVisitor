'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Typography, Card, Grid, Stack, Button, Chip, CircularProgress, Alert, Avatar } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent } from '@mui/lab';
import { ArrowBack, Edit, Person, Login, Logout, AddCircle, Update, Delete, CheckCircle, ExitToApp, Badge } from '@mui/icons-material';
import { usersApi, auditLogsApi, AuditLog } from '@/lib/api';
import { User } from '@/types/visitor';
import Breadcrumbs from '@/components/Breadcrumbs';

const getActionIcon = (action: string) => {
  switch (action) {
    case 'login': return <Login />;
    case 'logout': return <Logout />;
    case 'create': return <AddCircle />;
    case 'update': return <Update />;
    case 'delete': return <Delete />;
    case 'check_in': return <CheckCircle />;
    case 'check_out': return <ExitToApp />;
    case 'badge_issued': return <Badge />;
    default: return <Update />;
  }
};

const getActionColor = (action: string): 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
  switch (action) {
    case 'login': return 'success';
    case 'logout': return 'info';
    case 'create': return 'primary';
    case 'update': return 'warning';
    case 'delete': return 'error';
    case 'check_in': return 'success';
    case 'check_out': return 'info';
    case 'badge_issued': return 'secondary';
    default: return 'info';
  }
};

const translateAction = (action: string): string => {
  const translations: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    create: 'Creazione',
    update: 'Modifica',
    delete: 'Eliminazione',
    check_in: 'Check-in',
    check_out: 'Check-out',
    badge_issued: 'Badge emesso',
  };
  return translations[action] || action;
};

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadUser();
      loadAuditLogs();
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

  const loadAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await auditLogsApi.getByUser(id, 20);
      setAuditLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLogsLoading(false);
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
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Utenti', href: '/users' },
          { label: `${user.firstName} ${user.lastName}` }
        ]}
      />
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
            <Typography variant="h5" fontWeight="bold">{user.firstName} {user.lastName}</Typography>
            <Typography color="text.secondary">{user.email}</Typography>
            <Chip label={user.role} color="primary" sx={{ mt: 2 }} />
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Dettagli Utente</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><Typography><strong>Nome:</strong> {user.firstName} {user.lastName}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Email:</strong> {user.email}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Telefono:</strong> {user.phone || '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Dipartimento:</strong> {user.department || '-'}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Stato:</strong> <Chip label={user.isActive ? 'Attivo' : 'Inattivo'} color={user.isActive ? 'success' : 'default'} size="small" /></Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Membro dal:</strong> {new Date(user.createdAt).toLocaleDateString('it-IT')}</Typography></Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>Log Attività</Typography>
            {logsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : auditLogs.length === 0 ? (
              <Alert severity="info">Nessuna attività registrata</Alert>
            ) : (
              <Timeline position="right">
                {auditLogs.map((log, index) => (
                  <TimelineItem key={log.id}>
                    <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
                      <Typography variant="caption">
                        {new Date(log.createdAt).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Typography>
                      <br />
                      <Typography variant="caption">
                        {new Date(log.createdAt).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineDot color={getActionColor(log.action)}>
                        {getActionIcon(log.action)}
                      </TimelineDot>
                      {index < auditLogs.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body1" fontWeight={600}>
                        {translateAction(log.action)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {log.entityType}: {log.entityName || log.entityId || '-'}
                      </Typography>
                      {log.details && (
                        <Typography variant="caption" color="text.secondary">
                          {log.details}
                        </Typography>
                      )}
                      {log.ipAddress && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          IP: {log.ipAddress}
                        </Typography>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
