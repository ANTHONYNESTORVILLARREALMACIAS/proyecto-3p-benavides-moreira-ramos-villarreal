export interface Subscription {
  idSuscripcion: number;
  idUsuario: number;
  idVariante: number;
  estado: 'activa' | 'inactiva';
  rol?: 'suscriptor' | 'admin';
  nombre_asignatura?: string;
  nombre_variante?: string;
}
