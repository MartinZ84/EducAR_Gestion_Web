import { useEffect, useState } from 'react';
import {
    Box, Grid, Card, CardContent, Typography,
    CircularProgress, Avatar, Alert
} from '@mui/material';
import {
    School, ChildCare, FamilyRestroom, Class,
    TrendingUp, CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { getDocentes } from '../../../api/docentesApi';
import { getAlumnos } from '../../../api/alumnosApi';
import { getTutores } from '../../../api/tutoresApi';
import { getCursos } from '../../../api/cursosApi';
import { extraerMensajeError } from '../../../utils/apiErrors';

// Tarjeta de estadística reutilizable
interface StatCardProps {
    titulo: string;
    valor: number | string;
    icono: React.ReactNode;
    color: string;
    cargando?: boolean;
}

function StatCard({ titulo, valor, icono, color, cargando }: StatCardProps) {
    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {titulo}
                        </Typography>
                        {cargando
                            ? <CircularProgress size={24} />
                            : <Typography variant="h4" sx={{ fontWeight: 700 }}>{valor}</Typography>
                        }
                    </Box>
                    <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
                        {icono}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function AdminDashboard() {
    const { usuario } = useAuth();
    const [stats, setStats] = useState({ docentes: 0, alumnos: 0, tutores: 0, cursos: 0 });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    // Cargamos los contadores al montar el componente
    useEffect(() => {
        const cargar = async () => {
            try {
                // Promise.all: ejecuta todas las llamadas en paralelo (más rápido)
                const [d, a, t, c] = await Promise.all([
                    getDocentes(1, 1),
                    getAlumnos(1, 1),
                    getTutores(1, 1),
                    getCursos(1, 1),
                ]);
                setStats({
                    docentes: d.totalRegistros,
                    alumnos: a.totalRegistros,
                    tutores: t.totalRegistros,
                    cursos: c.totalRegistros,
                });
            } catch (err) {
                setError(extraerMensajeError(err));
            } finally {
                setCargando(false);
            }
        };
        cargar();
    }, []);

    return (
        <Box>
            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
            {/* Saludo */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ¡Bienvenido, {usuario?.nombreCompleto?.split(' ')[0]}!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Administrador General — resumen del sistema
                </Typography>
            </Box>

            {/* Tarjetas de estadísticas — Grid responsivo */}
            {/* Grid xs=12 → 1 columna en mobile, sm=6 → 2 en tablet, md=3 → 4 en desktop */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard titulo="Docentes" valor={stats.docentes} icono={<School />}
                        color="#1565C0" cargando={cargando} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard titulo="Alumnos" valor={stats.alumnos} icono={<ChildCare />}
                        color="#2E7D32" cargando={cargando} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard titulo="Tutores" valor={stats.tutores} icono={<FamilyRestroom />}
                        color="#E65100" cargando={cargando} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard titulo="Cursos" valor={stats.cursos} icono={<Class />}
                        color="#6A1B9A" cargando={cargando} />
                </Grid>
            </Grid>

            {/* Accesos rápidos */}
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
    Accesos rápidos
</Typography>

<Grid container spacing={2}>
    {[
        { label: 'Asistencia general', sub: '94% promedio hoy', icon: <CheckCircle />, color: '#2E7D32' },
        { label: 'Alertas de notas', sub: '2 alumnos sin calificar', icon: <TrendingUp />, color: '#E65100' },
    ].map((item) => (       
        <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 }, transition: 'box-shadow 0.2s' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: item.color, flexShrink: 0 }}>
                        {item.icon}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography 
                            variant="body1" 
                            sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                            {item.label}
                        </Typography>
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                            {item.sub}
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    ))}
</Grid>
        </Box>
    );
}