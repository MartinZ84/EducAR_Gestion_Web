import api from './axios';
import { Boletin } from '../types';


export const getBoletines = async (idCurso: number, idPeriodo: number) => {
  const res = await api.get<Boletin[]>(
    `/Boletines/curso/${idCurso}/periodo/${idPeriodo}`
  );
  return res.data;
};


export const generarBoletines = async (dto: {
  idCurso: number; idPeriodoEvaluacion: number;
}) => {
  const res = await api.post('/Boletines/generar', dto);
  return res.data;
};
export const actualizarObservacionBoletin = async (id: number, observacionGeneral: string) => {
  await api.patch(`/Boletines/${id}/observacion`, { observacionGeneral });
};
