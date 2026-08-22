// Tipos de todas las entidades de EducAR

export interface Escuela {
  idEscuela: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  email?: string;
  activo: boolean;
}

export interface Alumno {
  idAlumno: number;
  nombre: string;
  apellido: string;
  dni: number;
  fechaNacimiento?: string;
  activo: boolean;
  // Domicilio
  calle?: string;
  numero?: string;
  piso?: string;
  departamento?: string;
  barrio?: string;
  localidad?: string;
  provincia?: string;
}

export interface TelefonoContacto {
  idTelefono: number;
  idAlumno: number;
  numero: string;
  tipo?: string;
  esPrincipal?: boolean;
}

export interface Docente {
  idDocente: number;
  idUsuario: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  activo: boolean;
}

export interface Tutor {
  idTutor: number;
  idUsuario: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  nombreUsuario: string;
  esResponsable: boolean;
  activo: boolean;
}

export interface CicloLectivo {
  idCicloLectivo: number;
  idEscuela: number;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface Materia {
  idMateria: number;
  idEscuela: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export interface Curso {
  idCurso: number;
  idEscuela: number;
  idCicloLectivo: number;
  anio: number;
  grado: number;
  division: string;
  turno?: string;
  activo: boolean;
  cantidadAlumnos: number;
}

export interface PeriodoEvaluacion {
  idPeriodoEvaluacion: number;
  idCicloLectivo: number;
  anio: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface AsistenciaAlumno {
  idAlumno: number;
  nombreAlumno: string;
  apellidoAlumno: string;
  presente: boolean;
}

export interface AsistenciaPorFecha {
  fecha: string;
  idCurso: number;
  totalAlumnos: number;
  presentes: number;
  ausentes: number;
  detalle: AsistenciaAlumno[];
}

export interface Calificacion {
  idCalificacion: number;
  idAlumno: number;
  nombreAlumno: string;
  apellidoAlumno: string;
  idMateria: number;
  nombreMateria: string;
  idPeriodoEvaluacion: number;
  nombrePeriodo: string;
  valorCalificacion: number;
  observacion?: string;
  fecha: string;
}

export interface DetalleBoletin {
  idMateria: number;
  nombreMateria: string;
  calificacionFinal: number;
  conceptoFinal?: string;
}

export interface Boletin {
  idBoletin: number;
  idAlumno: number;
  nombreAlumno: string;
  apellidoAlumno: string;
  idCurso: number;
  curso: string;
  idPeriodoEvaluacion: number;
  nombrePeriodo: string;
  observacionGeneral?: string;
  promedioGeneral: number;
  fechaGeneracion: string;
  detalle: DetalleBoletin[];
}

export interface Mensaje {
  idMensaje: number;
  idUsuarioRemitente: number;
  nombreRemitente: string;
  idUsuarioDestinat: number;
  nombreDestinatario: string;
  asunto: string;
  mensajeTexto: string;
  fechaEnvio: string;
  leido: boolean;
}

export interface MensajeResumen {
  idMensaje: number;
  nombreRemitente: string;
  nombreDestinatario: string;
  asunto: string;
  fechaEnvio: string;
  leido: boolean;
}

// Tipo genérico para respuestas paginadas
export interface ResultadoPaginado<T> {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  registrosPorPagina: number;
  tienePaginaAnterior: boolean;
  tienePaginaSiguiente: boolean;
  datos: T[];
}

export interface UsuarioDetalle {
  idUsuario: number;
  dni: number;
  nombre: string;
  apellido: string;
  rol: string;
  email: string;
  activo: boolean;
  fechaCrea: string;
  fechaAct: string;
}

export interface DocenteDetalle {
  idDocente: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  cursosAsignados: CursoDocenteDetalle[];
}

export interface CursoDocenteDetalle {
  idCurso: number;
  curso: string;
  materia: string;
  cicloLectivo: string;
}

export interface TutorDetalle {
  idTutor: number;
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  alumnosAsignados: AlumnoTutorDetalle[];
}

export interface AlumnoTutorDetalle {
  idAlumno: number;
  dni: number;
  nombreCompleto: string;
  cursoActual: string;
}

export interface AlumnoDetalle {
  idAlumno: number;
  dni: number;
  nombre: string;
  apellido: string;
  fecNac?: string | null;
  activo: boolean;
  calle?: string | null;
  numero?: string | null;
  piso?: string | null;
  departamento?: string | null;
  barrio?: string | null;
  localidad?: string | null;
  provincia?: string | null;
  telefonos: TelefonoDetalle[];
  matriculaActual?: MatriculaActualDetalle | null;
  tutores: AlumnoTutorAsignadoDetalle[];
  asistenciaResumen: AsistenciaResumenDetalle;
  asistencias: AsistenciaDetalle[];
  calificaciones: CalificacionDetalle[];
  boletines: BoletinDetalle[];
}

export interface MatriculaActualDetalle {
  idCurso: number;
  curso: string;
  cicloLectivo: string;
  fechaMatricula: string;
}

export interface AlumnoTutorAsignadoDetalle {
  idTutor: number;
  nombreCompleto: string;
  parentesco?: string | null;
}

export interface AsistenciaResumenDetalle {
  presentes: number;
  ausentes: number;
  justificadas: number;
}

export interface AsistenciaDetalle {
  idAsistencia: number;
  fecha: string;
  presente: boolean;
  estado: string;
}

export interface CalificacionDetalle {
  materia: string;
  nota: number;
  periodo: string;
}

export interface BoletinDetalle {
  periodo: string;
  promedio: number;
  estado: string;
}

export interface CursoDetalle {
  idCurso: number;
  nombre: string;
  division: string;
  turno?: string | null;
  cicloLectivo: string;
  alumnosMatriculados: AlumnoCursoDetalle[];
  cantidadTotalAlumnos: number;
}

export interface AlumnoCursoDetalle {
  idAlumno: number;
  dni: number;
  nombreCompleto: string;
}

export interface MateriaDetalle {
  idMateria: number;
  nombre: string;
  descripcion?: string | null;
  docentesAsignados: DocenteMateriaDetalle[];
  cursos: CursoMateriaDetalle[];
}

export interface DocenteMateriaDetalle {
  idDocente: number;
  nombreCompleto: string;
}

export interface CursoMateriaDetalle {
  idCurso: number;
  curso: string;
  cicloLectivo: string;
}

export interface CicloLectivoDetalle {
  idCicloLectivo: number;
  anio: number;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
  cursos: CursoCicloLectivoDetalle[];
  cantidadCursos: number;
  cantidadAlumnosMatriculados: number;
}

export interface CursoCicloLectivoDetalle {
  idCurso: number;
  curso: string;
  cantidadAlumnos: number;
}

export interface TelefonoDetalle { numero: string; des?: string | null; }