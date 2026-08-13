import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, MenuItem,
  TextField, Button, Alert, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Avatar
} from '@mui/material';
import { ExpandMore, Article } from '@mui/icons-material';
import { getMisCursos, MiCurso } from '../../../api/docenteMateriaCursoApi';
import { getPeriodosPorCiclo } from '../../../api/periodosEvaluacionApi';
import { getCurso } from '../../../api/cursosApi';
import { getBoletines, generarBoletines, actualizarObservacionBoletin } from '../../../api/boletinesApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { Boletin, PeriodoEvaluacion } from '../../../types';

export default function BoletinesPage() {
  const [cursos, setCursos]       = useState<MiCurso[]>([]);
  const [periodos, setPeriodos]   = useState<PeriodoEvaluacion[]>([]);
  const [idCurso, setIdCurso]     = useState('');
  const [idPeriodo, setIdPeriodo] = useState('');
  const [boletines, setBoletines] = useState<Boletin[]>([]);
  const [cargando, setCargando]   = useState(false);
  const [generando, setGenerando] = useState(false);
  const [error, setError]         = useState('');
  const [exito, setExito]         = useState('');
  const [guardandoObservacion, setGuardandoObservacion] = useState<number | null>(null);

  useEffect(() => {
    getMisCursos().then(setCursos).catch((err) => setError(extraerMensajeError(err)));
  }, []);

  useEffect(() => {
    if (!idCurso) {
      setPeriodos([]);
      return;
    }
    getCurso(Number(idCurso))
      .then((curso) => getPeriodosPorCiclo(curso.idCicloLectivo))
      .then(setPeriodos)
      .catch((err) => { setPeriodos([]); setError(extraerMensajeError(err)); });
  }, [idCurso]);

  const handleBuscar = async () => {
    if (!idCurso || !idPeriodo) { setError('Seleccioná curso y período.'); return; }
    setCargando(true);
    setError('');
    try {
      const data = await getBoletines(Number(idCurso), Number(idPeriodo));
      setBoletines(data);
    } catch (err) {
      setError(extraerMensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  const handleGenerar = async () => {
    if (!idCurso || !idPeriodo) { setError('Seleccioná curso y período.'); return; }
    if (!confirm('¿Generar boletines para todos los alumnos del curso?')) return;

    setGenerando(true);
    setError('');
    setExito('');
    try {
      await generarBoletines({ idCurso: Number(idCurso), idPeriodoEvaluacion: Number(idPeriodo) });
      setExito('Boletines generados correctamente.');
      handleBuscar();
    } catch (err) {
      setError(extraerMensajeError(err));
    } finally {
      setGenerando(false);
    }
  };

  const guardarObservacion = async (boletin: Boletin, observacionGeneral: string) => {
    setGuardandoObservacion(boletin.idBoletin);
    setError('');
    try {
      await actualizarObservacionBoletin(boletin.idBoletin, observacionGeneral);
      setBoletines(prev => prev.map(b => b.idBoletin === boletin.idBoletin ? { ...b, observacionGeneral } : b));
    } catch (err) {
      setError(extraerMensajeError(err));
    } finally {
      setGuardandoObservacion(null);
    }
  };

  // Color según la nota
  const colorNota = (nota: number) => {
    if (nota >= 7) return 'success';
    if (nota >= 4) return 'warning';
    return 'error';
  };

  const cursosSinDuplicar = [...new Map(cursos.map(c => [c.idCurso, c])).values()];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Boletines</Typography>
        <Typography variant="body2" color="text.secondary">
          Consultá y generá boletines de rendimiento
        </Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <TextField
              select label="Curso" value={idCurso}
              onChange={(e) => setIdCurso(e.target.value)}
              sx={{ minWidth: 220, flex: 1 }}
            >
              {cursosSinDuplicar.map((c) => (
                <MenuItem key={c.idCurso} value={String(c.idCurso)}>
                  {c.grado}° "{c.division}" ({c.turno})
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

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={handleBuscar} disabled={cargando}>
                Consultar
              </Button>
              <Button
                variant="contained"
                startIcon={<Article />}
                onClick={handleGenerar}
                disabled={generando}
              >
                {generando ? 'Generando...' : 'Generar'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {error && <Alert severity="error"   sx={{ mb: 2 }}>{error}</Alert>}
      {exito && <Alert severity="success" sx={{ mb: 2 }}>{exito}</Alert>}

      {/* Lista de boletines — cada uno es un Accordion expandible */}
      {cargando ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : boletines.length === 0 && idCurso ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No hay boletines generados para este curso y período.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        boletines.map((b) => (
          <Accordion key={b.idBoletin} sx={{ mb: 1, borderRadius: '12px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', pr: 2 }}>
                <Avatar sx={{ bgcolor: '#1565C0', width: 36, height: 36, fontSize: 13 }}>
                  {b.apellidoAlumno[0]}{b.nombreAlumno[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {b.apellidoAlumno}, {b.nombreAlumno}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {b.curso} — {b.nombrePeriodo}
                  </Typography>
                </Box>
                <Chip
                  label={`Promedio: ${b.promedioGeneral.toFixed(1)}`}
                  color={colorNota(b.promedioGeneral)}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F5F7FA' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Materia</TableCell>
                    <TableCell sx={{ fontWeight: 600, width: 100 }}>Nota</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Concepto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {b.detalle.map((d) => (
                    <TableRow key={d.idMateria}>
                      <TableCell>{d.nombreMateria}</TableCell>
                      <TableCell>
                        <Chip
                          label={d.calificacionFinal.toFixed(1)}
                          color={colorNota(d.calificacionFinal)}
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>{d.conceptoFinal ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 2 }}>
                <TextField
                  label="Observación general"
                  value={b.observacionGeneral ?? ''}
                  onChange={(e) => setBoletines(prev => prev.map(x => x.idBoletin === b.idBoletin ? { ...x, observacionGeneral: e.target.value } : x))}
                  multiline
                  minRows={2}
                  fullWidth
                />
                <Button
                  variant="outlined"
                  disabled={guardandoObservacion === b.idBoletin}
                  onClick={() => guardarObservacion(b, b.observacionGeneral ?? '')}
                >
                  {guardandoObservacion === b.idBoletin ? 'Guardando...' : 'Guardar'}
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}