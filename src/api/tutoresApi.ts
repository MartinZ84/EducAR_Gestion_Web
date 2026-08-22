import api from './axios';
import { ResultadoPaginado, Tutor, TutorDetalle } from '../types';

export const getTutores = async (
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

  const res = await api.get<ResultadoPaginado<Tutor>>('/tutores', { params });
  return res.data;
};

export const createTutor = async (dto: {
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  contrasena: string;
  esResponsable: boolean;
}) => {
  const res = await api.post('/tutores', dto);
  return res.data;
};

export const updateTutor = async (id: number, dto: {
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  esResponsable: boolean;
  activo: boolean;
}) => {
  const res = await api.put(`/tutores/${id}`, dto);
  return res.data;
};

export const deleteTutor = async (id: number) => {
  await api.delete(`/tutores/${id}`);
};

export const getTutorDetalle = async (id: number) => {
  const res = await api.get<TutorDetalle>(`/tutores/${id}/detalle`);
  return res.data;
};