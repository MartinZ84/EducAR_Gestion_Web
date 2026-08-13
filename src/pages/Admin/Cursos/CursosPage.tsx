import { useState, useCallback, useEffect } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, MenuItem, TextField,
  Tooltip, Typography, Alert
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import TablaBase from '../../../components/common/TablaBase';
import { usePaginado } from '../../../hooks/usePaginado';
import { getCursos, createCurso, deleteCurso } from '../../../api/cursosApi';
import { getCiclosLectivos } from '../../../api/ciclosLectivosApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { Curso, CicloLectivo } from '../../../types';

interface FormCurso {
  idCicloLectivo: string;
  grado: string;
  division: string;
  turno: string;
}

interface FormErrors {
  idCicloLectivo?: string;
  grado?: string;
  division?: string;
}

const TURNOS = ['Mañana', 'Tarde', 'Noche'];
const GRADOS = [1, 2, 3, 4, 5, 6, 7];

const FORM_INICIAL: FormCurso = {
  idCicloLectivo: '', grado: '', division: '', turno: 'Mañana'
};

export default function CursosPage() {
  const [filtroCiclo, setFiltroCiclo] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormCurso>(FORM_INICIAL);
  const [campoErrors, setCampoErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [ciclos, setCiclos] = useState<CicloLectivo[]>([]);
  const [cargaCiclosError, setCargaCiclosError] = useState('');

  // Carga los ciclos lectivos para el select
  useEffect(() => {
    getCiclosLectivos()
      .then((data) => setCiclos(Array.isArray(data) ? data : []))
      .catch((err) => setCargaCiclosError(extraerMensajeError(err)));
  }, []);

  const fetchFn = useCallback(
    (p: number, c: number) => getCursos(p, c, filtroCiclo ? Number(filtroCiclo) : undefined),
    [filtroCiclo]
  );

  const { datos, pagina, totalPaginas, cargando, error, cargar, recargar } = usePaginado<Curso>(fetchFn);

  const abrirCrear = () => {
    setForm(FORM_INICIAL);
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

    if (!form.idCicloLectivo) errores.idCicloLectivo = 'Seleccioná un ciclo lectivo.';
    if (!form.grado) errores.grado = 'Seleccioná un grado.';
    if (!form.division.trim()) errores.division = 'La división es obligatoria.';

    if (Object.keys(errores).length > 0) { setCampoErrors(errores); return; }

    setGuardando(true);
    setFormError('');
    setCampoErrors({});

    try {
      await createCurso({
        idCicloLectivo: Number(form.idCicloLectivo),
        grado: Number(form.grado),
        division: form.division.toUpperCase(),
        turno: form.turno || undefined,
      });
      cerrarDialog();
      recargar();
    } catch (err) {
      setFormError(extraerMensajeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (c: Curso) => {
    if (!confirm(`¿Dar de baja el curso ${c.grado}° "${c.division}"?`)) return;
    try { await deleteCurso(c.idCurso); recargar(); }
    catch (err) { alert(extraerMensajeError(err)); }
  };

  const columnas = [
    { label: 'Año', render: (c: Curso) => c.anio },
    { label: 'Grado', render: (c: Curso) => `${c.grado}°` },
    { label: 'División', render: (c: Curso) => c.division },
    { label: 'Turno', render: (c: Curso) => c.turno ?? '—' },
    { label: 'Alumnos', render: (c: Curso) => c.cantidadAlumnos },
    {
      label: 'Estado',
      render: (c: Curso) => (
        <Chip label={c.activo ? 'Activo' : 'Inactivo'} color={c.activo ? 'success' : 'default'} size="small" />
      )
    },
    {
      label: 'Acciones', width: '80px',
      render: (c: Curso) => (
        <Tooltip title="Dar de baja">
          <IconButton size="small" color="error" onClick={() => handleEliminar(c)}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      )
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Cursos</Typography>
          <Typography variant="body2" color="text.secondary">
            Gestión de cursos de la institución
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>
          Nuevo Curso
        </Button>
      </Box>

      {/* Filtro por ciclo lectivo */}
      <Box sx={{ mb: 3 }}>
        <TextField
          select
          label="Filtrar por ciclo lectivo"
          value={filtroCiclo}
          onChange={(e) => { setFiltroCiclo(e.target.value); cargar(1); }}
          sx={{ minWidth: 250 }}
        >
          <MenuItem value="">Todos los ciclos</MenuItem>
          {ciclos.map((c) => (
            <MenuItem key={c.idCicloLectivo} value={String(c.idCicloLectivo)}>
              {c.anio}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {cargaCiclosError && <Alert severity="error" sx={{ mb: 2 }}>{cargaCiclosError}</Alert>}

      <TablaBase
        columnas={columnas} datos={datos} cargando={cargando} error={error}
        pagina={pagina} totalPaginas={totalPaginas} onCambiarPagina={cargar}
        mensajeVacio="No se encontraron cursos."
      />

      <Dialog open={dialogOpen} onClose={cerrarDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Curso</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            select
            label="Ciclo Lectivo *"
            value={form.idCicloLectivo}
            onChange={(e) => { setForm(p => ({ ...p, idCicloLectivo: e.target.value })); setCampoErrors(p => ({ ...p, idCicloLectivo: undefined })); }}
            error={!!campoErrors.idCicloLectivo}
            helperText={campoErrors.idCicloLectivo}
          >
            {ciclos.filter(c => c.activo).map((c) => (
              <MenuItem key={c.idCicloLectivo} value={String(c.idCicloLectivo)}>
                {c.anio}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              select
              label="Grado *"
              value={form.grado}
              onChange={(e) => { setForm(p => ({ ...p, grado: e.target.value })); setCampoErrors(p => ({ ...p, grado: undefined })); }}
              error={!!campoErrors.grado}
              helperText={campoErrors.grado}
            >
              {GRADOS.map((g) => (
                <MenuItem key={g} value={String(g)}>{g}°</MenuItem>
              ))}
            </TextField>

            <TextField
              label="División *"
              value={form.division}
              onChange={(e) => { setForm(p => ({ ...p, division: e.target.value })); setCampoErrors(p => ({ ...p, division: undefined })); }}
              error={!!campoErrors.division}
              helperText={campoErrors.division ?? 'Ej: A, B, C'}

              slotProps={{ htmlInput: { maxLength: 5 } }}
            />
          </Box>

          <TextField
            select
            label="Turno"
            value={form.turno}
            onChange={(e) => setForm(p => ({ ...p, turno: e.target.value }))}
          >
            {TURNOS.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar Curso'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}