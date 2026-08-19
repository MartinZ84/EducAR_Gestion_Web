import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Checkbox, CircularProgress, FormControl,
  InputAdornment, InputLabel, MenuItem, Select, SelectChangeEvent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination, TextField, Typography, Alert, Chip, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import { Search, School, HowToReg } from '@mui/icons-material';
import dayjs from 'dayjs';
import { getCiclosLectivos } from '../../../api/ciclosLectivosApi';
import { getCursosPorCiclo } from '../../../api/cursosApi';
import {
  getAlumnosDisponibles,
  asignarMasivo,
  AlumnoDisponible,
} from '../../../api/matriculasApi';
import { CicloLectivo, Curso } from '../../../types';
import { extraerMensajeError } from '../../../utils/apiErrors';

const CANTIDAD_POR_PAGINA = 10;

export default function MatriculasPage() {
  // ─── Selectores ───
  const [ciclos, setCiclos] = useState<CicloLectivo[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [idCiclo, setIdCiclo] = useState('');
  const [idCurso, setIdCurso] = useState('');
  const [cargandoCiclos, setCargandoCiclos] = useState(false);
  const [cargandoCursos, setCargandoCursos] = useState(false);

  // ─── Búsqueda ───
  const [busqueda, setBusqueda] = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState('');

  // ─── Tabla ───
  const [alumnos, setAlumnos] = useState<AlumnoDisponible[]>([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false);
  const [error, setError] = useState('');

  // ─── Selección ───
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set());
  const [todosSeleccionadosPagina, setTodosSeleccionadosPagina] = useState(false);

  // ─── Matriculación ───
  const [guardando, setGuardando] = useState(false);
  const [dialogExito, setDialogExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // ─── Cargar ciclos lectivos al montar ───
  useEffect(() => {
    setCargandoCiclos(true);
    getCiclosLectivos()
      .then(setCiclos)
      .catch((err) => setError(extraerMensajeError(err)))
      .finally(() => setCargandoCiclos(false));
  }, []);

  // ─── Cuando cambia el ciclo, cargar cursos ───
  useEffect(() => {
    if (!idCiclo) {
      setCursos([]);
      setIdCurso('');
      return;
    }
    setCargandoCursos(true);
    getCursosPorCiclo(Number(idCiclo))
      .then(setCursos)
      .catch((err) => setError(extraerMensajeError(err)))
      .finally(() => setCargandoCursos(false));
  }, [idCiclo]);

  // ─── Cuando cambia curso o búsqueda, resetear y cargar alumnos ───
  useEffect(() => {
    setSeleccionados(new Set());
    setTodosSeleccionadosPagina(false);
    setPagina(1);
    if (!idCurso || !idCiclo) {
      setAlumnos([]);
      setTotalPaginas(1);
      return;
    }
    cargarAlumnos(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idCurso, busquedaActiva, idCiclo]);

  const cargarAlumnos = useCallback(
    async (p: number) => {
      if (!idCurso || !idCiclo) return;
      setCargandoAlumnos(true);
      setError('');
      setTodosSeleccionadosPagina(false);

      const ciclo = ciclos.find((c) => String(c.idCicloLectivo) === idCiclo);
      const anioRegistro = ciclo?.anio ?? new Date().getFullYear();

      try {
        const resultado = await getAlumnosDisponibles(
          anioRegistro,
          Number(idCiclo),
          p,
          CANTIDAD_POR_PAGINA,
          busquedaActiva
        );
        setAlumnos(resultado.datos);
        setTotalPaginas(resultado.totalPaginas);
        setPagina(resultado.paginaActual);
      } catch (err) {
        setError(extraerMensajeError(err));
      } finally {
        setCargandoAlumnos(false);
      }
    },
    [idCurso, idCiclo, ciclos, busquedaActiva]
  );

  // ─── Handlers ───
  const handleCambioCiclo = (e: SelectChangeEvent) => {
    setIdCiclo(e.target.value);
    setIdCurso('');
    setAlumnos([]);
    setSeleccionados(new Set());
  };

  const handleCambioCurso = (e: SelectChangeEvent) => {
    setIdCurso(e.target.value);
    setSeleccionados(new Set());
  };

  const handleBuscar = () => {
    setBusquedaActiva(busqueda);
  };

  const handleKeyDownBusqueda = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleBuscar();
  };

  const handleCambiarPagina = (_: React.ChangeEvent<unknown>, p: number) => {
    cargarAlumnos(p);
  };

  // ─── Selección de alumnos ───
  const toggleAlumno = (idAlumno: number) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(idAlumno)) next.delete(idAlumno);
      else next.add(idAlumno);
      return next;
    });
  };

  const handleSeleccionarTodos = (checked: boolean) => {
    setTodosSeleccionadosPagina(checked);
    setSeleccionados((prev) => {
      const next = new Set(prev);
      alumnos.forEach((a) => {
        if (checked) next.add(a.idAlumno);
        else next.delete(a.idAlumno);
      });
      return next;
    });
  };

  // ─── Matricular ───
  const handleMatricular = async () => {
    if (!idCurso) {
      setError('Seleccioná un curso destino.');
      return;
    }
    if (seleccionados.size === 0) {
      setError('Seleccioná al menos un alumno.');
      return;
    }

    setGuardando(true);
    setError('');
    try {
      const res = await asignarMasivo({
        idCurso: Number(idCurso),
        idsAlumnos: Array.from(seleccionados),
      });
      setMensajeExito(res.mensaje);
      setDialogExito(true);
      setSeleccionados(new Set());
      setTodosSeleccionadosPagina(false);
      cargarAlumnos(pagina);
    } catch (err) {
      setError(extraerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const cursoSeleccionado = cursos.find((c) => String(c.idCurso) === idCurso);

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>         
        Matricular Alumnos
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Asigná alumnos a un curso dentro de un ciclo lectivo.
      </Typography>

      {/* Filtros */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mt: 3,
          mb: 3,
          alignItems: 'flex-start',
        }}
      >
        {/* Ciclo Lectivo */}
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel id="ciclo-label">Ciclo lectivo</InputLabel>
          <Select
            labelId="ciclo-label"
            value={idCiclo}
            label="Ciclo lectivo"
            onChange={handleCambioCiclo}
            disabled={cargandoCiclos}
          >
            {ciclos.map((c) => (
              <MenuItem key={c.idCicloLectivo} value={String(c.idCicloLectivo)}>
                {c.anio}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Curso destino */}
        <FormControl sx={{ minWidth: 280 }} size="small">
          <InputLabel id="curso-label">Curso destino</InputLabel>
          <Select
            labelId="curso-label"
            value={idCurso}
            label="Curso destino"
            onChange={handleCambioCurso}
            disabled={!idCiclo || cargandoCursos}
          >
            {cursos.map((c) => (
              <MenuItem key={c.idCurso} value={String(c.idCurso)}>
                {c.anio}° {c.division} {c.turno ? `— ${c.turno}` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Buscador */}
        <TextField
          size="small"
          placeholder="Apellido, nombre o DNI"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={handleKeyDownBusqueda}
          sx={{ minWidth: 320, flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button variant="outlined" onClick={handleBuscar} size="medium">
          Buscar
        </Button>
      </Box>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ borderRadius: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell padding="checkbox" sx={{ color: 'white' }}>
                <Checkbox
                  indeterminate={
                    alumnos.some((a) => seleccionados.has(a.idAlumno)) &&
                    !alumnos.every((a) => seleccionados.has(a.idAlumno))
                  }
                  checked={
                    alumnos.length > 0 && alumnos.every((a) => seleccionados.has(a.idAlumno))
                  }
                  onChange={(e) => handleSeleccionarTodos(e.target.checked)}
                  sx={{
                    color: 'white',
                    '&.Mui-checked': { color: 'white' },
                    '&.MuiCheckbox-indeterminate': { color: 'white' },
                  }}
                />
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Apellido</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Nombre</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>DNI</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>Fec. Nac.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cargandoAlumnos ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : alumnos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                  {idCurso
                    ? 'No hay alumnos disponibles para matricular en este curso.'
                    : 'Seleccioná un ciclo lectivo y un curso para ver los alumnos disponibles.'}
                </TableCell>
              </TableRow>
            ) : (
              alumnos.map((alumno) => (
                <TableRow
                  key={alumno.idAlumno}
                  hover
                  selected={seleccionados.has(alumno.idAlumno)}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={seleccionados.has(alumno.idAlumno)}
                      onChange={() => toggleAlumno(alumno.idAlumno)}
                    />
                  </TableCell>
                  <TableCell>{alumno.apellido}</TableCell>
                  <TableCell>{alumno.nombre}</TableCell>
                  <TableCell>{alumno.dni.toLocaleString('es-AR')}</TableCell>
                  <TableCell>
                    {alumno.fechaNacimiento
                      ? dayjs(alumno.fechaNacimiento).format('DD/MM/YYYY')
                      : '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer: paginación + contador + botón */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 2,
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {totalPaginas > 1 && (
            <Pagination
              count={totalPaginas}
              page={pagina}
              onChange={handleCambiarPagina}
              color="primary"
            />
          )}
          {seleccionados.size > 0 && (
            <Chip
              label={`Seleccionados: ${seleccionados.size}`}
              color="primary"
              variant="outlined"
              size="small"
            />
          )}
        </Box>

        <Button
          variant="contained"
          size="large"
          startIcon={<HowToReg />}
          disabled={guardando || seleccionados.size === 0 || !idCurso}
          onClick={handleMatricular}
          sx={{ minWidth: 260 }}
        >
          {guardando ? (
            <CircularProgress size={22} color="inherit" />
          ) : (
            `Matricular ${seleccionados.size} alumno${seleccionados.size !== 1 ? 's' : ''}`
          )}
        </Button>
      </Box>

      {/* Dialog de éxito */}
      <Dialog open={dialogExito} onClose={() => setDialogExito(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <School color="success" /> Matriculación exitosa
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{mensajeExito}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogExito(false)} autoFocus variant="contained">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}