import { useState, useCallback, useEffect } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, InputAdornment, MenuItem,
  TextField, Tooltip, Typography, Alert
} from '@mui/material';
import { Add, Edit, Search, Visibility, VisibilityOff, Clear } from '@mui/icons-material';
import TablaBase from '../../../components/common/TablaBase';
import { usePaginado } from '../../../hooks/usePaginado';
import { extraerMensajeError } from '../../../utils/apiErrors';
import api from '../../../api/axios';
import { ResultadoPaginado } from '../../../types';
import { getRoles, Rol } from '../../../api/rolesApi';
import { useAuth } from '../../../context/AuthContext';

interface Usuario {
  idUsuario: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  rol: string;
  activo: boolean;
}

interface FormUsuario {
  idRol: string;
  idEscuela: string;
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  contrasena: string;
  activo: boolean;
}

interface CreateUsuarioDto {
  idRol: number;
  idEscuela: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  contrasena: string;
}

interface UpdateUsuarioDto {
  idRol: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
}

interface FormErrors {
  idRol?: string;
  dni?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  nombreUsuario?: string;
  contrasena?: string;
}

const FORM_INICIAL: FormUsuario = {
  idRol: '', idEscuela: '1', dni: '', nombre: '', apellido: '',
  email: '', nombreUsuario: '', contrasena: '', activo: true
};

// MODIFICADO: getUsuarios acepta filtros
const getUsuarios = (
  p: number,
  c: number,
  nombre?: string,
  apellido?: string,
  dni?: number
) =>
  api.get<ResultadoPaginado<Usuario>>('/usuarios', {
    params: {
      pagina: p,
      cantidad: c,
      ...(nombre && { nombre }),
      ...(apellido && { apellido }),
      ...(dni && { dni })
    }
  }).then(r => r.data);

const createUsuario = (dto: CreateUsuarioDto) =>
  api.post('/usuarios', dto).then(r => r.data);

const updateUsuario = (id: number, dto: UpdateUsuarioDto) =>
  api.put(`/usuarios/${id}`, dto).then(r => r.data);

export default function UsuariosPage() {
  const [busqueda, setBusqueda] = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState('');
  const [roles, setRoles] = useState<Rol[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<FormUsuario>(FORM_INICIAL);
  const [campoErrors, setCampoErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const { usuario } = useAuth();

  // MODIFICADO: fetchFn con filtros
  // UsuariosPage.tsx - fetchFn
  const fetchFn = useCallback(
    (p: number, c: number) => {
      const limpia = busquedaActiva.trim();

      if (!limpia) {
        return getUsuarios(p, c);
      }

      const esDni = /^\d+$/.test(limpia);

      if (esDni) {
        return getUsuarios(p, c, undefined, undefined, Number(limpia));
      } else {
        // Enviar solo nombre para búsqueda OR
        return getUsuarios(p, c, limpia, undefined, undefined);
      }
    },
    [busquedaActiva]
  );

  const { datos, pagina, totalPaginas, cargando, error, cargar, recargar } = usePaginado<Usuario>(fetchFn);

  useEffect(() => {
    cargar(1);
  }, [busquedaActiva]); // Dependencia en busquedaActiva

  useEffect(() => {
    getRoles()
      .then((rolesObtenidos) => {
        setRoles(rolesObtenidos);
        if (rolesObtenidos.length > 0) {
          setForm((actual) => ({
            ...actual,
            idRol: actual.idRol || String(rolesObtenidos[0].id),
          }));
        }
      })
      .catch((err) => setFormError(extraerMensajeError(err)));
  }, []);

  const handleBuscar = () => {
    setBusquedaActiva(busqueda.trim());
    cargar(1);
  };

  const limpiarBusqueda = () => {
  setBusqueda('');
  setBusquedaActiva('');
  // Recargar con un pequeño retraso para asegurar que el estado se actualizó
  setTimeout(() => {
    cargar(1);
  }, 0);
};

  const abrirCrear = () => {
    setEditando(null);
    setForm({ ...FORM_INICIAL, idRol: roles.length > 0 ? String(roles[0].id) : '', idEscuela: String(usuario?.idEscuela ?? 1) });
    setCampoErrors({});
    setFormError('');
    setDialogOpen(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditando(u);
    setForm({
      idRol: String(roles.find(r => r.nombre === u.rol)?.id ?? ''),
      idEscuela: String(usuario?.idEscuela ?? 1),
      dni: String(u.dni), nombre: u.nombre, apellido: u.apellido,
      email: u.email, nombreUsuario: u.nombreUsuario,
      contrasena: '', activo: u.activo,
    });
    setCampoErrors({});
    setFormError('');
    setDialogOpen(true);
  };

  const cerrarDialog = () => {
    setDialogOpen(false);
    setCampoErrors({});
    setFormError('');
  };

  const handleGuardar = async () => {
    const errores: FormErrors = {};

    if (!form.idRol) errores.idRol = 'Seleccioná un rol.';
    if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
    if (!form.apellido.trim()) errores.apellido = 'El apellido es obligatorio.';
    if (!form.dni || isNaN(Number(form.dni)) || Number(form.dni) < 1000000 || Number(form.dni) > 99999999)
      errores.dni = 'El DNI debe tener entre 7 y 8 dígitos.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errores.email = 'Ingresá un email válido.';
    if (!editando) {
      if (!form.nombreUsuario.trim()) errores.nombreUsuario = 'El nombre de usuario es obligatorio.';
      if (!form.contrasena || form.contrasena.length < 6)
        errores.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (Object.keys(errores).length > 0) { setCampoErrors(errores); return; }

    setGuardando(true);
    setFormError('');
    setCampoErrors({});

    try {
      if (editando) {
        await updateUsuario(editando.idUsuario, {
          idRol: Number(form.idRol),
          dni: Number(form.dni),
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          activo: form.activo,
        });
      } else {
        await createUsuario({
          idRol: Number(form.idRol),
          idEscuela: Number(form.idEscuela || usuario?.idEscuela || 1),
          dni: Number(form.dni),
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          nombreUsuario: form.nombreUsuario,
          contrasena: form.contrasena,
        });
      }
      cerrarDialog();
      recargar();
    } catch (err) {
      setFormError(extraerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const columnas = [
    { label: 'Apellido y Nombre', render: (u: Usuario) => `${u.apellido}, ${u.nombre}` },
    { label: 'DNI', render: (u: Usuario) => u.dni.toLocaleString('es-AR') },
    { label: 'Usuario', render: (u: Usuario) => u.nombreUsuario },
    { label: 'Email', render: (u: Usuario) => u.email },
    { label: 'Rol', render: (u: Usuario) => <Chip label={u.rol} size="small" color="primary" variant="outlined" /> },
    {
      label: 'Estado',
      render: (u: Usuario) => (
        <Chip label={u.activo ? 'Activo' : 'Inactivo'} color={u.activo ? 'success' : 'default'} size="small" />
      )
    },
    {
      label: 'Acciones', width: '80px',
      render: (u: Usuario) => (
        <Tooltip title="Editar">
          <IconButton size="small" color="primary" onClick={() => abrirEditar(u)}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Usuarios</Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de usuarios de la institución
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>
          Nuevo Usuario
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Nombre, apellido o DNI"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          sx={{ maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search color="action" /></InputAdornment>
              ),
              endAdornment: busqueda && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={limpiarBusqueda} edge="end">
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button variant="outlined" onClick={handleBuscar}>Buscar</Button>
        <Button
          variant="outlined"
          onClick={limpiarBusqueda}
          disabled={!busqueda && !busquedaActiva}
        >
          Limpiar
        </Button>
      </Box>

      <TablaBase
        columnas={columnas}
        datos={datos} // Usar datos directamente
        cargando={cargando}
        error={error}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onCambiarPagina={cargar}
        mensajeVacio="No se encontraron usuarios."
      />

      {/* ... resto del código del diálogo igual */}
    </Box>
  );
}