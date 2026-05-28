import { useState } from 'react';
import { Smartphone, ShieldCheck, Zap } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: { name: string; role: 'GERENTE_GLOBAL' | 'SUPERVISOR_SEDE'; assignedSedeId?: number }) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('gerente@sodexo.com');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'GERENTE_GLOBAL' | 'SUPERVISOR_SEDE'>('GERENTE_GLOBAL');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'GERENTE_GLOBAL') {
      onLoginSuccess({ 
        name: 'Carlos Mendoza', 
        role: 'GERENTE_GLOBAL' 
      });
    } else {
      onLoginSuccess({ 
        name: 'Sonia Restrepo', 
        role: 'SUPERVISOR_SEDE',
        assignedSedeId: 101 // Asignada a Bancolombia Sede Centro automáticamente
      });
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900 selection:bg-purple-200">
      
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Propietario Nubeware.ai - Cliente Principal Sodexo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#830AD1] flex items-center justify-center text-white font-black text-sm shadow-md shadow-purple-200">
                Nu
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                sodexo<span className="text-[#830AD1] font-light">.io</span>
              </span>
            </div>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-mono font-medium">
              by nubeware.ai
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-black text-slate-950 tracking-tight">
              Control de Operaciones
            </h2>
            <p className="text-sm text-gray-500">
              Plataforma exclusiva para personal de operaciones y gestión de facilidades de Sodexo.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              
              <div>
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Usuario Institucional
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-slate-900 rounded-2xl focus:outline-none focus:border-[#830AD1] focus:bg-white transition-all text-sm font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-slate-900 rounded-2xl focus:outline-none focus:border-[#830AD1] focus:bg-white transition-all text-sm font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 font-bold uppercase tracking-wider block mb-1">
                  Perfil Operativo
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-slate-800 rounded-2xl focus:outline-none focus:border-[#830AD1] focus:bg-white transition-all text-sm font-semibold appearance-none cursor-pointer"
                    value={role}
                    onChange={(e) => {
                      const val = e.target.value as 'GERENTE_GLOBAL' | 'SUPERVISOR_SEDE';
                      setRole(val);
                      setEmail(val === 'GERENTE_GLOBAL' ? 'gerente@sodexo.com' : 'supervisor.centro@sodexo.com');
                    }}
                  >
                    <option value="GERENTE_GLOBAL">Gerente Global (Monitoreo Total)</option>
                    <option value="SUPERVISOR_SEDE">Supervisor de Sede (Despacho por Radio)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#830AD1] hover:bg-purple-700 text-white font-bold rounded-full shadow-lg shadow-purple-100 transition-all text-sm tracking-wide"
              >
                Ingresar al Panel
              </button>
            </div>

          </form>

          <p className="text-[11px] text-center text-gray-400">
            Propiedad tecnológica de nubeware.ai para Sodexo Corp.
          </p>
        </div>
      </div>

      {/* COLUMNA DERECHA: SECCIÓN EXPLICATIVA */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-950 via-[#1c0036] to-black p-16 items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-20%] w-[600px] h-[600px] rounded-full bg-[#830AD1]/15 blur-[120px]" />
        
        <div className="max-w-xl w-full space-y-10 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-purple-300 backdrop-blur-md">
            <Zap size={12} className="fill-current" />
            Infraestructura Inteligente
          </span>

          <div className="space-y-4">
            <h3 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Controla las cuentas de tus clientes mediante <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Alertas IoT</span>.
            </h3>
            <p className="text-base text-purple-200/70 font-medium">
              Supervisa contratos clave como Bancolombia u Opain. Detecta anomalías críticas en tiempo real y despacha personal de limpieza en segundos vía radiofrecuencia.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
              <Smartphone className="text-purple-400 mb-2" size={20} />
              <h5 className="text-white font-bold text-sm">Despacho Inmediato</h5>
              <p className="text-xs text-purple-200/50">Recibe la alerta de insumos e instruye inmediatamente a las cuadrillas en campo.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-1">
              <ShieldCheck className="text-purple-400 mb-2" size={20} />
              <h5 className="text-white font-bold text-sm">Métricas Globales</h5>
              <p className="text-xs text-purple-200/50">Análisis macro de afluencia para optimizar presupuestos de mantenimiento.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}