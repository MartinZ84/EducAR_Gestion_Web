import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, IconButton,
  List, ListItemButton, ListItemIcon, ListItemText,
  Avatar, Divider, Badge, useMediaQuery, useTheme, Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Class,
  HowToReg,
  Grade,
  Article,
  Email,
  Logout,
  ChevronLeft,
  School,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { contarNoLeidos } from '../../api/mensajesApi';

import DocenteDashboard from './Dashboard/DocenteDashboard';
import MisCursosPage from './MisCursos/MisCursosPage';
import AsistenciaPage from './Asistencia/AsistenciaPage';
import CalificacionesPage from './Calificaciones/CalificacionesPage';
import BoletinesPage from './Boletines/BoletinesPage';
import MensajesPage from './Mensajes/MensajesPage';

const DRAWER_WIDTH = 260;
const DRAWER_MINI_WIDTH = 72;

export default function DocenteLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [drawerMobile, setDrawerMobile] = useState(false);
  const [noLeidos, setNoLeidos] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

 useEffect(() => {
  contarNoLeidos()
    .then((cantidad) => {
      // Nos aseguramos de que sea un número
      const num = typeof cantidad === 'number' ? cantidad : 0;
      setNoLeidos(num);
    })
    .catch(() => setNoLeidos(0));
}, [location.pathname]);

  const menuItems = [
    { label: 'Dashboard', icon: <Dashboard />, ruta: '/docente' },
    { label: 'Mis Cursos', icon: <Class />, ruta: '/docente/mis-cursos' },
    { label: 'Asistencia', icon: <HowToReg />, ruta: '/docente/asistencia' },
    { label: 'Calificaciones', icon: <Grade />, ruta: '/docente/calificaciones' },
    { label: 'Boletines', icon: <Article />, ruta: '/docente/boletines' },
    {
      label: 'Mensajes',
      ruta: '/docente/mensajes',
      icon: (
        <Badge badgeContent={Number(noLeidos) || 0} color="error" max={99}>
          <Email />
        </Badge>
      )
    },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleNavegar = (ruta: string) => {
    navigate(ruta);
    if (isMobile) setDrawerMobile(false);
  };

  const SidebarContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Header */}
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
        {!isMobile && (
          <IconButton onClick={() => setSidebarOpen(!sidebarOpen)} sx={{ color: 'white', p: 0.5 }}>
            <ChevronLeft sx={{
              transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
              transition: 'transform 0.3s',
            }} />
          </IconButton>
        )}
      </Box>

      {/* Info usuario */}
      {sidebarOpen && (
        <Box sx={{ px: 2, py: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#1565C0', width: 36, height: 36, fontSize: 14 }}>
              {usuario?.nombreCompleto?.[0] ?? 'D'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                {usuario?.nombreCompleto}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Docente
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Navegación */}
      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {menuItems.map((item) => {
          const activo = location.pathname === item.ruta ||
            (item.ruta !== '/docente' && location.pathname.startsWith(item.ruta));

          return (
            <Tooltip key={item.ruta} title={!sidebarOpen ? item.label : ''} placement="right">
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
                    slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 600 } } }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>

      <Divider />

      {/* Logout */}
      <Box sx={{ p: 1 }}>
        <Tooltip title={!sidebarOpen ? 'Cerrar sesión' : ''} placement="right">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              px: sidebarOpen ? 2 : 1.5,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              color: 'error.main',
              '&:hover': { bgcolor: 'rgba(211,47,47,0.08)' },
            }}
          >
            <ListItemIcon sx={{ color: 'error.main', minWidth: sidebarOpen ? 40 : 'unset' }}>
              <Logout />
            </ListItemIcon>
            {sidebarOpen && (
              <ListItemText
                primary="Cerrar sesión"
                slotProps={{ primary: { sx: { fontSize: 14 } } }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* Sidebar desktop */}
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

      {/* Sidebar mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerMobile}
          onClose={() => setDrawerMobile(false)}
          sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
        >
          <SidebarContent />
        </Drawer>
      )}

      {/* Contenido */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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

        <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
          <Routes>
            <Route index element={<DocenteDashboard />} />
            <Route path="mis-cursos" element={<MisCursosPage />} />
            <Route path="asistencia" element={<AsistenciaPage />} />
            <Route path="calificaciones" element={<CalificacionesPage />} />
            <Route path="boletines" element={<BoletinesPage />} />
            <Route path="mensajes" element={<MensajesPage />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}