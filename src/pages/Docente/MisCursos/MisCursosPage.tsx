import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid,
  Avatar, Chip, CircularProgress, Button, Alert
} from '@mui/material';
import { HowToReg, Grade } from '@mui/icons-material';
import { getMisCursos, MiCurso } from '../../../api/docenteMateriaCursoApi';

export default function MisCursosPage() {
  const [cursos, setCursos]     = useState<MiCurso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getMisCursos()
      .then(setCursos)
      .catch(() => setError('Error al cargar los cursos.'))
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Mis Cursos</Typography>
        <Typography variant="body2" color="text.secondary">
          Cursos y materias asignados este ciclo
        </Typography>
      </Box>

      {cursos.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No tenés cursos asignados actualmente.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {cursos.map((c) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={c.idDocenteMateriaCurso}>
              <Card sx={{
                transition: 'all 0.2s',
                '&:hover':  { boxShadow: 6, transform: 'translateY(-2px)' },
              }}>
                <CardContent>
                  {/* Encabezado de la card */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{
                      bgcolor: '#1565C0', width: 52, height: 52,
                      fontSize: 16, fontWeight: 700,
                    }}>
                      {c.grado}°{c.division}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {c.grado}° "{c.division}"
                      </Typography>
                      <Chip label={c.turno} size="small" color="primary" variant="outlined" />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Materia
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    {c.nombreMateria}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Ciclo lectivo {c.anio}
                  </Typography>

                  {/* Acciones rápidas */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<HowToReg />}
                      onClick={() => navigate('/docente/asistencia', {
                        state: { idCurso: c.idCurso }
                      })}
                      sx={{ flex: 1, fontSize: 12 }}
                    >
                      Asistencia
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Grade />}
                      onClick={() => navigate('/docente/calificaciones', {
                        state: { idCurso: c.idCurso, idMateria: c.idMateria }
                      })}
                      sx={{ flex: 1, fontSize: 12 }}
                    >
                      Notas
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}