import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Atencion, EstadoAtencion, UserRole } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { printVoucher } from '../utils/printer';
import { Search, Printer, Play, CheckSquare, Edit3, X, Eye, FileText, User, Calendar, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AttentionsList: React.FC = () => {
  const { user } = useAuth();
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [filtered, setFiltered] = useState<Atencion[]>([]);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State for Completing Attention
  const [selectedAtencion, setSelectedAtencion] = useState<Atencion | null>(null);
  const [dispenseText, setDispenseText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    let result = atenciones;
    if (statusFilter !== 'all') {
      result = result.filter(a => a.estado === statusFilter);
    }
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(a => 
        a.solicitante_nombre.toLowerCase().includes(lower) ||
        a.solicitante_dni.includes(lower) ||
        a.motivo.toLowerCase().includes(lower)
      );
    }
    setFiltered(result);
  }, [searchText, statusFilter, atenciones]);

  const handleStartAttention = (id: string) => {
    StorageService.updateAtencion({ 
      estado: EstadoAtencion.EN_ATENCION,
      fecha_inicio_atencion: new Date().toISOString()
    });
    refreshData();
  };

  const openDetailModal = (atencion: Atencion) => {
    setSelectedAtencion(atencion);
    setDispenseText(atencion.resolucion || '');
    setIsModalOpen(true);
  };

  const handleSaveResolution = async () => {
    if (!selectedAtencion) return;
    await StorageService.updateAtencion({
      id: selectedAtencion.id,
      estado: EstadoAtencion.ATENDIDO,
      atencion_dispensada: dispenseText,
      fecha_atencion_dispensada: new Date().toISOString()
    });
    setIsModalOpen(false);
    refreshData();
  };

  const refreshData = async () => {
    const data = await StorageService.getAtenciones();
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setAtenciones(data);
    console.log(data);
  };

  const canEditResolution = (atencion: Atencion) => {
    if (!user) return false;

    // ADMIN: All permissions
    if (user.rol === UserRole.ADMIN) return true;

    // SUPERVISOR: Can edit any resolution, even if saved
    if (user.rol === UserRole.SUPERVISOR) return true;

    // MESA_ENTRADAS: Can edit any resolution, but NOT if already saved (status ATENDIDO)
    if (user.rol === UserRole.MESA_ENTRADAS) {
        return atencion.estado !== EstadoAtencion.ATENDIDO;
    }

    // PERSONAL: Can edit only assigned resolutions, but NOT if already saved (status ATENDIDO)
    if (user.rol === UserRole.PERSONAL) {
        return user.id === atencion.asignada_a && atencion.estado !== EstadoAtencion.ATENDIDO;
    }

    return false;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Listado de Atenciones</h1>
            <p className="text-slate-500 font-medium">Gestione y consulte el historial de atenciones.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            <input 
                type="text" 
                placeholder="Buscar por nombre, DNI, número o motivo..." 
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
            />
        </div>
        <select 
            className="p-3 bg-white border border-slate-300 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-600 focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
        >
            <option value="all">TODOS LOS ESTADOS</option>
            <option value={EstadoAtencion.REGISTRADO}>REGISTRADO</option>
            <option value={EstadoAtencion.EN_ATENCION}>EN ATENCIÓN</option>
            <option value={EstadoAtencion.ATENDIDO}>ATENDIDO</option>
        </select>
      </div>

      {/* Table View */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest whitespace-nowrap">Fecha / N°</th>
                        <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">Solicitante</th>
                        <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">Motivo</th>
                        <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">Asignado</th>
                        <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest text-center">Estado</th>
                        <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filtered.map(atencion => (
                        <tr key={atencion.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="p-4">
                                <div className="font-bold text-slate-700">{new Date(atencion.created_at).toLocaleDateString()}</div>
                                <div className="text-[10px] font-mono text-slate-400 font-bold">{atencion.id}</div>
                            </td>
                            <td className="p-4">
                                <div className="font-bold text-slate-900">{atencion.solicitante_nombre}</div>
                                <div className="text-xs text-slate-500">{atencion.solicitante_dni}</div>
                            </td>
                            <td className="p-4">
                                <div className="text-sm font-medium text-slate-700 truncate max-w-[200px]" title={atencion.motivo}>{atencion.motivo}</div>
                            </td>
                            <td className="p-4">
                                <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block whitespace-nowrap">
                                    {atencion.personal_nombre || 'Sin asignar'}
                                </div>
                            </td>
                            <td className="p-4 text-center">
                                <StatusBadge status={atencion.estado} />
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => openDetailModal(atencion)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Ver Detalles / Resolver"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => printVoucher(atencion)}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                        title="Imprimir"
                                    >
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    
                                    {atencion.estado === EstadoAtencion.REGISTRADO && canEditResolution(atencion) && (
                                        <button 
                                            onClick={() => handleStartAttention(atencion.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Iniciar Atención"
                                        >
                                            <Play className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {filtered.length === 0 && (
            <div className="text-center py-20">
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No se encontraron atenciones.</p>
            </div>
        )}
      </div>

      {/* Detail & Resolution Modal */}
      {isModalOpen && selectedAtencion && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                      <div>
                          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Detalle de Atención</h3>
                          <p className="text-sm text-slate-400 font-mono font-bold">{selectedAtencion.id}</p>
                      </div>
                      <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-3 text-slate-400">
                              <User className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Solicitante</span>
                          </div>
                          <p className="font-bold text-slate-900 text-lg">{selectedAtencion.solicitante_nombre}</p>
                          <p className="text-sm text-slate-600">DNI: {selectedAtencion.solicitante_dni}</p>
                          <p className="text-sm text-slate-600">{selectedAtencion.solicitante_domicilio}</p>
                          {selectedAtencion.solicitante_telefono && <p className="text-sm text-slate-600">{selectedAtencion.solicitante_telefono}</p>}
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-2 mb-3 text-slate-400">
                              <FileText className="w-4 h-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Trámite</span>
                          </div>
                          <p className="font-bold text-slate-900">{selectedAtencion.motivo}</p>
                          <p className="text-sm text-slate-600 mt-1">{selectedAtencion.descripcion}</p>
                          <div className="mt-4 pt-4 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-slate-400 mb-1">
                                  <Calendar className="w-3 h-3" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Fecha</span>
                              </div>
                              <p className="text-sm font-medium text-slate-700">{new Date(selectedAtencion.fecha).toLocaleDateString()}</p>
                          </div>
                      </div>
                  </div>

                  <div className="mb-6">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-green-600" /> Resolución / Atención Dispensada
                      </h4>
                      
                      {canEditResolution(selectedAtencion) ? (
                          <div className="space-y-4">
                              <textarea 
                                className="w-full border border-slate-300 rounded-2xl p-4 bg-slate-50 focus:ring-4 focus:ring-green-100 focus:border-green-500 h-32 resize-none font-medium text-sm transition-all"
                                value={dispenseText}
                                onChange={e => setDispenseText(e.target.value)}
                                placeholder="Escriba aquí la resolución, derivación o detalles de la atención brindada..."
                              />
                              <div className="flex justify-end gap-3">
                                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
                                  <button onClick={handleSaveResolution} className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center gap-2">
                                      <Save className="w-4 h-4" /> Guardar Resolución
                                  </button>
                              </div>
                          </div>
                      ) : (
                          <div className="bg-green-50 p-5 rounded-2xl border border-green-100 min-h-[100px]">
                              {selectedAtencion.resolucion ? (
                                  <p className="text-sm text-green-900 whitespace-pre-wrap font-medium">{selectedAtencion.resolucion}</p>
                              ) : (
                                  <p className="text-sm text-green-700 italic opacity-70">Sin resolución cargada aún.</p>
                              )}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};