import { useState, useCallback } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, InputAdornment, TextField,
  Tooltip, Typography, Alert, FormControlLabel, Switch
} from '@mui/material';
import { Add, Delete, Edit, Search, Visibility } from '@mui/icons-material';
import TablaBase from '../../../components/common/TablaBase';
import { usePaginado } from '../../../hooks/usePaginado';
import { getMaterias, createMateria, updateMateria, deleteMateria } from '../../../api/materiasApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { Materia } from '../../../types';
import MateriaDetalleModal from '../../../components/modals/MateriaDetalleModal';

interface FormMateria {
  nombre:      string;
  descripcion: string;
  activo:      boolean;
}

interface FormErrors {
  nombre?: string;
}

const FORM_INICIAL: FormMateria = { nombre: '', descripcion: '', activo: true };

export default function MateriasPage() {
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [busqueda, setBusqueda]             = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState('');
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [editando, setEditando]             = useState<Materia | null>(null);
  const [form, setForm]                     = useState<FormMateria>(FORM_INICIAL);
  const [campoErrors, setCampoErrors]       = useState<FormErrors>({});
  const [formError, setFormError]           = useState('');
  const [guardando, setGuardando]           = useState(false);

  const fetchFn = useCallback(
    (p: number, c: number) => getMaterias(p, c, busquedaActiva),
    [busquedaActiva]
  );

  const { datos, pagina, totalPaginas, cargando, error, cargar, recargar } = usePaginado<Materia>(fetchFn);

  const handleBuscar = () => setBusquedaActiva(busqueda.trim());

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setCampoErrors({});
    setFormError('');
    setDialogOpen(true);
  };

  const abrirEditar = (m: Materia) => {
    setEditando(m);
    setForm({ nombre: m.nombre, descripcion: m.descripcion ?? '', activo: m.activo });
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
    if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
    if (Object.keys(errores).length > 0) { setCampoErrors(errores); return; }

    setGuardando(true);
    setFormError('');
    setCampoErrors({});

    try {
      if (editando) {
        await updateMateria(editando.idMateria, {
          nombre:      form.nombre,
          descripcion: form.descripcion || undefined,
          activo:      form.activo,
        });
      } else {
        await createMateria({
          nombre:      form.nombre,
          descripcion: form.descripcion || undefined,
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

  const handleEliminar = async (m: Materia) => {
    if (!confirm(`¿Dar de baja la materia "${m.nombre}"?`)) return;
    try { await deleteMateria(m.idMateria); recargar(); }
    catch (err) { alert(extraerMensajeError(err)); }
  };

  const columnas = [
    { label: 'Nombre',      render: (m: Materia) => m.nombre },
    { label: 'Descripción', render: (m: Materia) => m.descripcion ?? '—' },
    {
      label:  'Estado',
      render: (m: Materia) => (
        <Chip label={m.activo ? 'Activa' : 'Inactiva'} color={m.activo ? 'success' : 'default'} size="small" />
      )
    },
    {
      label: 'Acciones', width: '100px',
      render: (m: Materia) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Ver detalle"><IconButton size="small" onClick={() => setDetalleId(m.idMateria)}><Visibility fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" color="primary" onClick={() => abrirEditar(m)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Dar de baja">
            <IconButton size="small" color="error" onClick={() => handleEliminar(m)}>
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
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Materias</Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de materias de la institución
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>
          Nueva Materia
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          placeholder="Buscar por nombre..."
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
        <Button variant="outlined" onClick={() => { setBusqueda(''); setBusquedaActiva(''); }}>Limpiar</Button>
      </Box>

      <TablaBase
        columnas={columnas} datos={datos} cargando={cargando} error={error}
        pagina={pagina} totalPaginas={totalPaginas} onCambiarPagina={cargar}
        mensajeVacio="No se encontraron materias."
      />

      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editando ? 'Editar Materia' : 'Nueva Materia'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Nombre *"
            value={form.nombre}
            onChange={(e) => { setForm(p => ({ ...p, nombre: e.target.value })); setCampoErrors(p => ({ ...p, nombre: undefined })); }}
            error={!!campoErrors.nombre}
            helperText={campoErrors.nombre}
          />
          <TextField
            label="Descripción"
            value={form.descripcion}
            onChange={(e) => setForm(p => ({ ...p, descripcion: e.target.value }))}
            multiline
            rows={3}
            helperText="Opcional"
          />
          {editando && <FormControlLabel
            control={<Switch checked={form.activo} onChange={(e) => setForm(p => ({ ...p, activo: e.target.checked }))} />}
            label={form.activo ? 'Materia activa' : 'Materia inactiva'}
          />}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar Materia'}
          </Button>
        </DialogActions>
      </Dialog>
      <MateriaDetalleModal open={detalleId !== null} id={detalleId} onClose={() => setDetalleId(null)} />
    </Box>
  );
}