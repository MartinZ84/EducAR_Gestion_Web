import { useState, useCallback } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, InputAdornment, TextField,
  Tooltip, Typography, Alert
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import TablaBase from '../../../components/common/TablaBase';
import { usePaginado } from '../../../hooks/usePaginado';
import { getAlumnos, createAlumno, updateAlumno, deleteAlumno } from '../../../api/alumnosApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { Alumno } from '../../../types';

interface FormAlumno {
  dni:      string;
  nombre:   string;
  apellido: string;
  activo:   boolean;
}

interface FormErrors {
  dni?:      string;
  nombre?:   string;
  apellido?: string;
}

const FORM_INICIAL: FormAlumno = { dni: '', nombre: '', apellido: '', activo: true };

export default function AlumnosPage() {
  const [busqueda, setBusqueda]             = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState('');
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [editando, setEditando]             = useState<Alumno | null>(null);
  const [form, setForm]                     = useState<FormAlumno>(FORM_INICIAL);
  const [campoErrors, setCampoErrors]       = useState<FormErrors>({});
  const [formError, setFormError]           = useState('');
  const [guardando, setGuardando]           = useState(false);

  const fetchFn = useCallback(
    (p: number, c: number) => getAlumnos(p, c, '', busquedaActiva),
    [busquedaActiva]
  );

  const { datos, pagina, totalPaginas, cargando, error, cargar, recargar } = usePaginado<Alumno>(fetchFn);

  const handleBuscar = () => {
    setBusquedaActiva(busqueda);
    cargar(1);
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setCampoErrors({});
    setFormError('');
    setDialogOpen(true);
  };

  const abrirEditar = (a: Alumno) => {
    setEditando(a);
    setForm({ dni: String(a.dni), nombre: a.nombre, apellido: a.apellido, activo: a.activo });
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

    if (!form.nombre.trim())
      errores.nombre = 'El nombre es obligatorio.';
    if (!form.apellido.trim())
      errores.apellido = 'El apellido es obligatorio.';
    if (!form.dni)
      errores.dni = 'El DNI es obligatorio.';
    else if (isNaN(Number(form.dni)) || Number(form.dni) < 1000000 || Number(form.dni) > 99999999)
      errores.dni = 'El DNI debe tener entre 7 y 8 dígitos.';

    if (Object.keys(errores).length > 0) {
      setCampoErrors(errores);
      return;
    }

    setGuardando(true);
    setFormError('');
    setCampoErrors({});

    try {
      if (editando) {
        await updateAlumno(editando.idAlumno, {
          nombre:   form.nombre,
          apellido: form.apellido,
          activo:   form.activo,
        });
      } else {
        await createAlumno({
          dni:      Number(form.dni),
          nombre:   form.nombre,
          apellido: form.apellido,
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

  const handleEliminar = async (a: Alumno) => {
    if (!confirm(`¿Dar de baja a ${a.nombre} ${a.apellido}?`)) return;
    try {
      await deleteAlumno(a.idAlumno);
      recargar();
    } catch (err) {
      alert(extraerMensajeError(err));
    }
  };

  const columnas = [
    { label: 'Apellido y Nombre', render: (a: Alumno) => `${a.apellido}, ${a.nombre}` },
    { label: 'DNI',               render: (a: Alumno) => a.dni.toLocaleString('es-AR') },
    {
      label:  'Estado',
      render: (a: Alumno) => (
        <Chip
          label={a.activo ? 'Activo' : 'Inactivo'}
          color={a.activo ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      label:  'Acciones',
      width:  '100px',
      render: (a: Alumno) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Editar">
            <IconButton size="small" color="primary" onClick={() => abrirEditar(a)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dar de baja">
            <IconButton size="small" color="error" onClick={() => handleEliminar(a)}>
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
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Alumnos</Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de alumnos de la institución
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>
          Nuevo Alumno
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
      </Box>

      <TablaBase
        columnas={columnas}
        datos={datos}
        cargando={cargando}
        error={error}
        pagina={pagina}
        totalPaginas={totalPaginas}
        onCambiarPagina={cargar}
        mensajeVacio="No se encontraron alumnos."
      />

      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editando ? 'Editar Alumno' : 'Nuevo Alumno'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Nombre *"
              value={form.nombre}
              onChange={(e) => {
                setForm(p => ({ ...p, nombre: e.target.value }));
                setCampoErrors(p => ({ ...p, nombre: undefined }));
              }}
              error={!!campoErrors.nombre}
              helperText={campoErrors.nombre}
            />
            <TextField
              label="Apellido *"
              value={form.apellido}
              onChange={(e) => {
                setForm(p => ({ ...p, apellido: e.target.value }));
                setCampoErrors(p => ({ ...p, apellido: undefined }));
              }}
              error={!!campoErrors.apellido}
              helperText={campoErrors.apellido}
            />
          </Box>

          <TextField
            label="DNI *"
            value={form.dni}
            disabled={!!editando}
            onChange={(e) => {
              setForm(p => ({ ...p, dni: e.target.value }));
              setCampoErrors(p => ({ ...p, dni: undefined }));
            }}
            error={!!campoErrors.dni}
            helperText={campoErrors.dni ?? (editando ? 'El DNI no se puede modificar.' : '')}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar Alumno'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}