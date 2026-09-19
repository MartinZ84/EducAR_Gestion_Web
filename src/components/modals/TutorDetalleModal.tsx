import { useEffect, useState } from 'react';
import { Alert, Autocomplete, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import DetalleModal from './DetalleModal';
import { getTutorDetalle } from '../../api/tutoresApi';
import { getAlumnos } from '../../api/alumnosApi';
import { asociarTutorAAlumno, desasociarTutorDeAlumno } from '../../api/asignacionesApi';
import { Alumno, TutorDetalle } from '../../types';
import { extraerMensajeError } from '../../utils/apiErrors';

export default function TutorDetalleModal({ open, id, onClose }: { open: boolean; id: number | null; onClose: () => void }) {
  const [reloadKey, setReloadKey] = useState(0), [asignarOpen, setAsignarOpen] = useState(false);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]), [alumno, setAlumno] = useState<Alumno | null>(null);
  const [parentesco, setParentesco] = useState(''), [responsable, setResponsable] = useState(false), [error, setError] = useState('');
  useEffect(() => { if (asignarOpen) getAlumnos(1, 500).then(r => setAlumnos(r.datos)).catch(e => setError(extraerMensajeError(e))); }, [asignarOpen]);
  const asignar = async () => { if (!id || !alumno) return; try { await asociarTutorAAlumno(alumno.idAlumno, { idTutor: id, parentesco: parentesco.trim() || undefined, esResponsablePrinc: responsable }); setAsignarOpen(false); setAlumno(null); setParentesco(''); setResponsable(false); setReloadKey(k => k + 1); } catch (e) { setError(extraerMensajeError(e)); } };
  const quitar = async (idAlumno: number) => { if (!id) return; try { await desasociarTutorDeAlumno(idAlumno, id); setReloadKey(k => k + 1); } catch (e) { setError(extraerMensajeError(e)); } };
  return <><DetalleModal open={open} id={id} title="Detalle del tutor" load={getTutorDetalle} onClose={onClose} reloadKey={reloadKey}>{(data: TutorDetalle) => <Stack spacing={2}>
    {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}<Typography><strong>DNI:</strong> {data.dni}</Typography><Typography><strong>Nombre:</strong> {data.nombre} {data.apellido}</Typography><Typography><strong>Email:</strong> {data.email}</Typography><Chip label={data.activo ? 'Activo' : 'Inactivo'} color={data.activo ? 'success' : 'default'} sx={{ alignSelf: 'flex-start' }} />
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}><Typography variant="h6">Alumnos asignados</Typography><Button variant="outlined" onClick={() => setAsignarOpen(true)}>Asignar alumno</Button></Stack>
    {data.alumnosAsignados.length === 0 ? <Typography color="text.secondary">No tiene alumnos asignados.</Typography> : <Table size="small"><TableHead><TableRow><TableCell>DNI</TableCell><TableCell>Alumno</TableCell><TableCell>Curso actual</TableCell><TableCell /></TableRow></TableHead><TableBody>{data.alumnosAsignados.map(item => <TableRow key={item.idAlumno}><TableCell>{item.dni}</TableCell><TableCell>{item.nombreCompleto}</TableCell><TableCell>{item.cursoActual}</TableCell><TableCell><Button color="error" size="small" onClick={() => quitar(item.idAlumno)}>Desasignar</Button></TableCell></TableRow>)}</TableBody></Table>}
  </Stack>}</DetalleModal>
  <Dialog open={asignarOpen} onClose={() => setAsignarOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Asignar alumno al tutor</DialogTitle><DialogContent dividers><Stack spacing={2}>{error && <Alert severity="error">{error}</Alert>}<Autocomplete options={alumnos} value={alumno} onChange={(_, value) => setAlumno(value)} getOptionLabel={a => `${a.apellido}, ${a.nombre} · DNI ${a.dni}`} renderInput={params => <TextField {...params} label="Buscar alumno" />} /><TextField label="Parentesco" value={parentesco} onChange={e => setParentesco(e.target.value)} /><FormControlLabel control={<Switch checked={responsable} onChange={e => setResponsable(e.target.checked)} />} label="Responsable principal" /></Stack></DialogContent><DialogActions><Button onClick={() => setAsignarOpen(false)}>Cancelar</Button><Button variant="contained" disabled={!alumno} onClick={asignar}>Asignar</Button></DialogActions></Dialog></>;
}
