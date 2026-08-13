import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button,
  Typography, InputAdornment, IconButton,
  CircularProgress, Alert, MenuItem
} from '@mui/material';
import {
  Person, Lock, Visibility, VisibilityOff, School
} from '@mui/icons-material';
import { login as loginApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { extraerMensajeError } from '../../utils/apiErrors';

interface LoginForm {
  nombreUsuario: string;
  contrasena:    string;
  idEscuela:     number;
}

function extraerIdUsuario(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const id = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    return Number(id);
  } catch {
    return 0;
  }
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({
    nombreUsuario: '',
    contrasena:    '',
    idEscuela:     1,
  });
  const [mostrarPass, setMostrarPass] = useState(false);
  const [cargando, setCargando]       = useState(false);
  const [error, setError]             = useState('');

  const navigate  = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'idEscuela' ? Number(value) : value,
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombreUsuario || !form.contrasena) {
      setError('Completá todos los campos.');
      return;
    }
    setCargando(true);
    try {
      const datos = await loginApi(
        form.nombreUsuario,
        form.contrasena,
        form.idEscuela
      );

      const idUsuario = extraerIdUsuario(datos.token);

      login({
        idUsuario,
        nombreUsuario:  datos.nombreUsuario,
        nombreCompleto: datos.nombreCompleto,
        rol:            datos.rol,
        idEscuela:      datos.idEscuela,
      }, datos.token);

      const destinos: Record<string, string> = {
        Administrador: '/admin',
        Docente:       '/docente',
        Tutor:         '/tutor',
      };
      navigate(destinos[datos.rol] || '/');

    } catch (err: unknown) {
      setError(extraerMensajeError(err) || 'Usuario o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight:      '100vh',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        background:     'linear-gradient(135deg, #0D47A1 0%, #1976D2 50%, #42A5F5 100%)',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>

          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width:          80,
                height:         80,
                borderRadius:   '50%',
                background:     'linear-gradient(135deg, #1565C0, #42A5F5)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                mx:             'auto',
                mb:             2,
                boxShadow:      '0 4px 20px rgba(21,101,192,0.4)',
              }}
            >
              <School sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
              EducAR Gestión
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Sistema de Administración Académica
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Iniciá sesión para acceder al portal académico.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              variant="outlined"
              name="nombreUsuario"
              label="Nombre de usuario"
              value={form.nombreUsuario}
              onChange={handleChange}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              name="contrasena"
              label="Contraseña"
              type={mostrarPass ? 'text' : 'password'}
              value={form.contrasena}
              onChange={handleChange}
              sx={{ mb: 2 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setMostrarPass(!mostrarPass)}
                        edge="end"
                      >
                        {mostrarPass ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              select
              name="idEscuela"
              label="Escuela"
              value={form.idEscuela}
              onChange={handleChange}
              sx={{ mb: 3 }}
            >
              <MenuItem value={1}>Escuela N° 1</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={cargando}
              sx={{ mb: 2 }}
            >
              {cargando
                ? <CircularProgress size={24} color="inherit" />
                : 'Ingresar'
              }
            </Button>

          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', textAlign: 'center', mt: 2 }}
          >
            © 2026 EducAR Gestión. Sistema de Administración Académica.
          </Typography>

        </CardContent>
      </Card>
    </Box>
  );
}