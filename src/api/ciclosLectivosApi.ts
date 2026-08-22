import api from './axios';
import { CicloLectivo, CicloLectivoDetalle } from '../types';

export interface CicloLectivoCreateDto {
  anio: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface CicloLectivoUpdateDto extends CicloLectivoCreateDto {
  activo: boolean;
}

export const getCiclosLectivos = async () => {
  const res = await api.get<{ datos: CicloLectivo[] }>('/cicloslectivos');
  return res.data.datos ?? res.data;
};

export const createCicloLectivo = async (dto: CicloLectivoCreateDto) => {
  const res = await api.post<CicloLectivo>('/cicloslectivos', dto);
  return res.data;
};

export const updateCicloLectivo = async (id: number, dto: CicloLectivoUpdateDto) => {
  await api.put(`/cicloslectivos/${id}`, dto);
};

export const getCicloLectivoDetalle = async (id: number) => {
  const res = await api.get<CicloLectivoDetalle>(`/cicloslectivos/${id}/detalle`);
  return res.data;
};

