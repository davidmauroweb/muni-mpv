
import { Atencion, ApiResponse, User, UserRole, EstadoAtencion, OrigenAtencion } from '../types';

const ATENCIONES_KEY = 'muni_atenciones';

export const fakeAtencionService = {
  getAll: (currentUser: User): Atencion[] => {
    const stored = localStorage.getItem(ATENCIONES_KEY);
    const all: Atencion[] = stored ? JSON.parse(stored) : [];

    // ROLE-BASED FILTERING
    if (currentUser.rol === UserRole.PERSONAL) {
      return all.filter(a => a.creada_por === currentUser.id || a.asignada_a === currentUser.id);
    }

    // ADMIN, SUPERVISOR and MESA_ENTRADAS see all
    return all;
  },

  create: (data: Partial<Atencion>, currentUser: User): ApiResponse<Atencion> => {
    const all = fakeAtencionService.getAll(currentUser);
    const year = new Date().getFullYear();
    const count = all.filter(a => a.numero_atencion.startsWith(`${year}-`)).length + 1;
    
    // Ensure all mandatory fields from Atencion interface are populated
    const newAtencion: Atencion = {
      id: crypto.randomUUID(),
      numero_atencion: `${year}-${count.toString().padStart(4, '0')}`,
      solicitante_id: data.solicitante_id!,
      solicitante_nombre: data.solicitante_nombre!,
      solicitante_dni: data.solicitante_dni!,
      solicitante_domicilio: data.solicitante_domicilio!,
      solicitante_telefono: data.solicitante_telefono,
      tipo_tramite: data.tipo_tramite!,
      descripcion: data.descripcion!,
      motivo: data.tipo_tramite!, // Default motif
      estado: data.asignada_a ? EstadoAtencion.ASIGNADO : EstadoAtencion.PENDIENTE,
      
      // ROLE RULES FOR ORIGIN & ASSIGNMENT
      origen: currentUser.rol === UserRole.PERSONAL ? OrigenAtencion.PERSONAL : OrigenAtencion.MESA_ENTRADAS,
      creada_por: currentUser.id,
      creada_por_nombre: `${currentUser.nombre} ${currentUser.apellido}`,
      asignada_a: currentUser.rol === UserRole.PERSONAL ? currentUser.id : (data.asignada_a || null),
      asignada_a_nombre: currentUser.rol === UserRole.PERSONAL ? `${currentUser.nombre} ${currentUser.apellido}` : (data.asignada_a_nombre || null),
      
      // Personal fields for identification
      personal_id: currentUser.rol === UserRole.PERSONAL ? currentUser.id : (data.asignada_a || ''),
      personal_nombre: currentUser.rol === UserRole.PERSONAL ? `${currentUser.nombre} ${currentUser.apellido}` : (data.asignada_a_nombre || ''),
      personal_cargo: currentUser.rol === UserRole.PERSONAL ? currentUser.cargo : '',

      fecha_creacion: new Date().toISOString(),
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString(),
      fecha_asignacion: (currentUser.rol === UserRole.PERSONAL || data.asignada_a) ? new Date().toISOString() : undefined,
    };

    all.unshift(newAtencion);
    localStorage.setItem(ATENCIONES_KEY, JSON.stringify(all));
    return { success: true, data: newAtencion, status: 201 };
  },

  update: (id: string, updates: Partial<Atencion>, currentUser: User): ApiResponse<Atencion> => {
    const all = fakeAtencionService.getAll(currentUser);
    const index = all.findIndex(a => a.id === id);
    if (index === -1) return { success: false, error: 'Atención no encontrada', status: 404 };

    const atencion = all[index];

    // PERMISSION CHECKS
    if (currentUser.rol === UserRole.MESA_ENTRADAS && updates.asignada_a) {
      return { success: false, error: 'Mesa de Entradas no tiene permisos para asignar', status: 403 };
    }

    if (currentUser.rol === UserRole.PERSONAL && updates.asignada_a && updates.asignada_a !== currentUser.id) {
      return { success: false, error: 'Personal no puede asignar a otros usuarios', status: 403 };
    }

    const updated = { ...atencion, ...updates, updated_date: new Date().toISOString() };
    
    // Auto-update state on assignment
    if (updates.asignada_a && atencion.estado === EstadoAtencion.PENDIENTE) {
      updated.estado = EstadoAtencion.ASIGNADO;
      updated.fecha_asignacion = new Date().toISOString();
    }

    all[index] = updated;
    localStorage.setItem(ATENCIONES_KEY, JSON.stringify(all));
    return { success: true, data: updated, status: 200 };
  }
};
