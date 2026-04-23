
export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  MESA_ENTRADAS = 'MESA_ENTRADAS',
  PERSONAL = 'PERSONAL'
}

export const UserArea = {
  0 : 'Social',
  1 : 'Gestión',
  2 : 'Salud',
  3 : 'Mesa de entradas',
  4 : 'Tercera edad',
  5 : 'Inclusión',
  6 : 'Niñez',
  7 : 'Administración',
  8 : 'Atención primaria'
} as const;

export const Edades = {
  0 : '< de 1',
  1 : '1 a 4',
  2 : '5 a 9',
  3 : '10 a 14',
  4 : '15 a 19',
  5 : '20 a 34',
  6 : '35 a 49',
  7 : '50 a 64',
  8 : '65 y +'
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
  caps: number;
  os: number;
  servicio: number;
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
  usuario_asignado_id: number | null; // User ID
  asignada_a_nombre: string | null;
  
  // Personnel fields
  personal_id: string;
  personal_nombre: string;
  personal_cargo: number;
  
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

export interface CentroSalud {
  nombre: string;
  codigo: number;
  dir: string;
  tel: string;
}

export const CAPS_MAP: Record<number, CentroSalud> = {
  328: { 
    nombre: 'CAPS 01', 
    codigo: 328, 
    dir: 'Calle 98 1169', 
    tel: '2281-413556' 
  },
  310: { 
    nombre: 'CAPS 02', 
    codigo: 310, 
    dir: 'Escalada y Bolivar', 
    tel: '2281-586874' 
  },
  301: { 
    nombre: 'CAPS 03', 
    codigo: 301, 
    dir: 'Malvinas 226', 
    tel: '2281-329386' 
  },
  298: { 
    nombre: 'CAPS 04', 
    codigo: 298, 
    dir: 'Tandil 887', 
    tel: '2281-516248' 
  },
  263: { 
    nombre: 'CAPS 05', 
    codigo: 263, 
    dir: 'Calle 2 251', 
    tel: '2281-587155' 
  },
  271: { 
    nombre: 'CAPS 06', 
    codigo: 271, 
    dir: 'Rauch 1375', 
    tel: '2281-587127' 
  },
  280: { 
    nombre: 'CAPS 07', 
    codigo: 280, 
    dir: 'Mitre 963', 
    tel: '2281-431585' 
  },
  352: { 
    nombre: 'CAPS 08', 
    codigo: 352, 
    dir: 'Rivas 1180', 
    tel: '2281-658338' 
  },
  344: { 
    nombre: 'CAPS 09', 
    codigo: 344,
    dir: 'Cte. Franco 50', 
    tel: '2281-660528' 
  },
  336: { 
    nombre: 'CAPS 10', 
    codigo: 336, 
    dir: 'Azucenas 222', 
    tel: '2281-498122' 
  },
  361: { 
    nombre: 'CAPS 11', 
    codigo: 361, 
    dir: 'S. Cabral y Alvear', 
    tel: '2281-658338' 
  },
  379: { 
    nombre: 'CAPS 12', 
    codigo: 379, 
    dir: 'De Paula 1130', 
    tel: '2281-587018' 
  },
  484: { 
    nombre: 'CAPS 13', 
    codigo: 484, 
    dir: 'Calle 4 e/ Maipú y 1ro de Mayo', 
    tel: '2281-587196' 
  },
} as const;

export const Servicios = {
  '016' : 'Clinica Médica',
  '014' : 'Tocoginecología',
  '057' : 'Psicología',
  '140' : 'Nutrición',
  '187' : 'Estimulación',
  '199' : 'Pediatría',
  '306' : 'Educ. Salud (C)',
  '314' : 'Servicio Social',
  '402' : 'Examen de Salud',
  '434' : 'Planificación',
  '642' : 'Obstetricia',
  '706' : 'Educ. Salud',
  '800' : 'Enfermeria',
  '801' : 'Vacunación',
  '802' : 'Ecografía',
  '901' : 'Garrafa',
  '902' : 'Veterinaria',
  '903' : 'Bolson Comida'
} as const;

export interface ReporteFiltros {
  desde?: string;
  hasta?: string;
}