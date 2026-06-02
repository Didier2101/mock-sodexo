import { Sparkles, BrainCircuit, ChevronRight } from 'lucide-react';

interface PropsResumenInsight {
  narrativa: string; // Texto con marcado **bold**
}

export default function ResumenInsight({ narrativa }: PropsResumenInsight) {
  return (
    <div className="bg-gradient-to-br from-[#830AD1]/5 via-[#830AD1]/[0.02] to-white border border-[#830AD1]/15 p-5 rounded-2xl shadow-xs transition-all hover:shadow-sm space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-[#830AD1]/10 rounded-xl text-[#830AD1]">
          <Sparkles size={18} className="animate-pulse" />
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            Resumen Inteligente y Recomendación Operativa
          </h3>
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest flex items-center gap-1 mt-0.5">
            <BrainCircuit size={9} className="text-gray-400" />
            Análisis descriptivo del día
          </p>
        </div>
        <ChevronRight size={14} className="text-[#830AD1]/40 shrink-0" />
      </div>

      <p
        className="text-xs text-slate-700 leading-relaxed font-medium"
        dangerouslySetInnerHTML={{
          __html: narrativa.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-black">$1</strong>')
        }}
      />
    </div>
  );
}
