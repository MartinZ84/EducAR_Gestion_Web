import { Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import DetalleModal from './DetalleModal';
import { getDocenteDetalle } from '../../api/docentesApi';
import { DocenteDetalle } from '../../types';

export default function DocenteDetalleModal({ open, id, onClose }: { open: boolean; id: number | null; onClose: () => void }) {
  return <DetalleModal open={open} id={id} title="Detalle del docente" load={getDocenteDetalle} onClose={onClose}>
    {(data: DocenteDetalle) => <Stack spacing={2}>
      <Typography><strong>DNI:</strong> {data.dni}</Typography><Typography><strong>Nombre:</strong> {data.nombre} {data.apellido}</Typography>
      <Typography><strong>Email:</strong> {data.email}</Typography><Chip label={data.activo ? 'Activo' : 'Inactivo'} color={data.activo ? 'success' : 'default'} sx={{ alignSelf: 'flex-start' }} />
      <Typography variant="h6">Cursos y materias asignadas</Typography>
      {data.cursosAsignados.length === 0 ? <Typography color="text.secondary">No tiene asignaciones.</Typography> : <Table size="small"><TableHead><TableRow><TableCell>Curso</TableCell><TableCell>Materia</TableCell><TableCell>Ciclo lectivo</TableCell></TableRow></TableHead><TableBody>{data.cursosAsignados.map((item) => <TableRow key={`${item.idCurso}-${item.materia}`}><TableCell>{item.curso}</TableCell><TableCell>{item.materia}</TableCell><TableCell>{item.cicloLectivo}</TableCell></TableRow>)}</TableBody></Table>}
    </Stack>}
  </DetalleModal>;
}
