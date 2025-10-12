'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Stack,
} from '@mui/material';
import { Business, Person } from '@mui/icons-material';
import { departmentsApi, visitsApi } from '@/lib/api';
import { Department, Visit } from '@/types/visitor';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [currentVisits, setCurrentVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [deptsRes, visitsRes] = await Promise.all([
        departmentsApi.getAll(),
        visitsApi.getCurrent(),
      ]);
      setDepartments(deptsRes.data);
      setCurrentVisits(visitsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVisitorsInDepartment = (deptName: string) => {
    return currentVisits.filter((v) => v.department === deptName);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Caricamento...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Reparti Aziendali
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Visualizzazione reparti con visitatori presenti in tempo reale
      </Typography>

      <Grid container spacing={3}>
        {departments.map((dept) => {
          const visitorsHere = getVisitorsInDepartment(dept.name);

          return (
            <Grid item xs={12} sm={6} md={4} key={dept.id}>
              <Card
                sx={{
                  height: '100%',
                  border: visitorsHere.length > 0 ? '2px solid' : '1px solid',
                  borderColor: visitorsHere.length > 0 ? 'primary.main' : 'divider',
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Business sx={{ color: dept.color || 'primary.main' }} />
                          <Typography variant="h6" fontWeight="bold">
                            {dept.name}
                          </Typography>
                        </Stack>
                        {dept.description && (
                          <Typography variant="body2" color="text.secondary">
                            {dept.description}
                          </Typography>
                        )}
                      </Box>
                      {visitorsHere.length > 0 && (
                        <Chip
                          label={visitorsHere.length}
                          color="primary"
                          size="small"
                        />
                      )}
                    </Stack>

                    {dept.floor !== null && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Piano {dept.floor} - {dept.area}
                        </Typography>
                      </Box>
                    )}

                    <Box
                      sx={{
                        p: 2,
                        bgcolor: dept.color || 'grey.200',
                        color: 'white',
                        borderRadius: 1,
                        minHeight: 80,
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Person />
                          <Typography variant="h5" fontWeight="bold">
                            {visitorsHere.length}
                          </Typography>
                        </Stack>
                        <Typography variant="caption">
                          {visitorsHere.length === 0
                            ? 'Nessun visitatore presente'
                            : visitorsHere.length === 1
                            ? '1 visitatore presente'
                            : `${visitorsHere.length} visitatori presenti`}
                        </Typography>
                      </Stack>
                    </Box>

                    {visitorsHere.length > 0 && (
                      <Box sx={{ pt: 1 }}>
                        <Typography variant="caption" fontWeight="bold">
                          Visitatori:
                        </Typography>
                        {visitorsHere.map((visit) => (
                          <Typography key={visit.id} variant="caption" display="block">
                            • {visit.visitor?.firstName} {visit.visitor?.lastName}
                            {visit.visitor?.company && ` (${visit.visitor.company})`}
                          </Typography>
                        ))}
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
