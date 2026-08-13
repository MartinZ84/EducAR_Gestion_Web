import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Typography, MenuItem,
  TextField, Chip, Divider, CircularProgress,
  Alert, Avatar, List, ListItem, ListItemText,
  ListItemAvatar, Switch, FormControlLabel
} from '@mui/material';
import { HowToReg, Save } from '@mui/icons-material';
import { getMisCursos, MiCurso } from '../../../api/docenteMateriaCursoApi';
import { getAsistenciaPorCursoYFecha, registrarAsistencia } from '../../../api/asistenciaApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
//import { getAlumnos } from '../../../api/alumnosApi';
import { getAlumnosPorCurso } from '../../../api/alumnosApi';
import { Alumno } from '../../../types';
import dayjs from 'dayjs';

interface AlumnoAsistencia {
  idAlumno: number;
  nombre:   string;
  apellido: string;
  presente: boolean;
}

export default function AsistenciaPage() {
  // useLocation: permite recibir estado de navegación (ej: desde MisCursos)
  const location = useLocation();
  const state    = location.state as { idCurso?: number } | null;

  const [cursos, setCursos]         = useState<MiCurso[]>([]);
  const [idCurso, setIdCurso]       = useState<string>(state?.idCurso ? String(state.idCurso) : '');
  const [fecha, setFecha]           = useState(dayjs().format('YYYY-MM-DD'));
  const [alumnos, setAlumnos]       = useState<AlumnoAsistencia[]>([]);
  const [cargando, setCargando]     = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [error, setError]           = useState('');
  const [exito, setExito]           = useState('');

  // Carga los cursos del docente al montar
  useEffect(() => {
    getMisCursos().then(setCursos).catch((err) => setError(extraerMensajeError(err)));
  }, []);

  // Cuando cambia el curso o la fecha, carga la asistencia existente
  useEffect(() => {
    if (!idCurso) return;
    setCargando(true);
    setError('');
    setExito('');

    // Primero cargamos los alumnos del curso
    getAlumnosPorCurso(Number(idCurso))
      .then(async (alumnosDelCurso) => {
        const alumnosBase: AlumnoAsistencia[] = alumnosDelCurso.map((a: Alumno) => ({
          idAlumno: a.idAlumno,
          nombre:   a.nombre,
          apellido: a.apellido,
          presente: true, // por defecto todos presentes
        }));

        // Luego intentamos cargar asistencia ya registrada para esa fecha
        try {
          const asistencia = await getAsistenciaPorCursoYFecha(Number(idCurso), fecha);
          if (asistencia?.detalle?.length) {
            // Si ya existe, usamos los valores registrados
            const mapa = new Map(asistencia.detalle.map((d: { idAlumno: number; presente: boolean }) => [d.idAlumno, d.presente]));
            setAlumnos(alumnosBase.map(a => ({
              ...a,
              presente: mapa.has(a.idAlumno) ? (mapa.get(a.idAlumno) as boolean) : true,
            })));
          } else {
            setAlumnos(alumnosBase);
          }
        } catch {
          // Si no existe un registro para la fecha, se mantiene el valor por defecto.
          setAlumnos(alumnosBase);
        }
      })
      .catch(() => setError('Error al cargar los alumnos.'))
      .finally(() => setCargando(false));
  }, [idCurso, fecha]);

  const toggleAlumno = (idAlumno: number) => {
    setAlumnos(prev =>
      prev.map(a => a.idAlumno === idAlumno ? { ...a, presente: !a.presente } : a)
    );
  };

  const marcarTodos = (presente: boolean) => {
    setAlumnos(prev => prev.map(a => ({ ...a, presente })));
  };

  const handleGuardar = async () => {
    if (!idCurso) { setError('Seleccioná un curso.'); return; }
    if (alumnos.length === 0) { setError('No hay alumnos para registrar.'); return; }

    setGuardando(true);
    setError('');
    setExito('');

    try {
      await registrarAsistencia({
        idCurso: Number(idCurso),
        fecha,
        alumnos: alumnos.map(a => ({ idAlumno: a.idAlumno, presente: a.presente })),
      });
      setExito('Asistencia guardada correctamente.');
    } catch (err) {
      setError(extraerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const presentes = alumnos.filter(a => a.presente).length;
  const ausentes  = alumnos.length - presentes;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Registro de Asistencia</Typography>
        <Typography variant="body2" color="text.secondary">
          Registrá la asistencia diaria de tus alumnos
        </Typography>
      </Box>

      {/* Selectores de curso y fecha */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select
              label="Curso"
              value={idCurso}
              onChange={(e) => setIdCurso(e.target.value)}
              sx={{ minWidth: 250, flex: 1 }}
            >
              {cursos.map((c) => (
                <MenuItem key={c.idDocenteMateriaCurso} value={String(c.idCurso)}>
                  {c.grado}° "{c.division}" — {c.nombreMateria} ({c.turno})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              sx={{ minWidth: 180 }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Mensajes */}
      {error  && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
      {exito  && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}

      {/* Lista de alumnos */}
      {idCurso && (
        <Card>
          <CardContent>
            {/* Resumen y acciones globales */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Chip label={`Presentes: ${presentes}`} color="success" size="small" icon={<HowToReg />} />
                <Chip label={`Ausentes: ${ausentes}`}   color="error"   size="small" />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="outlined" color="success" onClick={() => marcarTodos(true)}>
                  Todos presentes
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => marcarTodos(false)}>
                  Todos ausentes
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 1 }} />

            {cargando ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : alumnos.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No hay alumnos en este curso.
              </Typography>
            ) : (
              <List disablePadding>
                {alumnos.map((a, idx) => (
                  <Box key={a.idAlumno}>
                    <ListItem
                      secondaryAction={
                        // Switch para marcar presente/ausente
                        <FormControlLabel
                          control={
                            <Switch
                              checked={a.presente}
                              onChange={() => toggleAlumno(a.idAlumno)}
                              color="success"
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ color: a.presente ? 'success.main' : 'error.main', fontWeight: 600 }}>
                              {a.presente ? 'Presente' : 'Ausente'}
                            </Typography>
                          }
                          labelPlacement="start"
                        />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{
                          bgcolor: a.presente ? '#2E7D32' : '#C62828',
                          width: 36, height: 36, fontSize: 14,
                        }}>
                          {a.apellido[0]}{a.nombre[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${a.apellido}, ${a.nombre}`}
                        // primaryTypographyProps={{ fontWeight: 500 }}
                        slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }}                      
                      />
                    </ListItem>
                    {idx < alumnos.length - 1 && <Divider variant="inset" component="li" />}
                  </Box>
                ))}
              </List>
            )}
          </CardContent>

          {/* Botón guardar */}
          {!cargando && alumnos.length > 0 && (
            <Box sx={{ px: 2, pb: 2 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<Save />}
                onClick={handleGuardar}
                disabled={guardando}
              >
                {guardando ? 'Guardando...' : 'Guardar Asistencia'}
              </Button>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}