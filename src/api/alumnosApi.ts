import api from './axios';
import { ResultadoPaginado, Alumno, AlumnoDetalle } from '../types';

export const getAlumnos = async (
  pagina = 1,
  cantidad = 10,
  nombre = '',
  apellido = '',
  dni?: number
) => {
  const params: Record<string, unknown> = { pagina, cantidad };
  if (nombre) params.nombre = nombre;
  if (apellido) params.apellido = apellido;
  if (dni) params.dni = dni;

  const res = await api.get<ResultadoPaginado<Alumno>>('/Alumnos', { params });
  return res.data;
};

export const getAlumnosPorCurso = async (idCurso: number) => {
  const res = await api.get(`/AlumnoCurso/curso/${idCurso}`);
  return res.data;
};

export const getAlumno = async (id: number) => {
  const res = await api.get<Alumno>(`/Alumnos/${id}`);
  return res.data;
};

export const createAlumno = async (dto: {
  dni: number;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string;
  calle?: string;
  numero?: string;
  piso?: string;
  departamento?: string;
  barrio?: string;
  localidad?: string;
  provincia?: string;
}) => {
  const res = await api.post('/Alumnos', dto);
  return res.data;
};

export const updateAlumno = async (id: number, dto: {
  dni: number;
  nombre: string;
  apellido: string;
  fechaNacimiento?: string;
  activo: boolean;
  calle?: string;
  numero?: string;
  piso?: string;
  departamento?: string;
  barrio?: string;
  localidad?: string;
  provincia?: string;
}) => {
  const res = await api.put(`/Alumnos/${id}`, dto);
  return res.data;
};

export const deleteAlumno = async (id: number) => {
  await api.delete(`/Alumnos/${id}`);
};

export const getAlumnoDetalle = async (id: number) => {
  const res = await api.get<AlumnoDetalle>(`/Alumnos/${id}/detalle`);
  return res.data;
};