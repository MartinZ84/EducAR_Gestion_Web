import { useState, useEffect } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, TextField, Tooltip, Typography, Alert
} from '@mui/material';
import { Add, Edit, Visibility } from '@mui/icons-material';
import TablaBase from '../../../components/common/TablaBase';
import {
  getCiclosLectivos, createCicloLectivo, updateCicloLectivo
} from '../../../api/ciclosLectivosApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { CicloLectivo } from '../../../types';
import { toApiDateTime } from '../../../utils/dateUtils';
import CicloLectivoDetalleModal from '../../../components/modals/CicloLectivoDetalleModal';

interface FormCiclo {
  anio:        string;
  fechaInicio: string;
  fechaFin:    string;
  activo:      boolean;
}

interface FormErrors {
  anio?:        string;
  fechaInicio?: string;
  fechaFin?:    string;
}

const FORM_INICIAL: FormCiclo = {
  anio: '', fechaInicio: '', fechaFin: '', activo: true
};

export default function CiclosLectivosPage() {
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [ciclos, setCiclos]           = useState<CicloLectivo[]>([]);
  const [cargando, setCargando]       = useState(false);
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editando, setEditando]       = useState<CicloLectivo | null>(null);
  const [form, setForm]               = useState<FormCiclo>(FORM_INICIAL);
  const [campoErrors, setCampoErrors] = useState<FormErrors>({});
  const [formError, setFormError]     = useState('');
  const [cargaError, setCargaError]   = useState('');
  const [guardando, setGuardando]     = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await getCiclosLectivos();
      setCiclos(Array.isArray(data) ? data : (data as { datos?: CicloLectivo[] }).datos ?? []);
    } catch (err) {
      setCargaError(extraerMensajeError(err));
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setCampoErrors({});
    setFormError('');
    setDialogOpen(true);
  };

  const abrirEditar = (c: CicloLectivo) => {
    setEditando(c);
    setForm({
      anio:        String(c.anio),
      fechaInicio: c.fechaInicio.split('T')[0],
      fechaFin:    c.fechaFin.split('T')[0],
      activo:      c.activo,
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
    const anioNum = Number(form.anio);

    if (!form.anio || isNaN(anioNum) || anioNum < 2000 || anioNum > 2100)
      errores.anio = 'Ingresá un año válido (2000-2100).';
    if (!form.fechaInicio)
      errores.fechaInicio = 'La fecha de inicio es obligatoria.';
    if (!form.fechaFin)
      errores.fechaFin = 'La fecha de fin es obligatoria.';
    else if (form.fechaInicio && form.fechaFin <= form.fechaInicio)
      errores.fechaFin = 'La fecha de fin debe ser posterior a la de inicio.';

    if (Object.keys(errores).length > 0) { setCampoErrors(errores); return; }

    setGuardando(true);
    setFormError('');
    setCampoErrors({});

    try {
      if (editando) {
        await updateCicloLectivo(editando.idCicloLectivo, {
          anio: anioNum,
          fechaInicio: toApiDateTime(form.fechaInicio),
          fechaFin: toApiDateTime(form.fechaFin),
          activo: form.activo,
        });
      } else {
        await createCicloLectivo({
          anio: anioNum,
          fechaInicio: toApiDateTime(form.fechaInicio),
          fechaFin: toApiDateTime(form.fechaFin),
        });
      }
      cerrarDialog();
      cargar();
    } catch (err) {
      setFormError(extraerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  /* ─── Columnas en formato TablaBase (igual que Cursos) ─── */
  const columnas = [
    { label: 'Año',    render: (c: CicloLectivo) => c.anio },
    {
      label: 'Inicio',
      render: (c: CicloLectivo) => new Date(c.fechaInicio).toLocaleDateString('es-AR')
    },
    {
      label: 'Fin',
      render: (c: CicloLectivo) => new Date(c.fechaFin).toLocaleDateString('es-AR')
    },
    {
      label: 'Estado',
      render: (c: CicloLectivo) => (
        <Chip
          label={c.activo ? 'Activo' : 'Inactivo'}
          color={c.activo ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      label: 'Acciones', width: '80px',
      render: (c: CicloLectivo) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Ver detalle"><IconButton size="small" onClick={() => setDetalleId(c.idCicloLectivo)}><Visibility fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Editar"><IconButton size="small" color="primary" onClick={() => abrirEditar(c)}><Edit fontSize="small" /></IconButton></Tooltip>
        </Box>
      )
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Ciclos Lectivos</Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de ciclos lectivos de la institución
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>
          Nuevo Ciclo
        </Button>
      </Box>

      {/* Reemplazo de DataGrid por TablaBase */}
      {cargaError && <Alert severity="error" sx={{ mb: 2 }}>{cargaError}</Alert>}

      <TablaBase
        columnas={columnas}
        datos={ciclos}
        cargando={cargando}
        error={''}
        pagina={1}
        totalPaginas={1}
        onCambiarPagina={() => {}}
        mensajeVacio="No se encontraron ciclos lectivos."
      />

      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editando ? 'Editar Ciclo Lectivo' : 'Nuevo Ciclo Lectivo'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Año *"
            type="number"
            value={form.anio}
            onChange={(e) => { setForm(p => ({ ...p, anio: e.target.value })); setCampoErrors(p => ({ ...p, anio: undefined })); }}
            error={!!campoErrors.anio}
            helperText={campoErrors.anio}
            slotProps={{ htmlInput: { min: 2000, max: 2100 } }}
          />
          <TextField
            label="Fecha de inicio *"
            type="date"
            value={form.fechaInicio}
            onChange={(e) => { setForm(p => ({ ...p, fechaInicio: e.target.value })); setCampoErrors(p => ({ ...p, fechaInicio: undefined })); }}
            error={!!campoErrors.fechaInicio}
            helperText={campoErrors.fechaInicio}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="Fecha de fin *"
            type="date"
            value={form.fechaFin}
            onChange={(e) => { setForm(p => ({ ...p, fechaFin: e.target.value })); setCampoErrors(p => ({ ...p, fechaFin: undefined })); }}
            error={!!campoErrors.fechaFin}
            helperText={campoErrors.fechaFin}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Guardar Ciclo'}
          </Button>
        </DialogActions>
      </Dialog>
      <CicloLectivoDetalleModal open={detalleId !== null} id={detalleId} onClose={() => setDetalleId(null)} />
    </Box>
  );
}