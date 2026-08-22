import { Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import DetalleModal from './DetalleModal';
import { getCicloLectivoDetalle } from '../../api/ciclosLectivosApi';
import { CicloLectivoDetalle } from '../../types';

export default function CicloLectivoDetalleModal({ open, id, onClose }: { open: boolean; id: number | null; onClose: () => void }) {
  return <DetalleModal open={open} id={id} title="Detalle del ciclo lectivo" load={getCicloLectivoDetalle} onClose={onClose}>
    {(data: CicloLectivoDetalle) => <Stack spacing={2}>
      <Typography><strong>Año:</strong> {data.anio}</Typography><Typography><strong>Fecha de inicio:</strong> {new Date(data.fechaInicio).toLocaleDateString()}</Typography><Typography><strong>Fecha de fin:</strong> {new Date(data.fechaFin).toLocaleDateString()}</Typography><Chip label={data.activo ? 'Activo' : 'Inactivo'} color={data.activo ? 'success' : 'default'} sx={{ alignSelf: 'flex-start' }} /><Typography><strong>Cursos:</strong> {data.cantidadCursos} | <strong>Alumnos matriculados:</strong> {data.cantidadAlumnosMatriculados}</Typography>
      <Typography variant="h6">Cursos asociados</Typography>{data.cursos.length === 0 ? <Typography color="text.secondary">No hay cursos asociados.</Typography> : <Table size="small"><TableHead><TableRow><TableCell>Curso</TableCell><TableCell>Alumnos</TableCell></TableRow></TableHead><TableBody>{data.cursos.map((item) => <TableRow key={item.idCurso}><TableCell>{item.curso}</TableCell><TableCell>{item.cantidadAlumnos}</TableCell></TableRow>)}</TableBody></Table>}
    </Stack>}
  </DetalleModal>;
}
