import { useState, useMemo, useEffect, useRef } from 'react';
import { mockClients, type CityData, type LocationSede } from '../data';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import { Droplet, Sparkles, Building2, MapPin, Briefcase, Calendar, Filter, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';

// Helper: fecha local como string YYYY-MM-DD
const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Helper: Formatea la fecha seleccionada en español amigable
const formatDateSpanish = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const monthInt = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const monthName = months[monthInt - 1] || '';

  const todayStr = getTodayStr();
  if (dateStr === todayStr) {
    return `hoy, ${day} de ${monthName}`;
  }
  return `el ${day} de ${monthName}`;
};

// Helper: Genera la lista de las 12 horas previas a partir de una hora y fecha base
const get12HourWindow = (baseDateStr: string, endHour: number) => {
  const windowSlots: { dateStr: string; hour: number; label: string; hourKey: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const targetDate = new Date(`${baseDateStr}T${String(endHour).padStart(2, '0')}:00:00`);
    targetDate.setHours(targetDate.getHours() - i);

    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const hour = targetDate.getHours();
    const hourKey = String(hour).padStart(2, '0');
    const label = `${hourKey}:00`;

    windowSlots.push({ dateStr, hour, label, hourKey });
  }
  return windowSlots;
};

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  const isSupervisor = user.role === 'SUPERVISOR_SEDE';

  // CONTROL DE FILTROS EN CASCADA COMPLETO
  const [selectedClientId, setSelectedClientId] = useState<number>(1);
  const [selectedCityName, setSelectedCityName] = useState<string>('Bogotá');
  const [selectedSedeId, setSelectedSedeId] = useState<number>(101);

  // Filtros globales unificados desde el Context
  const { selectedDate, setSelectedDate, selectedHour } = useFilter();

  // Filtros avanzados del panel de control
  const [selectedMonth, setSelectedMonth] = useState<string>('custom'); // 'custom', '2026-05', '2026-04'
  const [selectedRestroomId, setSelectedRestroomId] = useState<string>('all');
  const [startHour, setStartHour] = useState<number>(0);
  const [endHour, setEndHour] = useState<number>(23);

  // Resetear el filtro de baño si cambia de sede
  useEffect(() => {
    setSelectedRestroomId('all');
  }, [selectedSedeId]);

  const handleStartHourChange = (val: number) => {
    setStartHour(val);
    if (val > endHour) {
      setEndHour(val);
    }
  };

  const handleEndHourChange = (val: number) => {
    setEndHour(val);
    if (val < startHour) {
      setStartHour(val);
    }
  };

  const [, setOpenFloors] = useState<Record<string, boolean>>({});

  // Refs de desplazamiento para gráficas horizontales
  const barChartContainerRef = useRef<HTMLDivElement>(null);
  const areaChartContainerRef = useRef<HTMLDivElement>(null);

  // Sincronizar el scroll de las gráficas al cambiar la hora activa
  useEffect(() => {
    const scrollToActiveHour = () => {
      // El ancho total de las gráficas es de 1800px (75px por hora para las 24 horas)
      // Restamos 11 horas para que la hora activa seleccionada quede alineada en el extremo derecho del viewport
      const hourWidth = 1800 / 24;
      const scrollPos = Math.max(0, (selectedHour - 11) * hourWidth);

      if (barChartContainerRef.current) {
        barChartContainerRef.current.scrollLeft = scrollPos;
      }
      if (areaChartContainerRef.current) {
        areaChartContainerRef.current.scrollLeft = scrollPos;
      }
    };

    const timer = setTimeout(scrollToActiveHour, 200);
    return () => clearTimeout(timer);
  }, [selectedHour]);

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

  // Límite de las 12 horas a partir del filtro de fecha y hora seleccionada
  const windowSlots = useMemo(() => {
    return get12HourWindow(selectedDate, selectedHour);
  }, [selectedDate, selectedHour]);

  const windowPrefixes = useMemo(() => {
    return windowSlots.map(s => `${s.dateStr}T${s.hourKey}`);
  }, [windowSlots]);

  // Pipeline analítico — genera datos basados en filtros de mes, baño y rango de horas
  const processedData = useMemo(() => {
    let totalVisitsCount = 0;
    const totals = { papel: 0, jabon: 0, aseo: 0, agua: 0 };

    // Inicializar el arreglo de datos del gráfico para las 24 horas
    const chartDataArray: any[] = [];
    const hourlyMap: Record<string, any> = {};
    for (let h = 0; h < 24; h++) {
      const key = String(h).padStart(2, '0');
      const label = `${key}:00`;

      const slot = {
        label,
        papel: 0,
        jabon: 0,
        aseo: 0,
        agua: 0,
        visitas: 0,
        hourKey: key,
        dateStr: selectedMonth === 'custom' ? selectedDate : selectedMonth
      };
      chartDataArray.push(slot);
      hourlyMap[key] = slot;
    }

    // Filtrar los baños de la sede
    const restroomsToProcess = currentSede && currentSede.restrooms ? currentSede.restrooms : [];
    const restroomsFiltered = selectedRestroomId === 'all'
      ? restroomsToProcess
      : restroomsToProcess.filter(r => r.id === Number(selectedRestroomId));

    // Determinar la coincidencia de periodo (por día exacto o mes completo)
    const matchPeriod = (timestamp: string) => {
      if (selectedMonth === 'custom') {
        return timestamp.startsWith(selectedDate);
      }
      return timestamp.startsWith(selectedMonth);
    };

    // Calcular actividad para las 24 horas del periodo seleccionado filtrando por rango de horas
    const rawHourActivity: Record<number, { visitas: number; clicks: number }> = {};
    for (let h = 0; h < 24; h++) {
      rawHourActivity[h] = { visitas: 0, clicks: 0 };
    }

    restroomsFiltered.forEach(r => {
      r.visitas_historicas.forEach(v => {
        if (matchPeriod(v.timestamp)) {
          const hour = parseInt(v.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
          if (hour >= startHour && hour <= endHour) {
            if (rawHourActivity[hour]) rawHourActivity[hour].visitas++;
            const hourStr = v.timestamp.split('T')[1]?.substring(0, 2);
            if (hourlyMap[hourStr]) hourlyMap[hourStr].visitas++;
          }
        }
      });
      r.clicks_historicos.forEach(c => {
        if (matchPeriod(c.timestamp)) {
          const hour = parseInt(c.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
          if (hour >= startHour && hour <= endHour) {
            if (rawHourActivity[hour]) rawHourActivity[hour].clicks++;
            const hourStr = c.timestamp.split('T')[1]?.substring(0, 2);
            if (hourlyMap[hourStr]) hourlyMap[hourStr][c.type]++;
          }
        }
      });
    });

    const restroomsTransformed = restroomsFiltered.map(r => {
      // Filtrar visitas dentro de la ventana de visualización activa
      const matchedVisits = r.visitas_historicas.filter(v => {
        if (selectedMonth === 'custom') {
          const prefix = v.timestamp.substring(0, 13);
          const hour = parseInt(v.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
          return windowPrefixes.includes(prefix) && hour >= startHour && hour <= endHour;
        } else {
          const hour = parseInt(v.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
          return v.timestamp.startsWith(selectedMonth) && hour >= startHour && hour <= endHour;
        }
      });

      // Filtrar clicks dentro de la ventana de visualización activa
      const matchedClicks = r.clicks_historicos.filter(c => {
        if (selectedMonth === 'custom') {
          const prefix = c.timestamp.substring(0, 13);
          const hour = parseInt(c.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
          return windowPrefixes.includes(prefix) && hour >= startHour && hour <= endHour;
        } else {
          const hour = parseInt(c.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
          return c.timestamp.startsWith(selectedMonth) && hour >= startHour && hour <= endHour;
        }
      });

      totalVisitsCount += matchedVisits.length;

      const localTotals = { papel: 0, jabon: 0, aseo: 0, agua: 0 };

      matchedClicks.forEach(c => {
        localTotals[c.type]++;
        totals[c.type]++;
      });

      return {
        ...r,
        computed_visits: matchedVisits.length,
        computed_clicks: localTotals
      };
    });

    // Recortar los datos de las gráficas según el rango de horas especificado
    const filteredChartData = chartDataArray.filter(item => {
      const hour = parseInt(item.hourKey, 10);
      return hour >= startHour && hour <= endHour;
    });

    return {
      restrooms: restroomsTransformed,
      totalVisits: totalVisitsCount,
      buttonTotals: totals,
      chartData: filteredChartData,
      rawHourActivity
    };
  }, [currentSede, selectedDate, selectedMonth, selectedRestroomId, startHour, endHour, windowPrefixes]);

  // const restroomsByFloor = useMemo(() => {
  //   const groups: Record<string, typeof processedData.restrooms> = {};
  //   processedData.restrooms.forEach(r => {
  //     if (!groups[r.floor_name]) groups[r.floor_name] = [];
  //     groups[r.floor_name].push(r);
  //   });
  //   return groups;
  // }, [processedData.restrooms]);

  const dailySummaryNarrative = useMemo(() => {
    const chartData = processedData.chartData;

    // 1. Conteo de tránsito total diario
    let totalVisits = 0;
    chartData.forEach(item => {
      totalVisits += item.visitas || 0;
    });

    // 2. Rango y hora pico de tránsito
    let maxVisits = -1;
    let maxVisitsHour = 12;
    chartData.forEach((item) => {
      if (item.visitas > maxVisits) {
        maxVisits = item.visitas;
        maxVisitsHour = parseInt(item.hourKey, 10);
      }
    });

    const startPeakHour = Math.max(0, maxVisitsHour - 1);
    const endPeakHour = Math.min(23, maxVisitsHour + 1);
    const peakRangeStr = `${String(startPeakHour).padStart(2, '0')}:00 y las ${String(endPeakHour).padStart(2, '0')}:00`;
    const peakHourStr = `${String(maxVisitsHour).padStart(2, '0')}:00`;

    // 3. Insumo/servicio más solicitado en el día
    let totalPapel = 0;
    let totalJabon = 0;
    let totalAseo = 0;
    let totalAgua = 0;

    chartData.forEach(item => {
      totalPapel += item.papel || 0;
      totalJabon += item.jabon || 0;
      totalAseo += item.aseo || 0;
      totalAgua += item.agua || 0;
    });

    const supplies = [
      { key: 'papel', label: 'peticiones de papel higiénico', count: totalPapel, singular: 'papel higiénico' },
      { key: 'jabon', label: 'falta de jabón', count: totalJabon, singular: 'jabón' },
      { key: 'aseo', label: 'alertas de aseo/limpieza', count: totalAseo, singular: 'limpieza' },
      { key: 'agua', label: 'reportes de olores o flujo de agua', count: totalAgua, singular: 'olores/agua' }
    ];

    supplies.sort((a, b) => b.count - a.count);
    const primaryRequest = supplies[0];

    // Hora pico del insumo más solicitado
    let maxSupplyHour = 12;
    let maxSupplyCount = -1;
    chartData.forEach((item) => {
      const val = item[primaryRequest.key] || 0;
      if (val > maxSupplyCount) {
        maxSupplyCount = val;
        maxSupplyHour = parseInt(item.hourKey, 10);
      }
    });
    const supplyPeakHourStr = `${String(maxSupplyHour).padStart(2, '0')}:00`;

    // 4. Ubicación con mayor afluencia acumulada
    let maxRestroomName = '';
    let maxRestroomVisits = -1;
    const restroomsToProcess = currentSede && currentSede.restrooms ? currentSede.restrooms : [];
    const restroomsFiltered = selectedRestroomId === 'all'
      ? restroomsToProcess
      : restroomsToProcess.filter(r => r.id === Number(selectedRestroomId));

    restroomsFiltered.forEach(r => {
      const count = r.visitas_historicas.filter(v => {
        const matchesDate = selectedMonth === 'custom'
          ? v.timestamp.startsWith(selectedDate)
          : v.timestamp.startsWith(selectedMonth);
        const hour = parseInt(v.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
        return matchesDate && hour >= startHour && hour <= endHour;
      }).length;

      if (count > maxRestroomVisits) {
        maxRestroomVisits = count;
        maxRestroomName = `${r.name} (${r.floor_name})`;
      }
    });

    const formattedPeriod = selectedMonth === 'custom'
      ? formatDateSpanish(selectedDate)
      : selectedMonth === '2026-05'
        ? 'el mes de mayo de 2026'
        : 'el mes de abril de 2026';

    const hourRangeLabel = `en el rango de ${String(startHour).padStart(2, '0')}:00 a ${String(endHour).padStart(2, '0')}:00`;

    if (totalVisits === 0 && primaryRequest.count === 0) {
      return `Para **${formattedPeriod}** (${hourRangeLabel}), no se registraron flujos de tránsito peatonal ni llamados de servicio en los sensores. El estado operativo de la sede se reporta sin novedades.`;
    }

    const trafficText = totalVisits > 0
      ? `se registró un flujo acumulado de **${totalVisits} personas** en la sede, concentrándose un ritmo de tránsito elevado principalmente entre las **${peakRangeStr}** (con pico máximo a las **${peakHourStr}**), destacando la zona de **${maxRestroomName || 'baños principales'}** con un total de **${maxRestroomVisits} visitas**.`
      : `el tránsito peatonal general fue imperceptible en los sensores.`;

    const requestText = primaryRequest.count > 0
      ? `el requerimiento más recurrente fue **${primaryRequest.label}** (registrando **${primaryRequest.count} timbres**), con mayor frecuencia de llamados alrededor de las **${supplyPeakHourStr}**.`
      : `no se reportaron llamados por falta de insumos o solicitudes de limpieza especial.`;

    const restroomContext = selectedRestroomId !== 'all' ? ` (Filtrado por el baño: **${maxRestroomName}**)` : '';

    const recommendation = primaryRequest.count > 0 && totalVisits > 0
      ? `Se sugiere intensificar las tareas de mantenimiento de **${primaryRequest.singular}** y limpieza general preventivas justo antes de las **${supplyPeakHourStr}** y durante el pico de tránsito de **${peakRangeStr}** para asegurar la calidad de servicio.`
      : `La sede se mantiene en parámetros estables de operación autónoma sin alertas pendientes.`;

    return `Durante **${formattedPeriod}** ${hourRangeLabel}${restroomContext}, ${trafficText} En cuanto a la gestión operativa, ${requestText} ${recommendation}`;
  }, [processedData, selectedDate, selectedMonth, selectedRestroomId, startHour, endHour, currentSede]);

  return (
    <div className="space-y-4">

      {/* PANEL DE FILTROS AVANZADOS PREMIUM */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Selector de Cliente */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Briefcase size={12} className="text-purple-700 shrink-0" /> Cliente
            </label>
            <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-purple-300 transition-all shadow-xs">
              <select
                value={selectedClientId}
                disabled={isSupervisor}
                onChange={(e) => setSelectedClientId(Number(e.target.value))}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
              >
                {mockClients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* 2. Selector de Ciudad */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <MapPin size={12} className="text-blue-600 shrink-0" /> Ciudad
            </label>
            <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs">
              <select
                value={selectedCityName}
                disabled={isSupervisor}
                onChange={(e) => setSelectedCityName(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
              >
                {currentClient.cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* 3. Selector de Sede / Terminal */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Building2 size={12} className="text-emerald-600 shrink-0" /> Sede / Terminal
            </label>
            <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all shadow-xs">
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

          {/* 4. Selector de Baño */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Droplet size={12} className="text-[#830AD1] shrink-0" /> Baño / Servicio
            </label>
            <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-[#830AD1]/30 transition-all shadow-xs">
              <select
                value={selectedRestroomId}
                onChange={(e) => setSelectedRestroomId(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
              >
                <option value="all">Todos los baños ({currentSede?.restrooms?.length || 0})</option>
                {currentSede?.restrooms?.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.floor_name})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fila 2: Tiempo y Rango de Horas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">

          {/* Periodo (Mes vs Día) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={12} className="text-purple-700 shrink-0" /> Periodo Analítico
            </label>
            <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-purple-300 transition-all shadow-xs">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
              >
                <option value="custom">Día Específico (Calendario)</option>
                <option value="2026-05">Mes Completo: Mayo 2026</option>
                <option value="2026-04">Mes Completo: Abril 2026</option>
              </select>
            </div>
          </div>

          {/* Selector de Fecha (Solo visible si es Día Específico) */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Calendar size={12} className="text-[#830AD1] shrink-0" /> {selectedMonth === 'custom' ? 'Seleccionar Fecha' : 'Fecha Inactiva'}
            </label>
            <div className={`flex items-center px-3 py-2 rounded-xl border transition-all shadow-xs ${selectedMonth === 'custom' ? 'bg-slate-50 border-slate-200 hover:border-[#830AD1]' : 'bg-slate-100 border-slate-200 opacity-60 pointer-events-none'}`}>
              <input
                type="date"
                value={selectedDate}
                max={getTodayStr()}
                disabled={selectedMonth !== 'custom'}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
              />
            </div>
          </div>

          {/* Rango de Horas: Desde */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Clock size={12} className="text-blue-500 shrink-0" /> Hora Inicio (Eje X)
            </label>
            <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-blue-300 transition-all shadow-xs">
              <select
                value={startHour}
                onChange={(e) => handleStartHourChange(Number(e.target.value))}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
              >
                {Array.from({ length: 24 }).map((_, idx) => (
                  <option key={`start-${idx}`} value={idx}>{String(idx).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>

          {/* Rango de Horas: Hasta */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <Clock size={12} className="text-[#830AD1] shrink-0" /> Hora Fin (Eje X)
            </label>
            <div className="flex items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-[#830AD1]/30 transition-all shadow-xs">
              <select
                value={endHour}
                onChange={(e) => handleEndHourChange(Number(e.target.value))}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer w-full"
              >
                {Array.from({ length: 24 }).map((_, idx) => (
                  <option key={`end-${idx}`} value={idx}>{String(idx).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* HEADER DINÁMICO */}
      <div className="space-y-1">
        <p className="text-xs font-black text-[#830AD1] uppercase tracking-widest">Inteligencia de Datos Sodexo</p>
        <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">{currentSede?.name}</h1>
      </div>

      {/* GRÁFICAS — Grid 2x2 en desktop, apiladas en móvil */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Gráfica 1: Fluctuación Temporal de Clics */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Pulsaciones por Botón / Hora</h3>
            <p className="text-[11px] text-gray-400 font-medium">Peticiones de los 4 sensores por hora — {selectedDate}</p>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10 bg-gradient-to-l from-white to-transparent rounded-r-xl" />
            <div
              ref={barChartContainerRef}
              className="w-full overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#830AD1 #f1f5f9' }}
            >
              <div className="h-64 min-w-[1800px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={processedData.chartData}
                    margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={8} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} width={28} />
                    <Tooltip
                      cursor={{ fill: '#f5f3ff' }}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', marginTop: '5px' }} />
                    <Bar dataKey="papel" name="Papel" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={12} />
                    <Bar dataKey="jabon" name="Jabón" fill="#A855F7" radius={[4, 4, 0, 0]} maxBarSize={12} />
                    <Bar dataKey="aseo" name="Aseo" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={12} />
                    <Bar dataKey="agua" name="Olores/Agua" fill="#06B6D4" radius={[4, 4, 0, 0]} maxBarSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfica 2: Ola de Tránsito Peatonal */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Ola de Tránsito Peatonal</h3>
            <p className="text-[11px] text-gray-400 font-medium">Afluencia por sensor de paso en la ventana activa: <strong className="text-slate-800">{processedData.totalVisits} pax</strong></p>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10 bg-gradient-to-l from-white to-transparent rounded-r-xl" />
            <div
              ref={areaChartContainerRef}
              className="w-full overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#0EA5E9 #f1f5f9' }}
            >
              <div className="h-64 min-w-[1800px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={processedData.chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVisitas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={8} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} allowDecimals={false} width={28} />
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="visitas" name="Personas" stroke="#0EA5E9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisitas)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfica 3: Torta — Distribución de botones presionados */}
        {(() => {
          const { buttonTotals } = processedData;
          const totalClicks = buttonTotals.papel + buttonTotals.jabon + buttonTotals.aseo + buttonTotals.agua;
          const pieData = [
            { name: 'Papel', value: buttonTotals.papel, color: '#3B82F6' },
            { name: 'Jabón', value: buttonTotals.jabon, color: '#A855F7' },
            { name: 'Aseo', value: buttonTotals.aseo, color: '#F59E0B' },
            { name: 'Olores/Agua', value: buttonTotals.agua, color: '#06B6D4' },
          ].filter(d => d.value > 0);

          const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            if (percent < 0.06) return null;
            return (
              <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight={900}>
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            );
          };

          return (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Distribución de Botones Presionados</h3>
                <p className="text-[11px] text-gray-400 font-medium">¿Cuál botón presionan más los usuarios? — Total: <strong className="text-slate-800">{totalClicks} pulsaciones</strong></p>
              </div>
              <div className="flex items-center gap-4">
                <div className="h-52 flex-1">
                  {totalClicks > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={88}
                          innerRadius={36}
                          paddingAngle={3}
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomLabel}
                        >
                          {pieData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any, name: any) => [value, name]}
                          contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 text-xs font-bold">Sin pulsaciones en este turno</div>
                  )}
                </div>
                {/* Leyenda lateral premium */}
                <div className="space-y-2.5 shrink-0">
                  {[
                    { label: 'Papel', value: buttonTotals.papel, color: '#3B82F6' },
                    { label: 'Jabón', value: buttonTotals.jabon, color: '#A855F7' },
                    { label: 'Aseo', value: buttonTotals.aseo, color: '#F59E0B' },
                    { label: 'Olores/Agua', value: buttonTotals.agua, color: '#06B6D4' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-[10px] font-bold text-slate-800">{item.label}</p>
                        <p className="text-[9px] font-mono text-gray-400">{item.value} puls. {totalClicks > 0 ? `(${((item.value / totalClicks) * 100).toFixed(0)}%)` : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Gráfica 4: Comparativa Combinada — Personas vs. Pulsaciones por Hora */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Personas vs. Pulsaciones por Hora</h3>
            <p className="text-[11px] text-gray-400 font-medium">Comparativa entre afluencia de personas y llamados a botones — eje dual</p>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 z-10 bg-gradient-to-l from-white to-transparent rounded-r-xl" />
            <div
              className="w-full overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#830AD1 #f1f5f9' }}
            >
              <div className="h-64 min-w-[1800px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={processedData.chartData.map(d => ({
                      ...d,
                      totalClicks: (d.papel || 0) + (d.jabon || 0) + (d.aseo || 0) + (d.agua || 0)
                    }))}
                    margin={{ top: 10, right: 36, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={8} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#0EA5E9" fontSize={9} tickLine={false} allowDecimals={false} width={28} />
                    <YAxis yAxisId="right" orientation="right" stroke="#830AD1" fontSize={9} tickLine={false} allowDecimals={false} width={28} />
                    <Tooltip
                      cursor={{ fill: '#f5f3ff' }}
                      contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any, name: any) => [value, name === 'visitas' ? 'Personas' : 'Pulsaciones']}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', marginTop: '5px' }} />
                    <Bar yAxisId="left" dataKey="visitas" name="Personas" fill="#0EA5E9" fillOpacity={0.25} radius={[4, 4, 0, 0]} maxBarSize={14} />
                    <Line yAxisId="right" type="monotone" dataKey="totalClicks" name="Pulsaciones" stroke="#830AD1" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#830AD1' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* CARD DE INSIGHT DE LENGUAJE NATURAL */}
      <div className="bg-gradient-to-br from-[#830AD1]/5 via-[#830AD1]/[0.02] to-white border border-[#830AD1]/15 p-5 rounded-2xl shadow-xs transition-all hover:shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#830AD1]/10 rounded-xl text-[#830AD1]">
            <Sparkles size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Resumen Inteligente y Recomendación Operativa
            </h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">
              Análisis descriptivo del día
            </p>
          </div>
        </div>

        <p
          className="text-xs text-slate-700 leading-relaxed font-medium"
          dangerouslySetInnerHTML={{
            __html: dailySummaryNarrative
              .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-black">$1</strong>')
          }}
        />
      </div>


    </div>
  );
}