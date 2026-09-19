import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Autocomplete, Box, Button, Card, CardContent, CircularProgress, Divider, FormControlLabel, Switch, Tab, Tabs, TextField, Typography } from '@mui/material';
import { Delete, Link as LinkIcon } from '@mui/icons-material';
import { getAlumnos } from '../../../api/alumnosApi';
import { getCursos } from '../../../api/cursosApi';
import { getDocentes } from '../../../api/docentesApi';
import { getMaterias } from '../../../api/materiasApi';
import { getTutores } from '../../../api/tutoresApi';
import { asignarAlumnoACurso, asociarTutorAAlumno, asignarDocenteMateriaCurso, desasignarAlumnoDeCurso, desasociarTutorDeAlumno, eliminarAsignacionDocenteMateriaCurso, getAsignacionesDocenteMateriaCurso, getCursosDeAlumno, getTutoresDeAlumno } from '../../../api/asignacionesApi';
import { extraerMensajeError } from '../../../utils/apiErrors';
import { Alumno, Curso, Docente, Materia, Tutor } from '../../../types';

type Option = { id: number; label: string };
const cursoLabel = (x: Curso) => `${x.grado}° "${x.division}" · ${x.turno} · ${x.anio}`;

export default function AsignacionesPage() {
  const [tab, setTab] = useState(0), [error, setError] = useState(''), [cargando, setCargando] = useState(true);
  const [alumnos, setAlumnos] = useState<Alumno[]>([]), [cursos, setCursos] = useState<Curso[]>([]), [docentes, setDocentes] = useState<Docente[]>([]), [materias, setMaterias] = useState<Materia[]>([]), [tutores, setTutores] = useState<Tutor[]>([]);
  useEffect(() => { Promise.all([getAlumnos(1,500), getCursos(1,500), getDocentes(1,500), getMaterias(1,500), getTutores(1,500)]).then(([a,c,d,m,t]) => { setAlumnos(a.datos); setCursos(c.datos); setDocentes(d.datos); setMaterias(m.datos); setTutores(t.datos); }).catch(e => setError(extraerMensajeError(e))).finally(() => setCargando(false)); }, []);
  if (cargando) return <Box sx={{ display:'flex', justifyContent:'center', py:8 }}><CircularProgress /></Box>;
  return <Box><Typography variant="h5" sx={{ fontWeight: 700 }}>Asignaciones académicas</Typography><Typography color="text.secondary" sx={{mb:3}}>Buscá y seleccioná cada elemento para administrar sus relaciones.</Typography>{error && <Alert severity="error" sx={{mb:2}} onClose={() => setError('')}>{error}</Alert>}<Card><Tabs value={tab} onChange={(_,v) => setTab(v)} variant="scrollable"><Tab label="Alumno ↔ Curso"/><Tab label="Alumno ↔ Tutor"/><Tab label="Docente ↔ Materia ↔ Curso"/></Tabs><Divider/><CardContent>{tab===0 && <AlumnoCurso alumnos={alumnos} cursos={cursos} error={setError}/>} {tab===1 && <AlumnoTutor alumnos={alumnos} tutores={tutores} error={setError}/>} {tab===2 && <DocenteMateriaCurso docentes={docentes} materias={materias} cursos={cursos} error={setError}/>}</CardContent></Card></Box>;
}

function AlumnoCurso({alumnos,cursos,error}:{alumnos:Alumno[];cursos:Curso[];error:(s:string)=>void}) {
  const [a,setA]=useState<number|null>(null), [c,setC]=useState<number|null>(null), [actuales,setActuales]=useState<{idMatricula:number;idCurso:number}[]>([]);
  const cargar=async(id:number)=>{try{const r=await getCursosDeAlumno(id);setActuales(r.map(x=>({idMatricula:+x.idMatricula,idCurso:+x.idCurso})));}catch(e){error(extraerMensajeError(e));}};
  const asignar=async()=>{if(!a||!c)return;try{await asignarAlumnoACurso(a,c);await cargar(a);setC(null);}catch(e){error(extraerMensajeError(e));}};
  const quitar=async(idMatricula:number)=>{if(!a)return;try{await desasignarAlumnoDeCurso(idMatricula);await cargar(a);}catch(e){error(extraerMensajeError(e));}};
  return <Panel title="Asignar alumno a curso"><SearchSelect label="Alumno" value={a} onChange={v=>{setA(v);setActuales([]);if(v)cargar(v);}} options={alumnos.map(x=>({id:x.idAlumno,label:`${x.apellido}, ${x.nombre} · DNI ${x.dni}`}))}/><SearchSelect label="Curso" value={c} onChange={setC} disabled={!a} options={cursos.map(x=>({id:x.idCurso,label:cursoLabel(x)}))}/><Button variant="contained" startIcon={<LinkIcon/>} onClick={asignar} disabled={!a||!c}>Asignar</Button><RelationList items={actuales.map(x=>({id:x.idMatricula,label:cursos.find(y=>y.idCurso===x.idCurso)?cursoLabel(cursos.find(y=>y.idCurso===x.idCurso)!):`Curso #${x.idCurso}`}))} onDelete={quitar}/></Panel>;
}

function AlumnoTutor({alumnos,tutores,error}:{alumnos:Alumno[];tutores:Tutor[];error:(s:string)=>void}) {
  const [a,setA]=useState<number|null>(null),[t,setT]=useState<number|null>(null),[p,setP]=useState(''),[r,setR]=useState(false),[actuales,setActuales]=useState<{idTutor:number;parentesco?:string|null;esResponsablePrinc?:boolean;nombreTutor?:string;apellidoTutor?:string}[]>([]);
  const cargar=async(id:number)=>{try{setActuales(await getTutoresDeAlumno(id));}catch(e){error(extraerMensajeError(e));}};
  const asignar=async()=>{if(!a||!t)return;try{await asociarTutorAAlumno(a,{idTutor:t,parentesco:p||undefined,esResponsablePrinc:r});await cargar(a);setT(null);setP('');setR(false);}catch(e){error(extraerMensajeError(e));}};
  const quitar=async(id:number)=>{if(!a)return;try{await desasociarTutorDeAlumno(a,id);await cargar(a);}catch(e){error(extraerMensajeError(e));}};
  return <Panel title="Asociar tutor a alumno"><SearchSelect label="Alumno" value={a} onChange={v=>{setA(v);setActuales([]);if(v)cargar(v);}} options={alumnos.map(x=>({id:x.idAlumno,label:`${x.apellido}, ${x.nombre} · DNI ${x.dni}`}))}/><SearchSelect label="Tutor" value={t} onChange={setT} disabled={!a} options={tutores.map(x=>({id:x.idTutor,label:`${x.apellido}, ${x.nombre} · DNI ${x.dni}`}))}/><TextField label="Parentesco" value={p} onChange={e=>setP(e.target.value)} fullWidth/><FormControlLabel control={<Switch checked={r} onChange={e=>setR(e.target.checked)}/>} label="Responsable principal"/><Button variant="contained" startIcon={<LinkIcon/>} onClick={asignar} disabled={!a||!t}>Asociar</Button><RelationList items={actuales.map(x=>({id:x.idTutor,label:`${x.apellidoTutor||tutores.find(y=>y.idTutor===x.idTutor)?.apellido||''}, ${x.nombreTutor||tutores.find(y=>y.idTutor===x.idTutor)?.nombre||`Tutor #${x.idTutor}`}${x.parentesco?` · ${x.parentesco}`:''}${x.esResponsablePrinc?' · Responsable':''}`}))} onDelete={quitar}/></Panel>;
}

function DocenteMateriaCurso({docentes,materias,cursos,error}:{docentes:Docente[];materias:Materia[];cursos:Curso[];error:(s:string)=>void}) {
  const [d,setD]=useState<number|null>(null),[m,setM]=useState<number|null>(null),[c,setC]=useState<number|null>(null),[actuales,setActuales]=useState<{id:number;idDocente:number;idMateria:number}[]>([]);
  const cargar=async(id:number)=>{try{const r=await getAsignacionesDocenteMateriaCurso(id);setActuales(r.map(x=>({id:+(x.idDocenteMateriaCurso||0),idDocente:+x.idDocente,idMateria:+x.idMateria})));}catch(e){error(extraerMensajeError(e));}};
  const asignar=async()=>{if(!d||!m||!c)return;try{await asignarDocenteMateriaCurso({idDocente:d,idMateria:m,idCurso:c});await cargar(c);}catch(e){error(extraerMensajeError(e));}};
  const quitar=async(id:number)=>{if(!c)return;try{await eliminarAsignacionDocenteMateriaCurso(id);await cargar(c);}catch(e){error(extraerMensajeError(e));}};
  return <Panel title="Asignar docente, materia y curso"><SearchSelect label="Curso" value={c} onChange={v=>{setC(v);setActuales([]);if(v)cargar(v);}} options={cursos.map(x=>({id:x.idCurso,label:cursoLabel(x)}))}/><SearchSelect label="Docente" value={d} onChange={setD} options={docentes.map(x=>({id:x.idDocente,label:`${x.apellido}, ${x.nombre}`}))}/><SearchSelect label="Materia" value={m} onChange={setM} options={materias.map(x=>({id:x.idMateria,label:x.nombre}))}/><Button variant="contained" startIcon={<LinkIcon/>} onClick={asignar} disabled={!d||!m||!c}>Asignar</Button><RelationList items={actuales.map(x=>({id:x.id,label:`${docentes.find(y=>y.idDocente===x.idDocente)?.apellido||`Docente #${x.idDocente}`} · ${materias.find(y=>y.idMateria===x.idMateria)?.nombre||`Materia #${x.idMateria}`}`}))} onDelete={quitar}/></Panel>;
}

function SearchSelect({label,value,onChange,options,disabled=false}:{label:string;value:number|null;onChange:(v:number|null)=>void;options:Option[];disabled?:boolean}) { const selected=options.find(x=>x.id===value)||null; return <Autocomplete options={options} value={selected} onChange={(_,v)=>onChange(v?.id??null)} getOptionLabel={x=>x.label} isOptionEqualToValue={(a,b)=>a.id===b.id} disabled={disabled} renderInput={params=><TextField {...params} label={label} placeholder="Escribí para buscar"/>}/>; }
function Panel({title,children}:{title:string;children:ReactNode}) { return <Box sx={{display:'flex',flexDirection:'column',gap:2}}><Typography variant="h6">{title}</Typography>{children}</Box>; }
function RelationList({items,onDelete}:{items:{id:number;label:string}[];onDelete:(id:number)=>void}) { if(!items.length)return <Typography color="text.secondary">No hay relaciones registradas.</Typography>;return <Box sx={{display:'flex',flexDirection:'column',gap:1}}>{items.map(x=><Box key={`${x.id}-${x.label}`} sx={{display:'flex',justifyContent:'space-between',alignItems:'center',p:1.5,border:'1px solid',borderColor:'divider',borderRadius:2}}><Typography>{x.label}</Typography><Button color="error" size="small" startIcon={<Delete/>} onClick={()=>onDelete(x.id)}>Quitar</Button></Box>)}</Box>; }
