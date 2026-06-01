import { useState, useMemo, useEffect } from 'react';
import { mockClients, type CityData, type LocationSede } from '../data';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';

import PanelFiltros from '../components/PanelFiltros';
import GraficaComparativaSedes from '../components/GraficaComparativaSedes';
import GraficaComportamientoGeneral from '../components/GraficaComportamientoGeneral';
import ResumenInsight from '../components/ResumenInsight';
import type { DatoPorSede, DatoTendencia } from '../components/tipos';

// ─── Helpers de fecha ────────────────────────────────────────────────────────

const obtenerFechaHoy = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatearFechaEspanol = (fechaStr: string): string => {
  if (!fechaStr) return '';
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return fechaStr;
  const mesNum = parseInt(partes[1], 10);
  const dia = parseInt(partes[2], 10);
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const nombreMes = meses[mesNum - 1] || '';
  if (fechaStr === obtenerFechaHoy()) return `hoy, ${dia} de ${nombreMes}`;
  return `el ${dia} de ${nombreMes}`;
};

const obtenerVentana12Horas = (fechaBase: string, horaFin: number) => {
  const slots: { dateStr: string; hour: number; label: string; hourKey: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const fecha = new Date(`${fechaBase}T${String(horaFin).padStart(2, '0')}:00:00`);
    fecha.setHours(fecha.getHours() - i);
    const year  = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day   = String(fecha.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const hour    = fecha.getHours();
    const hourKey = String(hour).padStart(2, '0');
    slots.push({ dateStr, hour, label: `${hourKey}:00`, hourKey });
  }
  return slots;
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  const esSupervisor = user.role === 'SUPERVISOR_SEDE';

  // ── Estado de filtros en cascada ──────────────────────────────────────────
  const [clienteId, setClienteId]     = useState<number>(1);
  const [ciudadNombre, setCiudadNombre] = useState<string>('Bogotá');
  const [sedeId, setSedeId]           = useState<number>(101);

  const { selectedDate: fechaSeleccionada, setSelectedDate: setFechaSeleccionada, selectedHour: horaSeleccionada } = useFilter();

  const [mes, setMes]               = useState<string>('custom');
  const [banoId, setBanoId]         = useState<string>('all');
  const horaInicio = 0;
  const horaFin = 23;

  const [, setFloors] = useState<Record<string, boolean>>({});

  // ── Resetear baño si cambia sede ──────────────────────────────────────────
  useEffect(() => { setBanoId('all'); }, [sedeId]);

  // ── Jerarquía derivada ────────────────────────────────────────────────────
  const clienteActual = useMemo(
    () => mockClients.find(c => c.id === clienteId) || mockClients[0],
    [clienteId]
  );

  const ciudadActual = useMemo((): CityData =>
    clienteActual.cities.find(c => c.name === ciudadNombre) || clienteActual.cities[0],
    [clienteActual, ciudadNombre]
  );

  const sedeActual = useMemo((): LocationSede => {
    if (esSupervisor && user.assignedSedeId) {
      for (const cl of mockClients)
        for (const ci of cl.cities) {
          const found = ci.sedes.find(s => s.id === user.assignedSedeId);
          if (found) return found;
        }
    }
    return ciudadActual.sedes.find(s => s.id === sedeId) || ciudadActual.sedes[0];
  }, [ciudadActual, sedeId, esSupervisor, user.assignedSedeId]);

  // ── Efectos en cascada: cliente → ciudad → sede ───────────────────────────
  useEffect(() => {
    if (!esSupervisor) {
      const defCiudad = clienteActual.cities[0];
      setCiudadNombre(defCiudad.name);
      setSedeId(defCiudad.sedes[0].id);
    }
  }, [clienteId, clienteActual, esSupervisor]);

  useEffect(() => {
    if (!esSupervisor) {
      const defSede = ciudadActual.sedes[0];
      if (defSede) setSedeId(defSede.id);
    }
  }, [ciudadNombre, ciudadActual, esSupervisor]);

  useEffect(() => {
    if (sedeActual?.restrooms.length > 0) {
      const abiertos: Record<string, boolean> = {};
      sedeActual.restrooms.forEach(r => { abiertos[r.floor_name] = true; });
      setFloors(abiertos);
    }
  }, [sedeActual]);

  // ── Ventana de 12 horas activa ────────────────────────────────────────────
  const ventanaSlots   = useMemo(() => obtenerVentana12Horas(fechaSeleccionada, horaSeleccionada), [fechaSeleccionada, horaSeleccionada]);
  const ventanaPrefijos = useMemo(() => ventanaSlots.map(s => `${s.dateStr}T${s.hourKey}`), [ventanaSlots]);

  // ── Pipeline analítico para el insight de lenguaje natural ───────────────
  const datosAnalíticos = useMemo(() => {
    let totalVisitas = 0;
    const totales = { papel: 0, jabon: 0, aseo: 0, agua: 0 };
    const mapaHoras: Record<string, any> = {};
    const datosPorHora: any[] = [];

    for (let h = 0; h < 24; h++) {
      const key = String(h).padStart(2, '0');
      const slot = { label: `${key}:00`, papel: 0, jabon: 0, aseo: 0, agua: 0, visitas: 0, hourKey: key };
      datosPorHora.push(slot);
      mapaHoras[key] = slot;
    }

    const banosFiltrados = (sedeActual?.restrooms ?? [])
      .filter(r => banoId === 'all' || r.id === Number(banoId));

    const coincidePeriodo = (ts: string) =>
      mes === 'custom' ? ts.startsWith(fechaSeleccionada) : ts.startsWith(mes);

    banosFiltrados.forEach(r => {
      r.visitas_historicas.forEach(v => {
        if (coincidePeriodo(v.timestamp)) {
          const h = parseInt(v.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
          if (h >= horaInicio && h <= horaFin) {
            totalVisitas++;
            const key = v.timestamp.split('T')[1]?.substring(0, 2);
            if (mapaHoras[key]) mapaHoras[key].visitas++;
          }
        }
      });
      r.clicks_historicos.forEach(c => {
        if (coincidePeriodo(c.timestamp)) {
          const h = parseInt(c.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
          if (h >= horaInicio && h <= horaFin) {
            totales[c.type]++;
            const key = c.timestamp.split('T')[1]?.substring(0, 2);
            if (mapaHoras[key]) mapaHoras[key][c.type]++;
          }
        }
      });
    });

    const datosFiltrados = datosPorHora.filter(d => {
      const h = parseInt(d.hourKey, 10);
      return h >= horaInicio && h <= horaFin;
    });

    // Baños enriquecidos para el insight
    const banosEnriquecidos = banosFiltrados.map(r => {
      const visitas = r.visitas_historicas.filter(v => {
        const h = parseInt(v.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
        if (mes === 'custom') {
          return ventanaPrefijos.includes(v.timestamp.substring(0, 13)) && h >= horaInicio && h <= horaFin;
        }
        return v.timestamp.startsWith(mes) && h >= horaInicio && h <= horaFin;
      });
      const clicks = r.clicks_historicos.filter(c => {
        const h = parseInt(c.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
        if (mes === 'custom') {
          return ventanaPrefijos.includes(c.timestamp.substring(0, 13)) && h >= horaInicio && h <= horaFin;
        }
        return c.timestamp.startsWith(mes) && h >= horaInicio && h <= horaFin;
      });
      const clicsLocales = { papel: 0, jabon: 0, aseo: 0, agua: 0 };
      clicks.forEach(c => { clicsLocales[c.type]++; });
      return { ...r, computed_visits: visitas.length, computed_clicks: clicsLocales };
    });

    return { datosFiltrados, totalVisitas, totalesBotones: totales, banosEnriquecidos };
  }, [sedeActual, fechaSeleccionada, mes, banoId, horaInicio, horaFin, ventanaPrefijos]);

  // ── Datos para GraficaComparativaSedes ───────────────────────────────────
  const datosPorSede = useMemo((): DatoPorSede[] => {
    return ciudadActual.sedes.map(sede => {
      let papel = 0, jabon = 0, aseo = 0, agua = 0, visitas = 0;

      sede.restrooms.forEach(r => {
        r.clicks_historicos.forEach(c => {
          const coincide = mes === 'custom' ? c.timestamp.startsWith(fechaSeleccionada) : c.timestamp.startsWith(mes);
          if (coincide) {
            const h = parseInt(c.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
            if (h >= horaInicio && h <= horaFin) {
              if (c.type === 'papel') papel++;
              else if (c.type === 'jabon') jabon++;
              else if (c.type === 'aseo') aseo++;
              else if (c.type === 'agua') agua++;
            }
          }
        });
        r.visitas_historicas.forEach(v => {
          const coincide = mes === 'custom' ? v.timestamp.startsWith(fechaSeleccionada) : v.timestamp.startsWith(mes);
          if (coincide) {
            const h = parseInt(v.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
            if (h >= horaInicio && h <= horaFin) visitas++;
          }
        });
      });

      const partes = sede.name.split(' - ');
      const nombreCorto = partes.length > 1 ? partes[1] : sede.name;
      return {
        name: nombreCorto.length > 20 ? nombreCorto.substring(0, 18) + '…' : nombreCorto,
        fullName: sede.name,
        papel, jabon, aseo, agua, visitas,
      };
    });
  }, [ciudadActual, fechaSeleccionada, mes, horaInicio, horaFin]);

  // ── Datos para GraficaComportamientoGeneral (últimos 30 días) ────────────
  const datosUltimos30Dias = useMemo((): DatoTendencia[] => {
    const resultado: DatoTendencia[] = [];
    const hoy = new Date();

    for (let diasAtras = 29; diasAtras >= 0; diasAtras--) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - diasAtras);
      const year  = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day   = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      let visitas = 0, pulsaciones = 0;
      ciudadActual.sedes.forEach(sede => {
        sede.restrooms.forEach(r => {
          visitas     += r.visitas_historicas.filter(v => v.timestamp.startsWith(dateStr)).length;
          pulsaciones += r.clicks_historicos.filter(c => c.timestamp.startsWith(dateStr)).length;
        });
      });

      resultado.push({ label: `${day}/${month}`, dateStr, visitas, pulsaciones });
    }

    return resultado;
  }, [ciudadActual]);

  // ── Narrativa de insight ──────────────────────────────────────────────────
  const narrativaInsight = useMemo(() => {
    const { datosFiltrados, totalesBotones } = datosAnalíticos;

    let totalVisitas = 0;
    let horaMaxVisitas = 12, maxVisitas = -1;
    datosFiltrados.forEach(d => {
      totalVisitas += d.visitas || 0;
      if ((d.visitas || 0) > maxVisitas) { maxVisitas = d.visitas; horaMaxVisitas = parseInt(d.hourKey, 10); }
    });

    const picoInicio = Math.max(0, horaMaxVisitas - 1);
    const picofin   = Math.min(23, horaMaxVisitas + 1);
    const rangoPico = `${String(picoInicio).padStart(2,'0')}:00 y las ${String(picofin).padStart(2,'0')}:00`;
    const horaPico  = `${String(horaMaxVisitas).padStart(2,'0')}:00`;

    let maxClic = -1, horaMaxClic = 12;
    const insumos = [
      { key: 'papel', label: 'peticiones de papel higiénico', singular: 'papel higiénico', count: totalesBotones.papel },
      { key: 'jabon', label: 'falta de jabón',                singular: 'jabón',           count: totalesBotones.jabon },
      { key: 'aseo',  label: 'alertas de aseo/limpieza',      singular: 'limpieza',        count: totalesBotones.aseo  },
      { key: 'agua',  label: 'reportes de olores o flujo',    singular: 'olores/agua',     count: totalesBotones.agua  },
    ];
    insumos.sort((a, b) => b.count - a.count);
    const insumoTop = insumos[0];

    datosFiltrados.forEach(d => {
      const val = d[insumoTop.key] || 0;
      if (val > maxClic) { maxClic = val; horaMaxClic = parseInt(d.hourKey, 10); }
    });
    const horaPicoInsumo = `${String(horaMaxClic).padStart(2,'0')}:00`;

    let nombreBanoTop = '', visitasBanoTop = -1;
    const banosFiltrados = (sedeActual?.restrooms ?? [])
      .filter(r => banoId === 'all' || r.id === Number(banoId));

    banosFiltrados.forEach(r => {
      const count = r.visitas_historicas.filter(v => {
        const coincide = mes === 'custom' ? v.timestamp.startsWith(fechaSeleccionada) : v.timestamp.startsWith(mes);
        const h = parseInt(v.timestamp.split('T')[1]?.substring(0, 2) || '0', 10);
        return coincide && h >= horaInicio && h <= horaFin;
      }).length;
      if (count > visitasBanoTop) { visitasBanoTop = count; nombreBanoTop = `${r.name} (${r.floor_name})`; }
    });

    const etiquetaPeriodo = mes === 'custom'
      ? formatearFechaEspanol(fechaSeleccionada)
      : mes === '2026-06' ? 'el mes de junio de 2026' : 'el mes de mayo de 2026';

    const contextoBano = banoId !== 'all' ? ` (Filtrado por el baño: **${nombreBanoTop}**)` : '';

    if (totalVisitas === 0 && insumoTop.count === 0) {
      return `Para **${etiquetaPeriodo}**, no se registraron flujos de tránsito peatonal ni llamados de servicio en los sensores. El estado operativo de la sede se reporta sin novedades.`;
    }

    const textoTrafico = totalVisitas > 0
      ? `se registró un flujo acumulado de **${totalVisitas} personas** en la sede, con pico máximo a las **${horaPico}** (rango **${rangoPico}**), destacando **${nombreBanoTop || 'baños principales'}** con **${visitasBanoTop} visitas**.`
      : `el tránsito peatonal fue imperceptible en los sensores.`;

    const textoSolicitud = insumoTop.count > 0
      ? `el requerimiento más recurrente fue **${insumoTop.label}** (${insumoTop.count} timbres), con mayor frecuencia alrededor de las **${horaPicoInsumo}**.`
      : `no se reportaron llamados por insumos o limpieza especial.`;

    const recomendacion = insumoTop.count > 0 && totalVisitas > 0
      ? `Se sugiere intensificar mantenimiento de **${insumoTop.singular}** antes de las **${horaPicoInsumo}** y durante el pico de tránsito de **${rangoPico}**.`
      : `La sede se mantiene en parámetros estables sin alertas pendientes.`;

    return `Durante **${etiquetaPeriodo}**${contextoBano}, ${textoTrafico} En cuanto a la gestión operativa, ${textoSolicitud} ${recomendacion}`;
  }, [datosAnalíticos, fechaSeleccionada, mes, banoId, sedeActual]);

  // ── Etiqueta de periodo para la gráfica izquierda ─────────────────────────
  const etiquetaPeriodo = mes === 'custom'
    ? formatearFechaEspanol(fechaSeleccionada)
    : mes === '2026-06' ? 'Junio 2026' : 'Mayo 2026';

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Filtros en cascada */}
      <PanelFiltros
        clienteActual={clienteActual}
        clienteId={clienteId}
        ciudadNombre={ciudadNombre}
        mes={mes}
        fechaSeleccionada={fechaSeleccionada}
        onClienteChange={setClienteId}
        onCiudadChange={setCiudadNombre}
        onMesChange={setMes}
        onFechaChange={setFechaSeleccionada}
        esSupervisor={esSupervisor}
        fechaMaxima={obtenerFechaHoy()}
      />

      {/* Header dinámico */}
      <div className="space-y-1">
        <p className="text-xs font-black text-[#830AD1] uppercase tracking-widest">Inteligencia de Datos Sodexo</p>
        <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">{sedeActual?.name}</h1>
      </div>

      {/* Gráficas principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GraficaComparativaSedes
          datos={datosPorSede}
          etiquetaPeriodo={etiquetaPeriodo}
        />
        <GraficaComportamientoGeneral
          datos={datosUltimos30Dias}
          nombreCiudad={ciudadActual.name}
        />
      </div>

      {/* Resumen e insight operativo */}
      <ResumenInsight narrativa={narrativaInsight} />

    </div>
  );
}