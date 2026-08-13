// Tipos de todas las entidades de EducAR

export interface Escuela {
  idEscuela: number;
  nombre:    string;
  direccion: string;
  telefono?: string;
  email?:    string;
  activo:    boolean;
}

export interface Alumno {
  idAlumno: number;
  nombre:   string;
  apellido: string;
  dni:      number;
  activo:   boolean;
}

export interface Docente {
  idDocente:     number;
  idUsuario:     number;
  dni:           number;
  nombre:        string;
  apellido:      string;
  email:         string;
  nombreUsuario: string;
  activo:        boolean;
}

export interface Tutor {
  idTutor:       number;
  idUsuario:     number;
  dni:           number;
  nombre:        string;
  apellido:      string;
  email:         string;
  nombreUsuario: string;
  esResponsable: boolean;
  activo:        boolean;
}

export interface CicloLectivo {
  idCicloLectivo: number;
  idEscuela:      number;
  anio:           number;
  fechaInicio:    string;
  fechaFin:       string;
  activo:         boolean;
}

export interface Materia {
  idMateria:   number;
  idEscuela:   number;
  nombre:      string;
  descripcion?: string;
  activo:      boolean;
}

export interface Curso {
  idCurso:        number;
  idEscuela:      number;
  idCicloLectivo: number;
  anio:           number;
  grado:          number;
  division:       string;
  turno?:         string;
  activo:         boolean;
  cantidadAlumnos: number;
}

export interface PeriodoEvaluacion {
  idPeriodoEvaluacion: number;
  idCicloLectivo:      number;
  anio:                number;
  nombre:              string;
  fechaInicio:         string;
  fechaFin:            string;
  activo:              boolean;
}

export interface AsistenciaAlumno {
  idAlumno:      number;
  nombreAlumno:  string;
  apellidoAlumno: string;
  presente:      boolean;
}

export interface AsistenciaPorFecha {
  fecha:        string;
  idCurso:      number;
  totalAlumnos: number;
  presentes:    number;
  ausentes:     number;
  detalle:      AsistenciaAlumno[];
}

export interface Calificacion {
  idCalificacion:      number;
  idAlumno:            number;
  nombreAlumno:        string;
  apellidoAlumno:      string;
  idMateria:           number;
  nombreMateria:       string;
  idPeriodoEvaluacion: number;
  nombrePeriodo:       string;
  valorCalificacion:   number;
  observacion?:        string;
  fecha:               string;
}

export interface DetalleBoletin {
  idMateria:         number;
  nombreMateria:     string;
  calificacionFinal: number;
  conceptoFinal?:    string;
}

export interface Boletin {
  idBoletin:           number;
  idAlumno:            number;
  nombreAlumno:        string;
  apellidoAlumno:      string;
  idCurso:             number;
  curso:               string;
  idPeriodoEvaluacion: number;
  nombrePeriodo:       string;
  observacionGeneral?: string;
  promedioGeneral:     number;
  fechaGeneracion:     string;
  detalle:             DetalleBoletin[];
}

export interface Mensaje {
  idMensaje:          number;
  idUsuarioRemitente: number;
  nombreRemitente:    string;
  idUsuarioDestinat:  number;
  nombreDestinatario: string;
  asunto:             string;
  mensajeTexto:       string;
  fechaEnvio:         string;
  leido:              boolean;
}

export interface MensajeResumen {
  idMensaje:          number;
  nombreRemitente:    string;
  nombreDestinatario: string;
  asunto:             string;
  fechaEnvio:         string;
  leido:              boolean;
}

// Tipo genérico para respuestas paginadas
export interface ResultadoPaginado<T> {
  paginaActual:       number;
  totalPaginas:       number;
  totalRegistros:     number;
  registrosPorPagina: number;
  tienePaginaAnterior: boolean;
  tienePaginaSiguiente: boolean;
  datos:              T[];
}