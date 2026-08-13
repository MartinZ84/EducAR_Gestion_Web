import api from './axios';

export interface AlumnoCursoAsignacion {
  idAlumno: number;
  idCurso: number;
  [key: string]: unknown;
}

export interface AlumnoTutorAsignacion {
  idAlumno: number;
  idTutor: number;
  parentesco?: string | null;
  esResponsablePrinc?: boolean;
  [key: string]: unknown;
}

export interface DocenteMateriaCursoAsignacion {
  idDocenteMateriaCurso?: number;
  idDocente: number;
  idMateria: number;
  idCurso: number;
  [key: string]: unknown;
}

const toArray = <T>(data: unknown): T[] => {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && Array.isArray((data as { datos?: unknown }).datos)) {
    return (data as { datos: T[] }).datos;
  }
  return [];
};

export const getCursosDeAlumno = async (idAlumno: number) => {
  const res = await api.get<unknown>(`/AlumnoCurso/alumno/${idAlumno}`);
  return toArray<AlumnoCursoAsignacion>(res.data);
};

export const asignarAlumnoACurso = async (idAlumno: number, idCurso: number) => {
  await api.post(`/Alumnos/${idAlumno}/cursos`, { idCurso });
};

export const desasignarAlumnoDeCurso = async (idAlumno: number, idCurso: number) => {
  await api.delete(`/Alumnos/${idAlumno}/cursos/${idCurso}`);
};

export const getTutoresDeAlumno = async (idAlumno: number) => {
  const res = await api.get<unknown>(`/AlumnoTutor/alumno/${idAlumno}`);
  return toArray<AlumnoTutorAsignacion>(res.data);
};

export const asociarTutorAAlumno = async (
  idAlumno: number,
  dto: { idTutor: number; parentesco?: string; esResponsablePrinc: boolean }
) => {
  await api.post(`/Alumnos/${idAlumno}/tutores`, dto);
};

export const desasociarTutorDeAlumno = async (idAlumno: number, idTutor: number) => {
  await api.delete(`/Alumnos/${idAlumno}/tutores/${idTutor}`);
};

export const getAsignacionesDocenteMateriaCurso = async (idCurso: number) => {
  const res = await api.get<unknown>(`/DocenteMateriaCurso/curso/${idCurso}`);
  return toArray<DocenteMateriaCursoAsignacion>(res.data);
};

export const asignarDocenteMateriaCurso = async (dto: {
  idDocente: number;
  idMateria: number;
  idCurso: number;
}) => {
  await api.post('/DocenteMateriaCurso', dto);
};

export const eliminarAsignacionDocenteMateriaCurso = async (id: number) => {
  await api.delete(`/DocenteMateriaCurso/${id}`);
};
