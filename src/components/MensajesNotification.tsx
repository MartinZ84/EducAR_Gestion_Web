import { useEffect, useState } from 'react';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { Mail } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { contarNoLeidos } from '../api/mensajesApi';

export default function MensajesNotification({ ruta }: { ruta: string }) {
  const [cantidad, setCantidad] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    // Consulta liviana que devuelve únicamente la cantidad de mensajes sin leer.
    // Se repite cada 15 segundos para lograr una actualización casi en tiempo real
    // sin agregar SignalR, WebSockets ni infraestructura adicional al proyecto.
    const actualizar = () => contarNoLeidos().then(setCantidad).catch(() => setCantidad(0));
    actualizar();
    const intervalo = window.setInterval(actualizar, 15000);

    // MensajesPage emite este evento al enviar o leer un mensaje. De esta forma
    // la insignia se actualiza inmediatamente, sin esperar al próximo intervalo.
    window.addEventListener('mensajes-actualizados', actualizar);
    return () => { window.clearInterval(intervalo); window.removeEventListener('mensajes-actualizados', actualizar); };
  }, []);
  // Esta es la notificación superior. El Badge muestra la cantidad pendiente y
  // al pulsarlo abre directamente la bandeja de mensajes del rol actual.
  const descripcion = cantidad ? `${cantidad} mensajes pendientes de leer` : 'No hay mensajes pendientes';
  return <Tooltip title={descripcion}>
    <IconButton aria-label={descripcion} onClick={() => navigate(ruta)} sx={{ bgcolor:'background.paper', border:1, borderColor:'divider', '&:hover':{ bgcolor:'grey.100' } }}>
      <Badge badgeContent={cantidad} color="error" max={99} overlap="circular"><Mail color={cantidad ? 'primary' : 'action'} /></Badge>
    </IconButton>
  </Tooltip>;
}
