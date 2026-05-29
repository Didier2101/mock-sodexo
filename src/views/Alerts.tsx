import { useState, useMemo } from 'react';
import { mockClients, getSimulatedTime } from '../data';
import { CheckCircle, MapPin, AlertCircle, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFilter } from '../context/FilterContext';

// 1. Tipado Estricto de Contratos de Datos
export interface AlertItem {
  id: number;
  client_id: number;
  client_name: string;
  sede_id: number;
  sede_name: string;
  floor_name: string;
  restroom_id: number;
  restroom_name: string;
  alert_type: 'PAPEL' | 'JABON' | 'ASEO' | 'AGUA';
  status: 'PENDIENTE' | 'ATENDIDO';
  created_at: string;
}

// Generación programática de un gran historial de alertas (~400 registros)
const generateAlerts = (): AlertItem[] => {
  const alertsList: AlertItem[] = [];
  let alertId = 1000;

  // Alertas activas pendientes (hoy) para la sede 101 y otras sedes
  alertsList.push({
    id: 501,
    client_id: 1,
    client_name: "Opain - El Dorado",
    sede_id: 101,
    sede_name: "Terminal 1 - Muelle Internacional",
    floor_name: "PISO 2 - SALAS DE ESPERA (A1)",
    restroom_id: 11,
    restroom_name: "Baño Zona Embarque A1",
    alert_type: "ASEO",
    status: "PENDIENTE",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  });

  alertsList.push({
    id: 504,
    client_id: 1,
    client_name: "Opain - El Dorado",
    sede_id: 101,
    sede_name: "Terminal 1 - Muelle Internacional",
    floor_name: "PISO 2 - SALAS DE ESPERA (B2)",
    restroom_id: 100,
    restroom_name: "Baño Zona Embarque B2",
    alert_type: "PAPEL",
    status: "PENDIENTE",
    created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString()
  });

  alertsList.push({
    id: 505,
    client_id: 1,
    client_name: "Opain - El Dorado",
    sede_id: 101,
    sede_name: "Terminal 1 - Muelle Internacional",
    floor_name: "PISO 1 - LLEGADAS",
    restroom_id: 101,
    restroom_name: "Baño Banda de Equipajes",
    alert_type: "JABON",
    status: "PENDIENTE",
    created_at: new Date(Date.now() - 1000 * 60 * 22).toISOString()
  });

  alertsList.push({
    id: 506,
    client_id: 1,
    client_name: "Opain - El Dorado",
    sede_id: 101,
    sede_name: "Terminal 1 - Muelle Internacional",
    floor_name: "PISO 3 - COMIDAS",
    restroom_id: 103,
    restroom_name: "Baño Zona de Comidas",
    alert_type: "AGUA",
    status: "PENDIENTE",
    created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString()
  });

  alertsList.push({
    id: 502,
    client_id: 1,
    client_name: "Opain - El Dorado",
    sede_id: 102,
    sede_name: "Terminal 2 - Puente Aéreo",
    floor_name: "PISO 1",
    restroom_id: 13,
    restroom_name: "Baño Público Pasillo Central",
    alert_type: "PAPEL",
    status: "PENDIENTE",
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  });

  alertsList.push({
    id: 503,
    client_id: 3,
    client_name: "Sodexo Corporativo",
    sede_id: 301,
    sede_name: "Sodexo - Centro de Distribución Calle 13",
    floor_name: "PISO 1",
    restroom_id: 31,
    restroom_name: "Baño Operarios Planta 1",
    alert_type: "JABON",
    status: "PENDIENTE",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  });

  // Generar alertas resueltas para todos los días individuales (0 a 30) de forma optimizada
  const timeRanges = Array.from({ length: 31 }, (_, i) => i);
  const alertTypes: ('PAPEL' | 'JABON' | 'ASEO' | 'AGUA')[] = ['PAPEL', 'JABON', 'ASEO', 'AGUA'];

  mockClients.forEach(client => {
    client.cities.forEach(city => {
      city.sedes.forEach(sede => {
        sede.restrooms.forEach((restroom, rIdx) => {
          timeRanges.forEach((daysAgo, tIdx) => {
            // Generar entre 1 y 3 alertas por día por baño para optimizar memoria
            const alertCount = 1 + ((rIdx + tIdx) % 3);
            for (let i = 0; i < alertCount; i++) {
              const hour = 7 + ((i + rIdx) % 13); // Horas de 7 a 19
              const minute = (i * 11) % 60;
              const type = alertTypes[(i + tIdx) % 4];

              // No duplicar las activas
              if (daysAgo === 0 && (
                (restroom.id === 11 && type === 'ASEO') ||
                (restroom.id === 13 && type === 'PAPEL') ||
                (restroom.id === 31 && type === 'JABON') ||
                (restroom.id === 100 && type === 'PAPEL') ||
                (restroom.id === 101 && type === 'JABON') ||
                (restroom.id === 103 && type === 'AGUA')
              )) {
                continue;
              }

              alertsList.push({
                id: alertId++,
                client_id: client.id,
                client_name: client.name,
                sede_id: sede.id,
                sede_name: sede.name,
                floor_name: restroom.floor_name,
                restroom_id: restroom.id,
                restroom_name: restroom.name,
                alert_type: type,
                status: "ATENDIDO",
                created_at: getSimulatedTime(daysAgo, hour, minute)
              });
            }
          });
        });
      });
    });
  });

  return alertsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const initialAlerts: AlertItem[] = generateAlerts();

// Genera un texto de despacho profesional en base a la afluencia y llamados del timbre desde la base de datos centralizada
const getProfessionalAlertInstruction = (alert: AlertItem) => {
  const client = mockClients.find(c => c.id === alert.client_id);
  let foundRestroom = null;
  if (client) {
    for (const city of client.cities) {
      const sede = city.sedes.find(s => s.id === alert.sede_id);
      if (sede) {
        foundRestroom = sede.restrooms.find(r => r.id === alert.restroom_id);
        if (foundRestroom) break;
      }
    }
  }

  const alertDateStr = alert.created_at.split('T')[0];
  let personas = 0;
  let timbres = 0;

  if (foundRestroom) {
    // Filtrar visitas exactas del día de la alerta
    const visitsOnDay = foundRestroom.visitas_historicas.filter(v => v.timestamp.startsWith(alertDateStr));
    personas = visitsOnDay.length;

    // Filtrar clics exactos de ese tipo de alerta en ese día
    const clickType = alert.alert_type.toLowerCase() as 'papel' | 'jabon' | 'aseo' | 'agua';
    const clicksOnDay = foundRestroom.clicks_historicos.filter(c => c.timestamp.startsWith(alertDateStr) && c.type === clickType);
    timbres = clicksOnDay.length;
  }

  // Fallback seguro en caso de que dé 0 por descalibración temporal de clicks simulados
  if (personas === 0) {
    personas = 35 + (alert.id % 30);
  }
  if (timbres === 0) {
    timbres = 2 + (alert.id % 5);
  }

  const insumo = alert.alert_type === 'PAPEL' ? 'papel' :
    alert.alert_type === 'JABON' ? 'jabón' :
      alert.alert_type === 'AGUA' ? 'agua' : 'aseo general';

  return `Por favor, enviar personal de aseo a la ubicación ${alert.floor_name} (${alert.restroom_name || 'Baño'}) ya que ingresaron ${personas} personas y han tocado ${timbres} veces el timbre de alerta por falta de ${insumo}.`;
};

export default function Alerts() {
  const { user } = useAuth();
  if (!user) return null;
  const isSupervisor = user.role === 'SUPERVISOR_SEDE';

  const { selectedDate, selectedHour } = useFilter();
  const [filterByShift, setFilterByShift] = useState<boolean>(true);

  // Estado único de la verdad (Base de datos local en memoria)
  const [rawAlerts, setRawAlerts] = useState<AlertItem[]>(initialAlerts);

  // Estados de paginación y límites
  const [pageSize, setPageSize] = useState<number>(20);
  const [visibleCount, setVisibleCount] = useState<number>(20);

  // 3. Resolución Dinámica de Nombre de Sede Asignada (Busca en la data maestra de Opain/Bancolombia)
  const assignedSedeName = useMemo(() => {
    if (!isSupervisor || !user.assignedSedeId) return null;
    for (const client of mockClients) {
      for (const city of client.cities) {
        const found = city.sedes.find(s => s.id === user.assignedSedeId);
        if (found) return found.name;
      }
    }
    return null;
  }, [isSupervisor, user.assignedSedeId]);

  // Lógica de cálculo de ventana de 12 horas
  const windowPrefixes = useMemo(() => {
    const endDate = new Date(`${selectedDate}T${String(selectedHour).padStart(2, '0')}:59:59`);
    const startDate = new Date(endDate.getTime() - 12 * 60 * 60 * 1000);
    return { startDate, endDate };
  }, [selectedDate, selectedHour]);

  // 4. Pipeline Reactivo Limpio: Las alertas se calculan solas cuando muta el estado o el usuario
  const filteredAlerts = useMemo(() => {
    let list = rawAlerts;

    if (isSupervisor && user.assignedSedeId) {
      list = list.filter(item => item.sede_id === user.assignedSedeId);
    }

    if (filterByShift) {
      list = list.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= windowPrefixes.startDate && itemDate <= windowPrefixes.endDate;
      });
    }

    return list;
  }, [rawAlerts, isSupervisor, user.assignedSedeId, filterByShift, windowPrefixes]);

  // Alertas recortadas según la paginación visible
  const slicedAlerts = useMemo(() => {
    return filteredAlerts.slice(0, visibleCount);
  }, [filteredAlerts, visibleCount]);

  // 5. Mutación de Estado Centralizada e Inmutable
  const handleResolve = (id: number) => {
    setRawAlerts(prevAlerts =>
      prevAlerts.map(alert =>
        alert.id === id ? { ...alert, status: 'ATENDIDO' as const } : alert
      )
    );
  };

  return (
    <div className="space-y-4">

      {/* ENCABEZADO DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight flex flex-wrap items-center gap-2">
            Despacho de Novedades IoT
            {isSupervisor && (
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md font-mono font-black uppercase tracking-wider">
                Filtro Local: {assignedSedeName || `Sede ID: ${user.assignedSedeId}`}
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500">
            {isSupervisor
              ? `Monitoreando incidencias en tiempo real para tu asignación operativa actual.`
              : 'Historial macro y panel global de alertas generadas por sensores IoT en todas las cuentas activas.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
          {/* Interruptor de Filtro de Turno de 12h */}
          <button
            onClick={() => setFilterByShift(prev => !prev)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${filterByShift
                ? 'bg-purple-950 border-purple-900 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
          >
            <Radio size={14} className={filterByShift ? 'text-purple-300 animate-pulse' : 'text-slate-400'} />
            <span>Turno Activo (12h)</span>
          </button>

          {/* SELECTOR DE PAGINACIÓN */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500">Ver:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const val = Number(e.target.value);
                setPageSize(val);
                setVisibleCount(val);
              }}
              className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value={5}>5 alertas</option>
              <option value={10}>10 alertas</option>
              <option value={20}>20 alertas</option>
              <option value={50}>50 alertas</option>
            </select>
          </div>
        </div>
      </div>

      {/* VISTA MÓVIL (Tarjetas de Acción) */}
      <div className="space-y-3 md:hidden">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-xs">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-sm font-bold text-slate-800">Operación sin incidencias</p>
            <p className="text-xs text-gray-400 mt-1">Los sensores de las botoneras registran estado conforme.</p>
          </div>
        ) : (
          slicedAlerts.map((alert) => {
            const isPending = alert.status === 'PENDIENTE';
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border bg-white shadow-sm space-y-3 transition-all ${isPending ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-tight text-purple-700 font-extrabold block">
                      Cuenta: {alert.client_name}
                    </span>
                    <h4 className="font-black text-sm text-slate-900 mt-0.5">{alert.sede_name}</h4>
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1 font-medium">
                      <MapPin size={11} className="text-purple-600" /> {alert.floor_name}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 font-black text-[9px] rounded-sm tracking-wide ${alert.alert_type === 'JABON' ? 'bg-amber-100 text-amber-800' :
                      alert.alert_type === 'PAPEL' ? 'bg-blue-100 text-blue-800' :
                        alert.alert_type === 'AGUA' ? 'bg-cyan-100 text-cyan-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                    FALTA {alert.alert_type}
                  </span>
                </div>

                {isPending && (
                  <div className="bg-amber-50 rounded-xl p-2.5 flex items-start gap-1.5 border border-amber-100 border-l-4 border-l-amber-500">
                    <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-900 leading-tight">
                      <strong>Instrucción de Despacho:</strong> {getProfessionalAlertInstruction(alert)}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 font-medium">
                    Reg: {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>

                  {isPending ? (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="bg-[#830AD1] hover:bg-purple-700 text-white font-extrabold text-xs px-4 py-1.5 rounded-full transition-all shadow-xs"
                    >
                      Marcar Surtido
                    </button>
                  ) : (
                    <span className="flex items-center text-green-600 font-bold text-xs gap-1">
                      <CheckCircle size={13} fill="currentColor" className="text-white" /> Atendido
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* VISTA ESCRITORIO (Tabla Estructural Corporativa) */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={36} />
            <p className="text-sm font-bold text-slate-800">Operación limpia y sin novedades</p>
            <p className="text-xs text-gray-400 mt-1">No hay alertas de sensores físicos desatendidas en este panel.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="p-3">Cuenta Atendida</th>
                <th className="p-3">Sede Corporativa</th>
                <th className="p-3">Ubicación Interna</th>
                <th className="p-3">Sensor Alerta</th>
                <th className="p-3">Hora Reporte</th>
                <th className="p-3 text-right">Estatus / Despacho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
              {slicedAlerts.map((alert) => {
                const isPending = alert.status === 'PENDIENTE';
                return (
                  <tr key={alert.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{alert.client_name}</td>
                    <td className="p-3 font-semibold text-slate-800">{alert.sede_name}</td>
                    <td className="p-3 text-gray-500 font-medium">{alert.floor_name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${isPending ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {alert.alert_type}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 font-medium">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </td>
                    <td className="p-3 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-3 text-left">
                          <span className="text-[10px] text-amber-900 bg-amber-50/70 border border-amber-200/80 px-2.5 py-1.5 rounded-xl font-medium max-w-sm leading-tight flex items-start gap-1.5 shadow-2xs">
                            <AlertCircle size={12} className="text-amber-600 shrink-0 mt-0.5" />
                            <span>{getProfessionalAlertInstruction(alert)}</span>
                          </span>
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="bg-[#830AD1] hover:bg-purple-700 text-white font-bold px-4 py-1.5 rounded-full transition-all shadow-xs shrink-0 self-center"
                          >
                            Resolver
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center text-green-600 font-bold gap-1 pr-3">
                          <CheckCircle size={14} /> Atendido en Planta
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* BOTÓN VER MÁS */}
      {visibleCount < filteredAlerts.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={() => setVisibleCount(prev => prev + pageSize)}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-800 font-bold text-xs rounded-xl shadow-xs hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-2 hover:border-slate-300"
          >
            Ver más alertas
          </button>
        </div>
      )}

    </div>
  );
}