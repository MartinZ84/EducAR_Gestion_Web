import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Alert, CircularProgress, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, Chip, Divider,
  Tab, Tabs, IconButton, Tooltip, Autocomplete
} from '@mui/material';
import { Send, Email, Drafts, Reply } from '@mui/icons-material';
import {
  getMensajesRecibidos, getMensajesEnviados,
  getMensaje, enviarMensaje, marcarLeido, getDestinatariosMensaje, DestinatarioMensaje
} from '../../../api/mensajesApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { MensajeResumen, Mensaje } from '../../../types';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useAuth } from '../../../context/AuthContext';

dayjs.locale('es');

interface FormMensaje {
  asunto:         string;
  texto:          string;
}

export default function MensajesPage() {
  const { usuario } = useAuth();
  const [tabActiva, setTabActiva]       = useState(0);
  const [recibidos, setRecibidos]       = useState<MensajeResumen[]>([]);
  const [enviados, setEnviados]         = useState<MensajeResumen[]>([]);
  const [paginaRecibidos, setPaginaRecibidos] = useState(1);
  const [paginaEnviados, setPaginaEnviados] = useState(1);
  const [totalPaginasRecibidos, setTotalPaginasRecibidos] = useState(1);
  const [totalPaginasEnviados, setTotalPaginasEnviados] = useState(1);
  const [detalle, setDetalle]           = useState<Mensaje | null>(null);
  const [detalleOpen, setDetalleOpen]   = useState(false);
  const [nuevoOpen, setNuevoOpen]       = useState(false);
  const [usuarios, setUsuarios]         = useState<DestinatarioMensaje[]>([]);
  const [form, setForm]                 = useState<FormMensaje>({ asunto: '', texto: '' });
  const [destinatariosSeleccionados, setDestinatariosSeleccionados] = useState<DestinatarioMensaje[]>([]);
  const [cargando, setCargando]         = useState(false);
  const [enviando, setEnviando]         = useState(false);
  const [error, setError]               = useState('');
  const [formError, setFormError]       = useState('');
  const [usuariosError, setUsuariosError] = useState('');


  const cargarMensajes = () => {
    setCargando(true);
    Promise.all([getMensajesRecibidos(paginaRecibidos), getMensajesEnviados(paginaEnviados)])
      .then(([r, e]) => {
        setRecibidos(r.datos); setEnviados(e.datos);
        setTotalPaginasRecibidos(r.totalPaginas || 1);
        setTotalPaginasEnviados(e.totalPaginas || 1);
      })
      .catch(() => setError('Error al cargar mensajes.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarMensajes();
    // Carga usuarios para el selector de destinatario
    getDestinatariosMensaje()
      .then(setUsuarios)
      .catch((err) => setUsuariosError(extraerMensajeError(err)));
    // Refresca las bandejas cada 15 segundos. Es un sondeo de bajo costo que
    // permite ver mensajes nuevos sin recargar manualmente la pantalla.
    const intervalo = window.setInterval(cargarMensajes, 15000);
    return () => window.clearInterval(intervalo);
  }, [paginaRecibidos, paginaEnviados]);

  const verDetalle = async (m: MensajeResumen) => {
    try {
      const data = await getMensaje(m.idMensaje);
      setDetalle(data);
      setDetalleOpen(true);
      // Marcar como leído si está en recibidos y no estaba leído
      if (tabActiva === 0 && !m.leido) {
        await marcarLeido(m.idMensaje);
        setRecibidos(prev => prev.map(r => r.idMensaje === m.idMensaje ? { ...r, leido: true } : r));
        window.dispatchEvent(new Event('mensajes-actualizados'));
      }
    } catch {
      setError('Error al cargar el mensaje.');
    }
  };

  const handleEnviar = async () => {
    if (destinatariosSeleccionados.length === 0) { setFormError('Seleccioná al menos un destinatario.'); return; }
    if (!form.asunto.trim())  { setFormError('El asunto es obligatorio.'); return; }
    if (!form.texto.trim())   { setFormError('El mensaje no puede estar vacío.'); return; }
    if (form.asunto.length > 200) { setFormError('El asunto no puede superar 200 caracteres.'); return; }
    if (form.texto.length > 2000) { setFormError('El mensaje no puede superar 2000 caracteres.'); return; }

    setEnviando(true);
    setFormError('');
    try {
      await enviarMensaje({
        // El selector puede contener varias filas del mismo tutor si representa
        // a más de un alumno. Set evita enviarle el mismo mensaje dos veces.
        idsUsuariosDestinatarios: [...new Set(destinatariosSeleccionados.map(d => d.idUsuario))],
        asunto:            form.asunto,
        mensajeTexto:      form.texto,
      });
      setNuevoOpen(false);
      setForm({ asunto: '', texto: '' });
      setDestinatariosSeleccionados([]);
      window.dispatchEvent(new Event('mensajes-actualizados'));
      cargarMensajes();
    } catch (err) {
      setFormError(extraerMensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const mensajesActivos = tabActiva === 0 ? recibidos : enviados;
  const responder = () => {
    if (!detalle || detalle.idUsuarioDestinat !== usuario?.idUsuario) return;
    const destinatario = usuarios.find((u) => u.idUsuario === detalle.idUsuarioRemitente);
    setDestinatariosSeleccionados(destinatario ? [destinatario] : []);
    setForm({ asunto: `Re: ${detalle.asunto}`, texto: '' });
    setDetalleOpen(false);
    setFormError('');
    setNuevoOpen(true);
  };
  const abrirNuevo = () => {
    setNuevoOpen(true);
    setFormError('');
    setUsuariosError('');
    getDestinatariosMensaje().then(setUsuarios)
      .catch((err) => setUsuariosError(extraerMensajeError(err)));
  };

  // Formatea la fecha de forma legible
  const formatFecha = (fecha: string) =>
    dayjs(fecha).format('DD/MM/YYYY HH:mm');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Mensajes</Typography>
          <Typography variant="body2" color="text.secondary">
            Comunicación interna con otros usuarios
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Send />}
          onClick={abrirNuevo}
        >
          Nuevo Mensaje
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {usuariosError && <Alert severity="warning" sx={{ mb: 2 }}>{usuariosError}</Alert>}

      <Card>
        {/* Tabs: Recibidos / Enviados */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabActiva} onChange={(_, v) => setTabActiva(v)}>
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email fontSize="small" />
                  Recibidos
                  {recibidos.filter(r => !r.leido).length > 0 && (
                    <Chip
                      label={recibidos.filter(r => !r.leido).length}
                      color="error"
                      size="small"
                      sx={{ height: 18, fontSize: 11 }}
                    />
                  )}
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Drafts fontSize="small" />
                  Enviados
                </Box>
              }
            />
          </Tabs>
        </Box>

        {cargando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : mensajesActivos.length === 0 ? (
          <CardContent>
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              No hay mensajes.
            </Typography>
          </CardContent>
        ) : (
          <List disablePadding>
            {mensajesActivos.map((m, idx) => (
              <Box key={m.idMensaje}>
                <ListItem
                  sx={{
                    cursor:    'pointer',
                    bgcolor:   (!m.leido && tabActiva === 0) ? 'rgba(21,101,192,0.04)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
                    py: 1.5,
                  }}
                  onClick={() => verDetalle(m)}
                  secondaryAction={
                    <Tooltip title="Ver mensaje">
                      <IconButton size="small">
                        <Reply fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: tabActiva === 0 ? '#1565C0' : '#2E7D32', width: 40, height: 40 }}>
                      {tabActiva === 0
                        ? m.nombreRemitente?.[0] ?? 'U'
                        : m.nombreDestinatario?.[0] ?? 'U'
                      }
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: (!m.leido && tabActiva === 0) ? 700 : 400 }}
                        >
                          {tabActiva === 0 ? m.nombreRemitente : `Para: ${m.nombreDestinatario}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatFecha(m.fechaEnvio)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!m.leido && tabActiva === 0 && (
                          <Chip label="Nuevo" color="primary" size="small" sx={{ height: 16, fontSize: 10 }} />
                        )}
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {m.asunto}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {idx < mensajesActivos.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        )}
      </Card>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button disabled={(tabActiva === 0 ? paginaRecibidos : paginaEnviados) <= 1} onClick={() =>
          tabActiva === 0 ? setPaginaRecibidos(p => p - 1) : setPaginaEnviados(p => p - 1)
        }>Anterior</Button>
        <Typography variant="body2">Página {tabActiva === 0 ? paginaRecibidos : paginaEnviados} de {tabActiva === 0 ? totalPaginasRecibidos : totalPaginasEnviados}</Typography>
        <Button disabled={(tabActiva === 0 ? paginaRecibidos >= totalPaginasRecibidos : paginaEnviados >= totalPaginasEnviados)} onClick={() =>
          tabActiva === 0 ? setPaginaRecibidos(p => p + 1) : setPaginaEnviados(p => p + 1)
        }>Siguiente</Button>
      </Box>

      {/* Dialog detalle del mensaje */}
      <Dialog open={detalleOpen} onClose={() => setDetalleOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {detalle?.asunto}
        </DialogTitle>
        <DialogContent>
          {detalle && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>De:</strong> {detalle.nombreRemitente}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFecha(detalle.fechaEnvio)}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {detalle.mensajeTexto}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          {detalle?.idUsuarioDestinat === usuario?.idUsuario &&
            usuarios.some((u) => u.idUsuario === detalle?.idUsuarioRemitente) &&
            <Button startIcon={<Reply />} onClick={responder}>Responder</Button>}
          <Button onClick={() => setDetalleOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog nuevo mensaje */}
      <Dialog open={nuevoOpen} onClose={() => setNuevoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Mensaje</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <Autocomplete
            // "multiple" permite seleccionar varios tutores o docentes antes de enviar.
            multiple
            options={usuarios}
            value={destinatariosSeleccionados}
            onChange={(_, value) => setDestinatariosSeleccionados(value)}
            getOptionLabel={(u) => `${u.nombreAlumno} — ${u.nombreCompleto}`}
            isOptionEqualToValue={(a, b) => a.idUsuario === b.idUsuario && a.idAlumno === b.idAlumno}
            filterOptions={(options, state) => {
              const texto = state.inputValue.toLocaleLowerCase('es');
              return options.filter(u => `${u.nombreAlumno} ${u.nombreCompleto}`.toLocaleLowerCase('es').includes(texto));
            }}
            renderOption={(props, u) => <li {...props} key={`${u.idAlumno}-${u.idUsuario}`}><Box><Typography sx={{ fontWeight: 600 }}>{u.nombreAlumno}</Typography><Typography variant="body2" color="text.secondary">{u.rol}: {u.nombreCompleto}</Typography></Box></li>}
            renderInput={(params) => <TextField {...params} label="Alumno y destinatario *" placeholder="Buscar por nombre o apellido" />}
          />
          {/* Seleccionar todos toma una sola opción por usuario. La API ya devuelve
              únicamente destinatarios vinculados durante el ciclo lectivo actual. */}
          {usuarios.length > 0 && <Box sx={{ display:'flex', gap:1 }}><Button size="small" onClick={() => setDestinatariosSeleccionados([...new Map(usuarios.map(u => [u.idUsuario, u])).values()])}>Seleccionar todos</Button><Button size="small" onClick={() => setDestinatariosSeleccionados([])}>Limpiar</Button></Box>}
          {usuarios.length === 0 && <Typography variant="body2" color="text.secondary">No hay destinatarios vinculados en el ciclo lectivo actual.</Typography>}

          <TextField
            label="Asunto *"
            value={form.asunto}
            onChange={(e) => setForm(p => ({ ...p, asunto: e.target.value }))}
          />

          <TextField
            label="Mensaje *"
            value={form.texto}
            onChange={(e) => setForm(p => ({ ...p, texto: e.target.value }))}
            multiline
            rows={5}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setNuevoOpen(false)}>Cancelar</Button>
          <Button variant="contained" startIcon={<Send />} onClick={handleEnviar} disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
