# Instalación y ejecución desde cero

## 1. Verificar Node y npm

```powershell
node --version
npm --version
```

Se recomienda:

- Node.js >= 22.12.0
- npm >= 10.8.0

## 2. Eliminar dependencias anteriores

PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
```

## 3. Instalar dependencias

```powershell
npm install
```

Si el registry corporativo devuelve 404 para algún paquete, verificar:

```powershell
npm config get registry
```

y, si corresponde al entorno:

```powershell
npm install --registry=https://registry.npmjs.org
```

## 4. Configurar la API

```powershell
Copy-Item .env.example .env
```

Editar `.env`:

```env
VITE_API_URL=http://localhost:5213/api
```

## 5. Verificar TypeScript

```powershell
npm run typecheck
```

Debe finalizar sin errores.

## 6. Ejecutar lint

```powershell
npm run lint
```

## 7. Generar build

```powershell
npm run build
```

Debe generarse `dist/`.

## 8. Ejecutar en desarrollo

```powershell
npm run dev
```

Abrir la URL indicada por Vite, normalmente:

```text
http://localhost:5173/
```

## 9. Verificación funcional mínima

1. Iniciar `EducAR.API`.
2. Confirmar que `VITE_API_URL` apunta al backend.
3. Abrir `/login`.
4. Iniciar sesión con Administrador.
5. Verificar Usuarios y roles.
6. Crear/editar un Ciclo Lectivo.
7. Verificar Cursos.
8. Abrir Asignaciones y probar alumno-curso.
9. Probar alumno-tutor.
10. Probar docente-materia-curso.
11. Cerrar sesión.
12. Iniciar sesión como Docente.
13. Probar Asistencia con una fecha.
14. Probar Calificaciones cargando un período con notas existentes.
15. Probar Boletines y editar la observación general.
16. Probar Mensajes.

## Importante

No copiar `node_modules` desde otro equipo. Las dependencias nativas de Vite/Rolldown deben instalarse en la plataforma donde se ejecutará la aplicación.
