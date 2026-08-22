import { useState, useCallback } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, FormControlLabel, IconButton, InputAdornment,
  Switch, TextField, Tooltip, Typography, Alert
} from '@mui/material';
import { Add, Delete, Edit, Search, Visibility, VisibilityOff } from '@mui/icons-material';
import TablaBase from '../../../components/common/TablaBase';
import { usePaginado } from '../../../hooks/usePaginado';
import { getTutores, createTutor, updateTutor, deleteTutor } from '../../../api/tutoresApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { Tutor } from '../../../types';
import TutorDetalleModal from '../../../components/modals/TutorDetalleModal';

interface FormTutor {
  dni:           string;
  nombre:        string;
  apellido:      string;
  email:         string;
  nombreUsuario: string;
  contrasena:    string;
  esResponsable: boolean;
  activo:        boolean;
}

interface FormErrors {
  dni?:           string;
  nombre?:        string;
  apellido?:      string;
  email?:         string;
  nombreUsuario?: string;
  contrasena?:    string;
}

const FORM_INICIAL: FormTutor = {
  dni: '', nombre: '', apellido: '', email: '',
  nombreUsuario: '', contrasena: '', esResponsable: true, activo: true
};

export default function TutoresPage() {
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [busqueda, setBusqueda]             = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState('');
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [editando, setEditando]             = useState<Tutor | null>(null);
  const [form, setForm]                     = useState<FormTutor>(FORM_INICIAL);
  const [campoErrors, setCampoErrors]       = useState<FormErrors>({});
  const [formError, setFormError]           = useState('');
  const [mostrarPass, setMostrarPass]       = useState(false);
  const [guardando, setGuardando]           = useState(false);

  const fetchFn = useCallback((p: number, c: number) => {
    const limpia = busquedaActiva.trim();
    if (!limpia) return getTutores(p, c);
    if (/^\d+$/.test(limpia)) return getTutores(p, c, '', '', Number(limpia));
    return getTutores(p, c, limpia, limpia);
  }, [busquedaActiva]);

  const { datos, pagina, totalPaginas, cargando, error, cargar, recargar } = usePaginado<Tutor>(fetchFn);

  const handleBuscar = () => setBusquedaActiva(busqueda.trim());

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setCampoErrors({});
    setFormError('');
    setDialogOpen(true);
  };

  const abrirEditar = (t: Tutor) => {
    setEditando(t);
    setForm({
      dni: String(t.dni), nombre: t.nombre, apellido: t.apellido,
      email: t.email, nombreUsuario: t.nombreUsuario, contrasena: '',
      esResponsable: t.esResponsable, activo: t.activo,
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

    if (!form.nombre.trim())    errores.nombre   = 'El nombre es obligatorio.';
    if (!form.apellido.trim())  errores.apellido = 'El apellido es obligatorio.';
    if (!form.dni)
      errores.dni = 'El DNI es obligatorio.';
    else if (isNaN(Number(form.dni)) || Number(form.dni) < 1000000 || Number(form.dni) > 99999999)
      errores.dni = 'El DNI debe tener entre 7 y 8 dígitos.';
    if (!form.email.trim())
      errores.email = 'El email es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errores.email = 'El formato del email no es válido.';

    if (!editando) {
      if (!form.nombreUsuario.trim()) errores.nombreUsuario = 'El nombre de usuario es obligatorio.';
      if (!form.contrasena)           errores.contrasena    = 'La contraseña es obligatoria.';
      else if (form.contrasena.length < 6) errores.contrasena = 'Mínimo 6 caracteres.';
    }

    if (Object.keys(errores).length > 0) { setCampoErrors(errores); return; }

    setGuardando(true);
    setFormError('');
    setCampoErrors({});

    try {
      if (editando) {
        await updateTutor(editando.idTutor, {
          dni: Number(form.dni),
          nombre:        form.nombre,
          apellido:      form.apellido,
          email:         form.email,
          esResponsable: form.esResponsable,
          activo:        form.activo,
        });
      } else {
        await createTutor({
          dni:           Number(form.dni),
          nombre:        form.nombre,
          apellido:      form.apellido,
          email:         form.email,
          nombreUsuario: form.nombreUsuario,
          contrasena:    form.contrasena,
          esResponsable: form.esResponsable,
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

  const handleEliminar = async (t: Tutor) => {
    if (!confirm(`¿Dar de baja a ${t.nombre} ${t.apellido}?`)) return;
    try { await deleteTutor(t.idTutor); recargar(); }
    catch (err) { alert(extraerMensajeError(err)); }
  };

  const columnas = [
    { label: 'Apellido y Nombre', render: (t: Tutor) => `${t.apellido}, ${t.nombre}` },
    { label: 'DNI',               render: (t: Tutor) => t.dni.toLocaleString('es-AR') },
    { label: 'Email',             render: (t: Tutor) => t.email },
    {
      label:  'Responsable',
      render: (t: Tutor) => (
        <Chip
          label={t.esResponsable ? 'Sí' : 'No'}
          color={t.esResponsable ? 'primary' : 'default'}
          size="small"
        />
      )
    },
    {
      label:  'Estado',
      render: (t: Tutor) => (
        <Chip
          label={t.activo ? 'Activo' : 'Inactivo'}
          color={t.activo ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      label: 'Acciones', width: '100px',
      render: (t: Tutor) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Ver detalle"><IconButton size="small" onClick={() => setDetalleId(t.idTutor)}><Visibility fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" color="primary" onClick={() => abrirEditar(t)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dar de baja">
            <IconButton size="small" color="error" onClick={() => handleEliminar(t)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Tutores</Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de tutores de la institución
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>
          Nuevo Tutor
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          placeholder="Buscar por nombre o apellido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          sx={{ maxWidth: 400 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button variant="outlined" onClick={handleBuscar}>Buscar</Button>
         <Button variant="outlined" onClick={() => {
            setBusqueda('');
            setBusquedaActiva('');
          }}
          size="medium"          
        >
          Limpiar
        </Button>
      </Box>

      <TablaBase
        columnas={columnas} datos={datos} cargando={cargando} error={error}
        pagina={pagina} totalPaginas={totalPaginas} onCambiarPagina={cargar}
        mensajeVacio="No se encontraron tutores."
      />

      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editando ? 'Editar Tutor' : 'Nuevo Tutor'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

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
            label="DNI *" value={form.dni}
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

          <FormControlLabel
            control={
              <Switch
                checked={form.esResponsable}
                onChange={(e) => setForm(p => ({ ...p, esResponsable: e.target.checked }))}
                color="primary"
              />
            }
            label="Es responsable principal"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar Tutor'}
          </Button>
        </DialogActions>
      </Dialog>
      <TutorDetalleModal open={detalleId !== null} id={detalleId} onClose={() => setDetalleId(null)} />
    </Box>
  );
}