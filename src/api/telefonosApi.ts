import api from './axios';

export interface TelefonoContacto {
  idTelefono?: number;
  idAlumno: number;
  numero: string;
  des?: string;
  tipo?: string;
  esPrincipal?: boolean;
}

export const getTelefonosPorAlumno = async (idAlumno: number): Promise<TelefonoContacto[]> => {
  const res = await api.get<TelefonoContacto[]>(`/telefonos/alumno/${idAlumno}`);
  return res.data;
};

export const createTelefono = async (dto: Omit<TelefonoContacto, 'idTelefono'>) => {
  const res = await api.post('/telefonos', dto);
  return res.data;
};

export const deleteTelefono = async (idTelefono: number) => {
  await api.delete(`/telefonos/${idTelefono}`);
};

export const updateTelefono = async (idTelefono: number, dto: Omit<TelefonoContacto, 'idTelefono'>) => {
  const res = await api.put(`/telefonos/${idTelefono}`, dto);
  return res.data;
};