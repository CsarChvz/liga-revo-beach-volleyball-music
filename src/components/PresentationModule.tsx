import React from 'react';
import { Play, Square, FastForward, Radio } from 'lucide-react';
import type { AudioTrack, PlayingState } from '../types/audio';

interface PresentationModuleProps {
  tracks: AudioTrack[];
  playingState: PlayingState;
  onPlayPresentation: () => void;
  onTransitionToGame: () => void;
  onSelectTrack: (track: AudioTrack) => void;
}

export const PresentationModule: React.FC<PresentationModuleProps> = ({
  tracks,
  playingState,
  onPlayPresentation,
  onTransitionToGame,
  onSelectTrack,
}) => {
  const isModuleActive = playingState.category === 'presentation' && playingState.isPlaying;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="bg-sky-500/20 text-sky-400 p-2 rounded-xl border border-sky-500/30">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">1. PRESENTACIÓN Y CALENTAMIENTO</h2>
              <p className="text-xs text-slate-400">Música continua pre-partido</p>
            </div>
          </div>
          <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded-md border border-slate-700">
            Tecla [P] / [T]
          </span>
        </div>

        {/* Track selector dropdown */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Pista Seleccionada:
          </label>
          <select
            onChange={(e) => {
              const selected = tracks.find((t) => t.id === e.target.value);
              if (selected) onSelectTrack(selected);
            }}
            className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-sky-500 font-medium"
          >
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} {t.artist ? `— ${t.artist}` : ''} ({t.sourceType.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main DJ Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        <button
          onClick={onPlayPresentation}
          className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg ${
            isModuleActive && !playingState.isFading
              ? 'bg-sky-500 text-slate-950 ring-4 ring-sky-500/30 animate-pulse'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
          }`}
        >
          <Play className="w-5 h-5 fill-current" />
          <span>PLAY PRESENTACIÓN [P]</span>
        </button>

        <button
          onClick={onTransitionToGame}
          disabled={!isModuleActive}
          className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg ${
            playingState.isFading && isModuleActive
              ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 animate-pulse'
              : isModuleActive
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
          }`}
        >
          {playingState.isFading && isModuleActive ? (
            <FastForward className="w-5 h-5 animate-spin" />
          ) : (
            <Square className="w-5 h-5" />
          )}
          <span>
            {playingState.isFading && isModuleActive
              ? `FADE 3S (${playingState.fadeTimeRemaining.toFixed(1)}s)`
              : 'TRANSICIÓN A JUEGO [T]'}
          </span>
        </button>
      </div>
    </div>
  );
};
