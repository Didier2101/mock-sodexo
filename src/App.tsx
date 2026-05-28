import { useState } from 'react';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Alerts from './views/Alerts';
import { LayoutDashboard, Bell, LogOut, Radio } from 'lucide-react';

export default function App() {
  // Estado adaptado a la estructura real de Sodexo y nubeware.ai
  const [user, setUser] = useState<{ name: string; role: 'GERENTE_GLOBAL' | 'SUPERVISOR_SEDE'; assignedSedeId?: number } | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'alerts'>('dashboard');

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  const isSupervisor = user.role === 'SUPERVISOR_SEDE';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-slate-900 selection:bg-purple-200">
      
      {/* HEADER MÓVIL (Optimizado para el supervisor en planta) */}
      <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#830AD1] flex items-center justify-center text-white font-black text-xs">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              sodexo.io 
              {isSupervisor && <Radio size={10} className="text-amber-500 animate-pulse" />}
            </h1>
            <p className="text-[9px] text-purple-600 font-bold tracking-wide uppercase">
              {isSupervisor ? 'Supervisor Local' : 'Gerente Global'}
            </p>
          </div>
        </div>
        <button onClick={() => setUser(null)} className="text-gray-400 hover:text-red-500 p-1">
          <LogOut size={18} />
        </button>
      </header>

      {/* SIDEBAR ESCRITORIO (Estilo UI Limpia de Nu) */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col justify-between sticky top-0 h-screen p-6">
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#830AD1] flex items-center justify-center text-white font-black text-xs shadow-sm">Nu</div>
              <h1 className="text-base font-black tracking-tight text-slate-900">sodexo<span className="text-[#830AD1] font-light">.io</span></h1>
            </div>
          </div>
          
          <nav className="space-y-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'dashboard' ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Monitoreo IoT</span>
            </button>

            <button
              onClick={() => setCurrentView('alerts')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                currentView === 'alerts' ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:bg-gray-50 hover:text-slate-900'
              }`}
            >
              <Bell size={18} />
              <span>Central de Alertas</span>
            </button>
          </nav>
        </div>

        {/* Info del operador logueado */}
        <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
            <p className="text-[9px] text-gray-400 font-bold truncate tracking-tight uppercase">
              {isSupervisor ? 'Sede Asignada 101' : 'Acceso Global'}
            </p>
          </div>
          <button onClick={() => setUser(null)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* CONTENEDOR CENTRAL RESPONSIVO */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 max-w-5xl mx-auto w-full">
        {currentView === 'dashboard' ? (
          <Dashboard user={user} />
        ) : (
          <Alerts user={user} />
        )}
      </main>

      {/* BOTTOM NAV BAR (Exclusiva para interacción ágil en móviles) */}
      <nav className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-4 z-50 shadow-lg">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${currentView === 'dashboard' ? 'text-[#830AD1] font-bold' : 'text-gray-400'}`}
        >
          <LayoutDashboard size={20} />
          <span className="text-[10px]">Monitoreo</span>
        </button>
        
        <button
          onClick={() => setCurrentView('alerts')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${currentView === 'alerts' ? 'text-[#830AD1] font-bold' : 'text-gray-400'}`}
        >
          <Bell size={20} />
          <span className="text-[10px]">Alertas</span>
        </button>
      </nav>

    </div>
  );
}