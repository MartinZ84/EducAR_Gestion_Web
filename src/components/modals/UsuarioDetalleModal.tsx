import { Stack, Typography, Chip } from '@mui/material';
import DetalleModal from './DetalleModal';
import { getUsuarioDetalle } from '../../api/usuariosApi';
import { UsuarioDetalle } from '../../types';

export default function UsuarioDetalleModal({ open, id, onClose }: { open: boolean; id: number | null; onClose: () => void }) {
  return <DetalleModal open={open} id={id} title="Detalle del usuario" load={getUsuarioDetalle} onClose={onClose}>
    {(data: UsuarioDetalle) => <Stack spacing={1.5}>
      <Typography><strong>DNI:</strong> {data.dni}</Typography>
      <Typography><strong>Nombre:</strong> {data.nombre} {data.apellido}</Typography>
      <Typography><strong>Email:</strong> {data.email}</Typography>
      <Typography><strong>Rol:</strong> {data.rol}</Typography>
      <Typography><strong>Creado:</strong> {new Date(data.fechaCrea).toLocaleString()}</Typography>
      <Typography><strong>Actualizado:</strong> {new Date(data.fechaAct).toLocaleString()}</Typography>
      <Chip label={data.activo ? 'Activo' : 'Inactivo'} color={data.activo ? 'success' : 'default'} sx={{ alignSelf: 'flex-start' }} />
    </Stack>}
  </DetalleModal>;
}
