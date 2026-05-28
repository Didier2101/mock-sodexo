import { useState, useMemo, useEffect } from 'react';
import { mockClients, type CityData, type LocationSede } from '../data';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { ChevronDown, ChevronUp, Radio, Droplet, StickyNote, Sparkles, Wind, Building2, MapPin, Briefcase } from 'lucide-react';

interface DashboardProps {
  user: { name: string; role: string; assignedSedeId?: number };
}

type TimeRange = 'hoy' | 'ayer' | 'semana_pasada' | 'mes_pasado';

export default function Dashboard({ user }: DashboardProps) {
  const isSupervisor = user.role === 'SUPERVISOR_SEDE';

  // CONTROL DE FILTROS EN CASCADA COMPLETO
  const [selectedClientId, setSelectedClientId] = useState<number>(1);
  const [selectedCityName, setSelectedCityName] = useState<string>('Bogotá');
  const [selectedSedeId, setSelectedSedeId] = useState<number>(101);
  
  // Temporalidad y filtros de botón métrico
  const [timeRange, setTimeRange] = useState<TimeRange>('hoy');
  const [activeMetricFilter, setActiveMetricFilter] = useState<'papel' | 'jabon' | 'aseo' | 'agua'>('aseo');
  const [openFloors, setOpenFloors] = useState<Record<string, boolean>>({});

  // Memoización segura de jerarquías para prevenir desfases de estado
  const currentClient = useMemo(() => {
    return mockClients.find(c => c.id === selectedClientId) || mockClients[0];
  }, [selectedClientId]);

  const currentCity = useMemo((): CityData => {
    return currentClient.cities.find(c => c.name === selectedCityName) || currentClient.cities[0];
  }, [currentClient, selectedCityName]);

  const currentSede = useMemo((): LocationSede => {
    if (isSupervisor && user.assignedSedeId) {
      for (const cl of mockClients) {
        for (const ci of cl.cities) {
          const found = ci.sedes.find(s => s.id === user.assignedSedeId);
          if (found) return found;
        }
      }
    }
    return currentCity.sedes.find(s => s.id === selectedSedeId) || currentCity.sedes[0];
  }, [currentCity, selectedSedeId, isSupervisor, user.assignedSedeId]);

  // Efecto cascada: Si cambia de cliente, actualiza ciudad y sede por defecto de forma segura
  useEffect(() => {
    if (!isSupervisor) {
      const defaultCity = currentClient.cities[0];
      setSelectedCityName(defaultCity.name);
      const defaultSede = defaultCity.sedes[0];
      setSelectedSedeId(defaultSede.id);
    }
  }, [selectedClientId, currentClient, isSupervisor]);

  useEffect(() => {
    if (!isSupervisor) {
      const defaultSede = currentCity.sedes[0];
      if (defaultSede) {
        setSelectedSedeId(defaultSede.id);
      }
    }
  }, [selectedCityName, currentCity, isSupervisor]);

  // Desplegar automáticamente los acordeones cuando cambie la sede actual
  useEffect(() => {
    if (currentSede && currentSede.restrooms.length > 0) {
      const initialOpen: Record<string, boolean> = {};
      currentSede.restrooms.forEach(r => {
        initialOpen[r.floor_name] = true;
      });
      setOpenFloors(initialOpen);
    }
  }, [currentSede]);

  // Validador estricto de coincidencia de rangos temporales
  const filterByTimeRange = (timestampStr: string) => {
    const recordDate = new Date(timestampStr).toDateString();
    const today = new Date();

    if (timeRange === 'hoy') return recordDate === today.toDateString();
    if (timeRange === 'ayer') {
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      return recordDate === yesterday.toDateString();
    }
    if (timeRange === 'semana_pasada') {
      const target = new Date();
      target.setDate(today.getDate() - 7);
      return recordDate === target.toDateString();
    }
    if (timeRange === 'mes_pasado') {
      const target = new Date();
      target.setDate(today.getDate() - 30);
      return recordDate === target.toDateString();
    }
    return false;
  };

  // Pipeline analítico temporal para inyectar datos a los dos paneles gráficos
  const processedData = useMemo(() => {
    let totalVisitsCount = 0;
    const totals = { papel: 0, jabon: 0, aseo: 0, agua: 0 };
    
    const hourlyMap: Record<string, { label: string; papel: number; jabon: number; aseo: number; agua: number; visitas: number }> = {
      "07": { label: "07:00 AM", papel: 0, jabon: 0, aseo: 0, agua: 0, visitas: 0 },
      "08": { label: "08:00 AM", papel: 0, jabon: 0, aseo: 0, agua: 0, visitas: 0 },
      "09": { label: "09:00 AM", papel: 0, jabon: 0, aseo: 0, agua: 0, visitas: 0 },
      "10": { label: "10:00 AM", papel: 0, jabon: 0, aseo: 0, agua: 0, visitas: 0 }
    };

    if (!currentSede || !currentSede.restrooms) {
      return { restrooms: [], totalVisits: 0, buttonTotals: totals, chartData: Object.values(hourlyMap) };
    }

    const restroomsTransformed = currentSede.restrooms.map(r => {
      const matchedVisits = r.visitas_historicas.filter(v => filterByTimeRange(v.timestamp));
      const matchedClicks = r.clicks_historicos.filter(c => filterByTimeRange(c.timestamp));

      totalVisitsCount += matchedVisits.length;

      matchedVisits.forEach(v => {
        const hourStr = v.timestamp.split('T')[1]?.substring(0, 2);
        if (hourlyMap[hourStr]) {
          hourlyMap[hourStr].visitas++;
        }
      });

      const localTotals = { papel: 0, jabon: 0, aseo: 0, agua: 0 };
      
      matchedClicks.forEach(c => {
        localTotals[c.type]++;
        totals[c.type]++;

        const hourStr = c.timestamp.split('T')[1]?.substring(0, 2);
        if (hourlyMap[hourStr]) {
          hourlyMap[hourStr][c.type]++;
        }
      });

      return {
        ...r,
        computed_visits: matchedVisits.length,
        computed_clicks: localTotals
      };
    });

    return {
      restrooms: restroomsTransformed,
      totalVisits: totalVisitsCount,
      buttonTotals: totals,
      chartData: Object.values(hourlyMap)
    };
  }, [currentSede, timeRange]);

  const restroomsByFloor = useMemo(() => {
    const groups: Record<string, typeof processedData.restrooms> = {};
    processedData.restrooms.forEach(r => {
      if (!groups[r.floor_name]) groups[r.floor_name] = [];
      groups[r.floor_name].push(r);
    });
    return groups;
  }, [processedData.restrooms]);

  return (
    <div className="space-y-6">
      
      {/* SELECTORES CORPORATIVOS MULTITENANT COMPLETO */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          
          {/* Selector de Cliente */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-auto">
            <Briefcase size={16} className="text-purple-700 shrink-0" />
            <select 
              value={selectedClientId} 
              disabled={isSupervisor}
              onChange={(e) => setSelectedClientId(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
            >
              {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Selector de Ciudad */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-auto">
            <MapPin size={16} className="text-blue-600 shrink-0" />
            <select 
              value={selectedCityName} 
              disabled={isSupervisor}
              onChange={(e) => setSelectedCityName(e.target.value)}
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
            >
              {currentClient.cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          {/* Selector de Sede */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 w-full sm:w-auto">
            <Building2 size={16} className="text-emerald-600 shrink-0" />
            <select 
              value={selectedSedeId} 
              disabled={isSupervisor}
              onChange={(e) => setSelectedSedeId(Number(e.target.value))}
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
            >
              {currentCity.sedes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* Control del Rango de Tiempo */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 w-full lg:w-auto overflow-x-auto">
          {(['hoy', 'ayer', 'semana_pasada', 'mes_pasado'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 lg:flex-none px-4 py-1.5 text-xs font-black rounded-xl transition-all capitalize whitespace-nowrap ${
                timeRange === range ? 'bg-white text-purple-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {range.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* HEADER DINÁMICO */}
      <div className="space-y-1">
        <p className="text-xs font-black text-[#830AD1] uppercase tracking-widest">Inteligencia de Datos Sodexo</p>
        <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">{currentSede?.name}</h1>
      </div>

      {/* RECUADROS KPI INTERACTIVOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button 
          onClick={() => setActiveMetricFilter('papel')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeMetricFilter === 'papel' ? 'bg-purple-950 border-purple-900 text-white shadow-md' : 'bg-white border-gray-100 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <StickyNote size={18} className={activeMetricFilter === 'papel' ? 'text-purple-300' : 'text-blue-500'} />
            <span className="text-[9px] font-mono opacity-60">BOTÓN 1</span>
          </div>
          <p className="text-2xl font-black mt-2">{processedData.buttonTotals.papel}</p>
          <p className="text-[11px] font-semibold opacity-70">Peticiones de Papel</p>
        </button>

        <button 
          onClick={() => setActiveMetricFilter('jabon')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeMetricFilter === 'jabon' ? 'bg-purple-950 border-purple-900 text-white shadow-md' : 'bg-white border-gray-100 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <Droplet size={18} className={activeMetricFilter === 'jabon' ? 'text-purple-300' : 'text-purple-600'} />
            <span className="text-[9px] font-mono opacity-60">BOTÓN 2</span>
          </div>
          <p className="text-2xl font-black mt-2">{processedData.buttonTotals.jabon}</p>
          <p className="text-[11px] font-semibold opacity-70">Falta de Jabón</p>
        </button>

        <button 
          onClick={() => setActiveMetricFilter('aseo')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeMetricFilter === 'aseo' ? 'bg-purple-950 border-purple-900 text-white shadow-md' : 'bg-white border-gray-100 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <Sparkles size={18} className={activeMetricFilter === 'aseo' ? 'text-purple-300' : 'text-amber-500'} />
            <span className="text-[9px] font-mono opacity-60">BOTÓN 3</span>
          </div>
          <p className="text-2xl font-black mt-2">{processedData.buttonTotals.aseo}</p>
          <p className="text-[11px] font-semibold opacity-70">Aviso Limpieza</p>
        </button>

        <button 
          onClick={() => setActiveMetricFilter('agua')}
          className={`p-4 rounded-2xl border text-left transition-all ${
            activeMetricFilter === 'agua' ? 'bg-purple-950 border-purple-900 text-white shadow-md' : 'bg-white border-gray-100 text-slate-800 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <Wind size={18} className={activeMetricFilter === 'agua' ? 'text-purple-300' : 'text-cyan-500'} />
            <span className="text-[9px] font-mono opacity-60">BOTÓN 4</span>
          </div>
          <p className="text-2xl font-black mt-2">{processedData.buttonTotals.agua}</p>
          <p className="text-[11px] font-semibold opacity-70">Flujo / Olores</p>
        </button>
      </div>

      {/* AMBAS GRÁFICAS COMPLETA MENTE FUNCIONALES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Gráfica 1: Fluctuación Temporal de Clics */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Fluctuación de Pulsaciones</h3>
              <p className="text-[11px] text-gray-400 font-medium">Intervalo horario basado en el filtro de rango seleccionado</p>
            </div>
            <span className="text-[9px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-black uppercase">
              Métrica: {activeMetricFilter}
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData.chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey={activeMetricFilter} fill="#830AD1" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfica 2: Conteo de Tránsito Peatonal */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Tránsito Peatonal Acumulado</h3>
            <p className="text-[11px] text-gray-400 font-medium">Registros capturados por sensores de paso: <strong className="text-slate-800">{processedData.totalVisits} pax</strong></p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={processedData.chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', fontSize: '11px' }} />
                <Bar dataKey="visitas" fill="#0EA5E9" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* DETALLE DESPLEGABLE POR NIVELES / PISOS */}
      <div className="space-y-3">
        {Object.entries(restroomsByFloor).map(([floorName, restrooms]) => {
          const isOpen = !!openFloors[floorName];
          return (
            <div key={floorName} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button 
                onClick={() => setOpenFloors(prev => ({ ...prev, [floorName]: !prev[floorName] }))}
                className="w-full flex items-center justify-between p-4 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <span className="text-xs font-black text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#830AD1]" />
                  {floorName}
                </span>
                {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {isOpen && (
                <div className="p-4 space-y-4 divide-y divide-gray-100">
                  {restrooms.map((r, idx) => {
                    const alertActive = r.active_alerts.length > 0;
                    return (
                      <div key={r.id} className={`space-y-3 ${idx > 0 ? 'pt-4' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{r.name}</h4>
                            <p className="text-[9px] font-mono text-gray-400">Tránsito peatonal mapeado: {r.computed_visits} personas</p>
                          </div>
                          {timeRange === 'hoy' && alertActive && (
                            <span className="text-[9px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-black animate-pulse uppercase">
                              ALERTA: {r.active_alerts[0]}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className={`p-2 rounded-xl border ${activeMetricFilter === 'papel' ? 'bg-purple-50 border-purple-200' : 'bg-slate-50/60 border-slate-100'}`}>
                            <p className="text-xs font-black text-slate-800">{r.computed_clicks.papel}</p>
                            <span className="text-[8px] text-gray-400 block font-bold">Papel</span>
                          </div>
                          <div className={`p-2 rounded-xl border ${activeMetricFilter === 'jabon' ? 'bg-purple-50 border-purple-200' : 'bg-slate-50/60 border-slate-100'}`}>
                            <p className="text-xs font-black text-slate-800">{r.computed_clicks.jabon}</p>
                            <span className="text-[8px] text-gray-400 block font-bold">Jabón</span>
                          </div>
                          <div className={`p-2 rounded-xl border ${activeMetricFilter === 'aseo' ? 'bg-purple-50 border-purple-200' : 'bg-slate-50/60 border-slate-100'}`}>
                            <p className="text-xs font-black text-slate-800">{r.computed_clicks.aseo}</p>
                            <span className="text-[8px] text-gray-400 block font-bold">Aseo</span>
                          </div>
                          <div className={`p-2 rounded-xl border ${activeMetricFilter === 'agua' ? 'bg-purple-50 border-purple-200' : 'bg-slate-50/60 border-slate-100'}`}>
                            <p className="text-xs font-black text-slate-800">{r.computed_clicks.agua}</p>
                            <span className="text-[8px] text-gray-400 block font-bold">Olores</span>
                          </div>
                        </div>

                        {timeRange === 'hoy' && alertActive && isSupervisor && (
                          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2 text-[10px] text-amber-900 font-medium">
                            <Radio size={14} className="text-amber-600 shrink-0" />
                            <span><strong>Instrucción inmediata:</strong> Notificar cuadrilla de limpieza para solucionar alerta de <strong>{r.active_alerts[0]}</strong>.</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}