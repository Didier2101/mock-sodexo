import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bell, LogOut, Menu, X, Building2, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Estados de control para los nuevos modales solicitados por el usuario
  const [isClientsOpen, setIsClientsOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);

  if (!user) return null;

  const isSupervisor = user.role === 'SUPERVISOR_SEDE';
  const currentView = location.pathname === '/alerts' ? 'alerts' : 'dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Mock Data para el modal de Gestión de Clientes
  const mockClientsList = [
    { id: 2, name: "Bancolombia", city: "Bogotá, Medellín, Cali", activeLocations: 3, devices: 16, status: "Activo" },
  ];

  // Mock Data para el modal de Gestión de Permisos / Usuarios
  const mockUsersList = [
    { id: 1, name: "Didier Administrador", email: "didier@sodexo.com", role: "Administrador Global", scope: "Todos", status: "Activo" },
    { id: 2, name: "Juan Pérez", email: "juan.perez@sodexo.com", role: "Supervisor Local", scope: "Sede Dirección General Centro - Bancolombia", status: "Activo" },
    { id: 3, name: "Maria Restrepo", email: "maria.restrepo@sodexo.com", role: "Supervisor Local", scope: "Sede Poblado - Bancolombia", status: "Inactivo" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-slate-900 selection:bg-purple-200 relative">

      {/* TOP BAR UNIFICADO (Desktop & Móvil) */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Botón de Menú Hamburguesa */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all cursor-pointer text-slate-700 hover:text-slate-950 focus:outline-none"
          >
            <Menu size={18} />
          </button>

          {/* Logo Corporativo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#830AD1] flex items-center justify-center text-white font-black text-xs shadow-sm">.AI</div>
            <h1 className="text-base font-black tracking-tight text-slate-900 hidden xs:inline-block">
              nubeware<span className="text-[#830AD1] font-light">.ai</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Indicador de rol */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-[9px] bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-mono font-black uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#830AD1]" />
            {isSupervisor ? 'Supervisor Local' : 'Administrador Global'}
          </span>

          {/* Botón de Perfil en Cápsula Premium */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-98"
            >
              <div className="w-5 h-5 rounded-full bg-[#830AD1]/10 text-[#830AD1] flex items-center justify-center font-black text-[10px]">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-black text-slate-800 hidden sm:inline">Perfil</span>
            </button>

            {/* Dropdown del Perfil Flotante */}
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-11 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 w-72 z-50 animate-in fade-in slide-in-from-top-2 duration-200 space-y-3.5">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                    <div className="w-10 h-10 rounded-2xl bg-[#830AD1]/10 text-[#830AD1] flex items-center justify-center font-black text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <h4 className="font-black text-slate-900 text-xs truncate">{user.name}</h4>
                      <p className="text-[10px] text-gray-400 font-medium truncate">{user.email || 'operaciones@sodexo.com'}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px] text-slate-600 font-medium">
                    <div className="flex justify-between">
                      <span>Nivel de Acceso:</span>
                      <span className="font-bold text-slate-900">{isSupervisor ? 'Local' : 'Global (Multi-tenant)'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sede Asignada:</span>
                      <span className="font-bold text-slate-900">{isSupervisor ? 'Terminal 1 - Opain' : 'Todas'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estado Conexión:</span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> En línea (IoT)
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs py-2 rounded-xl transition-all cursor-pointer border border-red-100"
                  >
                    <LogOut size={13} />
                    Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* DRAWER / SIDEBAR COLAPSIBLE COMPACTO (Desliza desde la izquierda) */}
      {isDrawerOpen && (
        <>
          {/* Backdrop sombreado con desenfoque suave */}
          <div
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40 transition-opacity duration-200"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Panel Lateral Compacto */}
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-100 z-50 shadow-2xl flex flex-col justify-between p-5 animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#830AD1] flex items-center justify-center text-white font-black text-xs">.Ai</div>
                  <h1 className="text-sm font-black tracking-tight text-slate-900">nubeware<span className="text-[#830AD1] font-light">.ai</span></h1>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <nav className="space-y-1.5">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Operaciones</p>
                <button
                  onClick={() => {
                    navigate('/dashboard');
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentView === 'dashboard' ? 'bg-purple-50 text-purple-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <LayoutDashboard size={15} />
                  <span>Monitoreo IoT</span>
                </button>

                <button
                  onClick={() => {
                    navigate('/alerts');
                    setIsDrawerOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${currentView === 'alerts' ? 'bg-purple-50 text-purple-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <Bell size={15} />
                  <span>Central de Alertas</span>
                </button>

                <div className="h-px bg-slate-100 my-3" />
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Administración</p>

                <button
                  onClick={() => {
                    setIsClientsOpen(true);
                    setIsDrawerOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
                >
                  <Building2 size={15} />
                  <span>Gestión de Clientes</span>
                </button>

                <button
                  onClick={() => {
                    setIsPermissionsOpen(true);
                    setIsDrawerOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
                >
                  <KeyRound size={15} />
                  <span>Gestión de Permisos</span>
                </button>
              </nav>
            </div>

            <div className="text-[10px] text-gray-400 font-bold text-center border-t border-slate-100 pt-3">
              Sodexo Data Intelligent v1.4
            </div>
          </aside>
        </>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 md:p-5 pb-5 max-w-[1600px] mx-auto w-full">
        <Outlet />
      </main>

      {/* MODAL: GESTIÓN DE CLIENTES */}
      {isClientsOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="text-[#830AD1]" size={18} />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">Gestión de Clientes Corporativos</h3>
              </div>
              <button
                onClick={() => setIsClientsOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5">
              <p className="text-[11px] text-slate-500 font-medium">
                Panel maestro de clientes con telemetría integrada y sensores físicos asignados por Sodexo en la cuenta activa.
              </p>

              <div className="space-y-2.5">
                {mockClientsList.map(c => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{c.city} — {c.activeLocations} sedes activas</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="text-[10px] bg-purple-50 text-[#830AD1] font-black font-mono px-2 py-0.5 rounded">
                        {c.devices} IoT
                      </span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setIsClientsOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => alert('Módulo demostrativo: Para crear un nuevo inquilino multi-tenant, comuníquese con soporte de Sodexo.')}
                className="bg-[#830AD1] hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Agregar Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GESTIÓN DE PERMISOS */}
      {isPermissionsOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-[#830AD1]" size={18} />
                <h3 className="font-black text-sm text-slate-900 uppercase tracking-tight">Gestión de Usuarios y Permisos</h3>
              </div>
              <button
                onClick={() => setIsPermissionsOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5">
              <p className="text-[11px] text-slate-500 font-medium">
                Lista de personal autorizado con privilegios definidos para consulta de telemetría y resolución de alertas de timbres.
              </p>

              <div className="space-y-2.5">
                {mockUsersList.map(u => (
                  <div key={u.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900">{u.name}</h4>
                        <span className="text-[8px] bg-slate-200/80 text-slate-600 font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                          {u.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{u.email} — Cobertura: {u.scope}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${u.status === 'Activo' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-gray-400'
                        }`}>
                        {u.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setIsPermissionsOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => alert('Módulo de permisos corporativos: Privilegio reservado para Administradores de TI Sodexo.')}
                className="bg-[#830AD1] hover:bg-purple-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Asignar Supervisor
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
