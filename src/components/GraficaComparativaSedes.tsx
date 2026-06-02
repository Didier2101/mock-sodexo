import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Scroll, SoapDispenserDroplet, Sparkles, Wind, BarChart3 } from 'lucide-react';
import type { DatoPorSede } from './tipos';

// Colores, etiquetas e iconos de cada tipo de botón
const TIPOS_BOTON = [
  { key: 'papel', label: 'Papel',  color: '#3B82F6', bg: 'bg-blue-50',    iconColor: 'text-blue-500',    Icon: Scroll               },
  { key: 'jabon', label: 'Jabón',  color: '#A855F7', bg: 'bg-purple-50',  iconColor: 'text-purple-500',  Icon: SoapDispenserDroplet  },
  { key: 'aseo',  label: 'Aseo',   color: '#F59E0B', bg: 'bg-amber-50',   iconColor: 'text-amber-500',   Icon: Sparkles             },
  { key: 'olor',  label: 'Olor',   color: '#10B981', bg: 'bg-emerald-50', iconColor: 'text-emerald-500', Icon: Wind                 },
] as const;

interface PropsGraficaComparativaSedes {
  datos: DatoPorSede[];
  etiquetaPeriodo: string;
}

export default function GraficaComparativaSedes({ datos, etiquetaPeriodo }: PropsGraficaComparativaSedes) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-100 rounded-lg">
            <BarChart3 size={14} className="text-slate-600" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Comparativa por Sede</h3>
            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
              Solicitudes por tipo de botón —&nbsp;{etiquetaPeriodo}
            </p>
          </div>
        </div>
        {/* Leyenda de colores con iconos */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end shrink-0">
          {TIPOS_BOTON.map(({ label, color, Icon }) => (
            <div key={label} className="flex items-center gap-1">
              <Icon size={9} style={{ color }} />
              <span className="text-[9px] font-bold text-slate-500 uppercase">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfica de barras apiladas */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            margin={{ top: 5, right: 8, left: 0, bottom: 65 }}
            barCategoryGap="28%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={9}
              tickLine={false}
              angle={-38}
              textAnchor="end"
              interval={0}
            />
            <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} width={28} />
            <Tooltip
              cursor={{ fill: '#f5f3ff' }}
              contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: any, name: any) => [value, name]}
            />
            <Bar dataKey="papel" name="Papel" fill="#3B82F6" stackId="a" maxBarSize={52} />
            <Bar dataKey="jabon" name="Jabón"  fill="#A855F7" stackId="a" maxBarSize={52} />
            <Bar dataKey="aseo"  name="Aseo"   fill="#F59E0B" stackId="a" maxBarSize={52} />
            <Bar dataKey="olor"  name="Olor"   fill="#10B981" stackId="a" radius={[4, 4, 0, 0]} maxBarSize={52} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tarjetas de totales por tipo con iconos */}
      <div className="grid grid-cols-4 gap-2 border-t border-slate-50 pt-3">
        {TIPOS_BOTON.map(({ key, label, color, bg, iconColor, Icon }) => {
          const total = datos.reduce((sum, s) => sum + (s[key] || 0), 0);
          return (
            <div key={label} className={`${bg} rounded-xl p-2.5 text-center flex flex-col items-center gap-1`}>
              <Icon size={14} className={iconColor} />
              <p className="text-[18px] font-black leading-none" style={{ color }}>{total}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
