import React, { useEffect, useState } from 'react';
import { Download, Printer, ArrowRight, AlertTriangle, Clock, TrendingUp, Users as UsersIcon, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Atencion, EstadoAtencion, Stats } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { printVoucher } from '../utils/printer';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, 
  AreaChart, Area, PieChart, Pie, Legend 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [stats, setStats] = useState<Stats>({ hoy: 0, registradas: 0, enAtencion: 0, atendidas: 0, tmr_minutos: 0 });
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [areaData, setAreaData] = useState<any[]>([]);
  const [criticalCases, setCriticalCases] = useState<Atencion[]>([]);

  const [data, setData] = useState([]);
  
  useEffect(() => {
    const fetch = async () => {
      const atenciones = await StorageService.getAtenciones();
      setData(atenciones);
    };
    //const data = StorageService.getAtenciones();
    const today = new Date().toDateString();
    const todays = data.filter(a => new Date(a.created_date).toDateString() === today);
    
    // Calculate TMR (Tiempo Medio de Resolución) for finished cases
    const finishedCases = data.filter(a => a.estado === EstadoAtencion.ATENDIDO && a.fecha_inicio_atencion && a.fecha_atencion_dispensada);
    const totalMinutes = finishedCases.reduce((acc, curr) => {
      const start = new Date(curr.fecha_inicio_atencion!).getTime();
      const end = new Date(curr.fecha_atencion_dispensada!).getTime();
      return acc + (end - start) / (1000 * 60);
    }, 0);
    const tmr = finishedCases.length > 0 ? Math.round(totalMinutes / finishedCases.length) : 0;

    setStats({
      hoy: todays.length,
      registradas: todays.filter(a => a.estado === EstadoAtencion.REGISTRADO).length,
      enAtencion: todays.filter(a => a.estado === EstadoAtencion.EN_ATENCION).length,
      atendidas: todays.filter(a => a.estado === EstadoAtencion.ATENDIDO).length,
      tmr_minutos: tmr
    });

    // Hourly distribution for today
    const hours = Array.from({ length: 10 }, (_, i) => ({ hour: `${i + 8}:00`, count: 0 }));
    todays.forEach(a => {
      const h = new Date(a.created_date).getHours();
      if (h >= 8 && h <= 17) hours[h - 8].count++;
    });
    setHourlyData(hours);

    // Area Distribution (all time)
    const areas: Record<string, number> = {};
    data.forEach(a => {
      // Since area is not directly in Atencion, we'll use a mock mapping or fallback
      // In a real app we'd join with Personal. Here we use personal_cargo or similar context if available
      // For demo, let's categorize by a prefix or just mock area based on staff assigned
      const area = a.personal_cargo.includes('Social') ? 'Social' : 
                   a.personal_cargo.includes('Gestión') ? 'Gestión' : 'Administración';
      areas[area] = (areas[area] || 0) + 1;
    });
    setAreaData(Object.entries(areas).map(([name, value]) => ({ name, value })));

    // Critical Cases tracking
    const now = new Date().getTime();
    const critical = data.filter(a => {
      if (a.estado === EstadoAtencion.ATENDIDO) return false;
      const created = new Date(a.created_date).getTime();
      const diffHours = (now - created) / (1000 * 60 * 60);
      return (a.estado === EstadoAtencion.REGISTRADO && diffHours > 24) || 
             (a.estado === EstadoAtencion.EN_ATENCION && diffHours > 4);
    });
    setCriticalCases(critical.slice(0, 3));

    // Latest 5 for display
    setAtenciones([...data].sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()).slice(0, 5));
  }, []);

  const handleStatusChange = (id: string) => {
    StorageService.updateAtencion(id, { 
      estado: EstadoAtencion.EN_ATENCION,
      fecha_inicio_atencion: new Date().toISOString()
    });
    window.location.reload(); // Quick refresh
  };

  const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Centro de Control</h1>
          <p className="text-slate-500 font-medium">Analíticas de atención en tiempo real</p>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Atenciones Hoy', value: stats.hoy, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
          { label: 'En Espera', value: stats.registradas, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', trend: '-5%' },
          { label: 'En Atención', value: stats.enAtencion, icon: UsersIcon, color: 'text-indigo-500', bg: 'bg-indigo-50', trend: 'Estable' },
          { label: 'Tiempo Medio (TMR)', value: `${stats.tmr_minutos}'`, icon: Clock, color: 'text-green-600', bg: 'bg-green-50', trend: '-2 min' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity`}>
              <item.icon className={`w-24 h-24 ${item.color}`} />
            </div>
            <div className="relative z-10">
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-4`}>
                <item.icon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
              <div className="flex items-end gap-3 mt-1">
                <p className={`text-4xl font-black ${item.color}`}>{item.value}</p>
                <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-1 rounded-lg mb-1">{item.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Operational Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Distribución de Carga Horaria</h2>
              <p className="text-sm font-medium text-slate-400">Ingreso de solicitantes por franja (Hoy)</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Distribution */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 flex flex-col">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-6">Demanda por Área</h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={areaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {areaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Critical Alerts Panel */}
        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 text-white overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-500 animate-pulse" />
                <h2 className="text-xl font-black uppercase tracking-tight">Alertas de Gestión (SLA)</h2>
            </div>
            <div className="space-y-4">
                {criticalCases.length > 0 ? criticalCases.map(c => (
                    <div key={c.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex justify-between items-center group hover:bg-slate-800 transition-all">
                        <div>
                            <p className="font-black text-rose-400 font-mono">{c.numero_atencion}</p>
                            <p className="font-bold text-sm">{c.solicitante_nombre}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                {c.estado === EstadoAtencion.REGISTRADO ? 'Exceso de tiempo en espera' : 'Atención prolongada en box'}
                            </p>
                        </div>
                        <Link to="/atenciones" className="p-2 bg-slate-700 rounded-xl group-hover:bg-blue-600 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )) : (
                    <div className="text-center py-8 opacity-50">
                        <Building2 className="w-12 h-12 mx-auto mb-2" />
                        <p className="font-bold uppercase tracking-widest text-xs">Sin alertas críticas detectadas</p>
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Quick Actions / Recent */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Actividad Reciente</h2>
            <Link to="/atenciones" className="text-xs font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-1">
              Historial Completo <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {atenciones.map((atencion) => (
              <div key={atencion.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                        <StatusBadge status={atencion.estado} />
                    </div>
                    <div>
                        <p className="font-black text-slate-800 text-sm">{atencion.solicitante_nombre}</p>
                        <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">{atencion.motivo}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => printVoucher(atencion)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Printer className="w-4 h-4" /></button>
                    {atencion.estado === EstadoAtencion.REGISTRADO && (
                       <button onClick={() => handleStatusChange(atencion.id)} className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-blue-200 transition-colors">Iniciar</button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};