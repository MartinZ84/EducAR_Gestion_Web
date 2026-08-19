import api from './axios';
import { ResultadoPaginado, Curso } from '../types';

export const getCursos = async (pagina = 1, cantidad = 10, idCicloLectivo?: number) => {
  const res = await api.get<ResultadoPaginado<Curso>>('/cursos', {
    params: { pagina, cantidad, idCicloLectivo }
  });
  return res.data;
};

export const createCurso = async (dto: {
  idCicloLectivo: number; grado: number; division: string; turno?: string;
}) => {
  const res = await api.post<Curso>('/cursos', dto);
  return res.data;
};

export const deleteCurso = async (id: number) => {
  await api.delete(`/cursos/${id}`);
};
export const getCurso = async (id: number) => {
  const res = await api.get<Curso>(`/Cursos/${id}`);
  return res.data;
};

export const getCursosPorCiclo = async (idCicloLectivo: number): Promise<Curso[]> => {
  const res = await api.get<Curso[]>(`/cursos/ciclo/${idCicloLectivo}`);
  return res.data;
};