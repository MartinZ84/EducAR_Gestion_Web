import api from './axios';
import { ResultadoPaginado, UsuarioDetalle } from '../types';

export interface Usuario {
  idUsuario: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  rol: string;
  activo: boolean;
}

export const getUsuarios = async (
  pagina = 1,
  cantidad = 10,
  busqueda = ''
) => {
  const params: Record<string, unknown> = { pagina, cantidad };
  const busquedaLimpia = busqueda.trim();
  if (busquedaLimpia) {
    const soloNumeros = /^\d+$/.test(busquedaLimpia);
    if (soloNumeros) {
      params.dni = busquedaLimpia;
    } else {
      params.nombre = busquedaLimpia;
      params.apellido = busquedaLimpia;
    }
  }

  const res = await api.get<ResultadoPaginado<Usuario>>('/usuarios', { params });
  return res.data;
};

export const createUsuario = async (dto: {
  idRol: number;
  idEscuela: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  contrasena: string;
}) => {
  const res = await api.post('/usuarios', dto);
  return res.data;
};

export const updateUsuario = async (id: number, dto: {
  idRol: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
}) => {
  const res = await api.put(`/usuarios/${id}`, dto);
  return res.data;
};

export const deleteUsuario = async (id: number) => {
  await api.delete(`/usuarios/${id}`);
};

export const getUsuarioDetalle = async (id: number) => {
  const res = await api.get<UsuarioDetalle>(`/usuarios/${id}/detalle`);
  return res.data;
};