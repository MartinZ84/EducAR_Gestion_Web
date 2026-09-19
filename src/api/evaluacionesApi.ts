import api from './axios';
import { toApiDateTime } from '../utils/dateUtils';

export interface Evaluacion {
  idEvaluacion: number;
  titulo: string;
  fecha: string;
  notas: { idAlumno: number; valor: number }[];
}

export const getEvaluaciones = async (idCurso: number, idMateria: number, idPeriodo: number) =>
  (await api.get<Evaluacion[]>(`/evaluaciones/curso/${idCurso}/materia/${idMateria}/periodo/${idPeriodo}`)).data;

export const crearEvaluacion = async (dto: {
  idCurso: number; idMateria: number; idPeriodoEvaluacion: number; titulo: string; fecha: string;
}) => (await api.post('/evaluaciones', { ...dto, fecha: toApiDateTime(dto.fecha) })).data;

export const guardarNotasEvaluacion = async (idEvaluacion: number, notas: { idAlumno: number; valor: number | null }[]) =>
  (await api.put(`/evaluaciones/${idEvaluacion}/notas`, { notas })).data;
