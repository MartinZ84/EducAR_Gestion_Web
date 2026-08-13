# Correcciones realizadas — EducAr Web

## Integración con EducAR.API

Las modificaciones se realizaron tomando como contrato la especificación OpenAPI 3.0.4 de `EducAR.API` versión 1.0 proporcionada para el proyecto.

## Correcciones de integración

1. Ciclo lectivo: creación y actualización usan DTOs separados.
2. Ciclo lectivo: fechas convertidas a `date-time`.
3. Asistencia: GET y POST utilizan `date-time`.
4. Usuarios: se eliminó el filtro `nombre` inexistente en el endpoint de usuarios.
5. Usuarios: los roles se cargan mediante `/Roles`.
6. Usuarios: el alta incluye `idEscuela`, requerido por `UsuarioCreateDto`.
7. Calificaciones: se consultan las notas existentes antes de editar.
8. Períodos: se consultan por el ciclo lectivo real del curso mediante `/ciclos/{id}/periodos`.
9. Boletines: se agregó edición de observación general mediante PATCH.
10. Asignaciones: se incorporó una pantalla para alumno-curso, alumno-tutor y docente-materia-curso.

## Configuración

- `vite.config.ts` normalizado.
- `src/vite-env.d.ts` normalizado.
- `VITE_API_URL` configurable mediante `.env`.
- `BrowserRouter` compatible con `import.meta.env.BASE_URL`.
- React Router alineado en `7.18.2`.
- Se agregaron engines de Node/npm.

## Calidad

- Se eliminaron logs de debugging.
- Se eliminaron capturas de error silenciosas en los módulos revisados.
- Se centralizó el manejo de errores usando `extraerMensajeError`.
- Se agregó chequeo TypeScript como parte de `npm run lint`.

## Validación realizada en el entorno de análisis

Se analizaron sintácticamente 49 archivos `ts/tsx/js/jsx` con Babel Parser:

```text
Errores de sintaxis: 0
```

ESLint se ejecutó sobre la configuración JavaScript sin reportar errores.

El build completo no pudo ejecutarse en este entorno porque las dependencias originales contenían bindings nativos de otra plataforma para Rolldown. Esto debe validarse con una instalación limpia de dependencias en el equipo donde se ejecutará el proyecto.
