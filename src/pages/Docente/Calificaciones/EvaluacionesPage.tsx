import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, CircularProgress, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { getMisCursos, MiCurso } from '../../../api/docenteMateriaCursoApi';
import { getCurso } from '../../../api/cursosApi';
import { getPeriodosPorCiclo } from '../../../api/periodosEvaluacionApi';
import { getAlumnosPorCurso } from '../../../api/alumnosApi';
import { crearEvaluacion, Evaluacion, getEvaluaciones, guardarNotasEvaluacion } from '../../../api/evaluacionesApi';
import { PeriodoEvaluacion } from '../../../types';
import { extraerMensajeError } from '../../../utils/apiErrors';
import dayjs from 'dayjs';

interface AlumnoEvaluacion { idAlumno: number; nombre: string; apellido: string }

export default function EvaluacionesPage() {
  const state = useLocation().state as { idCurso?: number; idMateria?: number } | null;
  const [cursos, setCursos] = useState<MiCurso[]>([]);
  const [periodos, setPeriodos] = useState<PeriodoEvaluacion[]>([]);
  const [idCurso, setIdCurso] = useState(state?.idCurso ? String(state.idCurso) : '');
  const [idMateria, setIdMateria] = useState(state?.idMateria ? String(state.idMateria) : '');
  const [idPeriodo, setIdPeriodo] = useState('');
  const [alumnos, setAlumnos] = useState<AlumnoEvaluacion[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([]);
  const [idEvaluacion, setIdEvaluacion] = useState('');
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(dayjs().format('YYYY-MM-DD'));
  const [notas, setNotas] = useState<Record<number, string>>({});
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => {
    getMisCursos().then(setCursos).catch((err) => setError(extraerMensajeError(err)));
  }, []);
  useEffect(() => {
    if (!idCurso) { setPeriodos([]); setAlumnos([]); return; }
    Promise.all([getCurso(Number(idCurso)).then(c => getPeriodosPorCiclo(c.idCicloLectivo)), getAlumnosPorCurso(Number(idCurso))])
      .then(([p, a]) => { setPeriodos(p); setAlumnos(a); })
      .catch((err) => setError(extraerMensajeError(err)));
  }, [idCurso]);
  useEffect(() => {
    if (!idCurso || !idMateria || !idPeriodo) { setEvaluaciones([]); setIdEvaluacion(''); return; }
    setCargando(true);
    getEvaluaciones(Number(idCurso), Number(idMateria), Number(idPeriodo))
      .then(setEvaluaciones)
      .catch((err) => setError(extraerMensajeError(err)))
      .finally(() => setCargando(false));
  }, [idCurso, idMateria, idPeriodo]);

  const seleccionarEvaluacion = (id: string) => {
    setIdEvaluacion(id);
    const seleccionada = evaluaciones.find(e => String(e.idEvaluacion) === id);
    setNotas(Object.fromEntries((seleccionada?.notas ?? []).map(n => [n.idAlumno, String(n.valor)])));
  };
  const recargar = async (seleccionarId?: number) => {
    const datos = await getEvaluaciones(Number(idCurso), Number(idMateria), Number(idPeriodo));
    setEvaluaciones(datos);
    if (seleccionarId) setIdEvaluacion(String(seleccionarId));
  };
  const crear = async () => {
    if (!idCurso || !idMateria || !idPeriodo || !titulo.trim() || !fecha) {
      setError('Seleccioná curso, materia y período e ingresá título y fecha.'); return;
    }
    setGuardando(true); setError(''); setExito('');
    try {
      const resultado = await crearEvaluacion({ idCurso: Number(idCurso), idMateria: Number(idMateria), idPeriodoEvaluacion: Number(idPeriodo), titulo: titulo.trim(), fecha });
      await recargar(resultado.idEvaluacion);
      setTitulo(''); setNotas({}); setExito('Evaluación creada. Ahora podés cargar sus notas.');
    } catch (err) { setError(extraerMensajeError(err)); }
    finally { setGuardando(false); }
  };
  const guardar = async () => {
    const conNota = alumnos.filter(a => notas[a.idAlumno] !== undefined && notas[a.idAlumno] !== '');
    if (!idEvaluacion) { setError('Seleccioná una evaluación.'); return; }
    if (conNota.some(a => !Number.isFinite(Number(notas[a.idAlumno])) || Number(notas[a.idAlumno]) < 1 || Number(notas[a.idAlumno]) > 10)) {
      setError('Las notas deben estar entre 1 y 10.'); return;
    }
    setGuardando(true); setError(''); setExito('');
    try {
      await guardarNotasEvaluacion(Number(idEvaluacion), alumnos.map(a => ({
        idAlumno: a.idAlumno,
        valor: notas[a.idAlumno] === undefined || notas[a.idAlumno] === '' ? null : Number(notas[a.idAlumno])
      })));
      await recargar(); setExito('Notas y promedios guardados.');
    } catch (err) { setError(extraerMensajeError(err)); }
    finally { setGuardando(false); }
  };
  const materias = cursos.filter(c => String(c.idCurso) === idCurso);
  const cursosUnicos = [...new Map(cursos.map(c => [c.idCurso, c])).values()];
  const promedios = new Map<number, number[]>();
  evaluaciones.forEach(e => e.notas.forEach(n => {
    promedios.set(n.idAlumno, [...(promedios.get(n.idAlumno) ?? []), n.valor]);
  }));
  return <Box>
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>Calificaciones</Typography>
    <Card sx={{ mb: 2 }}><CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField select label="Curso" value={idCurso} onChange={e => { setIdCurso(e.target.value); setIdMateria(''); setIdPeriodo(''); }} sx={{ minWidth: 180 }}>
        {cursosUnicos.map(c => <MenuItem key={c.idCurso} value={String(c.idCurso)}>{c.grado}° {c.division} ({c.turno})</MenuItem>)}
      </TextField>
      <TextField select label="Materia" value={idMateria} onChange={e => setIdMateria(e.target.value)} sx={{ minWidth: 180 }}>
        {materias.map(c => <MenuItem key={c.idMateria} value={String(c.idMateria)}>{c.nombreMateria}</MenuItem>)}
      </TextField>
      <TextField select label="Período" value={idPeriodo} onChange={e => setIdPeriodo(e.target.value)} sx={{ minWidth: 180 }}>
        {periodos.map(p => <MenuItem key={p.idPeriodoEvaluacion} value={String(p.idPeriodoEvaluacion)}>{p.nombre}</MenuItem>)}
      </TextField>
    </CardContent></Card>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {exito && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}
    {idCurso && idMateria && idPeriodo && <>
      <Card sx={{ mb: 2 }}><CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField label="Título de la evaluación" value={titulo} onChange={e => setTitulo(e.target.value)} sx={{ minWidth: 250 }} />
        <TextField label="Fecha" type="date" value={fecha} onChange={e => setFecha(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <Button variant="contained" onClick={crear} disabled={guardando}>Crear evaluación</Button>
      </CardContent></Card>
      <Card><CardContent>
        {cargando ? <CircularProgress /> : <>
          <TextField select label="Evaluación" value={idEvaluacion} onChange={e => seleccionarEvaluacion(e.target.value)} sx={{ minWidth: 250, mb: 2 }}>
            {evaluaciones.map(e => <MenuItem key={e.idEvaluacion} value={String(e.idEvaluacion)}>{e.titulo} · {dayjs(e.fecha).format('DD/MM/YYYY')}</MenuItem>)}
          </TextField>
          {idEvaluacion && <><Table size="small"><TableHead><TableRow><TableCell>Alumno</TableCell><TableCell>Nota (1–10)</TableCell><TableCell>Promedio del período</TableCell></TableRow></TableHead><TableBody>
            {alumnos.map(a => <TableRow key={a.idAlumno}><TableCell>{a.apellido}, {a.nombre}</TableCell><TableCell><TextField size="small" type="number" value={notas[a.idAlumno] ?? ''} onChange={e => setNotas(prev => ({ ...prev, [a.idAlumno]: e.target.value }))} slotProps={{ htmlInput: { min: 1, max: 10, step: 0.5 } }} sx={{ width: 100 }} /></TableCell><TableCell>{promedios.has(a.idAlumno) ? (promedios.get(a.idAlumno)!.reduce((s, v) => s + v, 0) / promedios.get(a.idAlumno)!.length).toFixed(2) : '—'}</TableCell></TableRow>)}
          </TableBody></Table><Button variant="contained" sx={{ mt: 2 }} onClick={guardar} disabled={guardando}>Guardar notas</Button></>}
          {evaluaciones.length === 0 && <Typography color="text.secondary">No hay evaluaciones en este período.</Typography>}
        </>}
      </CardContent></Card>
    </>}
  </Box>;
}
