# EducAr Web

Frontend web de **EducAr Gestión**, desarrollado con React, TypeScript, Vite y Material UI, integrado con `EducAR.API` mediante Axios y autenticación JWT.

## Requisitos

- Node.js **22.12 o superior**.
- npm **10.8 o superior**.
- `EducAR.API` ejecutándose y accesible desde el navegador.
- URL de la API disponible para configurar `VITE_API_URL`.

> El proyecto no incluye `node_modules`. Las dependencias deben instalarse localmente.

## 1. Instalación desde cero

Clonar o descomprimir el proyecto y entrar en la carpeta:

```bash
cd EducAr_Web
```

Eliminar cualquier instalación anterior de dependencias si existe:

### Windows PowerShell

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
```

### Linux/macOS

```bash
rm -rf node_modules
```

Instalar las dependencias:

```bash
npm install
```

> Se recomienda `npm install` en una instalación inicial para que npm pueda resolver correctamente las dependencias opcionales nativas de Vite/Rolldown para la plataforma local.

## 2. Configurar la URL de la API

Copiar `.env.example` como `.env`.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### Linux/macOS

```bash
cp .env.example .env
```

Editar `.env`:

```env
VITE_API_URL=http://localhost:5213/api
```

Si la API utiliza otra URL o puerto, reemplazar el valor.

Después de modificar `.env`, reiniciar Vite.

## 3. Verificar la instalación

Ejecutar primero el chequeo TypeScript:

```bash
npm run typecheck
```

Luego ESLint:

```bash
npm run lint
```

La validación de TypeScript se realiza mediante `tsc`; ESLint revisa la configuración JavaScript del proyecto. Esto evita que ESLint intente interpretar TypeScript sin un parser adicional.

Finalmente generar el build:

```bash
npm run build
```

## 4. Ejecutar en desarrollo

```bash
npm run dev
```

Vite mostrará la URL local, normalmente:

```text
http://localhost:5173/
```

Abrir esa dirección en el navegador.

## 5. Ejecutar el build generado

Después de:

```bash
npm run build
```

se genera la carpeta `dist`.

Para probarla localmente:

```bash
npm run preview
```

## 6. Orden recomendado: API + React

Primero iniciar `EducAR.API`.

Verificar que la API responda y que la URL configurada en `.env` sea correcta.

Después iniciar React:

```bash
npm run dev
```

El flujo de autenticación utiliza:

```text
POST /api/auth/login
```

El token JWT recibido se almacena en `localStorage` y Axios lo envía como:

```text
Authorization: Bearer <token>
```

## 7. Roles

La aplicación contempla:

- Administrador
- Docente
- Tutor

Las rutas principales son:

```text
/login
/admin
/docente
/tutor
```

El acceso se controla mediante `ProtectedRoute` según el rol recibido durante el login.

## 8. Funcionalidades principales

### Administrador

- Dashboard.
- Docentes.
- Tutores.
- Alumnos.
- Materias.
- Cursos.
- Ciclos lectivos.
- Usuarios.
- Asignaciones académicas.

### Docente

- Dashboard.
- Mis cursos.
- Asistencia.
- Calificaciones.
- Boletines.
- Mensajes.

### Tutor

La ruta está preparada y el módulo continúa en desarrollo.

## 9. Asignaciones académicas

Se incorporó la pantalla `/admin/asignaciones`, que permite trabajar con las relaciones expuestas por la API:

- Alumno ↔ Curso.
- Alumno ↔ Tutor.
- Docente ↔ Materia ↔ Curso.

Estas operaciones utilizan los endpoints correspondientes de `EducAR.API`.

## 10. Correcciones importantes incluidas

- DTO de alta de ciclo lectivo alineado con `CicloLectivoCreateDto`.
- DTO de actualización de ciclo lectivo separado del DTO de creación.
- Conversión de fechas `YYYY-MM-DD` a `date-time` para la API.
- Asistencia enviada con formato `date-time`.
- Calificaciones existentes recuperadas antes de editar/guardar.
- Períodos de evaluación cargados según el ciclo lectivo del curso seleccionado.
- Observación general de boletines editable mediante PATCH.
- Roles de usuarios obtenidos desde `/api/Roles`.
- `UsuarioCreateDto` incluye `idEscuela`, requerido por la API.
- Eliminado el parámetro inexistente `nombre` de `GET /api/Usuarios`.
- React Router alineado en versión `7.18.2`.
- `vite.config.ts` normalizado.
- `src/vite-env.d.ts` normalizado.
- URL de API configurable mediante `VITE_API_URL`.
- Redirección de sesión compatible con el `base` de Vite.
- Manejo de errores centralizado mediante `extraerMensajeError` en los principales flujos.
- Eliminados logs de debugging.
- Eliminados catches silenciosos en los módulos revisados.

## 11. Estructura principal

```text
src/
├── api/                  # Comunicación con EducAR.API
├── assets/               # Recursos estáticos
├── components/           # Componentes reutilizables
├── context/              # Estado global/autenticación
├── hooks/                # Hooks personalizados
├── pages/
│   ├── Admin/
│   ├── Docente/
│   ├── Tutor/
│   └── Login/
├── router/               # Rutas y protección por rol
├── theme/                # Tema Material UI
├── types/                # Tipos TypeScript
└── utils/                # Utilidades
```

## 12. Problemas frecuentes

### `npm ci` falla con un error 404 de un registro interno

Si el entorno o empresa utiliza un registry npm interno que no contiene un paquete, comprobar:

```bash
npm config get registry
```

Para una instalación normal desde npmjs se puede utilizar temporalmente:

```bash
npm install --registry=https://registry.npmjs.org
```

No modificar el proyecto para solucionar un problema exclusivo del registry corporativo sin validar primero la configuración de npm.

### Error de binding nativo de Rolldown/Vite

No reutilizar `node_modules` generado en otro sistema operativo.

Eliminarlo y reinstalar:

```bash
rm -rf node_modules
npm install
```

En Windows:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

### Error CORS

Si React carga correctamente pero las llamadas a la API fallan por CORS, la configuración debe revisarse en `EducAR.API`. El frontend no puede solucionar por sí solo una política CORS del backend.

### HTTP 401

Verificar:

1. Login exitoso.
2. Token almacenado en `localStorage`.
3. URL correcta de la API.
4. Expiración del JWT.
5. Que la API acepte `Authorization: Bearer <token>`.

## 13. Flujo recomendado para desarrollo

Después de cada modificación importante:

```bash
npm run typecheck
npm run lint
npm run build
```

Y para probar la aplicación:

```bash
npm run dev
```

## 14. GitHub

No subir:

```text
node_modules/
dist/
.env
```

Sí subir:

```text
package.json
package-lock.json
.env.example
src/
public/
README.md
vite.config.ts
tsconfig.json
tsconfig.node.json
eslint.config.js
```
