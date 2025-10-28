'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Stack,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { Save, ArrowBack, ArrowForward } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { visitorsApi, visitsApi, usersApi, departmentsApi } from '@/lib/api';
import { Visitor, VisitPurpose, Department } from '@/types/visitor';

const steps = ['Seleziona/Crea Visitatore', 'Dettagli Visita', 'Conferma'];

export default function NewVisitPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State per visitatore
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [newVisitor, setNewVisitor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    documentType: 'CARTA_IDENTITA',
    documentNumber: '',
    licensePlate: '',
    privacyConsent: false,
  });

  // State per visita
  const [hosts, setHosts] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [visitData, setVisitData] = useState({
    hostId: '',
    purpose: VisitPurpose.RIUNIONE,
    purposeNotes: '',
    department: '',
    area: '',
    scheduledDate: new Date().toISOString().slice(0, 16),
    scheduledEndDate: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [visitorsRes, hostsRes, deptsRes] = await Promise.all([
        visitorsApi.getAll(),
        usersApi.getAll(),
        departmentsApi.getAll(),
      ]);
      setVisitors(visitorsRes.data);
      setHosts(hostsRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleCreateVisit = async () => {
    setLoading(true);
    setError('');

    try {
      let visitorId = selectedVisitor?.id;

      // Step 1: Crea visitatore se nuovo
      if (!visitorId && newVisitor.firstName && newVisitor.lastName) {
        const formData = new FormData();
        Object.entries(newVisitor).forEach(([key, value]) => {
          formData.append(key, value.toString());
        });
        const visitorRes = await visitorsApi.create(formData);
        visitorId = visitorRes.data.id;
      }

      if (!visitorId) {
        setError('Seleziona o crea un visitatore');
        setLoading(false);
        return;
      }

      // Step 2: Crea visita
      const visitRes = await visitsApi.create({
        ...visitData,
        visitorId,
      });

      // Step 3: Check-in automatico
      await visitsApi.checkIn(visitRes.data.id);

      // Redirect alla dashboard
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Errore durante la creazione');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Visitatore Esistente
              </Typography>
              <Autocomplete
                options={visitors}
                getOptionLabel={(option) =>
                  `${option.firstName} ${option.lastName}${
                    option.company ? ` - ${option.company}` : ''
                  }`
                }
                value={selectedVisitor}
                onChange={(_, value) => setSelectedVisitor(value)}
                renderInput={(params) => (
                  <TextField {...params} label="Cerca visitatore" />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Oppure Nuovo Visitatore
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nome *"
                value={newVisitor.firstName}
                onChange={(e) =>
                  setNewVisitor({ ...newVisitor, firstName: e.target.value })
                }
                disabled={!!selectedVisitor}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cognome *"
                value={newVisitor.lastName}
                onChange={(e) =>
                  setNewVisitor({ ...newVisitor, lastName: e.target.value })
                }
                disabled={!!selectedVisitor}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newVisitor.email}
                onChange={(e) =>
                  setNewVisitor({ ...newVisitor, email: e.target.value })
                }
                disabled={!!selectedVisitor}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefono"
                value={newVisitor.phone}
                onChange={(e) =>
                  setNewVisitor({ ...newVisitor, phone: e.target.value })
                }
                disabled={!!selectedVisitor}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Azienda"
                value={newVisitor.company}
                onChange={(e) =>
                  setNewVisitor({ ...newVisitor, company: e.target.value })
                }
                disabled={!!selectedVisitor}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Numero Documento"
                value={newVisitor.documentNumber}
                onChange={(e) =>
                  setNewVisitor({ ...newVisitor, documentNumber: e.target.value })
                }
                disabled={!!selectedVisitor}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Targa Veicolo"
                value={newVisitor.licensePlate}
                onChange={(e) =>
                  setNewVisitor({ ...newVisitor, licensePlate: e.target.value })
                }
                disabled={!!selectedVisitor}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Host / Referente</InputLabel>
                <Select
                  value={visitData.hostId}
                  onChange={(e) =>
                    setVisitData({ ...visitData, hostId: e.target.value })
                  }
                >
                  {hosts.map((host) => (
                    <MenuItem key={host.id} value={host.id}>
                      {host.name} - {host.department}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Motivo Visita</InputLabel>
                <Select
                  value={visitData.purpose}
                  onChange={(e) =>
                    setVisitData({
                      ...visitData,
                      purpose: e.target.value as VisitPurpose,
                    })
                  }
                >
                  <MenuItem value="RIUNIONE">Riunione</MenuItem>
                  <MenuItem value="CONSEGNA">Consegna</MenuItem>
                  <MenuItem value="MANUTENZIONE">Manutenzione</MenuItem>
                  <MenuItem value="COLLOQUIO">Colloquio</MenuItem>
                  <MenuItem value="FORMAZIONE">Formazione</MenuItem>
                  <MenuItem value="AUDIT">Audit</MenuItem>
                  <MenuItem value="ALTRO">Altro</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Reparto</InputLabel>
                <Select
                  value={visitData.department}
                  onChange={(e) => {
                    const dept = departments.find((d) => d.name === e.target.value);
                    setVisitData({
                      ...visitData,
                      department: e.target.value,
                      area: dept?.area || '',
                    });
                  }}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note Motivo"
                multiline
                rows={2}
                value={visitData.purposeNotes}
                onChange={(e) =>
                  setVisitData({ ...visitData, purposeNotes: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data/Ora Inizio"
                type="datetime-local"
                value={visitData.scheduledDate}
                onChange={(e) =>
                  setVisitData({ ...visitData, scheduledDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data/Ora Fine (opzionale)"
                type="datetime-local"
                value={visitData.scheduledEndDate}
                onChange={(e) =>
                  setVisitData({ ...visitData, scheduledEndDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note"
                multiline
                rows={3}
                value={visitData.notes}
                onChange={(e) =>
                  setVisitData({ ...visitData, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Riepilogo
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Visitatore
                    </Typography>
                    <Typography variant="body1">
                      {selectedVisitor
                        ? `${selectedVisitor.firstName} ${selectedVisitor.lastName}`
                        : `${newVisitor.firstName} ${newVisitor.lastName}`}
                    </Typography>
                    {(selectedVisitor?.company || newVisitor.company) && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedVisitor?.company || newVisitor.company}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary">
                      Dettagli Visita
                    </Typography>
                    <Typography variant="body1">
                      Host:{' '}
                      {hosts.find((h) => h.id === visitData.hostId)?.name || '-'}
                    </Typography>
                    <Typography variant="body1">
                      Motivo: {visitData.purpose}
                    </Typography>
                    <Typography variant="body1">
                      Reparto: {visitData.department} - {visitData.area}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Nuova Visita / Check-in
      </Typography>

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBack />}
            >
              Indietro
            </Button>

            <Box sx={{ flex: 1 }} />

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForward />}
              >
                Avanti
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={handleCreateVisit}
                disabled={loading}
                startIcon={<Save />}
              >
                {loading ? 'Creazione...' : 'Conferma e Check-in'}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
