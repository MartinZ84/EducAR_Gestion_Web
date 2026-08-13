import { useEffect, useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Alert, CircularProgress, List, ListItem,
  ListItemText, ListItemAvatar, Avatar, Chip, Divider,
  Tab, Tabs, IconButton, Tooltip, MenuItem
} from '@mui/material';
import { Send, Email, Drafts, Reply } from '@mui/icons-material';
import {
  getMensajesRecibidos, getMensajesEnviados,
  getMensaje, enviarMensaje, marcarLeido
} from '../../../api/mensajesApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { MensajeResumen, Mensaje } from '../../../types';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import api from '../../../api/axios';

dayjs.locale('es');

interface FormMensaje {
  idDestinatario: string;
  asunto:         string;
  texto:          string;
}

interface Usuario {
  idUsuario:      number;
  nombreCompleto: string;
  rol:            string;
}

export default function MensajesPage() {
  const [tabActiva, setTabActiva]       = useState(0);
  const [recibidos, setRecibidos]       = useState<MensajeResumen[]>([]);
  const [enviados, setEnviados]         = useState<MensajeResumen[]>([]);
  const [detalle, setDetalle]           = useState<Mensaje | null>(null);
  const [detalleOpen, setDetalleOpen]   = useState(false);
  const [nuevoOpen, setNuevoOpen]       = useState(false);
  const [usuarios, setUsuarios]         = useState<Usuario[]>([]);
  const [form, setForm]                 = useState<FormMensaje>({ idDestinatario: '', asunto: '', texto: '' });
  const [cargando, setCargando]         = useState(false);
  const [enviando, setEnviando]         = useState(false);
  const [error, setError]               = useState('');
  const [formError, setFormError]       = useState('');
  const [usuariosError, setUsuariosError] = useState('');


  const cargarMensajes = () => {
    setCargando(true);
    Promise.all([getMensajesRecibidos(), getMensajesEnviados()])
      .then(([r, e]) => { setRecibidos(r); setEnviados(e); })
      .catch(() => setError('Error al cargar mensajes.'))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarMensajes();
    // Carga usuarios para el selector de destinatario
    api.get<{ datos: Usuario[] }>('/usuarios', { params: { pagina: 1, cantidad: 100 } })
      .then(r => setUsuarios(r.data.datos ?? []))
      .catch((err) => setUsuariosError(extraerMensajeError(err)));
  }, []);

  const verDetalle = async (m: MensajeResumen) => {
    try {
      const data = await getMensaje(m.idMensaje);
      setDetalle(data);
      setDetalleOpen(true);
      // Marcar como leído si está en recibidos y no estaba leído
      if (!m.leido) {
        await marcarLeido(m.idMensaje);
        setRecibidos(prev => prev.map(r => r.idMensaje === m.idMensaje ? { ...r, leido: true } : r));
      }
    } catch {
      setError('Error al cargar el mensaje.');
    }
  };

  const handleEnviar = async () => {
    if (!form.idDestinatario) { setFormError('Seleccioná un destinatario.'); return; }
    if (!form.asunto.trim())  { setFormError('El asunto es obligatorio.'); return; }
    if (!form.texto.trim())   { setFormError('El mensaje no puede estar vacío.'); return; }
    if (form.asunto.length > 200) { setFormError('El asunto no puede superar 200 caracteres.'); return; }
    if (form.texto.length > 2000) { setFormError('El mensaje no puede superar 2000 caracteres.'); return; }
    if (form.asunto.length > 200) { setFormError('El asunto no puede superar 200 caracteres.'); return; }
    if (form.texto.length > 2000) { setFormError('El mensaje no puede superar 2000 caracteres.'); return; }
    if (form.asunto.length > 200) { setFormError('El asunto no puede superar 200 caracteres.'); return; }
    if (form.texto.length > 2000) { setFormError('El mensaje no puede superar 2000 caracteres.'); return; }

    setEnviando(true);
    setFormError('');
    try {
      await enviarMensaje({
        idUsuarioDestinat: Number(form.idDestinatario),
        asunto:            form.asunto,
        mensajeTexto:      form.texto,
      });
      setNuevoOpen(false);
      setForm({ idDestinatario: '', asunto: '', texto: '' });
      cargarMensajes();
    } catch (err) {
      setFormError(extraerMensajeError(err));
    } finally {
      setEnviando(false);
    }
  };

  const mensajesActivos = tabActiva === 0 ? recibidos : enviados;

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
          onClick={() => { setNuevoOpen(true); setFormError(''); }}
        >
          Nuevo Mensaje
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {usuariosError && <Alert severity="warning" sx={{ mb: 2 }}>{usuariosError}</Alert>}
      {usuariosError && <Alert severity="warning" sx={{ mb: 2 }}>{usuariosError}</Alert>}
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
          <Button onClick={() => setDetalleOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog nuevo mensaje */}
      <Dialog open={nuevoOpen} onClose={() => setNuevoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Mensaje</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            select
            label="Destinatario *"
            value={form.idDestinatario}
            onChange={(e) => setForm(p => ({ ...p, idDestinatario: e.target.value }))}
          >
            {usuarios.map((u) => (
              <MenuItem key={u.idUsuario} value={String(u.idUsuario)}>
                {u.nombreCompleto} ({u.rol})
              </MenuItem>
            ))}
          </TextField>

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