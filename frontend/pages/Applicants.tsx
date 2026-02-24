import React, { useEffect, useState } from 'react';
import { StorageService } from '../services/storage';
import { Solicitante, Atencion } from '../types';
import { Search, UserPlus, History, X, Save, Edit3, Trash2, Eye, FileText, User, Calendar, CheckSquare } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const Applicants: React.FC = () => {
  const [solicitantes, setSolicitantes] = useState<Solicitante[]>([]);
  const [filter, setFilter] = useState('');
  
  // Create/Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre_apellido: '', dni: '', domicilio: '', telefono: ''
  });

  // History Modal State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<Atencion[]>([]);
  const [selectedSolicitanteName, setSelectedSolicitanteName] = useState('');

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedAtencion, setSelectedAtencion] = useState<Atencion | null>(null);

  useEffect(() => {
    loadSolicitantes();
  }, []);

  const loadSolicitantes = async () => {
    const solicitanteData = await StorageService.getSolicitantes();
    setSolicitantes(solicitanteData);
  };

  const filtered = solicitantes.filter(s => {
    const lower = filter.toLowerCase();
    return s.nombre_apellido.toLowerCase().includes(lower) || 
           s.dni.includes(lower) ||
           s.domicilio.toLowerCase().includes(lower) ||
           (s.telefono && s.telefono.includes(lower));
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ nombre_apellido: '', dni: '', domicilio: '', telefono: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: Solicitante) => {
    setEditingId(s.id);
    setFormData({
      nombre_apellido: s.nombre_apellido,
      dni: s.dni,
      domicilio: s.domicilio,
      telefono: s.telefono || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este solicitante? Esta acción no se puede deshacer.')) {
        try {
            const response = await StorageService.delete(id);

            if (response.success) {
                alert(response.message);
                await loadSolicitantes();
            } else {
                alert(`Error: ${response.message}`);
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("No se pudo eliminar el solicitante debido a un error de red o del servidor.");
        }
    }
};

  const viewHistory = (id: string, name: string) => {
    const all = StorageService.getAtenciones();
    const history = all.filter(a => a.solicitante_id === id);
    history.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    setSelectedHistory(history);
    setSelectedSolicitanteName(name);
    setHistoryOpen(true);
  };

  const openDetailModal = (atencion: Atencion) => {
    setSelectedAtencion(atencion);
    setDetailModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre_apellido || !formData.dni || !formData.domicilio) return;
    try {
    const solicitante: Solicitante = {
        ...formData,
        id: editingId,
        created_at: editingId 
            ? solicitantes.find(s => s.id === editingId)?.created_at || new Date().toISOString()
            : new Date().toISOString()
    };

    const savedSolicitante = await StorageService.save(solicitante);

    loadSolicitantes();

    setIsModalOpen(false);
    } catch (error: any) {
        alert(error);
        console.error(error);
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Padrón de Solicitantes</h1>
        <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg font-bold uppercase tracking-wider text-xs transition-transform hover:scale-105"
        >
            <UserPlus className="w-4 h-4" /> Nuevo Solicitante
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-200">
        <div className="relative max-w-md">
            <Search className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
            <input 
                type="text"
                placeholder="BUSCAR POR NOMBRE, DNI, DOMICILIO O TEL..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                value={filter}
                onChange={e => setFilter(e.target.value)}
            />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="p-6 font-bold text-xs text-slate-400 uppercase tracking-widest">Nombre y Apellido</th>
                    <th className="p-6 font-bold text-xs text-slate-400 uppercase tracking-widest">DNI</th>
                    <th className="p-6 font-bold text-xs text-slate-400 uppercase tracking-widest">Domicilio / Tel.</th>
                    <th className="p-6 font-bold text-xs text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filtered.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6">
                            <p className="font-bold text-slate-900">{s.nombre_apellido}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alta: {new Date(s.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="p-6 text-slate-600 font-mono text-sm">{s.dni}</td>
                        <td className="p-6">
                            <p className="text-slate-600 font-medium">{s.domicilio}</p>
                            {s.telefono && <p className="text-xs text-blue-500 font-bold">{s.telefono}</p>}
                        </td>
                        <td className="p-6">
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => viewHistory(s.id, s.nombre_apellido)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Ver Historial"
                                >
                                    <History className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleOpenEdit(s)}
                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                    title="Editar"
                                >
                                    <Edit3 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleDelete(s.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Eliminar"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {filtered.length === 0 && (
                    <tr>
                        <td colSpan={4} className="p-10 text-center text-slate-500 font-medium">No se encontraron solicitantes.</td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                        {editingId ? 'Editar Solicitante' : 'Nuevo Solicitante'}
                    </h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre Completo *</label>
                        <input 
                            required
                            type="text" 
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                            value={formData.nombre_apellido}
                            onChange={e => setFormData({...formData, nombre_apellido: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">DNI *</label>
                            <input 
                                required
                                type="text" 
                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                value={formData.dni}
                                onChange={e => setFormData({...formData, dni: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Teléfono</label>
                            <input 
                                type="text" 
                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                                value={formData.telefono}
                                onChange={e => setFormData({...formData, telefono: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Domicilio *</label>
                        <input 
                            required
                            type="text" 
                            className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                            value={formData.domicilio}
                            onChange={e => setFormData({...formData, domicilio: e.target.value})}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <button 
                            type="button"
                            onClick={() => setIsModalOpen(false)} 
                            className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-bold uppercase tracking-wider text-xs"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg font-bold uppercase tracking-wider text-xs"
                        >
                            <Save className="w-4 h-4" /> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* History Modal */}
      {historyOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Historial de Atenciones</h3>
                        <p className="text-sm text-slate-500 font-medium">{selectedSolicitanteName}</p>
                    </div>
                    <button onClick={() => setHistoryOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
                </div>
                
                <div className="overflow-y-auto flex-1 pr-2 space-y-4">
                    {selectedHistory.length > 0 ? (
                        <>
                            {selectedHistory.map(h => (
                                <div key={h.id} className="border border-slate-200 rounded-2xl p-5 hover:border-blue-200 transition-colors relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => openDetailModal(h)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Ver Detalle Completo"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex justify-between items-center mb-3 pr-10">
                                        <span className="font-black text-slate-700 font-mono text-lg">{h.numero_atencion}</span>
                                        <StatusBadge status={h.estado} />
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3 font-bold uppercase tracking-wider">{new Date(h.created_at).toLocaleDateString()}</p>
                                    <div className="mb-3">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Motivo</p>
                                        <p className="text-sm text-slate-800 font-medium">{h.motivo}</p>
                                    </div>
                                    {h.atencion_dispensada && (
                                        <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                            <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">Resolución</p>
                                            <p className="text-sm text-green-900 line-clamp-2">{h.atencion_dispensada}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                            <p className="text-slate-500 font-medium">No hay atenciones registradas para este solicitante.</p>
                        </div>
                    )}
                </div>
             </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedAtencion && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                      <div>
                          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Detalle de Atención</h3>
                          <p className="text-sm text-slate-400 font-mono font-bold">{selectedAtencion.numero_atencion}</p>
                      </div>
                      <button onClick={() => setDetailModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
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
                          <p className="font-bold text-slate-900">{selectedAtencion.tipo_tramite}</p>
                          <p className="text-sm text-slate-600 mt-1">{selectedAtencion.descripcion}</p>
                          <div className="mt-4 pt-4 border-t border-slate-200">
                              <div className="flex items-center gap-2 text-slate-400 mb-1">
                                  <Calendar className="w-3 h-3" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">Fecha</span>
                              </div>
                              <p className="text-sm font-medium text-slate-700">{new Date(selectedAtencion.created_at).toLocaleString()}</p>
                          </div>
                      </div>
                  </div>

                  <div className="mb-6">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-green-600" /> Resolución / Atención Dispensada
                      </h4>
                      
                      <div className="bg-green-50 p-5 rounded-2xl border border-green-100 min-h-[100px]">
                          {selectedAtencion.atencion_dispensada ? (
                              <p className="text-sm text-green-900 whitespace-pre-wrap font-medium">{selectedAtencion.atencion_dispensada}</p>
                          ) : (
                              <p className="text-sm text-green-700 italic opacity-70">Sin resolución cargada aún.</p>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};