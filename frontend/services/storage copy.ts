
import { Atencion, EstadoAtencion, Solicitante, OrigenAtencion } from '../types';

const INITIAL_SOLICITANTES: Solicitante[] = [
  { id: 's1', nombre_apellido: 'Roberto Gomez', dni: '20123456', domicilio: 'Av. Mitre 123', telefono: '2281-123456', created_date: new Date().toISOString() },
  { id: 's2', nombre_apellido: 'Laura Diaz', dni: '30987654', domicilio: 'San Martín 450', telefono: '2281-987654', created_date: new Date().toISOString() },
];

const INITIAL_ATENCIONES: Atencion[] = [
  {
    id: 'a1',
    numero_atencion: '2026-0001',
    solicitante_id: 's1',
    solicitante_nombre: 'Roberto Gomez',
    solicitante_dni: '20123456',
    solicitante_domicilio: 'Av. Mitre 123',
    motivo: 'Solicitud de materiales de construcción',
    tipo_tramite: 'Ayuda Material',
    descripcion: 'Solicitud de materiales de construcción',
    personal_id: 'u3', // Juan Social from fakeUserService
    personal_nombre: 'Juan Social',
    personal_cargo: 'Trabajador Social',
    estado: EstadoAtencion.ATENDIDO,
    atencion_dispensada: 'Se inició expediente N° 400/26. Se deriva a Obras Públicas.',
    fecha_atencion_dispensada: new Date().toISOString(),
    usuario_carga: 'admin@azul.gob.ar',
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString(),
    fecha_creacion: new Date().toISOString(),
    origen: OrigenAtencion.MESA_ENTRADAS,
    creada_por: 'u1',
    creada_por_nombre: 'Admin Sistema',
    asignada_a: 'u3',
    asignada_a_nombre: 'Juan Social'
  }
];

// Helper to load/save
const load = <T,>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) return initial;
  try {
    return JSON.parse(stored);
  } catch {
    return initial;
  }
};

const save = <T,>(key: string, data: T) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Service Methods
export const StorageService = {
  // Solicitantes
  getSolicitantes: (): Solicitante[] => load('solicitantes', INITIAL_SOLICITANTES),
  saveSolicitante: (solicitante: Solicitante) => {
    const list = StorageService.getSolicitantes();
    const existingIndex = list.findIndex(s => s.id === solicitante.id);
    if (existingIndex >= 0) {
      list[existingIndex] = solicitante;
    } else {
      list.push(solicitante);
    }
    save('solicitantes', list);
  },
  deleteSolicitante: (id: string) => {
    const list = StorageService.getSolicitantes().filter(s => s.id !== id);
    save('solicitantes', list);
  },

  // Atenciones
  getAtenciones: (): Atencion[] => load('muni_atenciones', INITIAL_ATENCIONES),
  
  createAtencion: (data: Omit<Atencion, 'id' | 'numero_atencion' | 'created_date' | 'updated_date' | 'estado' | 'fecha_creacion'>): Atencion => {
    const atenciones = StorageService.getAtenciones();
    const currentYear = new Date().getFullYear();
    const count = atenciones.filter(a => a.numero_atencion.startsWith(`${currentYear}-`)).length + 1;
    const number = `${currentYear}-${count.toString().padStart(4, '0')}`;
    
    const newAtencion: Atencion = {
      ...data,
      id: crypto.randomUUID(),
      numero_atencion: number,
      estado: EstadoAtencion.REGISTRADO,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      fecha_creacion: new Date().toISOString(),
    };
    
    atenciones.unshift(newAtencion);
    save('muni_atenciones', atenciones);
    return newAtencion;
  },

  updateAtencion: (id: string, updates: Partial<Atencion>) => {
    const atenciones = StorageService.getAtenciones();
    const index = atenciones.findIndex(a => a.id === id);
    if (index >= 0) {
      atenciones[index] = { ...atenciones[index], ...updates, updated_date: new Date().toISOString() };
      save('muni_atenciones', atenciones);
    }
  }
};
