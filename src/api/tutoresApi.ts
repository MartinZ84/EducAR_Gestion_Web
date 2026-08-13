import api from './axios';
import { ResultadoPaginado, Tutor } from '../types';

export const getTutores = async (pagina = 1, cantidad = 10, nombre = '', apellido = '') => {
  const res = await api.get<ResultadoPaginado<Tutor>>('/tutores', {
    params: { pagina, cantidad, nombre, apellido }
  });
  return res.data;
};

export const createTutor = async (dto: {
  dni: number; nombre: string; apellido: string;
  email: string; nombreUsuario: string; contrasena: string; esResponsable: boolean;
}) => {
  const res = await api.post<Tutor>('/tutores', dto);
  return res.data;
};

export const updateTutor = async (id: number, dto: {
  nombre: string; apellido: string; email: string; esResponsable: boolean; activo: boolean;
}) => {
  const res = await api.put(`/tutores/${id}`, dto);
  return res.data;
};

export const deleteTutor = async (id: number) => {
  await api.delete(`/tutores/${id}`);
};