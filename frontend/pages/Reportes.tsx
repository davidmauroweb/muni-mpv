import React, { useEffect, useState } from 'react';
import { fakeAtencionService } from '../services/fakeAtencionService';
import {CAPS_MAP, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { ObraSocial } from '../obrasocial';
import * as XLSX from 'xlsx';
import { Trash2, Download } from 'lucide-react';
export const Reportes: React.FC = () => {
  const [formData, setFormData] = useState({
    fecha_desde: '',
    fecha_hasta: ''
  });
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroCaps, setFiltroCaps] = useState<string>('all');
  const { user } = useAuth();

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
      //console.log(data.data);
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

const exportToExcel = () => {
  const data = resultados.filter(row => filtroCaps === 'all' || row.caps === parseInt(filtroCaps)).map(a => ({
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
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-1 items-end">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Desde</label>
            <input
              type="date"
              name="fecha_desde"
              value={formData.fecha_desde}
              onChange={handleChange}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Fecha Hasta</label>
            <input
              type="date"
              name="fecha_hasta"
              value={formData.fecha_hasta}
              onChange={handleChange}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg font-bold uppercase tracking-wider text-xs transition-transform hover:scale-105"
          >
            Buscar
          </button>
<select
          name="filtroCaps"
          value={filtroCaps}
          onChange={(e) => setFiltroCaps(e.target.value)}
          className="w-25 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-sm"
        >
          <option value="all">Todos</option>
          {Object.values(CAPS_MAP).sort((a, b) => a.nombre.localeCompare(b.nombre)).map((caps) => (
            <option key={caps.codigo} value={caps.codigo}>
              {caps.nombre}
            </option>
          ))}
        </select>
        <button onClick={exportToExcel} className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg font-bold uppercase tracking-wider text-xs transition-transform hover:scale-105">Xls</button>
     

        </form>
      </div>
      {/* Resultados */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Cargando...</p>
          </div>
        ) : resultados.length > 0 ? (
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
                
                  {resultados
                  .filter(row => filtroCaps === 'all' || row.caps === parseInt(filtroCaps))
                  .map((row, idx) => (
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