import api from './axios';
import { Calificacion } from '../types';


export const getCalificaciones = async (
  idCurso: number,
  idMateria: number,
  idPeriodo: number
) => {
  const res = await api.get<Calificacion[]>(
    `/Calificaciones/curso/${idCurso}/materia/${idMateria}/periodo/${idPeriodo}`
  );
  return res.data;
};


export const registrarCalificaciones = async (dto: {
  idCurso:             number;
  idMateria:           number;
  idPeriodoEvaluacion: number;
  alumnos: { idAlumno: number; valorCalificacion: number; observacion?: string }[];
}) => {
  const res = await api.post('/Calificaciones', dto);
  return res.data;
};