import { ReactNode, useEffect, useState } from 'react';
import {
  Alert, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Button, Typography,
} from '@mui/material';
import { extraerMensajeError } from '../../utils/apiErrors';

type DetalleModalProps<T> = {
  open: boolean;
  id: number | null;
  title: string;
  load: (id: number) => Promise<T>;
  onClose: () => void;
  children: (data: T) => ReactNode;
};

export default function DetalleModal<T>({ open, id, title, load, onClose, children }: DetalleModalProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || id === null) return;
    let activo = true;
    setLoading(true);
    setError('');
    setData(null);
    load(id)
      .then((resultado) => { if (activo) setData(resultado); })
      .catch((err) => { if (activo) setError(extraerMensajeError(err)); })
      .finally(() => { if (activo) setLoading(false); });
    return () => { activo = false; };
  }, [open, id, load]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && !data && (
          <Typography color="text.secondary">No hay información disponible.</Typography>
        )}
        {!loading && !error && data && children(data)}
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Cerrar</Button></DialogActions>
    </Dialog>
  );
}
