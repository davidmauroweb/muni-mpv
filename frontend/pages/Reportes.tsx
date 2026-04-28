import React, { useEffect, useState, useMemo } from 'react';
import { fakeAtencionService } from '../services/fakeAtencionService';
import {CAPS_MAP, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { ObraSocial } from '../obrasocial';
import * as XLSX from 'xlsx';
import { Trash2, Download } from 'lucide-react';
export const Reportes: React.FC = () => {
  const PAGE_SIZE = 20;
  const [formData, setFormData] = useState({
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroCaps, setFiltroCaps] = useState<string>('all');
  const { user } = useAuth();

  const [filtroDni, setFiltroDni] = useState<string>('');
  const [filtroOs, setFiltroOs] = useState<string>('all');
  const [filtroPersonal, setFiltroPersonal] = useState<string>('all');
  const [filtroNombre, setFiltroNombre] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

const filteredResults = resultados.filter(row => {
  if (filtroCaps !== 'all' && row.caps !== parseInt(filtroCaps)) return false;
  if (filtroDni && !String(row.solicitante_dni).includes(filtroDni)) return false;
  if (filtroOs !== 'all' && row.os !== parseInt(filtroOs)) return false;
  if (filtroPersonal !== 'all' && row.personal_nombre !== filtroPersonal) return false;
  if (filtroNombre && !String(row.solicitante_nombre || '').toLowerCase().includes(filtroNombre.toLowerCase())) return false;
  return true;
});

const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
const paginatedResults = filteredResults.slice(
  (currentPage - 1) * PAGE_SIZE,
  currentPage * PAGE_SIZE
);

useEffect(() => {
  setCurrentPage(1);
}, [resultados, filtroCaps, filtroDni, filtroOs, filtroPersonal, filtroNombre]);

  useEffect(() => {
    const fechaDesde = new Date();
    fechaDesde.setDate(fechaDesde.getDate() - 30);
    
    const fechaHasta = new Date();
    
    const desdeStr = fechaDesde.toISOString().split('T')[0];
    const hastaStr = fechaHasta.toISOString().split('T')[0];
    
    setFormData({ fecha_desde: desdeStr, fecha_hasta: hastaStr });
    handleGenerarReporte(desdeStr, hastaStr);
  }, []);
  const handleGenerarReporte = async (desde?: string, hasta?: string) => {
    const fd = desde || formData.fecha_desde;
    const fh = hasta || formData.fecha_hasta;
    
    if (!fd || !fh) return;
    
    setLoading(true);
    try {
      const data = await fakeAtencionService.reporteos({
        desde: fd,
        hasta: fh
      });
      console.log(data.data);
      setResultados(data.data);
    } catch (error) {
      console.error('Error al generar reporte:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleGenerarReporte();
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const opcionesDni = useMemo(() => {
  const dnis = resultados.map(row => row.solicitante_dni).filter(dni => dni != null);
  return [...new Set(dnis)].sort();
}, [resultados]);
const opcionesOs = useMemo(() => {
  const oss = resultados.map(row => row.os);
  const unique = [...new Set(oss.filter(os => os != null && os !== ''))];
  const hasEmpty = oss.some(os => os == null || os === '');
  if (hasEmpty) {
    unique.push('9999');
  }
  return unique.sort();
}, [resultados]);
const opcionesPersonal = useMemo(() => {
  const personales = resultados.map(row => row.personal_nombre).filter(p => p != null && p !== '');
  return [...new Set(personales)].sort();
}, [resultados]);
const opcionesCaps = useMemo(() => {
  const caps = resultados.map(row => row.caps).filter(p => p != null && p !== '');
  return [...new Set(caps)].sort();
}, [resultados]);

const exportToExcel = () => {
  const data = filteredResults.filter(row => filtroCaps === 'all' || row.caps === parseInt(filtroCaps)).map(a => ({
    'Fecha': new Date(a.created_at).toLocaleDateString(),
    'N°': a.id,
    'Obra Social': ObraSocial[a.os||'9999'], 
    'Solicitante': a.solicitante_nombre,
    'DNI': a.solicitante_dni,
    'Sexo': a.sx ? 'Mujer' : 'Hombre',
    'Edad': a.edad,
    'Motivo': a.motivo,
    'Establecimiento': CAPS_MAP[a.caps]?.nombre || '',
    'Asignado': a.personal_nombre || 'Sin asignar',
    'Estado': a.estado,
    'Fecha Atención': a.updated_at ? new Date(a.updated_at).toLocaleDateString() : '',
    'Resolución': a.resolucion || '',
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Atenciones');
  XLSX.writeFile(wb, `atenciones_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const handleDelete = async (id: number) => {
  if (!confirm('¿Eliminar el registro?')) return;
  try {
    await fakeAtencionService.delete(id);
    handleGenerarReporte();
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
};

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Reportes de Atenciones</h1>
        <div className="flex-1">
        </div>
         </div>
      {/* Filtros por fecha */}
      <div className="bg-white p-6 rounded-[1rem] shadow-xl border border-slate-200">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-2 items-end w-full">
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Desde</label>
            <input
              type="date"
              name="fecha_desde"
              value={formData.fecha_desde}
              onChange={handleChange}
              className="w-full h-9 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              required
            />
          </div>
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Hasta</label>
            <input
              type="date"
              name="fecha_hasta"
              value={formData.fecha_hasta}
              onChange={handleChange}
              className="w-full h-9 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              required
            />
          </div>
          <div className="w-full">
          <button
            type="submit"
            className="w-auto min-w-[110px] h-9 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg font-bold uppercase tracking-wider text-[11px] transition-transform hover:scale-105"
          >
            Buscar
          </button>
          </div>
          <div className="w-full">
            <button onClick={exportToExcel} className="w-auto min-w-[110px] h-9 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg font-bold uppercase tracking-wider text-[11px] transition-transform hover:scale-105">Xls</button>
          </div>
        </form>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mt-4 w-full">
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Centro</label>
          <select
          name="filtroCaps"
          value={filtroCaps}
          onChange={(e) => setFiltroCaps(e.target.value)}
          className="w-full h-9 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
        >
          <option value="all">Todos</option>
          {Object.values(opcionesCaps).sort().map((caps) => (
            <option key={caps} value={caps}>
              {CAPS_MAP[Number(caps)]?.nombre}
            </option>
          ))}
        </select>
        </div>
        <div className="w-full">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">DNI</label>
        <input
          type="text"
          placeholder="Filtrar por DNI..."
          value={filtroDni}
          onChange={(e) => setFiltroDni(e.target.value)}
          className="w-full h-9 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
        />
        </div>
        <div className="w-full">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre</label>
        <input
          type="text"
          placeholder="Filtrar por DNI..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="w-full h-9 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
        />
        </div>
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Personal</label>
        <select
          name="filtroPersonal"
          value={filtroPersonal}
          onChange={(e) => setFiltroPersonal(e.target.value)}
          className="w-full h-9 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
        >
          <option value="all">Todos</option>
          {opcionesPersonal.sort().map((personal) => (
            <option key={personal} value={personal}>
              {personal}
            </option>
          ))}
        </select>
        </div>
          <div className="w-full">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Obra Social</label>
        <select
          name="filtroOs"
          value={filtroOs}
          onChange={(e) => setFiltroOs(e.target.value)}
          className="w-full h-9 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
        >
          <option value="all">Todos</option>
          {Object.values(opcionesOs).sort().map((os) => (
            <option key={os} value={os}>
              {ObraSocial[Number(os)]}
            </option>
          ))}
        </select>
        </div>
     </div>


      </div>
      {/* Resultados */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Cargando...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th></th>
                    <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">Fecha</th>
                    <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">O.S.</th>
                    <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">DNI</th>
                    <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">Solicitante</th>
                    <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">Sexo</th>
                    <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">Motivo</th>
                    <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">Personal</th>
                    <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-widest">CAPS</th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-slate-100">
                
                  {paginatedResults.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td>
                        {user?.rol === UserRole.ADMIN && (
                          <button onClick={() => handleDelete(row.id)}>
                            <Trash2 className=" w-5 h-5 text-red-600 hover:text-red-800" />
                          </button>
                        )}
                    </td>
                      <td className="p-1 text-slate-700 font-medium text-sm">{row.fecha}</td>
                      <td className="p-1 text-slate-700 font-medium text-sm">{ObraSocial[row.os||'9999']}</td>
                      <td className="p-1 text-slate-700 font-medium text-sm">{row.solicitante_dni}</td>
                      <td className="p-1 text-slate-700 font-medium text-sm">{row.solicitante_nombre}</td>
                      <td className="p-1 text-slate-700 font-medium text-sm">{row.sx === true ? 'Mujer' : row.sx === false ? 'Hombre' : '-'}</td>
                      <td className="p-1 text-slate-700 font-medium text-sm">{row.motivo}</td>
                      <td className="p-1 text-slate-700 font-medium text-sm">{row.personal_nombre}</td>
                      <td className="p-1 text-slate-700 font-medium text-sm">  {typeof row.caps === 'number' 
                                                                                ? CAPS_MAP[row.caps]?.nombre || row.caps
                                                                                : row.caps?.nombre || row.caps || '-'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Mostrando {Math.min((currentPage - 1) * PAGE_SIZE + 1, filteredResults.length)} - {Math.min(currentPage * PAGE_SIZE, filteredResults.length)} de {filteredResults.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-xs font-semibold text-slate-600">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No se encontraron resultados.</p>
          </div>
        )}
      </div>
    </div>
  );
};