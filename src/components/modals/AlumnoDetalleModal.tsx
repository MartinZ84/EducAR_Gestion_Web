import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, Typography } from '@mui/material';
import { useState } from 'react';
import DetalleModal from './DetalleModal';
import { getAlumnoDetalle } from '../../api/alumnosApi';
import { AlumnoDetalle } from '../../types';

const fecha = (value?: string | null) => value ? new Date(value).toLocaleDateString() : 'Sin especificar';

export default function AlumnoDetalleModal({ open, id, onClose }: { open: boolean; id: number | null; onClose: () => void }) {
  const [tab, setTab] = useState(0);
  const [boletin, setBoletin] = useState<AlumnoDetalle['boletines'][number] | null>(null);
  return <DetalleModal open={open} id={id} title="Detalle del alumno" load={getAlumnoDetalle} onClose={onClose}>
    {(data: AlumnoDetalle) => <Stack spacing={2}>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable"><Tab label="Datos" /><Tab label="Matrícula" /><Tab label="Tutores" /><Tab label="Asistencias" /><Tab label="Calificaciones" /><Tab label="Boletines" /></Tabs>
      {tab === 0 && <Stack spacing={1}><Typography><strong>DNI:</strong> {data.dni}</Typography><Typography><strong>Apellido y nombre:</strong> {data.apellido}, {data.nombre}</Typography><Typography><strong>Fecha de nacimiento:</strong> {fecha(data.fecNac)}</Typography><Chip label={data.activo ? 'Activo' : 'Inactivo'} color={data.activo ? 'success' : 'default'} sx={{ alignSelf: 'flex-start' }} /><Typography><strong>Domicilio:</strong> {[data.calle, data.numero, data.piso && `Piso ${data.piso}`, data.departamento && `Dto. ${data.departamento}`, data.barrio, data.localidad, data.provincia].filter(Boolean).join(', ') || 'Sin domicilio registrado'}</Typography><Typography><strong>Teléfonos:</strong> {data.telefonos.map((telefono) => `${telefono.numero}${telefono.des ? ` (${telefono.des})` : ''}`).join(', ') || 'Sin teléfonos registrados'}</Typography></Stack>}
      {tab === 1 && <Stack spacing={1}>{data.matriculaActual ? <><Typography><strong>Curso:</strong> {data.matriculaActual.curso}</Typography><Typography><strong>Ciclo lectivo:</strong> {data.matriculaActual.cicloLectivo}</Typography><Typography><strong>Fecha:</strong> {fecha(data.matriculaActual.fechaMatricula)}</Typography></> : <Typography color="text.secondary">No tiene matrícula activa.</Typography>}</Stack>}
      {tab === 2 && <TablaVacia data={data.tutores} empty="No tiene tutores asignados." headers={['Tutor', 'Parentesco']} render={(item) => <TableRow key={item.idTutor}><TableCell>{item.nombreCompleto}</TableCell><TableCell>{item.parentesco || 'Sin especificar'}</TableCell></TableRow>} />}
      {tab === 3 && <Stack spacing={2}><Stack direction="row" spacing={1} flexWrap="wrap"><Chip label={`Presentes: ${data.asistenciaResumen.presentes}`} color="success" /><Chip label={`Ausentes: ${data.asistenciaResumen.ausentes}`} color="error" /><Chip label={`Justificadas: ${data.asistenciaResumen.justificadas}`} /></Stack><TablaVacia data={data.asistencias} empty="No hay asistencias registradas." headers={['Fecha', 'Estado']} render={(item) => <TableRow key={item.idAsistencia}><TableCell>{fecha(item.fecha)}</TableCell><TableCell>{item.estado}</TableCell></TableRow>} /></Stack>}
      {tab === 4 && <TablaVacia data={data.calificaciones} empty="No hay calificaciones registradas." headers={['Materia', 'Nota', 'Período']} render={(item) => <TableRow key={`${item.materia}-${item.periodo}`}><TableCell>{item.materia}</TableCell><TableCell>{item.nota}</TableCell><TableCell>{item.periodo}</TableCell></TableRow>} />}
      {tab === 5 && <TablaVacia data={data.boletines} empty="No hay boletines registrados." headers={['Período', 'Promedio', 'Estado', '']} render={(item) => <TableRow key={item.periodo}><TableCell>{item.periodo}</TableCell><TableCell>{item.promedio}</TableCell><TableCell>{item.estado}</TableCell><TableCell><Button size="small" onClick={() => setBoletin(item)}>Ver Boletín</Button></TableCell></TableRow>} />}
      <Dialog open={boletin !== null} onClose={() => setBoletin(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Boletín: {boletin?.periodo}</DialogTitle>
        <DialogContent dividers><Typography><strong>Promedio:</strong> {boletin?.promedio}</Typography><Typography><strong>Estado:</strong> {boletin?.estado}</Typography></DialogContent>
        <DialogActions><Button onClick={() => setBoletin(null)}>Cerrar</Button></DialogActions>
      </Dialog>
    </Stack>}
  </DetalleModal>;
}

function TablaVacia<T>({ data, empty, headers, render }: { data: T[]; empty: string; headers: string[]; render: (item: T) => React.ReactNode }) {
  if (data.length === 0) return <Typography color="text.secondary">{empty}</Typography>;
  return <Table size="small"><TableHead><TableRow>{headers.map((header) => <TableCell key={header}>{header}</TableCell>)}</TableRow></TableHead><TableBody>{data.map(render)}</TableBody></Table>;
}
