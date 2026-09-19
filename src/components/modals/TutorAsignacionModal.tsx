import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, FormControlLabel, IconButton, InputAdornment,
  List, ListItem, ListItemText, Switch, TextField, Typography,
} from '@mui/material';
import { Add, Delete, Search } from '@mui/icons-material';
import { createTutor, getTutores } from '../../api/tutoresApi';
import { asociarTutorAAlumno, desasociarTutorDeAlumno, getTutoresDeAlumno } from '../../api/asignacionesApi';
import { Tutor } from '../../types';
import { extraerMensajeError } from '../../utils/apiErrors';

type Relacion = { idTutor: number; parentesco?: string | null; esResponsablePrinc?: boolean; nombreTutor?: string; apellidoTutor?: string };

export default function TutorAsignacionModal({ open, idAlumno, nombreAlumno, obligatorio = false, onClose, onChanged }: {
  open: boolean; idAlumno: number | null; nombreAlumno?: string; obligatorio?: boolean;
  onClose: () => void; onChanged?: () => void;
}) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Tutor[]>([]);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [relaciones, setRelaciones] = useState<Relacion[]>([]);
  const [parentesco, setParentesco] = useState('');
  const [responsable, setResponsable] = useState(true);
  const [crear, setCrear] = useState(false);
  const [form, setForm] = useState({ dni: '', nombre: '', apellido: '', email: '', nombreUsuario: '', contrasena: '' });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarRelaciones = async () => {
    if (!idAlumno) return;
    setRelaciones(await getTutoresDeAlumno(idAlumno));
  };
  const buscar = async () => {
    const texto = busqueda.trim();
    const respuesta = /^\d+$/.test(texto)
      ? await getTutores(1, 50, '', '', Number(texto))
      : await getTutores(1, 50, texto);
    setResultados(respuesta.datos);
  };

  useEffect(() => {
    if (!open || !idAlumno) return;
    setError(''); setBusqueda(''); setResultados([]); setSeleccionado(null); setCrear(false);
    cargarRelaciones().catch((e) => setError(extraerMensajeError(e)));
  }, [open, idAlumno]);

  const asignar = async () => {
    if (!idAlumno || !seleccionado) { setError('Seleccioná un tutor.'); return; }
    setGuardando(true); setError('');
    try {
      await asociarTutorAAlumno(idAlumno, { idTutor: seleccionado, parentesco: parentesco.trim() || undefined, esResponsablePrinc: responsable });
      await cargarRelaciones(); setSeleccionado(null); setParentesco(''); setResponsable(false); onChanged?.();
    } catch (e) { setError(extraerMensajeError(e)); }
    finally { setGuardando(false); }
  };
  const quitar = async (idTutor: number) => {
    if (!idAlumno) return;
    if (obligatorio && relaciones.length === 1) { setError('El alumno debe conservar al menos un tutor.'); return; }
    try { await desasociarTutorDeAlumno(idAlumno, idTutor); await cargarRelaciones(); onChanged?.(); }
    catch (e) { setError(extraerMensajeError(e)); }
  };
  const crearTutor = async () => {
    if (!form.dni || !form.nombre.trim() || !form.apellido.trim() || !form.email.trim() || !form.nombreUsuario.trim() || form.contrasena.length < 6) {
      setError('Completá todos los datos del tutor. La contraseña debe tener al menos 6 caracteres.'); return;
    }
    setGuardando(true); setError('');
    try {
      const tutor = await createTutor({ dni: Number(form.dni), nombre: form.nombre.trim(), apellido: form.apellido.trim(), email: form.email.trim(), nombreUsuario: form.nombreUsuario.trim(), contrasena: form.contrasena, esResponsable: true });
      setResultados([tutor]); setSeleccionado(tutor.idTutor); setCrear(false);
      setForm({ dni: '', nombre: '', apellido: '', email: '', nombreUsuario: '', contrasena: '' });
    } catch (e) { setError(extraerMensajeError(e)); }
    finally { setGuardando(false); }
  };
  const cerrar = () => {
    if (obligatorio && relaciones.length === 0) { setError('Debés asignar al menos un tutor para completar el alta.'); return; }
    onClose();
  };

  return <Dialog open={open} onClose={cerrar} maxWidth="md" fullWidth>
    <DialogTitle>Asignar tutor{nombreAlumno ? ` a ${nombreAlumno}` : ''}</DialogTitle>
    <DialogContent dividers>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField fullWidth label="Buscar por DNI, nombre o apellido" value={busqueda} onChange={e => setBusqueda(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscar()} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search /></InputAdornment> } }} />
        <Button variant="outlined" onClick={buscar}>Buscar</Button>
        <Button startIcon={<Add />} onClick={() => setCrear(v => !v)}>Nuevo tutor</Button>
      </Box>
      {crear && <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 2 }}>
        <TextField label="DNI" value={form.dni} onChange={e => setForm(p => ({ ...p, dni: e.target.value }))} />
        <TextField label="Nombre" value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} />
        <TextField label="Apellido" value={form.apellido} onChange={e => setForm(p => ({ ...p, apellido: e.target.value }))} />
        <TextField label="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        <TextField label="Usuario" value={form.nombreUsuario} onChange={e => setForm(p => ({ ...p, nombreUsuario: e.target.value }))} />
        <TextField label="Contraseña" type="password" value={form.contrasena} onChange={e => setForm(p => ({ ...p, contrasena: e.target.value }))} />
        <Button variant="contained" onClick={crearTutor} disabled={guardando}>Crear tutor</Button>
      </Box>}
      {resultados.length > 0 && <List dense sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
        {resultados.map(t => <ListItem key={t.idTutor} secondaryAction={<Checkbox checked={seleccionado === t.idTutor} onChange={() => setSeleccionado(seleccionado === t.idTutor ? null : t.idTutor)} />}><ListItemText primary={`${t.apellido}, ${t.nombre}`} secondary={`DNI ${t.dni} · ${t.email}`} /></ListItem>)}
      </List>}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <TextField label="Parentesco" value={parentesco} onChange={e => setParentesco(e.target.value)} fullWidth />
        <FormControlLabel control={<Switch checked={responsable} onChange={e => setResponsable(e.target.checked)} />} label="Responsable principal" />
        <Button variant="contained" onClick={asignar} disabled={!seleccionado || guardando}>Asignar tutor</Button>
      </Box>
      <Divider sx={{ my: 2 }} /><Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tutores asignados</Typography>
      {relaciones.length === 0 ? <Typography color="text.secondary">Todavía no hay tutores asignados.</Typography> : <List dense>{relaciones.map(r => {
        const t = resultados.find(x => x.idTutor === r.idTutor);
        const nombre = t ? `${t.apellido}, ${t.nombre}` : r.nombreTutor ? `${r.apellidoTutor || ''}, ${r.nombreTutor}` : `Tutor #${r.idTutor}`;
        return <ListItem key={r.idTutor} secondaryAction={<IconButton color="error" onClick={() => quitar(r.idTutor)}><Delete /></IconButton>}><ListItemText primary={nombre} secondary={`${r.parentesco || 'Parentesco sin especificar'}${r.esResponsablePrinc ? ' · Responsable principal' : ''}`} /></ListItem>;
      })}</List>}
    </DialogContent>
    <DialogActions><Button onClick={cerrar}>{obligatorio ? 'Finalizar alta' : 'Cerrar'}</Button></DialogActions>
  </Dialog>;
}
