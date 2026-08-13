export type Rol = 'Administrador' | 'Docente' | 'Tutor';

export interface LoginRequest {
  nombreUsuario: string;
  contrasena:    string;
  idEscuela:     number;
}

export interface LoginResponse {
  idUsuario:      number;    // ← agregá esta línea
  token:          string;
  nombreUsuario:  string;
  nombreCompleto: string;
  rol:            Rol;
  idEscuela:      number;
  expiracion:     string;
}

export interface UsuarioLogueado {
  idUsuario:      number;
  nombreUsuario:  string;
  nombreCompleto: string;
  rol:            Rol;
  idEscuela:      number;
}