import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import type { DatoPorSede } from './tipos';

// Colores y etiquetas de cada tipo de botón
const TIPOS_BOTON = [
  { key: 'papel', label: 'Papel',  color: '#3B82F6', bg: 'bg-blue-50'   },
  { key: 'jabon', label: 'Jabón',  color: '#A855F7', bg: 'bg-purple-50' },
  { key: 'aseo',  label: 'Aseo',   color: '#F59E0B', bg: 'bg-amber-50'  },
  { key: 'agua',  label: 'Agua',   color: '#06B6D4', bg: 'bg-cyan-50'   },
] as const;

interface PropsGraficaComparativaSedes {
  datos: DatoPorSede[];
  etiquetaPeriodo: string; // ej. "hoy, 1 de junio" | "Mayo 2026"
}

export default function GraficaComparativaSedes({ datos, etiquetaPeriodo }: PropsGraficaComparativaSedes) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Comparativa por Sede</h3>
          <p className="text-[11px] text-gray-400 font-medium mt-0.5">
            Solicitudes por tipo de botón —&nbsp;{etiquetaPeriodo}
          </p>
        </div>
        {/* Leyenda de colores */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-end shrink-0">
          {TIPOS_BOTON.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
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
            <Bar dataKey="agua"  name="Agua"   fill="#06B6D4" stackId="a" radius={[4, 4, 0, 0]} maxBarSize={52} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tarjetas de totales por tipo */}
      <div className="grid grid-cols-4 gap-2 border-t border-slate-50 pt-3">
        {TIPOS_BOTON.map(({ key, label, color, bg }) => {
          const total = datos.reduce((sum, s) => sum + (s[key] || 0), 0);
          return (
            <div key={label} className={`${bg} rounded-xl p-2.5 text-center`}>
              <p className="text-[20px] font-black leading-none" style={{ color }}>{total}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mt-1">{label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
