import api from './axios';

export interface MiCurso {
  idDocenteMateriaCurso: number;
  idCurso:               number;
  grado:                 number;
  division:              string;
  turno:                 string;
  anio:                  number;
  idMateria:             number;
  nombreMateria:         string;
}


export const getMisCursos = async () => {
  const res = await api.get<MiCurso[]>('/DocenteMateriaCurso/mis-cursos');
  return res.data;
};