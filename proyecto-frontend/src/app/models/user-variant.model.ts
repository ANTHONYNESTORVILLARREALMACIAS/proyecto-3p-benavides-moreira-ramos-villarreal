export interface UserVariant {
  idUsuario: number;
  idVariante: number;
  rol: 'admin' | 'suscriptor';
  nombre_asignatura?: string;
  nombre_variante?: string;
}
