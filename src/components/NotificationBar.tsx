import { ReactNode } from 'react';
import { Box } from '@mui/material';

interface NotificationBarProps {
  children: ReactNode;
}

/**
 * Reserva una fila propia para los avisos globales.
 * Al formar parte del flujo de la pantalla, los iconos nunca cubren títulos,
 * leyendas ni botones de acción del contenido que aparece debajo.
 */
export default function NotificationBar({ children }: NotificationBarProps) {
  return (
    <Box
      component="aside"
      aria-label="Notificaciones"
      sx={{
        minHeight: 56,
        px: { xs: 2, md: 3 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 2,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );
}
