/**
 * Convierte una fecha proveniente de un input type="date" (YYYY-MM-DD)
 * al formato date-time que espera EducAR.API.
 */
export const toApiDateTime = (date: string): string =>
  date ? `${date}T00:00:00` : date;
