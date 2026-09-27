import React from 'react';
import { Timer, Play, Music2 } from 'lucide-react';
import type { AudioTrack, PlayingState } from '../types/audio';

interface TimeoutModuleProps {
  tracks: AudioTrack[];
  playingState: PlayingState;
  onTechnicalTimeout: () => void;
  onSelectTrack: (track: AudioTrack) => void;
}

export const TimeoutModule: React.FC<TimeoutModuleProps> = ({
  tracks,
  playingState,
  onTechnicalTimeout,
  onSelectTrack,
}) => {
  const isActive = playingState.category === 'technical_timeouts' && playingState.isPlaying;
  const progressPercent = isActive ? (playingState.currentTime / 60) * 100 : 0;
  const isFadingPhase = isActive && playingState.currentTime >= 50.0;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-emerald-500/20 text-emerald-400 p-2 rounded-xl border border-emerald-500/30">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">3. TIEMPOS TÉCNICOS & FUERA (1 MIN)</h2>
              <p className="text-xs text-slate-400">La Macarena • 50s Play + 10s Fade Auto</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
            Tecla [E]
          </span>
        </div>

        {/* Track Selector */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Pistas de Tiempo Fuera / Animación:
          </label>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {tracks.map((t) => (
              <button
                key={t.id}
                onClick={() => onSelectTrack(t)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between border ${
                  playingState.trackId === t.id && isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
                    : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <span className="truncate flex items-center gap-2">
                  <Music2 className={`w-3.5 h-3.5 ${playingState.trackId === t.id && isActive ? 'animate-bounce text-emerald-400' : 'text-slate-500'}`} />
                  {t.title}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">60s</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Live Countdown */}
      {isActive && (
        <div className="mb-4 bg-slate-950 border border-slate-800 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className={`font-bold ${isFadingPhase ? 'text-indigo-400 animate-pulse' : 'text-emerald-400'}`}>
              {isFadingPhase ? 'FADE OUT GRADUAL (10s)...' : 'TIEMPO FUERA ACTIVO (50s)'}
            </span>
            <span className="text-slate-300 font-bold">
              {playingState.currentTime.toFixed(1)}s / 60.0s
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                isFadingPhase ? 'bg-gradient-to-r from-emerald-500 to-indigo-500 animate-pulse' : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Main Trigger Pad */}
      <button
        onClick={onTechnicalTimeout}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg tracking-wider uppercase transition-all transform active:scale-95 shadow-xl flex items-center justify-center space-x-3 ${
          isActive
            ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400 animate-pulse'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
        }`}
      >
        <Play className="w-6 h-6 fill-current" />
        <span>TIEMPO TÉCNICO (1 MIN) [E]</span>
      </button>

    </div>
  );
};
