import api from './axios';
import { ResultadoPaginado } from '../types';

export interface AlumnoDisponible {
  idAlumno: number;
  nombre: string;
  apellido: string;
  dni: number;
  fecNac?: string | null;
  matriculado: boolean;
  idMatricula?: number;
  cursoActual?: string;
  estadoMatricula?: string;
}

export interface MatriculaAsignacionMasivaDto {
  idCurso: number;
  idsAlumnos: number[];
}

export interface AsignacionMasivaResultado {
  mensaje: string;
  resultado?: {
    exitosos: number;
    fallidos: number;
    detalles: string[];
  };
}

// GET /api/matriculas/alumnos-disponibles
export const getAlumnosDisponibles = async (
  anioRegistro: number,
  idCicloLectivo: number,
  pagina = 1,
  cantidad = 10,
  busqueda = ''
): Promise<ResultadoPaginado<AlumnoDisponible>> => {
  const params: Record<string, unknown> = {
    anioRegistro,
    idCicloLectivo,
    pagina,
    cantidad,
  };

  // Si la búsqueda es numérica → DNI, si no → nombre/apellido
  const busquedaLimpia = busqueda.trim();
  if (busquedaLimpia) {
    const soloNumeros = /^\d+$/.test(busquedaLimpia);
    if (soloNumeros) {
      params.dni = parseInt(busquedaLimpia, 10);
    } else {
      params.nombre = busquedaLimpia;
      params.apellido = busquedaLimpia;
    }
  }

  const res = await api.get<ResultadoPaginado<AlumnoDisponible>>(
    '/matriculas/alumnos-disponibles',
    { params }
  );
  return res.data;
};

// POST /api/matriculas/asignar-masivo
export const asignarMasivo = async (
  dto: MatriculaAsignacionMasivaDto
): Promise<AsignacionMasivaResultado> => {
  const res = await api.post<AsignacionMasivaResultado>(
    '/matriculas/asignar-masivo',
    dto
  );
  return res.data;
};