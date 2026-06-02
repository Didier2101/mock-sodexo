import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Footprints, MousePointerClick, TrendingUp, Activity } from 'lucide-react';
import type { DatoTendencia } from './tipos';

interface PropsGraficaComportamientoGeneral {
  datos: DatoTendencia[];
  nombreCiudad: string;
}

export default function GraficaComportamientoGeneral({ datos, nombreCiudad }: PropsGraficaComportamientoGeneral) {
  const totalVisitas     = datos.reduce((s, d) => s + d.visitas, 0);
  const totalPulsaciones = datos.reduce((s, d) => s + d.pulsaciones, 0);

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <TrendingUp size={14} className="text-slate-600" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Comportamiento General</h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              Tendencia de visitas y pulsaciones — últimos 30 días · {nombreCiudad}
            </p>
          </div>
        </div>
        {/* Leyenda de líneas con iconos */}
        <div className="flex gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Footprints size={10} className="text-[#0EA5E9]" />
            <span className="text-[9px] font-bold text-slate-500 uppercase">Visitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MousePointerClick size={10} className="text-[#830AD1]" />
            <span className="text-[9px] font-bold text-slate-500 uppercase">Pulsaciones</span>
          </div>
        </div>
      </div>

      {/* Gráfica de área */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradVisitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0EA5E9" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="gradPulsaciones" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#830AD1" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#830AD1" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" stroke="#94a3b8" fontSize={8} tickLine={false} interval={4} />
            <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} width={32} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any, name: any) => [value, name === 'visitas' ? 'Visitas' : 'Pulsaciones']}
            />
            <Area
              type="monotone"
              dataKey="visitas"
              name="visitas"
              stroke="#0EA5E9"
              strokeWidth={2.5}
              fill="url(#gradVisitas)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="pulsaciones"
              name="pulsaciones"
              stroke="#830AD1"
              strokeWidth={2}
              strokeDasharray="5 3"
              fill="url(#gradPulsaciones)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Métricas resumen 30 días con iconos */}
      <div className="grid grid-cols-2 gap-3 border-t border-slate-50 pt-3">
        <div className="bg-sky-50 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-sky-100 rounded-lg shrink-0">
            <Footprints size={16} className="text-[#0EA5E9]" />
          </div>
          <div>
            <p className="text-[20px] font-black leading-none text-[#0EA5E9]">
              {totalVisitas.toLocaleString()}
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Total Visitas (30 días)</p>
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg shrink-0">
            <Activity size={16} className="text-[#830AD1]" />
          </div>
          <div>
            <p className="text-[20px] font-black leading-none text-[#830AD1]">
              {totalPulsaciones.toLocaleString()}
            </p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Total Pulsaciones (30 días)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
