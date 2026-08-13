import api from './axios';

export interface Rol {
  id: number;
  nombre: string;
}

/**
 * GET /api/Roles no documenta un schema de respuesta en OpenAPI.
 * Normalizamos las dos formas habituales de identificador sin acoplar
 * el frontend a una única representación del backend.
 */
export const getRoles = async (): Promise<Rol[]> => {
  const res = await api.get<unknown>('/Roles');
  const data = Array.isArray(res.data)
    ? res.data
    : (res.data as { datos?: unknown[] })?.datos ?? [];

  return data.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const value = item as Record<string, unknown>;
    const id = Number(value.idRol ?? value.id);
    const nombre = String(value.nombre ?? value.rol ?? '').trim();
    return Number.isInteger(id) && id > 0 && nombre ? [{ id, nombre }] : [];
  });
};
