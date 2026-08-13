import api from './axios';
import { PeriodoEvaluacion } from '../types';

export const getPeriodosPorCiclo = async (idCicloLectivo: number) => {
  const res = await api.get<PeriodoEvaluacion[]>(`/ciclos/${idCicloLectivo}/periodos`);
  return res.data;
};

/**
 * Mantiene compatibilidad con las pantallas que todavía no tienen el ciclo
 * seleccionado. No oculta los errores de API: el componente consumidor puede
 * informar al usuario si la carga falla.
 */
export const getPeriodos = async (): Promise<PeriodoEvaluacion[]> => {
  const ciclosRes = await api.get<{ datos?: { idCicloLectivo: number; activo: boolean }[] } | { idCicloLectivo: number; activo: boolean }[]>(
    '/CiclosLectivos'
  );

  const ciclosData = ciclosRes.data;
  const ciclos = Array.isArray(ciclosData) ? ciclosData : ciclosData.datos ?? [];
  const activos = ciclos.filter((c) => c.activo);

  if (activos.length === 0) return [];

  const resultados = await Promise.all(
    activos.map((c) => getPeriodosPorCiclo(c.idCicloLectivo))
  );

  return resultados.flat();
};
