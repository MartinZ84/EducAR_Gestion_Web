import api from './axios';
import { ResultadoPaginado, Docente } from '../types';

export const getDocentes = async (pagina = 1, cantidad = 10, nombre = '', apellido = '') => {
  const res = await api.get<ResultadoPaginado<Docente>>('/docentes', {
    params: { pagina, cantidad, nombre, apellido }
  });
  return res.data;
};

export const createDocente = async (dto: {
  dni: number; nombre: string; apellido: string;
  email: string; nombreUsuario: string; contrasena: string;
}) => {
  const res = await api.post<Docente>('/docentes', dto);
  return res.data;
};

export const updateDocente = async (id: number, dto: {
  nombre: string; apellido: string; email: string; activo: boolean;
}) => {
  const res = await api.put(`/docentes/${id}`, dto);
  return res.data;
};

export const deleteDocente = async (id: number) => {
  await api.delete(`/docentes/${id}`);
};