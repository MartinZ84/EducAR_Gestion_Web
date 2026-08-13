import { createTheme } from '@mui/material/styles';

// createTheme: crea un tema personalizado que se aplica
// a todos los componentes MUI de la app automáticamente
const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',      // azul oscuro del diseño
      light: '#1976D2',
      dark: '#0D47A1',
      contrastText: '#fff',
    },
    secondary: {
      main: '#42A5F5',      // azul claro para acentos
    },
    background: {
      default: '#F5F7FA',   // fondo gris suave
      paper: '#FFFFFF',
    },
    success: {
      main: '#4CAF50',
    },
    error: {
      main: '#F44336',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,       // bordes redondeados como en el diseño
  },
  components: {
    // Personalización global de botones
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none', // sin mayúsculas automáticas
          fontWeight: 600,
          padding: '10px 24px',
        },
      },
    },
    // Cards con sombra suave
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    // Inputs con bordes redondeados
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
  },
});

export default theme;