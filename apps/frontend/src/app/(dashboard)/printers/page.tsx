'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { printerApi, PrinterConfig, PrinterStatus, QueueStatus } from '@/lib/api';

export default function PrintersPage() {
  const [configs, setConfigs] = useState<PrinterConfig[]>([]);
  const [printerStatus, setPrinterStatus] = useState<PrinterStatus | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PrinterConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'escpos',
    connection: 'usb',
    address: '',
    port: 9100,
    isDefault: false,
    isActive: true,
  });
  const [testingPrinter, setTestingPrinter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadQueueStatus, 5000); // Refresh queue every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configsRes, statusRes, queueRes] = await Promise.all([
        printerApi.getConfigs(),
        printerApi.getStatus().catch(() => ({ data: { connected: false } })),
        printerApi.getQueueStatus().catch(() => ({ data: { pending: 0, printing: 0, completed: 0, failed: 0 } })),
      ]);

      setConfigs(configsRes.data);
      setPrinterStatus(statusRes.data);
      setQueueStatus(queueRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nel caricamento dati');
    } finally {
      setLoading(false);
    }
  };

  const loadQueueStatus = async () => {
    try {
      const res = await printerApi.getQueueStatus();
      setQueueStatus(res.data);
    } catch (err) {
      // Silent fail for background updates
    }
  };

  const handleOpenDialog = (config?: PrinterConfig) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        type: config.type,
        connection: config.connection,
        address: config.address || '',
        port: config.port || 9100,
        isDefault: config.isDefault,
        isActive: config.isActive,
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: '',
        type: 'escpos',
        connection: 'usb',
        address: '',
        port: 9100,
        isDefault: false,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingConfig(null);
    setError(null);
  };

  const handleSave = async () => {
    try {
      setError(null);
      const data = {
        ...formData,
        settings: null,
      };

      if (editingConfig) {
        await printerApi.updateConfig(editingConfig.id, data);
        setSuccess('Configurazione aggiornata con successo');
      } else {
        await printerApi.createConfig(data as any);
        setSuccess('Configurazione creata con successo');
      }

      handleCloseDialog();
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nel salvataggio');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questa configurazione?')) return;

    try {
      await printerApi.deleteConfig(id);
      setSuccess('Configurazione eliminata con successo');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nell\'eliminazione');
    }
  };

  const handleTestPrint = async () => {
    try {
      setTestingPrinter(true);
      setError(null);
      await printerApi.test();
      setSuccess('Stampa di test inviata con successo!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nella stampa di test');
    } finally {
      setTestingPrinter(false);
    }
  };

  const handleInitPrinter = async (config: PrinterConfig) => {
    try {
      setError(null);
      await printerApi.init({
        type: config.connection as any,
        address: config.address || undefined,
        port: config.port || undefined,
      });
      setSuccess('Stampante inizializzata con successo');
      await loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Errore nell\'inizializzazione');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gestione Stampanti</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuova Stampante
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Status Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Stato Stampante
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                {printerStatus?.connected ? (
                  <>
                    <CheckCircleIcon color="success" />
                    <Typography>Connessa</Typography>
                  </>
                ) : (
                  <>
                    <ErrorIcon color="error" />
                    <Typography>Non connessa</Typography>
                  </>
                )}
              </Box>
              {printerStatus?.type && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Tipo: {printerStatus.type}
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button
                size="small"
                startIcon={<PrintIcon />}
                onClick={handleTestPrint}
                disabled={!printerStatus?.connected || testingPrinter}
              >
                {testingPrinter ? 'Stampa in corso...' : 'Test Stampa'}
              </Button>
              <Button size="small" startIcon={<RefreshIcon />} onClick={loadData}>
                Aggiorna
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Coda di Stampa
              </Typography>
              {queueStatus && (
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">In attesa:</Typography>
                    <Chip label={queueStatus.pending} size="small" color="warning" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">In stampa:</Typography>
                    <Chip label={queueStatus.printing} size="small" color="info" />
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Completati:</Typography>
                    <Chip label={queueStatus.completed} size="small" color="success" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Falliti:</Typography>
                    <Chip label={queueStatus.failed} size="small" color="error" />
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Printer Configs */}
      <Typography variant="h6" mb={2}>
        Configurazioni Stampanti
      </Typography>

      {configs.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              Nessuna stampante configurata
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {configs.map((config) => (
            <Grid item xs={12} md={6} key={config.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                    <Box>
                      <Typography variant="h6">{config.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {config.type.toUpperCase()} - {config.connection.toUpperCase()}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      {config.isDefault && <Chip label="Predefinita" size="small" color="primary" />}
                      {config.isActive ? (
                        <Chip label="Attiva" size="small" color="success" />
                      ) : (
                        <Chip label="Disattiva" size="small" color="default" />
                      )}
                    </Box>
                  </Box>

                  {config.address && (
                    <Typography variant="body2" color="text.secondary">
                      Indirizzo: {config.address}
                      {config.port && `:${config.port}`}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => handleInitPrinter(config)}
                    disabled={!config.isActive}
                  >
                    Inizializza
                  </Button>
                  <Button size="small" startIcon={<EditIcon />} onClick={() => handleOpenDialog(config)}>
                    Modifica
                  </Button>
                  <IconButton size="small" color="error" onClick={() => handleDelete(config.id)}>
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingConfig ? 'Modifica Stampante' : 'Nuova Stampante'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Nome"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Tipo Connessione</InputLabel>
              <Select
                value={formData.connection}
                label="Tipo Connessione"
                onChange={(e) => setFormData({ ...formData, connection: e.target.value })}
              >
                <MenuItem value="usb">USB</MenuItem>
                <MenuItem value="network">Network</MenuItem>
                <MenuItem value="file">File (Test)</MenuItem>
              </Select>
            </FormControl>

            {formData.connection === 'network' && (
              <>
                <TextField
                  label="Indirizzo IP"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="192.168.1.100"
                  required
                  fullWidth
                />
                <TextField
                  label="Porta"
                  type="number"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                  required
                  fullWidth
                />
              </>
            )}

            {formData.connection === 'usb' && (
              <TextField
                label="Device Path (opzionale)"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="/dev/usb/lp0 o lascia vuoto per auto-detect"
                fullWidth
              />
            )}

            {formData.connection === 'file' && (
              <TextField
                label="File Path"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="./print-output.txt"
                required
                fullWidth
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                />
              }
              label="Imposta come stampante predefinita"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Attiva"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annulla</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>
            Salva
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
