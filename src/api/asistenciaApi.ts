import api from './axios';
import { AsistenciaPorFecha } from '../types';
import { toApiDateTime } from '../utils/dateUtils';


export const getAsistenciaPorCursoYFecha = async (idCurso: number, fecha: string) => {
  const res = await api.get<AsistenciaPorFecha>(
    `/Asistencia/curso/${idCurso}`,
    { params: { fecha: toApiDateTime(fecha) } }
  );
  return res.data;
};


export const registrarAsistencia = async (dto: {
  idCurso: number;
  fecha:   string;
  alumnos: { idAlumno: number; presente: boolean }[];
}) => {
  const res = await api.post('/Asistencia', { ...dto, fecha: toApiDateTime(dto.fecha) });
  return res.data;
};


export const getAsistenciaPorAlumno = async (idAlumno: number, idCurso: number) => {
  const res = await api.get(`/Asistencia/alumno/${idAlumno}/curso/${idCurso}`);
  return res.data;
};

export interface DiaCalendarioAsistencia { fecha: string; estado: 'Cargada' | 'Pendiente' | 'Futura' | 'NoLaborable'; motivo?: string | null }
export interface CalendarioAsistencia { idCurso: number; curso: string; fechaInicio: string; fechaFin: string; pendientes: number; dias: DiaCalendarioAsistencia[] }

export const getCalendarioAsistencia = async (idCurso: number) =>
  (await api.get<CalendarioAsistencia>(`/Asistencia/calendario/${idCurso}`)).data;

export const getPendientesAsistencia = async () =>
  (await api.get<{ cantidad: number; cursosConPendientes: number }>('/Asistencia/pendientes')).data;
