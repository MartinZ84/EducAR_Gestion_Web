import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import Login from '../pages/Login/Login';
import AdminLayout   from '../pages/Admin/AdminLayout';
import DocenteLayout from '../pages/Docente/DocenteLayout';
import TutorLayout   from '../pages/Tutor/TutorLayout';

const rutasPorRol: Record<string, string> = {
  Administrador: '/admin',
  Docente:       '/docente',
  Tutor:         '/tutor',
};

export default function AppRouter() {
  const { usuario, cargando } = useAuth();

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

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            usuario
              ? <Navigate to={rutasPorRol[usuario.rol] || '/login'} replace />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={['Administrador']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/docente/*"
          element={
            <ProtectedRoute roles={['Docente']}>
              <DocenteLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tutor/*"
          element={
            <ProtectedRoute roles={['Tutor']}>
              <TutorLayout />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}