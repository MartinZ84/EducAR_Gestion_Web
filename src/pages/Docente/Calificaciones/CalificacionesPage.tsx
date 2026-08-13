import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, MenuItem,
  TextField, Button, Alert, CircularProgress,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Avatar
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { getMisCursos, MiCurso } from '../../../api/docenteMateriaCursoApi';
import { getPeriodosPorCiclo } from '../../../api/periodosEvaluacionApi';
import { getCurso } from '../../../api/cursosApi';
import { getCalificaciones, registrarCalificaciones } from '../../../api/calificacionesApi';
//import { getAlumnos } from '../../../api/alumnosApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { Alumno, PeriodoEvaluacion } from '../../../types';
import { getAlumnosPorCurso } from '../../../api/alumnosApi';

interface AlumnoCalificacion {
  idAlumno:    number;
  nombre:      string;
  apellido:    string;
  nota:        string;
  observacion: string;
  error?:      string;  // ← agregar esta línea
}

export default function CalificacionesPage() {
  const location = useLocation();
  const state    = location.state as { idCurso?: number; idMateria?: number } | null;

  const [cursos, setCursos]         = useState<MiCurso[]>([]);
  const [periodos, setPeriodos]     = useState<PeriodoEvaluacion[]>([]);
  const [idCurso, setIdCurso]       = useState<string>(state?.idCurso ? String(state.idCurso) : '');
  const [idMateria, setIdMateria]   = useState<string>(state?.idMateria ? String(state.idMateria) : '');
  const [idPeriodo, setIdPeriodo]   = useState('');
  const [alumnos, setAlumnos]       = useState<AlumnoCalificacion[]>([]);
  const [cargando, setCargando]     = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [error, setError]           = useState('');
  const [exito, setExito]           = useState('');

  useEffect(() => {
    getMisCursos()
      .then(setCursos)
      .catch((err) => setError(extraerMensajeError(err)));
  }, []);

  useEffect(() => {
    if (!idCurso) {
      setPeriodos([]);
      return;
    }

    getCurso(Number(idCurso))
      .then((curso) => getPeriodosPorCiclo(curso.idCicloLectivo))
      .then(setPeriodos)
      .catch((err) => {
        setPeriodos([]);
        setError(extraerMensajeError(err));
      });
  }, [idCurso]);

  // Cuando cambia el curso carga los alumnos.
  useEffect(() => {
    if (!idCurso) {
      setAlumnos([]);
      return;
    }

    setCargando(true);
    setError('');
    setExito('');

    getAlumnosPorCurso(Number(idCurso))
      .then((res) => {
        setAlumnos(res.map((a) => ({
          idAlumno: a.idAlumno,
          nombre: a.nombre,
          apellido: a.apellido,
          nota: '',
          observacion: '',
        })));
      })
      .catch((err) => setError(extraerMensajeError(err)))
      .finally(() => setCargando(false));
  }, [idCurso]);

  // Recupera las calificaciones ya registradas para permitir editarlas.
  useEffect(() => {
    if (!idCurso || !idMateria || !idPeriodo || alumnos.length === 0) return;

    let cancelado = false;

    getCalificaciones(Number(idCurso), Number(idMateria), Number(idPeriodo))
      .then((calificaciones) => {
        if (cancelado) return;

        const mapa = new Map(
          calificaciones.map((c) => [c.idAlumno, c])
        );

        setAlumnos((actuales) => actuales.map((a) => {
          const calificacion = mapa.get(a.idAlumno);
          return calificacion
            ? {
                ...a,
                nota: String(calificacion.valorCalificacion),
                observacion: calificacion.observacion ?? '',
              }
            : a;
        }));
      })
      .catch((err) => {
        if (!cancelado) setError(extraerMensajeError(err));
      });

    return () => { cancelado = true; };
  }, [idCurso, idMateria, idPeriodo, alumnos.length]);

  // Materias disponibles según el curso seleccionado
  const materiasDelCurso = cursos.filter(c => String(c.idCurso) === idCurso);

  const actualizarAlumno = (idAlumno: number, campo: 'nota' | 'observacion', valor: string) => {
  setAlumnos(prev => prev.map(a => {
    if (a.idAlumno !== idAlumno) return a;

    // Tipamos explícitamente como AlumnoCalificacion para que error acepte string | undefined
    const actualizado: AlumnoCalificacion = { ...a, [campo]: valor, error: undefined };

    if (campo === 'nota') {
      const num = Number(valor);
      if (valor && (isNaN(num) || num < 1 || num > 10))
        actualizado.error = 'Nota entre 1 y 10';
    }

    return actualizado;
  }));
};

  const handleGuardar = async () => {
    if (!idCurso || !idMateria || !idPeriodo) {
      setError('Seleccioná curso, materia y período.');
      return;
    }

    // Validar que todos los alumnos con nota tengan nota válida
    const conNota  = alumnos.filter(a => a.nota !== '');
    const hayError = conNota.some(a => {
      const num = Number(a.nota);
      return isNaN(num) || num < 1 || num > 10;
    });

    if (hayError) { setError('Hay notas inválidas. Deben ser entre 1 y 10.'); return; }
    if (conNota.length === 0) { setError('Ingresá al menos una nota.'); return; }

    setGuardando(true);
    setError('');
    setExito('');

    try {
      await registrarCalificaciones({
        idCurso:             Number(idCurso),
        idMateria:           Number(idMateria),
        idPeriodoEvaluacion: Number(idPeriodo),
        alumnos: conNota.map(a => ({
          idAlumno:          a.idAlumno,
          valorCalificacion: Number(a.nota),
          observacion:       a.observacion || undefined,
        })),
      });
      setExito(`${conNota.length} calificaciones guardadas correctamente.`);
    } catch (err) {
      setError(extraerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Calificaciones</Typography>
        <Typography variant="body2" color="text.secondary">
          Cargá las calificaciones de tus alumnos
        </Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              select label="Curso" value={idCurso}
              onChange={(e) => { setIdCurso(e.target.value); setIdMateria(''); setIdPeriodo(''); }}
              sx={{ minWidth: 200, flex: 1 }}
            >
              {[...new Map(cursos.map(c => [c.idCurso, c])).values()].map((c) => (
                <MenuItem key={c.idCurso} value={String(c.idCurso)}>
                  {c.grado}° "{c.division}" ({c.turno})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select label="Materia" value={idMateria}
              onChange={(e) => setIdMateria(e.target.value)}
              sx={{ minWidth: 200, flex: 1 }}
              disabled={!idCurso}
            >
              {materiasDelCurso.map((c) => (
                <MenuItem key={c.idMateria} value={String(c.idMateria)}>
                  {c.nombreMateria}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select label="Período" value={idPeriodo}
              onChange={(e) => setIdPeriodo(e.target.value)}
              sx={{ minWidth: 180, flex: 1 }}
            >
              {periodos.map((p) => (
                <MenuItem key={p.idPeriodoEvaluacion} value={String(p.idPeriodoEvaluacion)}>
                  {p.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
      {exito && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}

      {/* Tabla de calificaciones */}
      {idCurso && (
        <Card>
          <CardContent sx={{ p: 0 }}>
            {cargando ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F5F7FA' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Alumno</TableCell>
                      <TableCell sx={{ fontWeight: 600, width: 140 }}>Nota (1-10)</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Observación</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alumnos.map((a) => (
                      <TableRow key={a.idAlumno} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 12, bgcolor: '#1565C0' }}>
                              {a.apellido[0]}{a.nombre[0]}
                            </Avatar>
                            <Typography variant="body2">
                              {a.apellido}, {a.nombre}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={a.nota}
                            onChange={(e) => actualizarAlumno(a.idAlumno, 'nota', e.target.value)}
                            error={!!a.error}
                            helperText={a.error}
                            placeholder="—"
                            sx={{ width: 100 }}
                            slotProps={{ htmlInput: { min: 1, max: 10, step: 0.5 } }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={a.observacion}
                            onChange={(e) => actualizarAlumno(a.idAlumno, 'observacion', e.target.value)}
                            placeholder="Opcional"
                            sx={{ width: '100%' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>

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
                {guardando ? 'Guardando...' : 'Guardar Calificaciones'}
              </Button>
            </Box>
          )}
        </Card>
      )}
    </Box>
  );
}