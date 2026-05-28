import { useState, useMemo } from 'react';
import { mockClients } from '../data'; // Importación segura desde tu motor de datos central
import { CheckCircle, MapPin, Radio } from 'lucide-react';

// 1. Tipado Estricto de Contratos de Datos
export interface AlertItem {
  id: number;
  client_id: number;
  client_name: string;
  sede_id: number;
  sede_name: string;
  floor_name: string;
  alert_type: 'PAPEL' | 'JABON' | 'ASEO' | 'AGUA';
  status: 'PENDIENTE' | 'ATENDIDO';
  created_at: string;
}

interface AlertsProps {
  user: { 
    name: string; 
    role: 'GERENTE_GLOBAL' | 'SUPERVISOR_SEDE'; 
    assignedSedeId?: number; 
  };
}

// 2. Mock de Persistencia de Alertas en Caliente (Simulando Infraestructura de Base de Datos)
const initialAlerts: AlertItem[] = [
  {
    id: 501,
    client_id: 1,
    client_name: "Opain - El Dorado",
    sede_id: 101,
    sede_name: "Terminal 1 - Muelle Internacional",
    floor_name: "PISO 2 - SALAS DE ESPERA",
    alert_type: "ASEO",
    status: "PENDIENTE",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString() // Hace 12 minutos
  },
  {
    id: 502,
    client_id: 1,
    client_name: "Opain - El Dorado",
    sede_id: 102,
    sede_name: "Terminal 2 - Puente Aéreo",
    floor_name: "PISO 1",
    alert_type: "PAPEL",
    status: "PENDIENTE",
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString() // Hace 25 minutos
  },
  {
    id: 503,
    client_id: 3,
    client_name: "Sodexo Corporativo",
    sede_id: 301,
    sede_name: "Sodexo - Centro de Distribución Calle 13",
    floor_name: "PISO 1",
    alert_type: "JABON",
    status: "PENDIENTE",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  }
];

export default function Alerts({ user }: AlertsProps) {
  const isSupervisor = user.role === 'SUPERVISOR_SEDE';
  
  // Estado único de la verdad (Base de datos local en memoria)
  const [rawAlerts, setRawAlerts] = useState<AlertItem[]>(initialAlerts);

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

  // 4. Pipeline Reactivo Limpio: Las alertas se calculan solas cuando muta el estado o el usuario
  const filteredAlerts = useMemo(() => {
    if (isSupervisor && user.assignedSedeId) {
      return rawAlerts.filter(item => item.sede_id === user.assignedSedeId);
    }
    return rawAlerts;
  }, [rawAlerts, isSupervisor, user.assignedSedeId]);

  // 5. Mutación de Estado Centralizada e Inmutable
  const handleResolve = (id: number) => {
    setRawAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === id ? { ...alert, status: 'ATENDIDO' as const } : alert
      )
    );
  };

  return (
    <div className="space-y-6">
      
      {/* ENCABEZADO DINÁMICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          filteredAlerts.map((alert) => {
            const isPending = alert.status === 'PENDIENTE';
            return (
              <div 
                key={alert.id} 
                className={`p-4 rounded-2xl border bg-white shadow-sm space-y-3 transition-all ${
                  isPending ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-green-500'
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
                  
                  <span className={`px-2 py-0.5 font-black text-[9px] rounded-sm tracking-wide ${
                    alert.alert_type === 'JABON' ? 'bg-amber-100 text-amber-800' :
                    alert.alert_type === 'PAPEL' ? 'bg-blue-100 text-blue-800' :
                    alert.alert_type === 'AGUA' ? 'bg-cyan-100 text-cyan-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    FALTA {alert.alert_type}
                  </span>
                </div>

                {isPending && isSupervisor && (
                  <div className="bg-amber-50 rounded-xl p-2.5 flex items-start gap-1.5 border border-amber-100">
                    <Radio size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-900 leading-tight">
                      <strong>Frecuencia Radial de Guardia:</strong> Indique al auxiliar de aseo que asista de inmediato al <strong>{alert.floor_name}</strong> con insumos de <strong>{alert.alert_type}</strong>.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 font-medium">
                    Reg: {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
      <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
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
                <th className="p-4">Cuenta Atendida</th>
                <th className="p-4">Sede Corporativa</th>
                <th className="p-4">Ubicación Interna</th>
                <th className="p-4">Sensor Alerta</th>
                <th className="p-4">Hora Reporte</th>
                <th className="p-4 text-right">Estatus / Despacho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-slate-700">
              {filteredAlerts.map((alert) => {
                const isPending = alert.status === 'PENDIENTE';
                return (
                  <tr key={alert.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{alert.client_name}</td>
                    <td className="p-4 font-semibold text-slate-800">{alert.sede_name}</td>
                    <td className="p-4 text-gray-500 font-medium">{alert.floor_name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        isPending ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {alert.alert_type}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 font-medium">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-2">
                          {isSupervisor && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-md font-medium border border-amber-100 flex items-center gap-1 animate-pulse">
                              <Radio size={12} /> Ordenar Limpieza por Radio
                            </span>
                          )}
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="bg-[#830AD1] hover:bg-purple-700 text-white font-bold px-4 py-1.5 rounded-full transition-all shadow-xs"
                          >
                            Resolver
                          </button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center text-green-600 font-bold gap-1 pr-4">
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

    </div>
  );
}