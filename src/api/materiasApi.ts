import api from './axios';
import { ResultadoPaginado, Materia } from '../types';

export const getMaterias = async (pagina = 1, cantidad = 10, nombre = '') => {
  const res = await api.get<ResultadoPaginado<Materia>>('/materias', {
    params: { pagina, cantidad, nombre }
  });
  return res.data;
};

export const createMateria = async (dto: { nombre: string; descripcion?: string }) => {
  const res = await api.post<Materia>('/materias', dto);
  return res.data;
};

export const updateMateria = async (id: number, dto: { nombre: string; descripcion?: string; activo: boolean }) => {
  await api.put(`/materias/${id}`, dto);
};

export const deleteMateria = async (id: number) => {
  await api.delete(`/materias/${id}`);
};