
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  MESA_ENTRADAS = 'MESA_ENTRADAS',
  PERSONAL = 'PERSONAL'
}
/*
export enum UserArea {
  SOCIAL = '314',
  GESTION = '1',
  SALUD = '2',
  MESA_ENTRADAS = '3',
  TERCERA_EDAD = '4',
  INCLUSION = '5',
  NIÑEZ = '6',
  ADMINISTRACION = '7'
}
*/

export const UserArea = {
  314 : 'Social',
  1 : 'Gestión',
  2 : 'Salud',
  3 : 'Mesa de entradas',
  4 : 'Tercera edad',
  5 : 'Inclusion',
  6 : 'Niñez',
  7 : 'Administración',
  8 : 'Mas de 65 años'
} as const;

export const Edades = {
  0 : 'Menos de 1 año',
  1 : 'De 1 a 4 años',
  2 : 'De 5 a 9 años',
  3 : 'De 10 a 14 años',
  4 : 'De 15 a 19 años',
  5 : 'De 20 a 34 años',
  6 : 'De 35 a 49 años',
  7 : 'De 50 a 64 años',
  8 : 'Mas de 65 años'
} as const;

export enum EstadoAtencion {
  PENDIENTE = 'pendiente',
  ASIGNADO = 'asignado',
  EN_PROCESO = 'en_proceso',
  FINALIZADO = 'finalizado',
  REGISTRADO = 'registrado',
  EN_ATENCION = 'en_atencion',
  ATENDIDO = 'atendido'
}

export enum OrigenAtencion {
  MESA_ENTRADAS = 'mesa_entradas',
  PERSONAL = 'personal'
}

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  area: string;
  cargo: string;
  username: string;
  password?: string;
  rol: UserRole;
  activo: boolean;
  debe_cambiar_password: boolean;
  created_at: string;
}

export interface Solicitante {
  id: string;
  nombre_apellido: string;
  dni: string;
  domicilio: string;
  telefono?: string;
  created_date: string;
}

export interface PersonalMunicipal {
  id: string;
  nombre_apellido: string;
  cargo: string;
  area: string;
  activo: boolean;
  atenciones_mes?: number;
}

export interface Stats {
  hoy: number;
  registradas: number;
  enAtencion: number;
  atendidas: number;
  tmr_minutos: number;
}

export interface Atencion {
  id: string;
  numero_atencion: string;
  sx: boolean;
  edad: string;
  
  // Ciudadano (Solicitante)
  solicitante_id: string;
  solicitante_nombre: string;
  solicitante_dni: string;
  solicitante_domicilio: string;
  solicitante_telefono?: string;

  tipo_tramite: string;
  descripcion: string;
  motivo: string;
  estado: EstadoAtencion;
  origen: OrigenAtencion;
  
  usuario_creador_id: string; // User ID
  creada_por_nombre: string;
  usuario_asignado_id: string | null; // User ID
  asignada_a_nombre: string | null;
  
  // Personnel fields
  personal_id: string;
  personal_nombre: string;
  personal_cargo: string;
  
  observaciones?: string;
  resolucion?: string;
  atencion_dispensada?: string;
  
  fecha_creacion: string;
  created_date: string;
  updated_date: string;
  
  fecha_asignacion?: string;
  fecha_inicio_atencion?: string;
  fecha_inicio_proceso?: string;
  fecha_finalizacion?: string;
  fecha_atencion_dispensada?: string;

  usuario_carga?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}
