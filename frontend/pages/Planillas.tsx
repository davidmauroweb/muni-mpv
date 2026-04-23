import React, { useEffect, useMemo, useState } from 'react';
import { listado } from '../services/fakeAtencionService';
import { CAPS_MAP, Edades, Servicios } from '../types';
import * as XLSX from 'xlsx';
import { Download } from 'lucide-react';

type CuboAtencion = {
  sx: number;
  edad: string;
  cantidad: number;
};

type CuboServicio = {
  servicio: string;
  atenciones: CuboAtencion[];
  total_hombres: number;
  total_mujeres: number;
};

export const Planillas: React.FC = () => {
  const now = new Date();
  const capsOptions = useMemo(
    () => Object.values(CAPS_MAP).sort((a, b) => a.nombre.localeCompare(b.nombre)),
    []
  );
  const defaultCaps = capsOptions[0] ? String(capsOptions[0].codigo) : '';

  const [formM, setFormM] = useState(now.getMonth() + 1);
  const [formY, setFormY] = useState(now.getFullYear());
  const [formC, setFormC] = useState(defaultCaps);

  const [m, setM] = useState(now.getMonth() + 1);
  const [y, setY] = useState(now.getFullYear());
  const [c, setC] = useState(defaultCaps);
  const [data, setData] = useState<CuboServicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedServicios, setSelectedServicios] = useState<string[]>([]);


  const fetchCubo = async () => {
    setLoading(true);
    setError('');
    try {
      const capsParam = c ? parseInt(c, 10) : null;
      const res = await listado.cubo(m, y, capsParam);
      console.log(res)
      setData(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setData([]);
      setError('No se pudo obtener la planilla.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCubo();
  }, [m, y, c]);

  useEffect(() => {
    setSelectedServicios([]);
  }, [data]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setM(formM);
    setY(formY);
    setC(formC);
  };

  const getCantidad = (servicio: number, edad: string, sx: boolean) => {
    const item = data.find((d) => d.servicio === servicio);
    if (!item) return 0;
    const atencion = item.atenciones.find((a) => a.edad === edad && a.sx === sx);
    return atencion ? atencion.cantidad : 0;
  };

  const formatServicio = (servicio: string) => {
    const code = String(servicio).padStart(3, '0');
    const nombre = Servicios[code as keyof typeof Servicios];
    return nombre ? `${code} - ${nombre}` : code;
  };

const exportToExcel = () => {
  if (data.length === 0) return;
  const selectedData = data.filter((d) => selectedServicios.includes(String(d.servicio)));
  if (selectedData.length === 0) return;
  const edadCount = Object.keys(Edades).length;  // = 9
  const totalColStart = 1 + edadCount * 2;    // = 1 + 18 = 19 (columna H del TOTAL)
  const totalColEnd = totalColStart + 1;        // = 20 (columna M del TOTAL)
  // 1. Nombre del archivo con mes, año y CAPS
  const capsNombre = formC
    ? capsOptions.find((c) => c.codigo === formC)?.nombre.replace(/\s+/g, '_')
    : 'Todos';
  const fileName = `planilla_${m}_${y}_${capsNombre}.xlsx`;
  // 2. Fila 1: Labels de edad (colspan H + M)
  const rowEdadLabel = [
    'Servicio',
    ...Object.values(Edades).flatMap((edad) => [edad, '']), 'Total', '', 'Obra Social',''
  ];
  // 3. Fila 2: H / M
  const rowHM = [
    '',
    ...Object.values(Edades).flatMap(() => ['H', 'M']),
    'H','M','Si','No'
  ];
  // 4. Filas de datos
  const rows = selectedData.map((d) => [
    formatServicio(d.servicio),
    ...Object.values(Edades).flatMap((edad) => [
      getCantidad(d.servicio, edad, true),
      getCantidad(d.servicio, edad, false)
    ]),
    d.total_hombres,
    d.total_mujeres,
    d.total_obrasocial,
    d.total_sin_obrasocial
  ]);
  // 5. Fila de totales
  const totalesRow = [
    'TOTAL',
    ...Object.values(Edades).flatMap((edad) => {
      const totalH = selectedData.reduce((sum, d) => sum + getCantidad(d.servicio, edad, true), 0);
      const totalM = selectedData.reduce((sum, d) => sum + getCantidad(d.servicio, edad, false), 0);
      return [totalH, totalM];
    }),
    selectedData.reduce((sum, d) => sum + d.total_hombres, 0),
    selectedData.reduce((sum, d) => sum + d.total_mujeres, 0),
    selectedData.reduce((sum, d) => sum + d.total_obrasocial, 0),
    selectedData.reduce((sum, d) => sum + d.total_sin_obrasocial, 0)
  ];
  // 6. Crear sheet
  const ws = XLSX.utils.aoa_to_sheet([rowEdadLabel, rowHM, ...rows, totalesRow]);
  // 7. Aplicar merges en fila 1 (cada label abarca H + M)
const mergeTOTAL = { 
  s: { r: 0, c: totalColStart },   // Inicio: fila 0, columna 19
  e: { r: 0, c: totalColEnd }    // Fin: fila 0, columna 20
};
const mergeObraSocial = { 
  s: { r: 0, c: totalColEnd + 1},  // Inicio en columna 20 donde está "Obra Social"
  e: { r: 0, c: totalColEnd + 2 }  // Fin en columna 22
};

ws['!merges'] = [
  ...Object.keys(Edades).map((_, idx) => ({
    s: { r: 0, c: 1 + idx * 2 },
    e: { r: 0, c: 1 + idx * 2 + 1 }
  })),
  mergeTOTAL,
  mergeObraSocial
];
  // 8. Aplicar estilos: negrita + centrado en labels de edad (fila 1)
  Object.keys(Edades).forEach((_, idx) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: 1 + idx * 2 });
    const cell = ws[cellRef] || { v: Object.values(Edades)[idx] };
    cell.s = { font: { bold: true }, alignment: { horizontal: 'center', vertical: 'center' } };
    ws[cellRef] = cell;
  });
  // 9. Crear y descargar workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Mes ${m}-${y}`);
  XLSX.writeFile(wb, fileName);
};

  const totalColumns = 2 + Object.keys(Edades).length * 2 + 4;
  const allSelected = data.length > 0 && selectedServicios.length === data.length;

  const toggleServicio = (servicio: string) => {
    setSelectedServicios((prev) =>
      prev.includes(servicio) ? prev.filter((s) => s !== servicio) : [...prev, servicio]
    );
  };

  const toggleAllServicios = (checked: boolean) => {
    setSelectedServicios(checked ? data.map((d) => String(d.servicio)) : []);
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Planillas</h1>
          <p className="text-slate-500 font-medium text-sm">Atenciones agrupadas por servicio, edad y sexo</p>
        </div>
        <form className="flex flex-wrap items-center gap-2" onSubmit={handleApplyFilters}>
          <select className="px-3 py-2 bg-white border rounded-xl text-sm" value={formM} onChange={(e) => setFormM(parseInt(e.target.value, 10))}>
            {Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => (
              <option key={month} value={month}>
                Mes {month}
              </option>
            ))}
          </select>
          <input
            className="px-3 py-2 bg-white border rounded-xl text-sm w-28"
            type="number"
            value={formY}
            onChange={(e) => setFormY(parseInt(e.target.value, 10))}
          />
          <select className="px-3 py-2 bg-white border rounded-xl text-sm min-w-44" value={formC} onChange={(e) => setFormC(e.target.value)}>
            <option value="">Todos los CAPS</option>
            {capsOptions.map((caps) => (
              <option key={caps.codigo} value={caps.codigo}>
                {caps.nombre}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-3 py-2 bg-slate-700 text-white rounded-xl font-bold uppercase tracking-wider text-[10px]"
          >
            Ver planilla
          </button>
          <button
            type="button"
            onClick={exportToExcel}
            disabled={data.length === 0 || selectedServicios.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-blue-900 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
        </form>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 font-bold text-sm">{error}</div>}

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]"></th>
              <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]"></th>
              {Object.values(Edades).map((key) => (
                <React.Fragment key={key}>
                  <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]" colSpan="2">{key}</th>
                </React.Fragment>
              ))}
              <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]" colSpan="2">Total</th>
              <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]" colSpan="2">O.Social.</th>
            </tr>
            <tr>
              <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAllServicios(e.target.checked)}
                  aria-label="Seleccionar todos los servicios"
                />
              </th>
              <th className="text-left p-1 font-black uppercase tracking-wide text-[11px]">Servicio</th>
              {Object.keys(Edades).map((key) => (
                <React.Fragment key={key}>
                  <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]"> H</th>
                  <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]"> M</th>
                </React.Fragment>
              ))}
              <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]"> H</th>
              <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]"> M</th>
              <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]"> Si</th>
              <th className="text-center p-1 font-black uppercase tracking-wide text-[11px]"> No</th>
            </tr>
          </thead>
          
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-slate-500 font-medium" colSpan={totalColumns}>
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td className="p-4 text-slate-500 font-medium" colSpan={totalColumns}>
                  Sin datos para el filtro seleccionado.
                </td>
              </tr>
            ) : (
              data.map((d) => (
                <tr key={d.servicio} className="border-t border-slate-100">
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedServicios.includes(String(d.servicio))}
                      onChange={() => toggleServicio(String(d.servicio))}
                      aria-label={`Seleccionar servicio ${formatServicio(d.servicio)}`}
                    />
                  </td>
                  <td className="p-3 font-bold text-slate-800">{formatServicio(d.servicio)}</td>
                  {Object.values(Edades).map((edad) => (
                    <React.Fragment key={`${d.servicio}-${edad}`}>
                      <td className="p-3 text-center">{getCantidad(d.servicio, edad, false)}</td>
                      <td className="p-3 text-center">{getCantidad(d.servicio, edad, true)}</td>
                    </React.Fragment>
                  ))}
                  <td className="p-3 text-center font-bold">{d.total_hombres}</td>
                  <td className="p-3 text-center font-bold">{d.total_mujeres}</td>
                  <td className="p-3 text-center font-bold">{d.total_obrasocial}</td>
                  <td className="p-3 text-center font-bold">{d.total_sin_obrasocial}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};