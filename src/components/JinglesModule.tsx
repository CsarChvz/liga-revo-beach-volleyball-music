import React from 'react';
import { Zap, ShieldAlert, Volume2 } from 'lucide-react';
import type { PlayingState } from '../types/audio';

interface JinglesModuleProps {
  playingState: PlayingState;
  onSuperSpike: () => void;
  onMonsterBlock: () => void;
}

export const JinglesModule: React.FC<JinglesModuleProps> = ({
  playingState,
  onSuperSpike,
  onMonsterBlock,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-rose-500/20 text-rose-400 p-2 rounded-xl border border-rose-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">4. JINGLES & EFECTOS INSTANTÁNEOS</h2>
              <p className="text-xs text-slate-400">Ducking Automático (Atenúa la música de fondo)</p>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">
            Teclas [Q] / [W]
          </span>
        </div>

        {playingState.jingleActive && (
          <div className="mb-4 bg-rose-950/70 border border-rose-500/40 rounded-xl p-2.5 flex items-center justify-between animate-pulse">
            <span className="text-xs font-bold text-rose-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 animate-bounce" /> EFECTO EN VIVO ACTIVO
            </span>
            <span className="text-[10px] font-mono bg-rose-500 text-slate-950 font-black px-2 py-0.5 rounded">
              PRIORIDAD ALTA
            </span>
          </div>
        )}
      </div>

      {/* Giant Action Pads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        
        {/* Super Spike Pad */}
        <button
          onClick={onSuperSpike}
          className="group relative overflow-hidden bg-gradient-to-br from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white p-5 rounded-2xl shadow-xl shadow-rose-600/30 transition-all transform active:scale-95 text-left border border-rose-400/40"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="bg-black/40 text-rose-200 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-white/10">
              TECLA [Q]
            </span>
            <Zap className="w-7 h-7 text-amber-300 group-hover:scale-125 transition-transform" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1 uppercase">
            SUPER SPIKE
          </h3>
          <p className="text-xs text-rose-100/80 font-medium">
            Remate espectacular instantáneo
          </p>
        </button>

        {/* Monster Block Pad */}
        <button
          onClick={onMonsterBlock}
          className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white p-5 rounded-2xl shadow-xl shadow-purple-600/30 transition-all transform active:scale-95 text-left border border-purple-400/40"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="bg-black/40 text-purple-200 text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-white/10">
              TECLA [W]
            </span>
            <ShieldAlert className="w-7 h-7 text-indigo-200 group-hover:scale-125 transition-transform" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1 uppercase">
            MONSTER BLOCK
          </h3>
          <p className="text-xs text-purple-100/80 font-medium">
            Bloqueo defensivo espectacular
          </p>
        </button>

      </div>

    </div>
  );
};
