import api from './axios';

export interface AlumnoTutorConsulta {
  idAlumno: number;
  nombre: string;
  apellido: string;
}

export interface AsistenciaTutorConsulta {
  idAsistencia: number;
  idCurso: number;
  fecha: string;
  presente: boolean;
  grado: number;
  division: string;
  anio: number;
}

export interface CalificacionTutorConsulta {
  idCalificacion: number;
  nombre: string;
  periodo: string;
  anio: number;
  nota: number;
  observacion?: string;
  fecha: string;
}

export interface NotaTutorConsulta {
  idNotaEvaluacion: number;
  titulo: string;
  fecha: string;
  materia: string;
  periodo: string;
  anio: number;
  valor: number;
}

export const getMisAlumnosTutor = async () =>
  (await api.get<AlumnoTutorConsulta[]>('/tutor/mis-alumnos')).data;

export const getAsistenciasTutor = async (idAlumno: number) =>
  (await api.get<AsistenciaTutorConsulta[]>(`/tutor/alumnos/${idAlumno}/asistencias`)).data;

export const getCalificacionesTutor = async (idAlumno: number) =>
  (await api.get<CalificacionTutorConsulta[]>(`/tutor/alumnos/${idAlumno}/calificaciones`)).data;

export const getNotasTutor = async (idAlumno: number) =>
  (await api.get<NotaTutorConsulta[]>(`/tutor/alumnos/${idAlumno}/notas`)).data;
