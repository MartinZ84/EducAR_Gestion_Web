import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid,
  Avatar, Chip, CircularProgress, List,
  ListItem, ListItemText, Divider
} from '@mui/material';
import {
  Class, HowToReg, Grade, Email, ChevronRight
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { getMisCursos, MiCurso } from '../../../api/docenteMateriaCursoApi';
import { contarNoLeidos } from '../../../api/mensajesApi';
import { extraerMensajeError } from '../../../utils/apiErrors';

export default function DocenteDashboard() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [misCursos, setMisCursos] = useState<MiCurso[]>([]);
  const [noLeidos, setNoLeidos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  Promise.all([getMisCursos(), contarNoLeidos()])
    .then(([cursos, nl]) => {
      setMisCursos(cursos);
      setNoLeidos(nl);
    })
    .catch((err) => setError(extraerMensajeError(err)))
    .finally(() => setCargando(false));
}, []);

  // Accesos rápidos del docente
  const accesos = [
    { label: 'Mis Cursos', sub: `${misCursos.length} asignaciones`, icon: <Class />, color: '#1565C0', ruta: '/docente/mis-cursos' },
    { label: 'Asistencia', sub: 'Registrar hoy', icon: <HowToReg />, color: '#2E7D32', ruta: '/docente/asistencia' },
    { label: 'Calificaciones', sub: 'Cargar notas', icon: <Grade />, color: '#E65100', ruta: '/docente/calificaciones' },
    { label: 'Mensajes', sub: `${Number(noLeidos) || 0} sin leer`, icon: <Email />, color: '#6A1B9A', ruta: '/docente/mensajes' },
  ];

  return (
    <Box>
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      {/* Saludo */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          ¡Bienvenido, {usuario?.nombreCompleto?.split(' ')[0]}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Panel docente — resumen de tu actividad
        </Typography>
      </Box>

      {/* Tarjetas de acceso rápido */}
      {/* Tarjetas de acceso rápido */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {accesos.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={item.label}>
            <Card
              onClick={() => navigate(item.ruta)}
              sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { boxShadow: 6, transform: 'translateY(-2px)' },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {item.sub}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: item.color, width: 48, height: 48 }}>
                    {item.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Mis cursos asignados */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Mis cursos asignados
      </Typography>

      <Card>
        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : misCursos.length === 0 ? (
          <CardContent>
            <Typography color="text.secondary"  sx={{ textAlign: 'center' }}>
              No tenés cursos asignados.
            </Typography>
          </CardContent>
        ) : (
          <List disablePadding>
            {misCursos.map((c, idx) => (
              <Box key={c.idDocenteMateriaCurso}>
                <ListItem
                  secondaryAction={<ChevronRight color="action" />}
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(21,101,192,0.04)' },
                  }}
                  onClick={() => navigate('/docente/asistencia')}
                >
                  <Avatar sx={{ bgcolor: '#1565C0', mr: 2, width: 40, height: 40, fontSize: 14 }}>
                    {c.grado}°{c.division}
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {c.grado}° "{c.division}" — {c.nombreMateria}
                        </Typography>
                        <Chip label={c.turno} size="small" variant="outlined" />
                      </Box>
                    }
                    secondary={`Ciclo ${c.anio}`}
                  />
                </ListItem>
                {idx < misCursos.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Card>
    </Box>
  );
}