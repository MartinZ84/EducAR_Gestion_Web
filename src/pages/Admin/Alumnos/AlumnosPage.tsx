import { useState, useCallback } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, IconButton, InputAdornment, TextField,
  Tooltip, Typography, Alert, List, ListItem, ListItemText,
  Paper, Grid, Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import {
  Add, Delete, Edit, Search, Phone, Home, Person, Visibility, Clear as ClearIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import TablaBase from '../../../components/common/TablaBase';
import { usePaginado } from '../../../hooks/usePaginado';
import {
  getAlumnos, getAlumno, createAlumno, updateAlumno, deleteAlumno
} from '../../../api/alumnosApi';
import {
  getTelefonosPorAlumno, createTelefono, deleteTelefono,
  updateTelefono, TelefonoContacto
} from '../../../api/telefonosApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { Alumno } from '../../../types';
import AlumnoDetalleModal from '../../../components/modals/AlumnoDetalleModal';

interface FormAlumno {
  dni: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  activo: boolean;
  calle: string;
  numero: string;
  piso: string;
  departamento: string;
  barrio: string;
  localidad: string;
  provincia: string;
}

interface FormErrors {
  dni?: string;
  nombre?: string;
  apellido?: string;
  fechaNacimiento?: string;
}

interface TelefonoForm {
  idTelefono?: number;
  numero: string;
  des: string;
  esNuevo: boolean;
}

const FORM_INICIAL: FormAlumno = {
  dni: '', nombre: '', apellido: '', fechaNacimiento: '', activo: true,
  calle: '', numero: '', piso: '', departamento: '',
  barrio: '', localidad: '', provincia: '',
};

export default function AlumnosPage() {
  const [detalleId, setDetalleId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Alumno | null>(null);
  const [form, setForm] = useState<FormAlumno>(FORM_INICIAL);
  const [campoErrors, setCampoErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [telefonos, setTelefonos] = useState<TelefonoForm[]>([]);
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoTelefonoDescripcion, setNuevoTelefonoDescripcion] = useState('');
  const [cargandoTelefonos, setCargandoTelefonos] = useState(false);

  const fetchFn = useCallback(
    (p: number, c: number) => {
      const limpia = busquedaActiva.trim();

      // Si no hay término de búsqueda, obtener todos
      if (!limpia) {
        return getAlumnos(p, c, '', '', undefined);
      }

      const esDni = /^\d+$/.test(limpia);

      if (esDni) {
        // Buscar por DNI
        return getAlumnos(p, c, '', '', Number(limpia));
      } else {
        // IMPORTANTE: Solo enviar el término en el parámetro "nombre"
        // El backend busca en Nombre OR Apellido usando este parámetro
        return getAlumnos(p, c, limpia, '', undefined);
      }
    },
    [busquedaActiva]
  );

  const { datos, pagina, totalPaginas, cargando, error, cargar, recargar } = usePaginado(fetchFn);

  const handleBuscar = () => setBusquedaActiva(busqueda.trim());

  const abrirCrear = () => {
    setEditando(null);
    setForm(FORM_INICIAL);
    setTelefonos([]);
    setNuevoTelefono('');
    setNuevoTelefonoDescripcion('');
    setCampoErrors({});
    setFormError('');
    setDialogOpen(true);
  };

  const abrirEditar = async (a: Alumno) => {
    let alumno = a;
    try {
      alumno = await getAlumno(a.idAlumno);
    } catch (err) {
      setFormError(extraerMensajeError(err));
    }
    setEditando(alumno);
    setForm({
      dni: String(alumno.dni),
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      fechaNacimiento: alumno.fechaNacimiento
        ? dayjs(alumno.fechaNacimiento).format('YYYY-MM-DD')
        : '',
      activo: alumno.activo,
      calle: alumno.calle ?? '', numero: alumno.numero ?? '', piso: alumno.piso ?? '',
      departamento: alumno.departamento ?? '', barrio: alumno.barrio ?? '',
      localidad: alumno.localidad ?? '', provincia: alumno.provincia ?? '',
    });
    setCampoErrors({});
    setFormError('');
    setNuevoTelefono('');
    setNuevoTelefonoDescripcion('');
    setDialogOpen(true);

    setCargandoTelefonos(true);
    try {
      const tels = await getTelefonosPorAlumno(a.idAlumno);
      setTelefonos(tels.map((t) => ({ idTelefono: t.idTelefono, numero: t.numero, des: t.des ?? '', esNuevo: false })));
    } catch {
      setTelefonos([]);
    } finally {
      setCargandoTelefonos(false);
    }
  };

  const cerrarDialog = () => {
    setDialogOpen(false);
    setCampoErrors({});
    setFormError('');
    setTelefonos([]);
    setNuevoTelefono('');
  };

  const agregarTelefono = () => {
    const limpio = nuevoTelefono.trim();
    if (!limpio) return;
    if (telefonos.some((t) => t.numero === limpio)) {
      setFormError('Ese número ya está agregado.');
      return;
    }
    setTelefonos((prev) => [...prev, { numero: limpio, des: nuevoTelefonoDescripcion.trim(), esNuevo: true }]);
    setNuevoTelefono('');
    setNuevoTelefonoDescripcion('');
    setFormError('');
  };

  const quitarTelefono = async (index: number) => {
    const tel = telefonos[index];
    if (tel.idTelefono && !tel.esNuevo) {
      try {
        await deleteTelefono(tel.idTelefono);
      } catch (err) {
        setFormError(extraerMensajeError(err));
        return;
      }
    }
    setTelefonos((prev) => prev.filter((_, i) => i !== index));
  };

  const sincronizarTelefonos = async (idAlumno: number) => {
    for (const tel of telefonos) {
      const dto = { idAlumno, numero: tel.numero, des: tel.des || undefined };
      if (tel.esNuevo) await createTelefono(dto);
      else if (tel.idTelefono) await updateTelefono(tel.idTelefono, dto);
    }
  };

  const handleGuardar = async () => {
    const errores: FormErrors = {};

    if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio.';
    if (!form.apellido.trim()) errores.apellido = 'El apellido es obligatorio.';
    if (!form.dni) errores.dni = 'El DNI es obligatorio.';
    else if (isNaN(Number(form.dni)) || Number(form.dni) < 1000000 || Number(form.dni) > 99999999)
      errores.dni = 'El DNI debe tener entre 7 y 8 dígitos.';

    if (form.fechaNacimiento) {
      const fecha = dayjs(form.fechaNacimiento, 'YYYY-MM-DD', true);
      if (!fecha.isValid()) errores.fechaNacimiento = 'La fecha no es válida.';
      else if (fecha.isAfter(dayjs())) errores.fechaNacimiento = 'La fecha no puede ser futura.';
    }

    if (Object.keys(errores).length > 0) {
      setCampoErrors(errores);
      return;
    }

    setGuardando(true);
    setFormError('');
    setCampoErrors({});

    try {
      const dtoBase = {
        nombre: form.nombre,
        apellido: form.apellido,
        fechaNacimiento: form.fechaNacimiento || undefined,
        calle: form.calle || undefined,
        numero: form.numero || undefined,
        piso: form.piso || undefined,
        departamento: form.departamento || undefined,
        barrio: form.barrio || undefined,
        localidad: form.localidad || undefined,
        provincia: form.provincia || undefined,
      };

      if (editando) {
        await updateAlumno(editando.idAlumno, {
          dni: Number(form.dni),
          ...dtoBase,
          activo: form.activo,
        });
        await sincronizarTelefonos(editando.idAlumno);
      } else {
        const creado = await createAlumno({
          dni: Number(form.dni),
          ...dtoBase,
        });
        const idNuevoAlumno = creado?.idAlumno;
        if (idNuevoAlumno && telefonos.length > 0) {
          await sincronizarTelefonos(idNuevoAlumno);
        }
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
      alert(extraerMensajeError(err as Error));
    }
  };

  const domicilioResumido = (a: Alumno) => {
    const partes = [
      a.calle,
      a.numero,
      a.piso && `Piso ${a.piso}`,
      a.departamento && `Dto. ${a.departamento}`,
      a.barrio,
      a.localidad,
      a.provincia,
    ].filter(Boolean);
    return partes.length > 0 ? partes.join(', ') : '—';
  };

  const columnas = [
    {
      label: 'Apellido y Nombre',
      render: (a: Alumno) => `${a.apellido}, ${a.nombre}`,
    },
    {
      label: 'DNI',
      render: (a: Alumno) => a.dni.toLocaleString('es-AR'),
    },
    {
      label: 'Fec. Nac.',
      render: (a: Alumno) =>
        a.fechaNacimiento
          ? dayjs(a.fechaNacimiento).format('DD/MM/YYYY')
          : '—',
    },
    {
      label: 'Domicilio',
      render: (a: Alumno) => (
        <Tooltip title={domicilioResumido(a)}>
          <span>{domicilioResumido(a)}</span>
        </Tooltip>
      ),
    },
    {
      label: 'Estado',
      render: (a: Alumno) => (
        <Chip
          label={a.activo ? 'Activo' : 'Inactivo'}
          color={a.activo ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      label: 'Acciones',
      width: '120px',
      align: 'center' as const,
      render: (a: Alumno) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Ver detalle"><IconButton onClick={() => setDetalleId(a.idAlumno)} size="small"><Visibility fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Editar">
            <IconButton onClick={() => abrirEditar(a)} size="small"><Edit fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Dar de baja">
            <IconButton color="error" onClick={() => handleEliminar(a)} size="small"><Delete fontSize="small" /></IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Alumnos </Typography>
          <Typography variant="body2" color="text.secondary">
             Gestión de alumnos de la institución
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={abrirCrear}>
          Nuevo Alumno  
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
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Button variant="outlined" onClick={handleBuscar} size="medium">
          Buscar
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            setBusqueda('');
            setBusquedaActiva('');
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

      <Dialog
        open={dialogOpen}
        onClose={cerrarDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {editando ? 'Editar Alumno' : 'Nuevo Alumno'}
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <Box>
            <Typography
              variant="subtitle1"

              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 600 }}
            >
              <Person fontSize="small" color="primary" /> Datos personales
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Nombre"
                  value={form.nombre}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, nombre: e.target.value }));
                    setCampoErrors((p) => ({ ...p, nombre: undefined }));
                  }}
                  error={!!campoErrors.nombre}
                  helperText={campoErrors.nombre}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Apellido"
                  value={form.apellido}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, apellido: e.target.value }));
                    setCampoErrors((p) => ({ ...p, apellido: undefined }));
                  }}
                  error={!!campoErrors.apellido}
                  helperText={campoErrors.apellido}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="DNI"
                  value={form.dni}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, dni: e.target.value }));
                    setCampoErrors((p) => ({ ...p, dni: undefined }));
                  }}
                  error={!!campoErrors.dni}
                  helperText={campoErrors.dni}
                  disabled={false}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Fecha de nacimiento"
                  type="date"
                  value={form.fechaNacimiento}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, fechaNacimiento: e.target.value }));
                    setCampoErrors((p) => ({ ...p, fechaNacimiento: undefined }));
                  }}
                  error={!!campoErrors.fechaNacimiento}
                  helperText={campoErrors.fechaNacimiento ?? 'Opcional'}
                  slotProps={{ inputLabel: { shrink: true } }}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography
              variant="subtitle1"
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, fontWeight: 600 }}
            >
              <Home fontSize="small" color="primary" /> Domicilio
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  label="Calle"
                  value={form.calle}
                  onChange={(e) => setForm((p) => ({ ...p, calle: e.target.value }))}
                  placeholder="Ej: Av. Corrientes"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Número"
                  value={form.numero}
                  onChange={(e) => setForm((p) => ({ ...p, numero: e.target.value }))}
                  placeholder="Ej: 1234"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Piso"
                  value={form.piso}
                  onChange={(e) => setForm((p) => ({ ...p, piso: e.target.value }))}
                  placeholder="Ej: 3"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Departamento"
                  value={form.departamento}
                  onChange={(e) => setForm((p) => ({ ...p, departamento: e.target.value }))}
                  placeholder="Ej: B"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Barrio"
                  value={form.barrio}
                  onChange={(e) => setForm((p) => ({ ...p, barrio: e.target.value }))}
                  placeholder="Ej: Villa Crespo"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Localidad"
                  value={form.localidad}
                  onChange={(e) => setForm((p) => ({ ...p, localidad: e.target.value }))}
                  placeholder="Ej: CABA"
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Provincia"
                  value={form.provincia}
                  onChange={(e) => setForm((p) => ({ ...p, provincia: e.target.value }))}
                  placeholder="Ej: Buenos Aires"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography
              sx={{ variant: "subtitle1", fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}

            >
              <Phone fontSize="small" color="primary" /> Teléfonos de contacto
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Número de teléfono"
                value={nuevoTelefono}
                onChange={(e) => setNuevoTelefono(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregarTelefono()}
                fullWidth
              />
              <TextField
                size="small"
                placeholder="Descripción (ej. mamá)"
                value={nuevoTelefonoDescripcion}
                onChange={(e) => setNuevoTelefonoDescripcion(e.target.value)}
                fullWidth
              />
              <Button variant="outlined" onClick={agregarTelefono} size="medium">
                Agregar
              </Button>
            </Box>

            {cargandoTelefonos ? (
              <Typography variant="body2" color="text.secondary">
                Cargando teléfonos...
              </Typography>
            ) : telefonos.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay teléfonos registrados.
              </Typography>
            ) : (
              <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead><TableRow><TableCell>Teléfono</TableCell><TableCell>Descripción</TableCell><TableCell align="right">Acción</TableCell></TableRow></TableHead>
                  <TableBody>
                  {telefonos.map((tel, idx) => (
                    <TableRow
                      key={`${tel.idTelefono ?? 'nuevo'}-${idx}`}
                    >
                      <TableCell>{tel.numero}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={tel.des}
                          onChange={(e) => setTelefonos((prev) => prev.map((item, itemIndex) => itemIndex === idx ? { ...item, des: e.target.value } : item))}
                        />
                      </TableCell>
                      <TableCell align="right"><Tooltip title="Quitar"><IconButton size="small" color="error" onClick={() => quitarTelefono(idx)}><Delete fontSize="small" /></IconButton></Tooltip></TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                </Table>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={cerrarDialog} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardar}
            disabled={guardando}
          >
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
      <AlumnoDetalleModal open={detalleId !== null} id={detalleId} onClose={() => setDetalleId(null)} />
    </Box>
  );
}