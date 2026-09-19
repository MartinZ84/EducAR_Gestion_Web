import api from './axios';
import { Calificacion } from '../types';


export const getCalificaciones = async (
  idCurso: number,
  idMateria: number,
  idPeriodo: number
) => {
  const res = await api.get<{ calificaciones: Calificacion[] }>(
    `/Calificaciones/curso/${idCurso}/materia/${idMateria}/periodo/${idPeriodo}`
  );
  return res.data.calificaciones;
};
