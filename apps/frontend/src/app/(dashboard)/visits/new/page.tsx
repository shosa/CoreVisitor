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
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Save, ArrowBack, ArrowForward, UploadFile } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { visitorsApi, visitsApi, departmentsApi } from '@/lib/api';
import { Visitor, Department } from '@/types/visitor';
import Breadcrumbs from '@/components/Breadcrumbs';

const steps = ['Seleziona/Crea Visitatore', 'Dettagli Visita', 'Conferma'];

export default function NewVisitPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

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
    documentExpiry: '',
    licensePlate: '',
    privacyConsent: false,
  });

  // State per visita
  const [departments, setDepartments] = useState<Department[]>([]);
  const [visitData, setVisitData] = useState({
    hostName: '',
    visitType: 'business',
    purpose: '',
    departmentId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeStart: new Date().toISOString().slice(0, 16),
    scheduledTimeEnd: '', // Opzionale
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [visitorsRes, deptsRes] = await Promise.all([
        visitorsApi.getAll(),
        departmentsApi.getAll(),
      ]);
      setVisitors(visitorsRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0: // Visitor step
        if (selectedVisitor) {
          return true; // Visitor esistente selezionato
        }
        // Nuovo visitatore: verifica campi obbligatori
        if (!newVisitor.firstName.trim() || !newVisitor.lastName.trim()) {
          setError('Nome e Cognome sono obbligatori');
          return false;
        }
        if (!newVisitor.documentType || !newVisitor.documentNumber.trim()) {
          setError('Tipo e Numero documento sono obbligatori');
          return false;
        }
        return true;

      case 1: // Visit details step
        if (!visitData.departmentId) {
          setError('Seleziona un reparto');
          return false;
        }
        if (!visitData.visitType) {
          setError('Seleziona il tipo di visita');
          return false;
        }
        if (!visitData.purpose.trim()) {
          setError('Il motivo della visita è obbligatorio');
          return false;
        }
        if (!visitData.scheduledTimeStart) {
          setError('Data/Ora inizio è obbligatoria');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    setError(null); // Reset error
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null); // Reset error
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
          if (value != null && typeof value !== 'object') {
            formData.append(key, value.toString());
          }
        });

        // Aggiungi i file se presenti
        if (photoFile) {
          formData.append('photo', photoFile);
        }
        if (documentFile) {
          formData.append('document', documentFile);
        }

        const visitorRes = await visitorsApi.create(formData);
        visitorId = visitorRes.data.id;
      }

      if (!visitorId) {
        setError('Seleziona o crea un visitatore');
        setLoading(false);
        return;
      }

      // Step 2: Crea visita
      const visitPayload: any = {
        visitorId,
        departmentId: visitData.departmentId,
        visitType: visitData.visitType,
        purpose: visitData.purpose,
        hostName: visitData.hostName,
        scheduledDate: visitData.scheduledDate,
        scheduledTimeStart: visitData.scheduledTimeStart,
        notes: visitData.notes,
      };

      // Aggiungi scheduledTimeEnd solo se fornito
      if (visitData.scheduledTimeEnd) {
        visitPayload.scheduledTimeEnd = visitData.scheduledTimeEnd;
      }

      const visitRes = await visitsApi.create(visitPayload);

      // Redirect alla lista visite (check-in verrà fatto con PIN al kiosk)
      router.push('/visits');
    } catch (error: any) {
      console.error('Error creating visit:', error);
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
                required
                error={!selectedVisitor && !newVisitor.firstName.trim() && activeStep > 0}
                helperText={!selectedVisitor && !newVisitor.firstName.trim() && activeStep > 0 ? 'Campo obbligatorio' : ''}
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
                required
                error={!selectedVisitor && !newVisitor.lastName.trim() && activeStep > 0}
                helperText={!selectedVisitor && !newVisitor.lastName.trim() && activeStep > 0 ? 'Campo obbligatorio' : ''}
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
              <FormControl fullWidth required disabled={!!selectedVisitor}>
                <InputLabel>Tipo Documento *</InputLabel>
                <Select
                  value={newVisitor.documentType}
                  onChange={(e) =>
                    setNewVisitor({ ...newVisitor, documentType: e.target.value })
                  }
                  label="Tipo Documento *"
                >
                  <MenuItem value="CARTA_IDENTITA">Carta d'Identità</MenuItem>
                  <MenuItem value="PASSAPORTO">Passaporto</MenuItem>
                  <MenuItem value="PATENTE">Patente</MenuItem>
                  <MenuItem value="ALTRO">Altro</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Numero Documento *"
                value={newVisitor.documentNumber}
                onChange={(e) =>
                  setNewVisitor({ ...newVisitor, documentNumber: e.target.value })
                }
                disabled={!!selectedVisitor}
                required
                error={!selectedVisitor && !newVisitor.documentNumber.trim() && activeStep > 0}
                helperText={!selectedVisitor && !newVisitor.documentNumber.trim() && activeStep > 0 ? 'Campo obbligatorio' : ''}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Scadenza Documento"
                type="date"
                value={newVisitor.documentExpiry}
                onChange={(e) =>
                  setNewVisitor({ ...newVisitor, documentExpiry: e.target.value })
                }
                disabled={!!selectedVisitor}
                InputLabelProps={{ shrink: true }}
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

            {/* File Uploads */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Foto Visitatore</Typography>
              <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={!!selectedVisitor}>
                Carica Foto
                <input type="file" hidden accept="image/*" onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)} />
              </Button>
              {photoFile && <Typography variant="body2" sx={{ mt: 1 }}>{photoFile.name}</Typography>}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" gutterBottom>Scansione Documento</Typography>
              <Button component="label" variant="outlined" startIcon={<UploadFile />} disabled={!!selectedVisitor}>
                Carica Documento
                <input type="file" hidden accept=".pdf,image/*" onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)} />
              </Button>
              {documentFile && <Typography variant="body2" sx={{ mt: 1 }}>{documentFile.name}</Typography>}
            </Grid>

            {/* Privacy Consent */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newVisitor.privacyConsent}
                    onChange={(e) =>
                      setNewVisitor({ ...newVisitor, privacyConsent: e.target.checked })
                    }
                    disabled={!!selectedVisitor}
                  />
                }
                label="Dichiaro di aver letto l'informativa sulla privacy e di prestare il consenso al trattamento dei dati personali."
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Host / Referente"
                value={visitData.hostName}
                onChange={(e) =>
                  setVisitData({ ...visitData, hostName: e.target.value })
                }
                helperText="Nome della persona da visitare"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo Visita</InputLabel>
                <Select
                  value={visitData.visitType}
                  onChange={(e) =>
                    setVisitData({ ...visitData, visitType: e.target.value })
                  }
                >
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="personal">Personale</MenuItem>
                  <MenuItem value="delivery">Consegna</MenuItem>
                  <MenuItem value="maintenance">Manutenzione</MenuItem>
                  <MenuItem value="interview">Colloquio</MenuItem>
                  <MenuItem value="other">Altro</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Reparto</InputLabel>
                <Select
                  value={visitData.departmentId}
                  onChange={(e) =>
                    setVisitData({ ...visitData, departmentId: e.target.value })
                  }
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motivo della Visita *"
                value={visitData.purpose}
                onChange={(e) =>
                  setVisitData({ ...visitData, purpose: e.target.value })
                }
                multiline
                rows={2}
                required
                helperText="Descrivi brevemente il motivo della visita"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data/Ora Inizio *"
                type="datetime-local"
                value={visitData.scheduledTimeStart}
                onChange={(e) =>
                  setVisitData({ ...visitData, scheduledTimeStart: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Data/Ora Fine (opzionale)"
                type="datetime-local"
                value={visitData.scheduledTimeEnd}
                onChange={(e) =>
                  setVisitData({ ...visitData, scheduledTimeEnd: e.target.value })
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
                      Host: {visitData.hostName || '-'}
                    </Typography>
                    <Typography variant="body1">
                      Tipo: {visitData.visitType}
                    </Typography>
                    <Typography variant="body1">
                      Motivo: {visitData.purpose}
                    </Typography>
                    <Typography variant="body1">
                      Reparto: {departments.find((d) => d.id === visitData.departmentId)?.name || '-'}
                    </Typography>
                    <Typography variant="body1">
                      Inizio: {new Date(visitData.scheduledTimeStart).toLocaleString('it-IT')}
                    </Typography>
                    {visitData.scheduledTimeEnd && (
                      <Typography variant="body1">
                        Fine: {new Date(visitData.scheduledTimeEnd).toLocaleString('it-IT')}
                      </Typography>
                    )}
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
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Visite', href: '/visits' },
          { label: 'Nuova' }
        ]}
      />
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Registra Nuova Visita
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
                sx={{
                  backgroundColor: 'common.black',
                  color: 'common.white',
                  '&:hover': { backgroundColor: 'grey.800' },
                }}
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
                {loading ? 'Creazione...' : 'Crea Visita'}
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
