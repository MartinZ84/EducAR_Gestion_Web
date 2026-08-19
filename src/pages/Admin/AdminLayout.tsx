import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Divider, useMediaQuery, useTheme, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  School,
  FamilyRestroom,
  ChildCare,
  Book,
  Class,
  CalendarMonth,
  DateRange,
  Link as LinkIcon,
  Logout,
  ChevronLeft,
  Description,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

// Vistas
import AdminDashboard from './Dashboard/AdminDashboard';
import DocentesPage from './Docentes/DocentesPage';
import TutoresPage from './Tutores/TutoresPage';
import AlumnosPage from './Alumnos/AlumnosPage';
import MateriasPage from './Materias/MateriasPage';
import CursosPage from './Cursos/CursosPage';
import CiclosLectivosPage from './CiclosLectivos/CiclosLectivosPage';
import UsuariosPage from './Usuarios/UsuariosPage';
import AsignacionesPage from './Asignaciones/AsignacionesPage';
import MatriculasPage from './Matriculas/MatriculasPage';

const DRAWER_WIDTH = 260;
const DRAWER_MINI_WIDTH = 72;

// Definición de items del menú con sus rutas e íconos
const menuItems = [
  { label: 'Dashboard', icon: <Dashboard />, ruta: '/admin' },
  { label: 'Docentes', icon: <School />, ruta: '/admin/docentes' },
  { label: 'Tutores', icon: <FamilyRestroom />, ruta: '/admin/tutores' },
  { label: 'Alumnos', icon: <ChildCare />, ruta: '/admin/alumnos' },
  { label: 'Materias', icon: <Description />, ruta: '/admin/materias' },
  { label: 'Cursos', icon: <Class />, ruta: '/admin/cursos' },
  { label: 'Ciclos Lectivos', icon: <CalendarMonth />, ruta: '/admin/ciclos' },
  { label: 'Usuarios', icon: <People />, ruta: '/admin/usuarios' },
  { label: 'Asignaciones', icon: <LinkIcon />, ruta: '/admin/asignaciones' },
  { label: 'Matrículas', icon: <School />, ruta: '/admin/matriculas' },
];

export default function AdminLayout() {
  const theme = useTheme();
  // useMediaQuery: hook que detecta el ancho de pantalla
  // En mobile (< md = 900px) el sidebar empieza cerrado
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [drawerMobile, setDrawerMobile] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavegar = (ruta: string) => {
    navigate(ruta);
    if (isMobile) setDrawerMobile(false);
  };

  // Contenido del sidebar — reutilizado en versión mobile y desktop
  const SidebarContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header del sidebar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: sidebarOpen ? 'space-between' : 'center',
        px: 2, py: 2,
        background: 'linear-gradient(135deg, #0D47A1, #1976D2)',
        color: 'white',
        minHeight: 64,
      }}>
        {sidebarOpen && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16 }}>
              EducAR
            </Typography>
          </Box>
        )}
        {/* Botón para colapsar el sidebar en desktop */}
        {!isMobile && (
          <IconButton
            onClick={() => setSidebarOpen(!sidebarOpen)}
            sx={{ color: 'white', p: 0.5 }}
          >
            <ChevronLeft sx={{
              transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s'
            }} />
          </IconButton>
        )}
      </Box>

      {/* Info del usuario */}
      {sidebarOpen && (
        <Box sx={{ px: 2, py: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#1565C0', width: 36, height: 36, fontSize: 14 }}>
              {usuario?.nombreCompleto?.[0] ?? 'A'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {usuario?.nombreCompleto}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administrador
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Items de navegación */}
      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {menuItems.map((item) => {
          // Detectamos la ruta activa para resaltarla
          const activo = location.pathname === item.ruta ||
            (item.ruta !== '/admin' && location.pathname.startsWith(item.ruta));

          return (
            <Tooltip
              key={item.ruta}
              title={!sidebarOpen ? item.label : ''}
              placement="right"
            >
              <ListItemButton
                onClick={() => handleNavegar(item.ruta)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  px: sidebarOpen ? 2 : 1.5,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  bgcolor: activo ? 'primary.main' : 'transparent',
                  color: activo ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: activo ? 'primary.dark' : 'rgba(21,101,192,0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{
                  color: activo ? 'white' : 'text.secondary',
                  minWidth: sidebarOpen ? 40 : 'unset',
                }}>
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && (
                  <ListItemText
                    primary={item.label}
                    // primaryTypographyProps={{ fontSize: 14, fontWeight: activo ? 600 : 400 }}
                    // slotProps={{ primary: { fontSize: 14, fontWeight: activo ? 600 : 400 } }}
                    slotProps={{
                      primary: {
                        sx: { fontSize: 14, fontWeight: activo ? 600 : 400 }
                      }
                    }
                    }
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider />

      {/* Botón logout */}
      <Box sx={{ p: 1 }}>
        <Tooltip title={!sidebarOpen ? 'Cerrar sesión' : ''} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              px: sidebarOpen ? 2 : 1.5,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              color: 'error.main',
              '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' }
            }}
          >
            <ListItemIcon sx={{ color: 'error.main', minWidth: sidebarOpen ? 40 : 'unset' }}>
              <Logout />
            </ListItemIcon>
            {sidebarOpen && (
              <ListItemText
                primary="Cerrar sesión"
                // primaryTypographyProps={{ fontSize: 14 }}
                slotProps={{
                  primary: {
                    sx: { fontSize: 14, fontWeight: 600 }
                  }
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* SIDEBAR DESKTOP — permanente, colapsable */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: sidebarOpen ? DRAWER_WIDTH : DRAWER_MINI_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: sidebarOpen ? DRAWER_WIDTH : DRAWER_MINI_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: '2px 0 8px rgba(0,0,0,0.08)',
              overflowX: 'hidden',
              transition: 'width 0.3s ease',
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* SIDEBAR MOBILE — temporal, se abre desde el botón hamburguesa */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerMobile}
          onClose={() => setDrawerMobile(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* TOP BAR en mobile */}
        {isMobile && (
          <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
            <Toolbar>
              <IconButton onClick={() => setDrawerMobile(true)} edge="start" sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <School sx={{ color: 'primary.main', mr: 1 }} />
              <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                EducAR Gestión
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        {/* Área de contenido — las rutas se renderizan acá */}
        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="docentes/*" element={<DocentesPage />} />
            <Route path="tutores/*" element={<TutoresPage />} />
            <Route path="alumnos/*" element={<AlumnosPage />} />
            <Route path="materias/*" element={<MateriasPage />} />
            <Route path="cursos/*" element={<CursosPage />} />
            <Route path="ciclos/*" element={<CiclosLectivosPage />} />
            <Route path="usuarios/*" element={<UsuariosPage />} />
            <Route path="asignaciones/*" element={<AsignacionesPage />} />
            <Route path="/matriculas" element={<MatriculasPage />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}