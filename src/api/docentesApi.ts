import api from './axios';
import { ResultadoPaginado, Docente, DocenteDetalle } from '../types';

export const getDocentes = async (
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

  const res = await api.get<ResultadoPaginado<Docente>>('/docentes', { params });
  return res.data;
};

export const createDocente = async (dto: {
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  contrasena: string;
}) => {
  const res = await api.post('/docentes', dto);
  return res.data;
};

export const updateDocente = async (id: number, dto: {
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
}) => {
  const res = await api.put(`/docentes/${id}`, dto);
  return res.data;
};

export const deleteDocente = async (id: number) => {
  await api.delete(`/docentes/${id}`);
};

export const getDocenteDetalle = async (id: number) => {
  const res = await api.get<DocenteDetalle>(`/docentes/${id}/detalle`);
  return res.data;
};