'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
  IconButton,
  Stack,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import {
  Search,
  Visibility,
  AddCircle,
  FileDownload,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { visitsApi, departmentsApi } from '@/lib/api';
import { Visit, VisitStatus, Department } from '@/types/visitor';
import { format, startOfDay, endOfDay } from 'date-fns';
import { translateVisitStatus, getVisitStatusColor, translateVisitType } from '@/lib/translations';
import { it } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function VisitsPage() {
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filteredVisits, setFilteredVisits] = useState<Visit[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterVisits();
  }, [visits, statusFilter, searchQuery, departmentFilter, dateFrom, dateTo]);

  const loadData = async () => {
    try {
      const [visitsRes, deptsRes] = await Promise.all([
        visitsApi.getAll(),
        departmentsApi.getAll(),
      ]);
      setVisits(visitsRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error('Error loading visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterVisits = () => {
    let filtered = visits;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((v) => v.status === statusFilter);
    }

    // Filter by department
    if (departmentFilter !== 'ALL') {
      filtered = filtered.filter((v) => v.department === departmentFilter);
    }

    // Filter by date range
    if (dateFrom) {
      const from = startOfDay(new Date(dateFrom));
      filtered = filtered.filter((v) => new Date(v.scheduledDate) >= from);
    }
    if (dateTo) {
      const to = endOfDay(new Date(dateTo));
      filtered = filtered.filter((v) => new Date(v.scheduledDate) <= to);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.visitor?.firstName?.toLowerCase().includes(query) ||
          v.visitor?.lastName?.toLowerCase().includes(query) ||
          v.visitor?.company?.toLowerCase().includes(query) ||
          v.hostName?.toLowerCase().includes(query) ||
          (v.hostUser && `${v.hostUser.firstName} ${v.hostUser.lastName}`.toLowerCase().includes(query)) ||
          v.badgeNumber?.toLowerCase().includes(query) ||
          v.department?.name?.toLowerCase().includes(query)
      );
    }

    setFilteredVisits(filtered);
  };

  const handleExportCSV = () => {
    const headers = [
      'Data/Ora',
      'Visitatore',
      'Azienda',
      'Host',
      'Reparto',
      'Area',
      'Motivo',
      'Badge',
      'Stato',
      'Check-in',
      'Check-out',
    ];

    const rows = filteredVisits.map((v) => [
      format(new Date(v.scheduledDate), 'dd/MM/yyyy HH:mm'),
      `${v.visitor?.firstName} ${v.visitor?.lastName}`,
      v.visitor?.company || '',
      v.hostUser ? `${v.hostUser.firstName} ${v.hostUser.lastName}` : v.hostName || '',
      v.department?.name || '',
      v.department?.area || '',
      v.purpose,
      v.badgeNumber || '',
      v.status,
      v.actualCheckIn ? format(new Date(v.actualCheckIn), 'dd/MM/yyyy HH:mm') : '',
      v.actualCheckOut ? format(new Date(v.actualCheckOut), 'dd/MM/yyyy HH:mm') : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visite_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    link.click();
    setExportMenuAnchor(null);
  };

  const handleClearFilters = () => {
    setStatusFilter('ALL');
    setDepartmentFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
  };


  const activeFiltersCount =
    (statusFilter !== 'ALL' ? 1 : 0) +
    (departmentFilter !== 'ALL' ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0);

  return (
    <Box sx={{ p: 3 }}>
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Visite' },
        ]}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Tutte le Visite
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip label={`${filteredVisits.length} visite`} color="primary" />
          <IconButton onClick={loadData}>
            <Refresh />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<FileDownload />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          >
            Esporta
          </Button>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() => router.push('/visits/new')}
          >
            Nuova Visita
          </Button>
        </Stack>
      </Stack>

      <Card sx={{ mb: 3 }}>
        <Box sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              placeholder="Cerca per visitatore, azienda, host, badge, reparto..."
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
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              startIcon={<FilterList />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtri
              {activeFiltersCount > 0 && ` (${activeFiltersCount})`}
            </Button>
          </Stack>

          {showFilters && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Reparto</InputLabel>
                  <Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    label="Reparto"
                  >
                    <MenuItem value="ALL">Tutti</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Da Data"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="A Data"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleClearFilters}
                  disabled={activeFiltersCount === 0}
                >
                  Azzera Filtri
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>

        <Tabs
          value={statusFilter}
          onChange={(_, value) => setStatusFilter(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Tutte" value="ALL" />
          <Tab label="In Corso" value={VisitStatus.CHECKED_IN} />
          <Tab label="Programmate" value={VisitStatus.SCHEDULED} />
          <Tab label="Completate" value={VisitStatus.CHECKED_OUT} />
          <Tab label="Cancellate" value={VisitStatus.CANCELLED} />
        </Tabs>
      </Card>

      {loading ? (
        <Typography>Caricamento...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Data/Ora</TableCell>
                <TableCell>Visitatore</TableCell>
                <TableCell>Azienda</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Reparto</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell>Badge</TableCell>
                <TableCell>Stato</TableCell>
                <TableCell align="right">Azioni</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVisits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    Nessuna visita trovata
                  </TableCell>
                </TableRow>
              ) : (
                filteredVisits.map((visit) => (
                  <TableRow key={visit.id} hover>
                    <TableCell>
                      {format(new Date(visit.scheduledDate), 'dd/MM/yyyy HH:mm', {
                        locale: it,
                      })}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {visit.visitor?.firstName} {visit.visitor?.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{visit.visitor?.company || '-'}</TableCell>
                    <TableCell>
                      {visit.hostUser
                        ? `${visit.hostUser.firstName} ${visit.hostUser.lastName}`
                        : visit.hostName || '-'}
                    </TableCell>
                    <TableCell>
                      {visit.department?.name || '-'}
                      {visit.department?.area && (
                        <>
                          <br />
                          <Typography variant="caption" color="text.secondary">
                            {visit.department.area}
                          </Typography>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={visit.purpose} size="small" />
                    </TableCell>
                    <TableCell>
                      {visit.badgeNumber && (
                        <Chip label={visit.badgeNumber} size="small" color="success" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={translateVisitStatus(visit.status)}
                        size="small"
                        color={getVisitStatusColor(visit.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/visits/${visit.id}`)}
                        sx={{
                          bgcolor: 'black',
                          color: 'white',
                          borderRadius: '6px',
                          '&:hover': { bgcolor: 'grey.800' },
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={handleExportCSV}>
          <FileDownload sx={{ mr: 1 }} /> Esporta CSV
        </MenuItem>
      </Menu>
    </Box>
  );
}
