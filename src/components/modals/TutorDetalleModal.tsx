import { Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import DetalleModal from './DetalleModal';
import { getTutorDetalle } from '../../api/tutoresApi';
import { TutorDetalle } from '../../types';

export default function TutorDetalleModal({ open, id, onClose }: { open: boolean; id: number | null; onClose: () => void }) {
  return <DetalleModal open={open} id={id} title="Detalle del tutor" load={getTutorDetalle} onClose={onClose}>
    {(data: TutorDetalle) => <Stack spacing={2}>
      <Typography><strong>DNI:</strong> {data.dni}</Typography><Typography><strong>Nombre:</strong> {data.nombre} {data.apellido}</Typography><Typography><strong>Email:</strong> {data.email}</Typography>
      <Chip label={data.activo ? 'Activo' : 'Inactivo'} color={data.activo ? 'success' : 'default'} sx={{ alignSelf: 'flex-start' }} />
      <Typography variant="h6">Alumnos asignados</Typography>
      {data.alumnosAsignados.length === 0 ? <Typography color="text.secondary">No tiene alumnos asignados.</Typography> : <Table size="small"><TableHead><TableRow><TableCell>DNI</TableCell><TableCell>Alumno</TableCell><TableCell>Curso actual</TableCell></TableRow></TableHead><TableBody>{data.alumnosAsignados.map((item) => <TableRow key={item.idAlumno}><TableCell>{item.dni}</TableCell><TableCell>{item.nombreCompleto}</TableCell><TableCell>{item.cursoActual}</TableCell></TableRow>)}</TableBody></Table>}
    </Stack>}
  </DetalleModal>;
}
