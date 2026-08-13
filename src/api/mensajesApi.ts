import api from './axios';
import { Mensaje, MensajeResumen } from '../types';

export const getMensajesRecibidos = async (pagina = 1, cantidad = 20) => {
  const res = await api.get<{ datos: MensajeResumen[] }>('/Mensajes/recibidos', {
    params: { pagina, cantidad }
  });
  return res.data.datos ?? res.data;
};

export const getMensajesEnviados = async (pagina = 1, cantidad = 20) => {
  const res = await api.get<{ datos: MensajeResumen[] }>('/Mensajes/enviados', {
    params: { pagina, cantidad }
  });
  return res.data.datos ?? res.data;
};

export const getMensaje = async (id: number) => {
  const res = await api.get<Mensaje>(`/Mensajes/${id}`);
  return res.data;
};

export const enviarMensaje = async (dto: {
  idUsuarioDestinat: number;
  asunto:            string;
  mensajeTexto:      string;
}) => {
  const res = await api.post('/Mensajes', dto);
  return res.data;
};

export const marcarLeido = async (id: number) => { 
  await api.patch(`/Mensajes/${id}/leido`);
};

export const contarNoLeidos = async (): Promise<number> => {
  const res = await api.get('/Mensajes/noleidos');
  const data = res.data;
  if (typeof data === 'number') return data;
  if (typeof data?.cantidad === 'number') return data.cantidad;
  if (typeof data?.noLeidos === 'number') return data.noLeidos;
  return 0;
};