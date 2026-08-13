import {
  Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Pagination, CircularProgress,
  Typography, Alert
} from '@mui/material';

interface Columna<T> {
  label:  string;
  render: (fila: T) => React.ReactNode;
  width?: string;
}

interface TablaBaseProps<T> {
  columnas:     Columna<T>[];
  datos:        T[];
  cargando:     boolean;
  error:        string;
  pagina:       number;
  totalPaginas: number;
  onCambiarPagina: (p: number) => void;
  mensajeVacio?: string;
}

// Componente genérico de tabla — TypeScript generics para que funcione con cualquier entidad
export default function TablaBase<T>({
  columnas, datos, cargando, error,
  pagina, totalPaginas, onCambiarPagina, mensajeVacio = 'No hay registros.'
}: TablaBaseProps<T>) {

  if (cargando) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress />
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Box>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid rgba(0,0,0,0.08)' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F5F7FA' }}>
              {columnas.map((col) => (
                <TableCell key={col.label} sx={{ fontWeight: 600, width: col.width }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {datos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas.length} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">{mensajeVacio}</Typography>
                </TableCell>
              </TableRow>
            ) : (
              datos.map((fila, idx) => (
                <TableRow key={idx} hover>
                  {columnas.map((col) => (
                    <TableCell key={col.label}>{col.render(fila)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPaginas > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPaginas}
            page={pagina}
            onChange={(_, p) => onCambiarPagina(p)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}