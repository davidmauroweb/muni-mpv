import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fakeAtencionService } from '../services/fakeAtencionService';
import { fakeUserService } from '../services/fakeUserService';
import { StorageService } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { User, Solicitante, UserRole } from '../types';
import { Search, Plus, User as UserIcon, Printer, X, Save, AlertCircle } from 'lucide-react';
import { printVoucher } from '../utils/printer';

export const NewAttention: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [personalList, setPersonalList] = useState<User[]>([]);
  
  // Form State
  const [selectedSolicitante, setSelectedSolicitante] = useState<Solicitante | null>(null);
  const [tipoTramite, setTipoTramite] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedPersonalId, setSelectedPersonalId] = useState('');
  const [error, setError] = useState('');
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Solicitante[]>([]);
  const [showCreateSolicitante, setShowCreateSolicitante] = useState(false);

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        const data = await fakeUserService.getPersonalActivo();
        setPersonalList(data);
      } catch (error) {
        console.error("Error cargando personal:", error);
        setPersonalList([]); 
      }
    };
  
    fetchPersonal();
    if (user?.rol === UserRole.PERSONAL) {
        setSelectedPersonalId(user.id);
    }
  }, [user]);

  useEffect(() => {
    const fetchAndFilter = async () => {
      if (searchTerm.length >= 2) {
        const all = await StorageService.getSolicitantes();
        if (Array.isArray(all)) {
          const filtered = all.filter(s => 
            s.nombre_apellido.toLowerCase().includes(searchTerm.toLowerCase()) || 
            s.dni.includes(searchTerm)
          );
          setSearchResults(filtered);
        }
      } else {
        setSearchResults([]);
      }
    };
  
    fetchAndFilter();
  }, [searchTerm]);

  const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSolicitante || !user) return;

    const personal = personalList.find(p => p.id === selectedPersonalId);
    setLoading(true); 

        const res = await fakeAtencionService.create({
            solicitante_id: selectedSolicitante.id,
            tipo_tramite: tipoTramite,
            descripcion: descripcion,
            asignada_a: selectedPersonalId || null,
            asignada_a_nombre: personal ? `${personal.nombre} ${personal.apellido}` : null,
        });

        if (res.success) {
            if (res.data) {
                printVoucher(res.data);
            }
            alert('Atención registrada con éxito');
            navigate('/atenciones');
        } else {
            setError(res.error || 'Error desconocido');
        }
};

  return (
    <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-2">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Nueva Atención</h1>
        <p className="text-slate-500 font-medium text-sm">Registre una nueva atención en mesa de entradas</p>
      </div>

      {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 font-bold flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4"/> {error}
          </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Solicitante Section */}
        <div className="bg-white p-5 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex justify-between items-center mb-4">
             <div>
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Solicitante</h2>
                <p className="text-slate-500 text-xs font-medium">Identifique al ciudadano</p>
             </div>
             {!selectedSolicitante && (
                 <button type="button" onClick={() => setShowCreateSolicitante(true)} className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg font-bold uppercase tracking-wider text-[10px]">
                    <Plus className="w-3 h-3" /> Nuevo
                </button>
             )}
          </div>

          {!selectedSolicitante ? (
            <div className="relative">
                <div className="relative">
                  <input type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl font-medium text-sm" placeholder="Buscar por Nombre o DNI..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  <Search className="w-5 h-5 text-slate-400 absolute left-3 top-3" />
                </div>
                {searchResults.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-white border rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
                    {searchResults.map(s => (
                      <button key={s.id} type="button" onClick={() => { setSelectedSolicitante(s); setSearchTerm(''); }} className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b last:border-0 transition-colors">
                        <p className="font-bold text-slate-900 text-sm">{s.nombre_apellido}</p>
                        <p className="text-[10px] text-slate-500">DNI: {s.dni} • {s.domicilio}</p>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700"><UserIcon className="w-5 h-5" /></div>
                <div>
                  <p className="font-black text-blue-900 text-base">{selectedSolicitante.nombre_apellido}</p>
                  <p className="text-xs font-medium text-blue-700">DNI: {selectedSolicitante.dni}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedSolicitante(null)} className="px-3 py-1.5 bg-white text-slate-600 rounded-lg font-bold text-[10px] uppercase tracking-wider border hover:bg-slate-50">Cambiar</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Trámite Section */}
            <div className="md:col-span-2 bg-white p-5 rounded-2xl shadow-lg border border-slate-200 flex flex-col space-y-3">
                <div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Trámite</h2>
                    <p className="text-slate-500 text-xs font-medium">Categoría y descripción</p>
                </div>
                <input required className="w-full p-3 bg-slate-50 border rounded-xl font-medium text-sm" placeholder="Tipo de trámite (Ej: Ayuda Habitacional)" value={tipoTramite} onChange={e => setTipoTramite(e.target.value)} />
                <textarea required className="w-full flex-1 p-3 bg-slate-50 border rounded-xl font-medium resize-none min-h-[80px] text-sm" placeholder="Descripción de la solicitud..." value={descripcion} onChange={e => setDescripcion(e.target.value)} />
            </div>

            {/* Asignación Section */}
            <div className="md:col-span-1 bg-white p-5 rounded-2xl shadow-lg border border-slate-200 flex flex-col justify-between">
                <div>
                    <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-1">Asignación</h2>
                    <p className="text-slate-500 text-xs font-medium mb-4">Derivar caso</p>
                    <select 
                        disabled={user?.rol === UserRole.PERSONAL}
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium appearance-none disabled:opacity-70 text-sm"
                        value={selectedPersonalId}
                        onChange={e => setSelectedPersonalId(e.target.value)}
                    >
                        <option value="">Sin asignar (Pendiente)</option>
                        {personalList.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido} - {p.area}</option>)}
                    </select>
                    {user?.rol === UserRole.PERSONAL && <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-2 ml-1">Auto-asignado por rol</p>}
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                   <button type="submit" disabled={!selectedSolicitante || !tipoTramite} className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-blue-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100">
                     <Printer className="w-4 h-4" /> GUARDAR E IMPRIMIR
                   </button>
                </div>
            </div>
        </div>
      </form>
    </div>
  );
};