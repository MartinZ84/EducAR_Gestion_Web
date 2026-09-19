import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Avatar, Badge, Box, Divider, Drawer, IconButton, List,
  ListItemButton, ListItemIcon, ListItemText, Toolbar, Tooltip,
  Typography, useMediaQuery, useTheme,
} from '@mui/material';
import {
  Assessment, ChevronLeft, Email, FamilyRestroom, HowToReg,
  Logout, Menu as MenuIcon, School,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { contarNoLeidos } from '../../api/mensajesApi';
import ConsultaAlumnoPage from './ConsultaAlumnoPage';
import MensajesPage from '../Docente/Mensajes/MensajesPage';
import MensajesNotification from '../../components/MensajesNotification';
import NotificationBar from '../../components/NotificationBar';

const DRAWER_WIDTH = 260;
const DRAWER_MINI_WIDTH = 72;

export default function TutorLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [drawerMobile, setDrawerMobile] = useState(false);
  const [noLeidos, setNoLeidos] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  useEffect(() => {
    contarNoLeidos().then(setNoLeidos).catch(() => setNoLeidos(0));
  }, [location.pathname]);

  const menuItems = [
    { label: 'Asistencia', icon: <HowToReg />, ruta: '/tutor/asistencia' },
    { label: 'Calificaciones', icon: <Assessment />, ruta: '/tutor/calificaciones' },
    { label: 'Mensajes', icon: <Badge badgeContent={noLeidos} color="error" max={99} overlap="circular"><Email /></Badge>, ruta: '/tutor/mensajes' },
  ];

  const navegar = (ruta: string) => {
    navigate(ruta);
    if (isMobile) setDrawerMobile(false);
  };

  const SidebarContent = () => <Box sx={{ display:'flex', flexDirection:'column', height:'100%' }}>
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:sidebarOpen?'space-between':'center', px:2, py:2, minHeight:64, color:'white', background:'linear-gradient(135deg, #0D47A1, #1976D2)' }}>
      {sidebarOpen && <Box sx={{ display:'flex', alignItems:'center', gap:1 }}><School sx={{ fontSize:28 }} /><Typography variant="h6" sx={{ fontWeight:700, fontSize:16 }}>EducAR</Typography></Box>}
      {!isMobile && <IconButton onClick={() => setSidebarOpen(v => !v)} sx={{ color:'white', p:.5 }}><ChevronLeft sx={{ transform:sidebarOpen?'rotate(0deg)':'rotate(180deg)', transition:'transform .3s' }} /></IconButton>}
    </Box>
    {sidebarOpen && <Box sx={{ px:2, py:2, borderBottom:'1px solid rgba(0,0,0,.08)' }}><Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}><Avatar sx={{ bgcolor:'#1565C0', width:36, height:36, fontSize:14 }}>{usuario?.nombreCompleto?.[0] ?? 'T'}</Avatar><Box><Typography variant="body2" sx={{ fontWeight:600, lineHeight:1.2 }}>{usuario?.nombreCompleto}</Typography><Typography variant="caption" color="text.secondary">Tutor</Typography></Box></Box></Box>}
    <List sx={{ flex:1, px:1, py:1 }}>{menuItems.map(item => { const activo=location.pathname===item.ruta || (location.pathname==='/tutor' && item.ruta==='/tutor/asistencia'); return <Tooltip key={item.ruta} title={!sidebarOpen?item.label:''} placement="right"><ListItemButton onClick={() => navegar(item.ruta)} sx={{ borderRadius:2, mb:.5, px:sidebarOpen?2:1.5, justifyContent:sidebarOpen?'flex-start':'center', bgcolor:activo?'primary.main':'transparent', color:activo?'white':'text.primary', '&:hover':{ bgcolor:activo?'primary.dark':'rgba(21,101,192,.08)' } }}><ListItemIcon sx={{ color:activo?'white':'text.secondary', minWidth:sidebarOpen?(item.ruta==='/tutor/mensajes'?48:40):'unset' }}>{item.icon}</ListItemIcon>{sidebarOpen && <ListItemText primary={item.label} slotProps={{ primary:{ sx:{ fontSize:14, fontWeight:activo?600:400 } } }} />}</ListItemButton></Tooltip>; })}</List>
    <Divider />
    <Box sx={{ p:1 }}><Tooltip title={!sidebarOpen?'Cerrar sesión':''} placement="right"><ListItemButton onClick={() => { logout(); navigate('/login'); }} sx={{ borderRadius:2, px:sidebarOpen?2:1.5, justifyContent:sidebarOpen?'flex-start':'center', color:'error.main', '&:hover':{ bgcolor:'rgba(211,47,47,.08)' } }}><ListItemIcon sx={{ color:'error.main', minWidth:sidebarOpen?40:'unset' }}><Logout /></ListItemIcon>{sidebarOpen && <ListItemText primary="Cerrar sesión" slotProps={{ primary:{ sx:{ fontSize:14, fontWeight:600 } } }} />}</ListItemButton></Tooltip></Box>
  </Box>;

  return <Box sx={{ display:'flex', minHeight:'100vh', bgcolor:'background.default' }}>
    {!isMobile && <Drawer variant="permanent" sx={{ width:sidebarOpen?DRAWER_WIDTH:DRAWER_MINI_WIDTH, flexShrink:0, '& .MuiDrawer-paper':{ width:sidebarOpen?DRAWER_WIDTH:DRAWER_MINI_WIDTH, boxSizing:'border-box', border:'none', boxShadow:'2px 0 8px rgba(0,0,0,.08)', overflowX:'hidden', transition:'width .3s ease' } }}><SidebarContent /></Drawer>}
    {isMobile && <Drawer variant="temporary" open={drawerMobile} onClose={() => setDrawerMobile(false)} sx={{ '& .MuiDrawer-paper':{ width:DRAWER_WIDTH } }}><SidebarContent /></Drawer>}
    <Box sx={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
      {isMobile && <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor:'white' }}><Toolbar><IconButton onClick={() => setDrawerMobile(true)} edge="start" sx={{ mr:2 }}><MenuIcon /></IconButton><FamilyRestroom sx={{ color:'primary.main', mr:1 }} /><Typography variant="h6" color="primary" sx={{ fontWeight:700 }}>EducAR Gestión</Typography></Toolbar></AppBar>}
      <NotificationBar><MensajesNotification ruta="/tutor/mensajes" /></NotificationBar>
      <Box sx={{ flex:1, p:{ xs:2, md:3 }, overflow:'auto' }}><Routes>
        <Route index element={<ConsultaAlumnoPage tipo="asistencia" />} />
        <Route path="asistencia" element={<ConsultaAlumnoPage tipo="asistencia" />} />
        <Route path="calificaciones" element={<ConsultaAlumnoPage tipo="calificaciones" />} />
        <Route path="mensajes" element={<MensajesPage />} />
      </Routes></Box>
    </Box>
  </Box>;
}
