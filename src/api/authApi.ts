import api from './axios';
import { LoginResponse } from '../types/auth';

export const login = async (
  
  nombreUsuario: string,
  contrasena:    string,
  idEscuela:     number
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', {
    nombreUsuario,
    contrasena,
    idEscuela,
  });
  return response.data;
};
