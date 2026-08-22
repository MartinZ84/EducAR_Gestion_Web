import { Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import DetalleModal from './DetalleModal';
import { getCursoDetalle } from '../../api/cursosApi';
import { CursoDetalle } from '../../types';

export default function CursoDetalleModal({ open, id, onClose }: { open: boolean; id: number | null; onClose: () => void }) {
  return <DetalleModal open={open} id={id} title="Detalle del curso" load={getCursoDetalle} onClose={onClose}>
    {(data: CursoDetalle) => <Stack spacing={2}>
      <Typography><strong>Nombre:</strong> {data.nombre}</Typography><Typography><strong>División:</strong> {data.division}</Typography><Typography><strong>Turno:</strong> {data.turno || 'Sin especificar'}</Typography><Typography><strong>Ciclo lectivo:</strong> {data.cicloLectivo}</Typography><Typography><strong>Total de alumnos:</strong> {data.cantidadTotalAlumnos}</Typography>
      <Typography variant="h6">Alumnos matriculados</Typography>
      {data.alumnosMatriculados.length === 0 ? <Typography color="text.secondary">No hay alumnos matriculados.</Typography> : <Table size="small"><TableHead><TableRow><TableCell>DNI</TableCell><TableCell>Alumno</TableCell></TableRow></TableHead><TableBody>{data.alumnosMatriculados.map((item) => <TableRow key={item.idAlumno}><TableCell>{item.dni}</TableCell><TableCell>{item.nombreCompleto}</TableCell></TableRow>)}</TableBody></Table>}
    </Stack>}
  </DetalleModal>;
}
