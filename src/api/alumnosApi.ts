import api from './axios';
import { ResultadoPaginado, Alumno } from '../types';

export const getAlumnos = async (pagina = 1, cantidad = 10, nombre = '', apellido = '') => {
  const res = await api.get<ResultadoPaginado<Alumno>>('/Alumnos', {
    params: { pagina, cantidad, nombre, apellido }
  });
  return res.data;
};


export const getAlumnosPorCurso = async (idCurso: number) => {
  const res = await api.get<Alumno[]>(`/AlumnoCurso/curso/${idCurso}`);
  return res.data;
};

export const getAlumno = async (id: number) => {
  const res = await api.get<Alumno>(`/Alumnos/${id}`);
  return res.data;
};

export const createAlumno = async (dto: { dni: number; nombre: string; apellido: string }) => {
  const res = await api.post<Alumno>('/Alumnos', dto);
  return res.data;
};

export const updateAlumno = async (id: number, dto: { nombre: string; apellido: string; activo: boolean }) => {
  const res = await api.put(`/Alumnos/${id}`, dto);
  return res.data;
};

export const deleteAlumno = async (id: number) => {
  await api.delete(`/Alumnos/${id}`);
};