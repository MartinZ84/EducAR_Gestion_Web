// La API de .NET con ModelState devuelve errores en este formato:
// {
//   "errors": {
//     "Email": ["El formato del email no es válido."],
//     "Contrasena": ["La contraseña debe tener al menos 6 caracteres."]
//   }
// }
// O en formato simple:
// { "mensaje": "El nombre de usuario ya existe." }

export function extraerMensajeError(err: unknown): string {
  const error = err as {
    response?: {
      status?: number;
      data?:   {
        mensaje?: string;
        errors?:  Record<string, string[]>;
        title?:   string;
      };
    };
  };

  const { status, data } = error?.response ?? {};

  if (!data) return 'Error de conexión con el servidor.';

  // 400 con mensaje simple: { mensaje: "..." }
  if (data.mensaje) return data.mensaje;

  // 400 con ModelState: { errors: { Campo: ["error"] } }
  if (data.errors) {
    const mensajes = Object.entries(data.errors)
      .map(([campo, msgs]) => {
        // Limpiamos el nombre del campo para que sea legible
        const nombreCampo = campo
          .replace(/([A-Z])/g, ' $1')  // camelCase → palabras
          .trim();
        return `${nombreCampo}: ${msgs.join(', ')}`;
      })
      .join('\n');
    if (mensajes) return mensajes;
  }

  // 500 genérico
  if (status === 500) return 'Error interno del servidor. Revisá los datos e intentá de nuevo.';

  if (data.title) return data.title;

  return 'Ocurrió un error inesperado.';
}