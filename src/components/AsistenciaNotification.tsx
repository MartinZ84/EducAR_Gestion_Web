import { useEffect, useState } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { Notifications } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPendientesAsistencia } from '../api/asistenciaApi';

export default function AsistenciaNotification({ ruta }: { ruta: string }) {
  const [cantidad, setCantidad] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { getPendientesAsistencia().then(r => setCantidad(r.cantidad)).catch(() => setCantidad(0)); }, [location.pathname]);
  const descripcion = cantidad ? `${cantidad} días de asistencia pendientes` : 'Asistencia al día';
  return <Tooltip title={descripcion}>
    <IconButton aria-label={descripcion} onClick={() => navigate(ruta, { state: { abrirCalendario: true } })} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', '&:hover': { bgcolor: 'grey.100' } }}>
      <Badge badgeContent={cantidad} color="error" max={99} overlap="circular"><Notifications color={cantidad ? 'warning' : 'action'} /></Badge>
    </IconButton>
  </Tooltip>;
}
