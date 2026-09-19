import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Tooltip, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/es';
import { CalendarioAsistencia, getCalendarioAsistencia } from '../../api/asistenciaApi';
import { extraerMensajeError } from '../../utils/apiErrors';

export interface CursoAsistencia { idCurso: number; grado: number; division: string; turno?: string; anio: number }

// El calendario trabaja con días civiles. Tomar solo YYYY-MM-DD evita que una
// fecha UTC a medianoche retroceda al día anterior en la zona horaria argentina.
const fechaCivil = (fecha: string) => fecha.slice(0, 10);

export default function CalendarioAsistenciaModal({ open, cursos, idCursoInicial, onClose, onSeleccionar }: {
  open: boolean; cursos: CursoAsistencia[]; idCursoInicial?: number; onClose: () => void; onSeleccionar: (idCurso: number, fecha: string) => void;
}) {
  const [idCurso, setIdCurso] = useState<number | ''>(''), [datos, setDatos] = useState<CalendarioAsistencia | null>(null);
  const [mes, setMes] = useState<Dayjs>(dayjs().startOf('month')), [error, setError] = useState('');
  useEffect(() => { if (open) setIdCurso(idCursoInicial || cursos[0]?.idCurso || ''); }, [open, idCursoInicial, cursos]);
  useEffect(() => { if (!open || !idCurso) return; getCalendarioAsistencia(idCurso).then(r => { setDatos(r); setMes(dayjs().startOf('month')); setError(''); }).catch(e => setError(extraerMensajeError(e))); }, [open, idCurso]);
  const mapa = useMemo(() => new Map(datos?.dias.map(d => [fechaCivil(d.fecha), d]) || []), [datos]);
  // La locale española considera el lunes como inicio de semana. Como la grilla
  // se presenta desde domingo, retrocedemos explícitamente hasta el domingo.
  const primerDiaDelMes = mes.startOf('month');
  const inicio = primerDiaDelMes.subtract(primerDiaDelMes.day(), 'day');
  const celdas = Array.from({ length: 42 }, (_, i) => inicio.add(i, 'day'));
  // La API identifica ambos como NoLaborable y usa el motivo para distinguirlos.
  const color = (estado?: string, motivo?: string | null) => estado === 'Cargada'
    ? { bgcolor:'#d7f3df', color:'#176b35' }
    : estado === 'Pendiente'
      ? { bgcolor:'#fde2e2', color:'#a52a2a' }
      : estado === 'NoLaborable'
        ? motivo === 'Fin de semana'
          ? { bgcolor:'#dff3fb', color:'#17627e' }
          : { bgcolor:'#d8b9ef', color:'#512170' }
        : { bgcolor:'transparent', color:'text.disabled' };
  return <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth><DialogTitle>Calendario de asistencia</DialogTitle><DialogContent dividers>
    {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
    <TextField select fullWidth label="Curso" value={idCurso} onChange={e => setIdCurso(Number(e.target.value))} sx={{ mb:2 }}>{cursos.map(c => <MenuItem key={c.idCurso} value={c.idCurso}>{c.grado}° “{c.division}” · {c.turno} · {c.anio}</MenuItem>)}</TextField>
    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:1 }}><Button onClick={() => setMes(m => m.subtract(1,'month'))}><ChevronLeft /></Button><Typography variant="h6">{mes.locale('es').format('MMMM YYYY')}</Typography><Button onClick={() => setMes(m => m.add(1,'month'))}><ChevronRight /></Button></Box>
    <Box sx={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:0.75 }}>{['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(x => <Typography key={x} align="center" variant="caption" sx={{ fontWeight: 700 }}>{x}</Typography>)}{celdas.map(d => { const key=d.format('YYYY-MM-DD'), dia=mapa.get(key), habilitado=!!dia && (dia.estado==='Cargada'||dia.estado==='Pendiente'); return <Tooltip key={key} title={dia?.motivo || (dia?.estado==='Cargada'?'Asistencia cargada':dia?.estado==='Pendiente'?'Asistencia pendiente':'')}><Box onClick={() => habilitado && idCurso && onSeleccionar(Number(idCurso),key)} sx={{ ...color(dia?.estado, dia?.motivo), opacity:d.month()===mes.month()?1:.35, minHeight:54, borderRadius:1.5, border:'1px solid', borderColor:'divider', p:1, cursor:habilitado?'pointer':'default', fontWeight:dia?'bold':'normal' }}>{d.date()}</Box></Tooltip>; })}</Box>
    <Box sx={{ display:'flex', gap:2, mt:2, alignItems:'center', flexWrap:'wrap' }}><Typography variant="caption" sx={{ bgcolor:'#d7f3df', color:'#176b35', px:1, borderRadius:1 }}>Cargada</Typography><Typography variant="caption" sx={{ bgcolor:'#fde2e2', color:'#a52a2a', px:1, borderRadius:1 }}>Pendiente</Typography><Typography variant="caption" sx={{ bgcolor:'#dff3fb', color:'#17627e', px:1, borderRadius:1 }}>Fin de semana</Typography><Typography variant="caption" sx={{ bgcolor:'#d8b9ef', color:'#512170', px:1, borderRadius:1 }}>Feriado</Typography><Typography variant="caption" color="text.secondary">Los días no laborables y futuros no generan pendientes.</Typography></Box>
  </DialogContent><DialogActions><Button onClick={onClose}>Cerrar</Button></DialogActions></Dialog>;
}
