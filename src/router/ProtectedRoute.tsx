import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Rol } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  roles?:   Rol[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { usuario, cargando } = useAuth();

  // Muestra spinner mientras carga la sesión
  if (cargando) {
    return (
      <Box sx={{
        minHeight:      '100vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    const dashboards: Record<Rol, string> = {
      Administrador: '/admin',
      Docente:       '/docente',
      Tutor:         '/tutor',
    };
    return <Navigate to={dashboards[usuario.rol]} replace />;
  }

  return <>{children}</>;
}