import { useState, useCallback } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, InputAdornment, TextField,
  Tooltip, Typography, Alert
} from '@mui/material';
import { Add, Delete, Edit, Search, Visibility, VisibilityOff } from '@mui/icons-material';
import TablaBase from '../../../components/common/TablaBase';
import { usePaginado } from '../../../hooks/usePaginado';
import { getDocentes, createDocente, updateDocente, deleteDocente } from '../../../api/docentesApi';
import { Docente } from '../../../types';
import { extraerMensajeError } from '../../../utils/apiErrors';

interface FormDocente {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  contrasena: string;
  activo: boolean;
}

interface FormErrors {
  dni?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  nombreUsuario?: string;
  contrasena?: string;
}

const FORM_INICIAL: FormDocente = {
  dni: '', nombre: '', apellido: '', email: '',
  nombreUsuario: '', contrasena: '', activo: true
};

export default function DocentesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Docente | null>(null);
  const [form, setForm] = useState<FormDocente>(FORM_INICIAL);
  const [mostrarPass, setMostrarPass] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formError, setFormError] = useState('');
  const [campoErrors, setCampoErrors] = useState<FormErrors>({});

  const fetchFn = useCallback(
    (p: number, c: number) => {
      const limpia = busquedaActiva.trim();
      const esDni = /^\d+$/.test(limpia);
      return getDocentes(
        p,
        c,
        esDni ? '' : limpia,
        esDni ? '' : limpia,
        esDni ? Number(limpia) : undefined
      );
    },
    [busquedaActiva]
  );

  const { datos, pagina, totalPaginas, cargando, error, cargar, recargar } = usePaginado(fetchFn);

  const handleBuscar = () => {
    setBusquedaActiva(busqueda);
    cargar(1);
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setFormError('');
    setCampoErrors({});
    setDialogOpen(true);
  };

  const abrirEditar = (doc: Docente) => {
    setEditando(doc);
    setForm({
      dni: String(doc.dni),
      nombre: doc.nombre,
      apellido: doc.apellido,
      email: doc.email,
      nombreUsuario: doc.nombreUsuario,
      contrasena: '',
      activo: doc.activo,
    });
    setFormError('');
    setCampoErrors({});
    setDialogOpen(true);
  };

  const cerrarDialog = () => {
    setDialogOpen(false);
    setCampoErrors({});
    setFormError('');
  };

  const handleGuardar = async () => {
    const errores: FormErrors = {};

    if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
    if (!form.apellido.trim()) errores.apellido = 'El apellido es obligatorio.';
    if (!form.dni) errores.dni = 'El DNI es obligatorio.';
    else if (isNaN(Number(form.dni)) || Number(form.dni) < 1000000 || Number(form.dni) > 99999999)
      errores.dni = 'El DNI debe tener entre 7 y 8 dígitos.';
    if (!form.email.trim()) errores.email = 'El email es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errores.email = 'El formato del email no es válido.';

    if (!editando) {
      if (!form.nombreUsuario.trim()) errores.nombreUsuario = 'El nombre de usuario es obligatorio.';
      if (!form.contrasena) errores.contrasena = 'La contraseña es obligatoria.';
      else if (form.contrasena.length < 6) errores.contrasena = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (Object.keys(errores).length > 0) {
      setCampoErrors(errores);
      return;
    }

    setGuardando(true);
    setFormError('');
    setCampoErrors({});

    try {
      if (editando) {
        await updateDocente(editando.idDocente, {
          dni: Number(form.dni),
          nombre: form.nombre,
          apellido: form.apellido,
          email: form.email,
          activo: form.activo,
        });
      } else {
        await createDocente({
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

  const handleEliminar = async (doc: Docente) => {
    if (!confirm(`¿Dar de baja a ${doc.nombre} ${doc.apellido}?`)) return;
    try {
      await deleteDocente(doc.idDocente);
      recargar();
    } catch {
      alert('Error al dar de baja.');
    }
  };

  const columnas = [
    {
      label: 'Apellido y Nombre',
      render: (d: Docente) => `${d.apellido}, ${d.nombre}`
    },
    {
      label: 'DNI',
      render: (d: Docente) => d.dni.toLocaleString('es-AR')
    },
    {
      label: 'Email',
      render: (d: Docente) => d.email
    },
    {
      label: 'Usuario',
      render: (d: Docente) => d.nombreUsuario
    },
    {
      label: 'Estado',
      render: (d: Docente) => (
        <Chip label={d.activo ? 'Activo' : 'Inactivo'} color={d.activo ? 'success' : 'default'} size="small" />
      )
    },
    {
      label: 'Acciones',
      width: '120px',
      align: 'center' as const,
      render: (d: Docente) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Editar">
            <IconButton onClick={() => abrirEditar(d)} size="small"><Edit fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Dar de baja">
            <IconButton color="error" onClick={() => handleEliminar(d)} size="small"><Delete fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      )
    },
  ];

  return (
    <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Docentes </Typography>
          <Typography variant="body2" color="text.secondary">
             Gestión de docentes de la institución
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>
          Nuevo Docente  
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Nombre, apellido o DNI"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
          sx={{ maxWidth: 400, flex: 1 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start"><Search color="action" /></InputAdornment>
              ),
            },
          }}
        />
        <Button variant="outlined" onClick={handleBuscar} size="medium">
          Buscar
        </Button>
        <Button variant="outlined" onClick={() => {
            setBusqueda('');
            setBusquedaActiva('');
            cargar(1);
          }}
          size="medium"          
        >
          Limpiar
        </Button>
      </Box>

      <TablaBase
        columnas={columnas}
        datos={datos}
        cargando={cargando}
        error={error}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onCambiarPagina={(p) => cargar(p)}
      />

      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editando ? 'Editar Docente' : 'Nuevo Docente'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Nombre"
            value={form.nombre}
            onChange={(e) => { setForm(p => ({ ...p, nombre: e.target.value })); setCampoErrors(p => ({ ...p, nombre: undefined })); }}
            error={!!campoErrors.nombre}
            helperText={campoErrors.nombre}
          />
          <TextField
            label="Apellido"
            value={form.apellido}
            onChange={(e) => { setForm(p => ({ ...p, apellido: e.target.value })); setCampoErrors(p => ({ ...p, apellido: undefined })); }}
            error={!!campoErrors.apellido}
            helperText={campoErrors.apellido}
          />
          <TextField
            label="DNI"
            value={form.dni}
            onChange={(e) => { setForm(p => ({ ...p, dni: e.target.value })); setCampoErrors(p => ({ ...p, dni: undefined })); }}
            error={!!campoErrors.dni}
            helperText={campoErrors.dni}
            // helperText={campoErrors.dni ?? (editando ? 'El DNI no se puede modificar.' : '')}
            // disabled={!!editando}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => { setForm(p => ({ ...p, email: e.target.value })); setCampoErrors(p => ({ ...p, email: undefined })); }}
            error={!!campoErrors.email}
            helperText={campoErrors.email}
          />

          {!editando && (
            <>
              <TextField
                label="Nombre de usuario"
                value={form.nombreUsuario}
                onChange={(e) => { setForm(p => ({ ...p, nombreUsuario: e.target.value })); setCampoErrors(p => ({ ...p, nombreUsuario: undefined })); }}
                error={!!campoErrors.nombreUsuario}
                helperText={campoErrors.nombreUsuario}
              />
              <TextField
                label="Contraseña"
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
          <Button onClick={cerrarDialog} disabled={guardando}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}