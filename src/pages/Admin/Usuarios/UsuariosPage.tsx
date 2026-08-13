import { useState, useCallback, useEffect } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, InputAdornment, MenuItem,
  TextField, Tooltip, Typography, Alert
} from '@mui/material';
import { Add, Edit, Search, Visibility, VisibilityOff } from '@mui/icons-material';
import TablaBase from '../../../components/common/TablaBase';
import { usePaginado } from '../../../hooks/usePaginado';
import { extraerMensajeError } from '../../../utils/apiErrors';
import api from '../../../api/axios';
import { ResultadoPaginado } from '../../../types';
import { getRoles, Rol } from '../../../api/rolesApi';
import { useAuth } from '../../../context/AuthContext';

interface Usuario {
  idUsuario:     number;
  dni:           number;
  nombre:        string;
  apellido:      string;
  email:         string;
  nombreUsuario: string;
  rol:           string;
  activo:        boolean;
}

interface FormUsuario {
  idRol:         string;
  idEscuela:     string;
  dni:           string;
  nombre:        string;
  apellido:      string;
  email:         string;
  nombreUsuario: string;
  contrasena:    string;
  activo:        boolean;
}

// NUEVO: DTO para crear (sin 'activo', con tipos numéricos)
interface CreateUsuarioDto {
  idRol:         number;
  idEscuela:     number;
  dni:           number;
  nombre:        string;
  apellido:      string;
  email:         string;
  nombreUsuario: string;
  contrasena:    string;
}

// NUEVO: DTO para editar
interface UpdateUsuarioDto {
  idRol:    number;
  dni:      number;
  nombre:   string;
  apellido: string;
  email:    string;
  activo:   boolean;
}

interface FormErrors {
  idRol?:         string;
  dni?:           string;
  nombre?:        string;
  apellido?:      string;
  email?:         string;
  nombreUsuario?: string;
  contrasena?:    string;
}

const FORM_INICIAL: FormUsuario = {
  idRol: '', idEscuela: '1', dni: '', nombre: '', apellido: '',
  email: '', nombreUsuario: '', contrasena: '', activo: true
};

const getUsuarios = (p: number, c: number) =>
  api.get<ResultadoPaginado<Usuario>>('/usuarios', { params: { pagina: p, cantidad: c } })
     .then(r => r.data);

const createUsuario = (dto: CreateUsuarioDto) =>
  api.post('/usuarios', dto).then(r => r.data);

const updateUsuario = (id: number, dto: UpdateUsuarioDto) =>
  api.put(`/usuarios/${id}`, dto).then(r => r.data);
export default function UsuariosPage() {
  const [busqueda, setBusqueda]             = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState('');
  const [roles, setRoles]                   = useState<Rol[]>([]);
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [editando, setEditando]             = useState<Usuario | null>(null);
  const [form, setForm]                     = useState<FormUsuario>(FORM_INICIAL);
  const [campoErrors, setCampoErrors]       = useState<FormErrors>({});
  const [formError, setFormError]           = useState('');
  const [mostrarPass, setMostrarPass]       = useState(false);
  const [guardando, setGuardando]           = useState(false);
  const { usuario } = useAuth();

  const fetchFn = useCallback(
    (p: number, c: number) => getUsuarios(p, c),
    []
  );

  const { datos, pagina, totalPaginas, cargando, error, cargar, recargar } = usePaginado<Usuario>(fetchFn);

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

  const datosVisibles = busquedaActiva
    ? datos.filter((u) => {
        const texto = `${u.nombre} ${u.apellido} ${u.nombreUsuario} ${u.email} ${u.rol}`.toLowerCase();
        return texto.includes(busquedaActiva.toLowerCase());
      })
    : datos;

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
    if (!form.nombre.trim())   errores.nombre   = 'El nombre es obligatorio.';
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
          idRol:    Number(form.idRol),
          dni:      Number(form.dni),
          nombre:   form.nombre,
          apellido: form.apellido,
          email:    form.email,
          activo:   form.activo,
        });
      } else {
        await createUsuario({
          idRol:         Number(form.idRol),
          idEscuela:     Number(form.idEscuela || usuario?.idEscuela || 1),
          dni:           Number(form.dni),
          nombre:        form.nombre,
          apellido:      form.apellido,
          email:         form.email,
          nombreUsuario: form.nombreUsuario,
          contrasena:    form.contrasena,
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
    { label: 'DNI',               render: (u: Usuario) => u.dni.toLocaleString('es-AR') },
    { label: 'Usuario',           render: (u: Usuario) => u.nombreUsuario },
    { label: 'Email',             render: (u: Usuario) => u.email },
    { label: 'Rol',               render: (u: Usuario) => <Chip label={u.rol} size="small" color="primary" variant="outlined" /> },
    {
      label:  'Estado',
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

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          placeholder="Filtrar página actual..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          sx={{ maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search color="action" /></InputAdornment>
              ),
            },
          }}
        />
        <Button variant="outlined" onClick={handleBuscar}>Buscar</Button>
      </Box>

      <TablaBase
        columnas={columnas} datos={datosVisibles} cargando={cargando} error={error}
        pagina={pagina} totalPaginas={totalPaginas} onCambiarPagina={cargar}
        mensajeVacio="No se encontraron usuarios."
      />

      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editando ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            select label="Rol *" value={form.idRol}
            onChange={(e) => setForm(p => ({ ...p, idRol: e.target.value }))}
            error={!!campoErrors.idRol} helperText={campoErrors.idRol}
          >
            {roles.map((r) => (
              <MenuItem key={r.id} value={String(r.id)}>{r.nombre}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Nombre *" value={form.nombre}
              onChange={(e) => { setForm(p => ({ ...p, nombre: e.target.value })); setCampoErrors(p => ({ ...p, nombre: undefined })); }}
              error={!!campoErrors.nombre} helperText={campoErrors.nombre}
            />
            <TextField
              label="Apellido *" value={form.apellido}
              onChange={(e) => { setForm(p => ({ ...p, apellido: e.target.value })); setCampoErrors(p => ({ ...p, apellido: undefined })); }}
              error={!!campoErrors.apellido} helperText={campoErrors.apellido}
            />
          </Box>

          <TextField
            label="DNI *" value={form.dni} disabled={!!editando}
            onChange={(e) => { setForm(p => ({ ...p, dni: e.target.value })); setCampoErrors(p => ({ ...p, dni: undefined })); }}
            error={!!campoErrors.dni}
            helperText={campoErrors.dni ?? (editando ? 'El DNI no se puede modificar.' : '')}
          />

          <TextField
            label="Email *" type="email" value={form.email}
            onChange={(e) => { setForm(p => ({ ...p, email: e.target.value })); setCampoErrors(p => ({ ...p, email: undefined })); }}
            error={!!campoErrors.email} helperText={campoErrors.email}
          />

          {!editando && (
            <>
              <TextField
                label="Nombre de usuario *" value={form.nombreUsuario}
                onChange={(e) => { setForm(p => ({ ...p, nombreUsuario: e.target.value })); setCampoErrors(p => ({ ...p, nombreUsuario: undefined })); }}
                error={!!campoErrors.nombreUsuario} helperText={campoErrors.nombreUsuario}
              />
              <TextField
                label="Contraseña *"
                type={mostrarPass ? 'text' : 'password'}
                value={form.contrasena}
                onChange={(e) => { setForm(p => ({ ...p, contrasena: e.target.value })); setCampoErrors(p => ({ ...p, contrasena: undefined })); }}
                error={!!campoErrors.contrasena}
                helperText={campoErrors.contrasena ?? 'Mínimo 6 caracteres.'}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setMostrarPass(!mostrarPass)}>
                          {mostrarPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}