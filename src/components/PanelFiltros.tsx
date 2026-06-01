import { MapPin, Briefcase, Calendar, Filter } from 'lucide-react';
import { mockClients } from '../data';
import type { ClientAccount } from '../data';

interface PropsPanelFiltros {
  // Jerarquía actual (para render de opciones)
  clienteActual: ClientAccount;

  // Valores seleccionados
  clienteId: number;
  ciudadNombre: string;
  mes: string;
  fechaSeleccionada: string;

  // Setters
  onClienteChange: (id: number) => void;
  onCiudadChange: (nombre: string) => void;
  onMesChange: (mes: string) => void;
  onFechaChange: (fecha: string) => void;

  // Helpers
  esSupervisor: boolean;
  fechaMaxima: string;
}

export default function PanelFiltros({
  clienteActual,
  clienteId,
  ciudadNombre,
  mes,
  fechaSeleccionada,
  onClienteChange,
  onCiudadChange,
  onMesChange,
  onFechaChange,
  esSupervisor,
  fechaMaxima,
}: PropsPanelFiltros) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
      {/* Cabecera del panel */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#830AD1]/10 rounded-lg text-[#830AD1]">
            <Filter size={16} />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">Panel de Filtros Avanzados</h2>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Ajusta la analítica en tiempo real</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Monitoreo Activo
        </div>
      </div>

      {/* Grid de Filtros Unificado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Selector de Cliente */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Briefcase size={12} className="text-purple-700 shrink-0" /> Cliente
          </label>
          <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-purple-300 transition-all shadow-xs">
            <select
              value={clienteId}
              disabled={esSupervisor}
              onChange={(e) => onClienteChange(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
            >
              {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Selector de Ciudad */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <MapPin size={12} className="text-blue-600 shrink-0" /> Ciudad
          </label>
          <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs">
            <select
              value={ciudadNombre}
              disabled={esSupervisor}
              onChange={(e) => onCiudadChange(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
            >
              {clienteActual.cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>
        </div>

        {/* Periodo Analítico */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Calendar size={12} className="text-purple-700 shrink-0" /> Periodo Analítico
          </label>
          <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-purple-300 transition-all shadow-xs">
            <select
              value={mes}
              onChange={(e) => onMesChange(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
            >
              <option value="custom">Día Específico (Calendario)</option>
              <option value="2026-06">Mes Completo: Junio 2026</option>
              <option value="2026-05">Mes Completo: Mayo 2026</option>
            </select>
          </div>
        </div>

        {/* Selector de Fecha */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Calendar size={12} className="text-[#830AD1] shrink-0" />
            {mes === 'custom' ? 'Seleccionar Fecha' : 'Fecha Inactiva'}
          </label>
          <div className={`flex items-center px-3 py-2 rounded-xl border transition-all shadow-xs ${mes === 'custom' ? 'bg-slate-50 border-slate-200 hover:border-[#830AD1]' : 'bg-slate-100 border-slate-200 opacity-60 pointer-events-none'}`}>
            <input
              type="date"
              value={fechaSeleccionada}
              max={fechaMaxima}
              disabled={mes !== 'custom'}
              onChange={(e) => e.target.value && onFechaChange(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
