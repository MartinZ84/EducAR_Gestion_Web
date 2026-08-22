import { Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import DetalleModal from './DetalleModal';
import { getMateriaDetalle } from '../../api/materiasApi';
import { MateriaDetalle } from '../../types';

export default function MateriaDetalleModal({ open, id, onClose }: { open: boolean; id: number | null; onClose: () => void }) {
  return <DetalleModal open={open} id={id} title="Detalle de la materia" load={getMateriaDetalle} onClose={onClose}>
    {(data: MateriaDetalle) => <Stack spacing={2}>
      <Typography><strong>Nombre:</strong> {data.nombre}</Typography><Typography><strong>Descripción:</strong> {data.descripcion || 'Sin descripción'}</Typography>
      <Typography variant="h6">Docentes asignados</Typography>{data.docentesAsignados.length === 0 ? <Typography color="text.secondary">No tiene docentes asignados.</Typography> : <Table size="small"><TableHead><TableRow><TableCell>Docente</TableCell></TableRow></TableHead><TableBody>{data.docentesAsignados.map((item) => <TableRow key={item.idDocente}><TableCell>{item.nombreCompleto}</TableCell></TableRow>)}</TableBody></Table>}
      <Typography variant="h6">Cursos donde se dicta</Typography>{data.cursos.length === 0 ? <Typography color="text.secondary">No está asociada a cursos.</Typography> : <Table size="small"><TableHead><TableRow><TableCell>Curso</TableCell><TableCell>Ciclo lectivo</TableCell></TableRow></TableHead><TableBody>{data.cursos.map((item) => <TableRow key={item.idCurso}><TableCell>{item.curso}</TableCell><TableCell>{item.cicloLectivo}</TableCell></TableRow>)}</TableBody></Table>}
    </Stack>}
  </DetalleModal>;
}
