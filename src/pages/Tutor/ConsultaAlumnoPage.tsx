import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Box, Card, CardContent, Chip, CircularProgress, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  AlumnoTutorConsulta, AsistenciaTutorConsulta, CalificacionTutorConsulta,
  NotaTutorConsulta, getAsistenciasTutor, getCalificacionesTutor,
  getMisAlumnosTutor, getNotasTutor,
} from '../../api/tutorConsultasApi';
import { extraerMensajeError } from '../../utils/apiErrors';

interface AsistenciaConAlumno extends AsistenciaTutorConsulta {
  idAlumno: number;
  nombreAlumno: string;
}

type PeriodoAsistencia = 'semana' | 'mes';

export default function ConsultaAlumnoPage({ tipo }: { tipo: 'asistencia' | 'calificaciones' }) {
  const [alumnos, setAlumnos] = useState<AlumnoTutorConsulta[]>([]);
  const [idAlumno, setIdAlumno] = useState('todos');
  const [asistencias, setAsistencias] = useState<AsistenciaConAlumno[]>([]);
  const [calificaciones, setCalificaciones] = useState<CalificacionTutorConsulta[]>([]);
  const [notas, setNotas] = useState<NotaTutorConsulta[]>([]);
  const [periodo, setPeriodo] = useState<PeriodoAsistencia>('semana');
  const [fechaReferencia, setFechaReferencia] = useState(dayjs().format('YYYY-MM-DD'));
  const [mesReferencia, setMesReferencia] = useState(dayjs().format('YYYY-MM'));
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setCargando(true);
    getMisAlumnosTutor()
      .then((resultado) => {
        setAlumnos(resultado);
        if (tipo === 'calificaciones' && resultado.length > 0) {
          setIdAlumno(String(resultado[0].idAlumno));
        }
      })
      .catch((err) => setError(extraerMensajeError(err)))
      .finally(() => setCargando(false));
  }, [tipo]);

  useEffect(() => {
    if (tipo !== 'asistencia' || alumnos.length === 0) return;
    setCargando(true);
    setError('');

    // La pantalla inicial reúne las asistencias de todos los hijos vinculados.
    // Cada respuesta se identifica con su alumno para poder mostrarla y filtrarla.
    Promise.all(alumnos.map(async (alumno) => {
      const registros = await getAsistenciasTutor(alumno.idAlumno);
      return registros.map((registro) => ({
        ...registro,
        idAlumno: alumno.idAlumno,
        nombreAlumno: `${alumno.apellido}, ${alumno.nombre}`,
      }));
    }))
      .then((resultados) => setAsistencias(resultados.flat()))
      .catch((err) => setError(extraerMensajeError(err)))
      .finally(() => setCargando(false));
  }, [alumnos, tipo]);

  useEffect(() => {
    if (tipo !== 'calificaciones' || idAlumno === 'todos') return;
    setCargando(true);
    setError('');
    Promise.all([getCalificacionesTutor(Number(idAlumno)), getNotasTutor(Number(idAlumno))])
      .then(([finales, individuales]) => {
        setCalificaciones(finales);
        setNotas(individuales);
      })
      .catch((err) => setError(extraerMensajeError(err)))
      .finally(() => setCargando(false));
  }, [idAlumno, tipo]);

  const rango = useMemo(() => {
    if (periodo === 'mes') {
      const referencia = dayjs(`${mesReferencia || dayjs().format('YYYY-MM')}-01`);
      return { desde: referencia.startOf('month'), hasta: referencia.endOf('month') };
    }
    const hasta = dayjs(fechaReferencia || dayjs().format('YYYY-MM-DD')).endOf('day');
    return { desde: hasta.subtract(6, 'day').startOf('day'), hasta };
  }, [fechaReferencia, mesReferencia, periodo]);

  const asistenciasFiltradas = useMemo(() => asistencias
    .filter((asistencia) => idAlumno === 'todos' || asistencia.idAlumno === Number(idAlumno))
    .filter((asistencia) => {
      const fecha = dayjs(asistencia.fecha);
      return !fecha.isBefore(rango.desde) && !fecha.isAfter(rango.hasta);
    })
    .sort((a, b) => dayjs(b.fecha).valueOf() - dayjs(a.fecha).valueOf()),
  [asistencias, idAlumno, rango]);

  const presentes = asistenciasFiltradas.filter((asistencia) => asistencia.presente).length;
  const ausentes = asistenciasFiltradas.length - presentes;

  return <Box>
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>{tipo === 'asistencia' ? 'Asistencia' : 'Calificaciones'}</Typography>
    {tipo === 'asistencia' && <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      Vista inicial de los últimos siete días de todos tus alumnos vinculados.
    </Typography>}

    <Card sx={{ mb: 2 }}><CardContent>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField select label="Alumno" value={idAlumno} onChange={(e) => setIdAlumno(e.target.value)} sx={{ minWidth: 250, flex: 1 }}>
          {tipo === 'asistencia' && <MenuItem value="todos">Todos mis alumnos</MenuItem>}
          {alumnos.map((alumno) => <MenuItem key={alumno.idAlumno} value={String(alumno.idAlumno)}>{alumno.apellido}, {alumno.nombre}</MenuItem>)}
        </TextField>

        {tipo === 'asistencia' && <>
          <TextField select label="Período" value={periodo} onChange={(e) => setPeriodo(e.target.value as PeriodoAsistencia)} sx={{ minWidth: 170 }}>
            <MenuItem value="semana">Últimos 7 días</MenuItem>
            <MenuItem value="mes">Por mes</MenuItem>
          </TextField>
          {periodo === 'semana'
            ? <TextField label="Hasta" type="date" value={fechaReferencia} onChange={(e) => setFechaReferencia(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
            : <TextField label="Mes" type="month" value={mesReferencia} onChange={(e) => setMesReferencia(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />}
        </>}
      </Box>
      {!cargando && alumnos.length === 0 && <Typography color="text.secondary" sx={{ mt: 2 }}>No hay alumnos vinculados.</Typography>}
    </CardContent></Card>

    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {cargando ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box> : alumnos.length > 0 && <Card><CardContent>
      {tipo === 'asistencia' ? <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">{rango.desde.format('DD/MM/YYYY')} al {rango.hasta.format('DD/MM/YYYY')}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip label={`Presentes: ${presentes}`} color="success" size="small" />
            <Chip label={`Ausentes: ${ausentes}`} color="error" size="small" />
          </Box>
        </Box>
        {asistenciasFiltradas.length > 0 ? <TableContainer sx={{ overflowX: 'auto' }}><Table size="small">
          <TableHead><TableRow><TableCell>Fecha</TableCell><TableCell>Alumno</TableCell><TableCell>Curso</TableCell><TableCell>Estado</TableCell></TableRow></TableHead>
          <TableBody>{asistenciasFiltradas.map((asistencia) => <TableRow key={`${asistencia.idAlumno}-${asistencia.idAsistencia}`}>
            <TableCell>{dayjs(asistencia.fecha).format('DD/MM/YYYY')}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{asistencia.nombreAlumno}</TableCell>
            <TableCell>{asistencia.grado}° {asistencia.division} ({asistencia.anio})</TableCell>
            <TableCell><Chip label={asistencia.presente ? 'Presente' : 'Ausente'} color={asistencia.presente ? 'success' : 'error'} size="small" variant="outlined" /></TableCell>
          </TableRow>)}</TableBody>
        </Table></TableContainer> : <Typography color="text.secondary">No hay asistencias registradas en el período seleccionado.</Typography>}
      </> : <>
        <Typography variant="h6" sx={{ mb: 1 }}>Notas de evaluaciones</Typography>
        <TableContainer sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow><TableCell>Evaluación</TableCell><TableCell>Materia</TableCell><TableCell>Período</TableCell><TableCell>Fecha</TableCell><TableCell>Nota</TableCell></TableRow></TableHead><TableBody>
          {notas.map((nota) => <TableRow key={nota.idNotaEvaluacion}><TableCell>{nota.titulo}</TableCell><TableCell>{nota.materia}</TableCell><TableCell>{nota.periodo} ({nota.anio})</TableCell><TableCell>{dayjs(nota.fecha).format('DD/MM/YYYY')}</TableCell><TableCell>{nota.valor}</TableCell></TableRow>)}
        </TableBody></Table></TableContainer>
        {notas.length === 0 && <Typography color="text.secondary">No hay notas de evaluaciones.</Typography>}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Promedios finales</Typography>
        <TableContainer sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow><TableCell>Materia</TableCell><TableCell>Período</TableCell><TableCell>Nota final</TableCell><TableCell>Observación</TableCell></TableRow></TableHead><TableBody>
          {calificaciones.map((calificacion) => <TableRow key={calificacion.idCalificacion}><TableCell>{calificacion.nombre}</TableCell><TableCell>{calificacion.periodo} ({calificacion.anio})</TableCell><TableCell>{calificacion.nota}</TableCell><TableCell>{calificacion.observacion || '—'}</TableCell></TableRow>)}
        </TableBody></Table></TableContainer>
        {calificaciones.length === 0 && <Typography color="text.secondary">No hay calificaciones registradas.</Typography>}
      </>}
    </CardContent></Card>}
  </Box>;
}
