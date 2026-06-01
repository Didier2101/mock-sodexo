// Tipos compartidos para los componentes del Dashboard

export interface DatoPorSede {
  name: string;       // Nombre corto de la sede (para el eje X)
  fullName: string;   // Nombre completo
  papel: number;
  jabon: number;
  aseo: number;
  agua: number;
  visitas: number;
}

export interface DatoTendencia {
  label: string;      // "dd/mm" para el eje X
  dateStr: string;    // "YYYY-MM-DD"
  visitas: number;
  pulsaciones: number;
}
