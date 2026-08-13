import { useState, useEffect, useCallback } from 'react';
import { ResultadoPaginado } from '../types';

// Hook reutilizable para cualquier listado paginado
// Recibe la función que llama a la API y maneja estado, carga y errores automáticamente
export function usePaginado<T>(
  fetchFn: (pagina: number, cantidad: number) => Promise<ResultadoPaginado<T>>,
  cantidad = 10
) {
  const [datos, setDatos]         = useState<T[]>([]);
  const [pagina, setPagina]       = useState(1);
  const [total, setTotal]         = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando]   = useState(false);
  const [error, setError]         = useState('');

  const cargar = useCallback(async (p: number) => {
    setCargando(true);
    setError('');
    try {
      const resultado = await fetchFn(p, cantidad);
      setDatos(resultado.datos);
      setTotal(resultado.totalRegistros);
      setTotalPaginas(resultado.totalPaginas);
      setPagina(p);
    } catch {
      setError('Error al cargar los datos.');
    } finally {
      setCargando(false);
    }
  }, [fetchFn, cantidad]);

  useEffect(() => { cargar(1); }, [cargar]);

  return { datos, pagina, total, totalPaginas, cargando, error, cargar, recargar: () => cargar(pagina) };
}