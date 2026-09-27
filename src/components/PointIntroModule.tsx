import React from 'react';
import { Play, Flame, Disc, Shuffle } from 'lucide-react';
import type { AudioTrack, PlayingState } from '../types/audio';

interface PointIntroModuleProps {
  tracks: AudioTrack[];
  playingState: PlayingState;
  onNextPointIntro: () => void;
  onSelectTrack: (track: AudioTrack) => void;
}

export const PointIntroModule: React.FC<PointIntroModuleProps> = ({
  tracks,
  playingState,
  onNextPointIntro,
  onSelectTrack,
}) => {
  const isActive = playingState.category === 'point_intros' && playingState.isPlaying;
  const progressPercent = isActive ? (playingState.currentTime / 12) * 100 : 0;
  const isFadingPhase = isActive && playingState.currentTime >= 9.0;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden">
      
      {/* Top Banner & Info */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-amber-500/20 text-amber-400 p-2 rounded-xl border border-amber-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">2. ENTREPUNTOS (12s INTROS)</h2>
              <p className="text-xs text-slate-400">La Chona, Meneadito • 9s Play + 3s Fade Auto</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30">
            [Espacio]
          </span>
        </div>

        {/* Track Selector & Mode */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Lista de Intros Pegajosas ({tracks.length}):
            </label>
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              <Shuffle className="w-3 h-3" /> Modo Aleatorio
            </span>
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTrack(t)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                  playingState.trackId === t.id && isActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <span className="truncate flex items-center gap-2">
                  <Disc className={`w-3.5 h-3.5 ${playingState.trackId === t.id && isActive ? 'animate-spin text-amber-400' : 'text-slate-500'}`} />
                  {t.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{t.duration || 12}s</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Live Timer Progress */}
      {isActive && (
        <div className="mb-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className={`font-bold ${isFadingPhase ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              {isFadingPhase ? 'FADE OUT AUTO (3s)...' : 'REPRODUCCIÓN (9s)'}
            </span>
            <span className="text-slate-300 font-bold">
              {playingState.currentTime.toFixed(1)}s / 12.0s
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                isFadingPhase ? 'bg-gradient-to-r from-amber-500 to-red-500 animate-pulse' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Giant DJ Trigger Pad */}
      <button
        onClick={onNextPointIntro}
        className={`w-full py-5 px-6 rounded-2xl font-black text-lg sm:text-xl tracking-wider uppercase transition-all transform active:scale-95 shadow-2xl flex items-center justify-center space-x-3 ${
          isActive
            ? 'bg-amber-500 text-slate-950 shadow-amber-500/40 ring-4 ring-amber-400 animate-pulse-ring'
            : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-500/20'
        }`}
      >
        <Play className="w-7 h-7 fill-current" />
        <span>SIGUIENTE PUNTO [ESPACIO]</span>
      </button>

    </div>
  );
};
