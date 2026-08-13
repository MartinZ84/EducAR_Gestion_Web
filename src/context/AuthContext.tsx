import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UsuarioLogueado } from '../types/auth';

interface AuthContextType {
  usuario:   UsuarioLogueado | null;
  token:     string | null;
  cargando:  boolean;
  login:     (usuario: UsuarioLogueado, token: string) => void;
  logout:    () => void;
  esAdmin:   () => boolean;
  esDocente: () => boolean;
  esTutor:   () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuario, setUsuario]   = useState<UsuarioLogueado | null>(null);
  const [token, setToken]       = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    try {
      const tokenGuardado   = localStorage.getItem('token');
      const usuarioGuardado = localStorage.getItem('usuario');

      if (tokenGuardado && usuarioGuardado) {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado) as UsuarioLogueado);
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
    } finally {
      setCargando(false);
    }
  }, []);

  const login = (datosUsuario: UsuarioLogueado, jwtToken: string) => {
    setUsuario(datosUsuario);
    setToken(jwtToken);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('usuario', JSON.stringify(datosUsuario));
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
  };

  const esAdmin   = () => usuario?.rol === 'Administrador';
  const esDocente = () => usuario?.rol === 'Docente';
  const esTutor   = () => usuario?.rol === 'Tutor';

  return (
    <AuthContext.Provider value={{
      usuario, token, cargando,
      login, logout,
      esAdmin, esDocente, esTutor,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}