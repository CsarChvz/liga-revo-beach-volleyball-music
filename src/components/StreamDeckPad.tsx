import React, { useState } from 'react';
import { Play, Disc, ArrowUp, ArrowDown, Trash2, ListMusic, ChevronDown, ChevronUp, Repeat, Infinity as InfinityIcon } from 'lucide-react';
import type { CategoryPlaylistState, PlayingState, PlaylistCategory, AudioTrack } from '../types/audio';

interface StreamDeckPadProps {
  categoryState: CategoryPlaylistState;
  playingState: PlayingState;
  hotkeyLabel: string;
  padTheme: 'sky' | 'amber' | 'emerald' | 'rose' | 'purple' | 'green' | 'orange';
  /** 'trigger' = one-shot play & advance (default). 'continuous' = toggle auto-advance whole playlist. 'loop' = toggle infinite loop of active track. */
  mode?: 'trigger' | 'continuous' | 'loop';
  /** Big, prominent label for the pad (e.g. "TECHNICAL TIME-OUT"), shown above the OLED screen. */
  padLabel: string;
  /** For 'continuous'/'loop' modes: whether the toggle is currently ON. */
  isToggleActive?: boolean;
  onTriggerPlay: () => void;
  onSelectTrackIndex: (category: PlaylistCategory, index: number) => void;
  onReorderTrack: (category: PlaylistCategory, fromIdx: number, toIdx: number) => void;
  onRemoveTrack: (category: PlaylistCategory, trackId: string) => void;
  subtitleInfo?: string;
}

function formatElapsed(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatElapsedLong(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins} min ${secs.toString().padStart(2, '0')} s`;
}

const StreamDeckPadComponent: React.FC<StreamDeckPadProps> = ({
  categoryState,
  playingState,
  hotkeyLabel,
  padTheme,
  mode = 'trigger',
  padLabel,
  isToggleActive = false,
  onTriggerPlay,
  onSelectTrackIndex,
  onReorderTrack,
  onRemoveTrack,
  subtitleInfo,
}) => {
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const isActive = playingState.category === categoryState.category && playingState.isPlaying;

  // NOTE: categoryState.currentIndex already points to the NEXT track to play (it's advanced
  // the moment playback starts), so while a track is actively playing we must resolve the
  // real "now playing" track via playingState.trackId instead of currentIndex directly.
  const tracks = categoryState.tracks;
  const playingIdx = isActive ? tracks.findIndex((t) => t.id === playingState.trackId) : -1;
  const displayIndex = playingIdx >= 0 ? playingIdx : categoryState.currentIndex;
  const currentTrack: AudioTrack | undefined = tracks[displayIndex] || tracks[0];
  const nextIndex = playingIdx >= 0 ? categoryState.currentIndex : (tracks.length > 0 ? (categoryState.currentIndex + 1) % tracks.length : 0);
  const nextTrack: AudioTrack | undefined = tracks.length > 1 ? tracks[nextIndex] : undefined;

  // Theme color presets
  const themeClasses = {
    sky: {
      border: 'border-sky-500/50',
      activeRing: 'ring-4 ring-sky-400 shadow-sky-500/50',
      btnBg: 'bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950',
      textAccent: 'text-sky-400',
      badgeBg: 'bg-sky-950 text-sky-300 border-sky-500/30',
      activeBg: 'bg-sky-500/20 text-sky-200 border-sky-500/60',
    },
    amber: {
      border: 'border-amber-500/50',
      activeRing: 'ring-4 ring-amber-400 shadow-amber-500/50',
      btnBg: 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950',
      textAccent: 'text-amber-400',
      badgeBg: 'bg-amber-950 text-amber-300 border-amber-500/30',
      activeBg: 'bg-amber-500/20 text-amber-200 border-amber-500/60',
    },
    emerald: {
      border: 'border-emerald-500/50',
      activeRing: 'ring-4 ring-emerald-400 shadow-emerald-500/50',
      btnBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950',
      textAccent: 'text-emerald-400',
      badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-500/30',
      activeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/60',
    },
    rose: {
      border: 'border-rose-500/50',
      activeRing: 'ring-4 ring-rose-400 shadow-rose-500/50',
      btnBg: 'bg-gradient-to-br from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white',
      textAccent: 'text-rose-400',
      badgeBg: 'bg-rose-950 text-rose-300 border-rose-500/30',
      activeBg: 'bg-rose-500/20 text-rose-200 border-rose-500/60',
    },
    purple: {
      border: 'border-purple-500/50',
      activeRing: 'ring-4 ring-purple-400 shadow-purple-500/50',
      btnBg: 'bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 text-white',
      textAccent: 'text-purple-400',
      badgeBg: 'bg-purple-950 text-purple-300 border-purple-500/30',
      activeBg: 'bg-purple-500/20 text-purple-200 border-purple-500/60',
    },
    green: {
      border: 'border-green-500/50',
      activeRing: 'ring-4 ring-green-400 shadow-green-500/50',
      btnBg: 'bg-gradient-to-br from-green-500 to-emerald-700 hover:from-green-400 hover:to-emerald-600 text-slate-950',
      textAccent: 'text-green-400',
      badgeBg: 'bg-green-950 text-green-300 border-green-500/30',
      activeBg: 'bg-green-500/20 text-green-200 border-green-500/60',
    },
    orange: {
      border: 'border-orange-500/50',
      activeRing: 'ring-4 ring-orange-400 shadow-orange-500/50',
      btnBg: 'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-slate-950',
      textAccent: 'text-orange-400',
      badgeBg: 'bg-orange-950 text-orange-300 border-orange-500/30',
      activeBg: 'bg-orange-500/20 text-orange-200 border-orange-500/60',
    },
  }[padTheme];

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIdx !== null && draggedIdx !== targetIdx) {
      onReorderTrack(categoryState.category, draggedIdx, targetIdx);
      setDraggedIdx(targetIdx);
    }
  };

  return (
    <div className={`bg-slate-900/90 border-2 ${themeClasses.border} rounded-3xl p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden backdrop-blur-md transition-all`}>
      
      {/* Top Stream Deck Key Screen */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`text-[11px] font-mono font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${themeClasses.badgeBg}`}>
              [{hotkeyLabel}]
            </span>
            <span className={`text-sm font-black uppercase tracking-wider ${themeClasses.textAccent}`}>
              {padLabel}
            </span>
          </div>

          <button
            onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
            className="flex items-center space-x-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
            title="Ver / Reordenar Playlist de esta categoría"
          >
            <ListMusic className="w-3.5 h-3.5 text-amber-400" />
            <span>Playlist ({categoryState.tracks.length})</span>
            {showPlaylistDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* OLED Display Screen Box inside key */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 mb-4 shadow-inner">
          {mode === 'continuous' ? (
            <>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span className="uppercase text-[10px] font-bold tracking-widest text-slate-500">LISTA DE REPRODUCCIÓN</span>
                {subtitleInfo && <span className={themeClasses.textAccent}>{subtitleInfo}</span>}
              </div>
              <div className="text-base sm:text-lg font-black text-white truncate flex items-center gap-2">
                <Repeat className={`w-4 h-4 ${isToggleActive ? 'animate-spin ' + themeClasses.textAccent : 'text-slate-600'}`} />
                <span>{categoryState.tracks.length > 0 ? 'Completa' : 'Sin pistas asignadas'}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase">ESTADO:</span>
                <span className={`font-semibold truncate max-w-[180px] ${isToggleActive ? themeClasses.textAccent : 'text-slate-300'}`}>
                  {isToggleActive ? 'Reproducción Continua' : 'Detenido'}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase">SIGUIENTE CANCIÓN:</span>
                <span className="font-semibold text-slate-300">[Automático]</span>
              </div>
            </>
          ) : mode === 'loop' ? (
            <>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span className="uppercase text-[10px] font-bold tracking-widest text-slate-500">PISTA</span>
                {subtitleInfo && <span className={themeClasses.textAccent}>{subtitleInfo}</span>}
              </div>
              <div className="text-base sm:text-lg font-black text-white truncate flex items-center gap-2">
                <InfinityIcon className={`w-4 h-4 ${isToggleActive ? 'animate-pulse ' + themeClasses.textAccent : 'text-slate-600'}`} />
                <span>{currentTrack ? currentTrack.title : 'Sin pistas asignadas'}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase">ESTADO:</span>
                <span className={`font-semibold truncate max-w-[180px] ${isToggleActive ? themeClasses.textAccent : 'text-slate-300'}`}>
                  {isToggleActive ? 'BUCLE INFINITO' : 'Detenido'}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase">TIEMPO TRANSCURRIDO:</span>
                <span className="font-semibold text-slate-300">
                  {isToggleActive ? formatElapsedLong(playingState.currentTime) : '0 min 00 s'}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span className="uppercase text-[10px] font-bold tracking-widest text-slate-500">
                  PISTA ACTUAL ({tracks.length > 0 ? displayIndex + 1 : 0}/{tracks.length})
                </span>
                {subtitleInfo && <span className={themeClasses.textAccent}>{subtitleInfo}</span>}
              </div>

              <div className="text-base sm:text-lg font-black text-white truncate flex items-center gap-2">
                <Disc className={`w-4 h-4 ${isActive ? 'animate-spin ' + themeClasses.textAccent : 'text-slate-600'}`} />
                <span>{currentTrack ? currentTrack.title : 'Sin pistas asignadas'}</span>
              </div>

              {isActive && (
                <div className={`mt-1 text-[11px] font-mono font-bold ${themeClasses.textAccent}`}>
                  REPRODUCIENDO {formatElapsed(playingState.currentTime)}
                </div>
              )}

              {/* Next Track Preview Indicator */}
              {nextTrack && categoryState.tracks.length > 1 && (
                <div className="mt-2 text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">SIGUIENTE:</span>
                  <span className="font-semibold text-slate-300 truncate max-w-[180px]">{nextTrack.title}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Expandable Reordering / Selector Playlist Drawer */}
      {showPlaylistDrawer && (
        <div className="mb-4 bg-slate-950 border border-slate-800 rounded-2xl p-3 max-h-48 overflow-y-auto space-y-2 shadow-2xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex justify-between items-center">
            <span>Arrastra para reordenar playlist:</span>
            <span className="text-[9px] text-slate-500">Click para seleccionar activa</span>
          </div>
          {categoryState.tracks.map((t, idx) => {
            const isSelected = idx === categoryState.currentIndex;
            return (
              <div
                key={t.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-semibold cursor-grab active:cursor-grabbing border transition-all ${
                  isSelected
                    ? themeClasses.activeBg
                    : 'bg-slate-900 hover:bg-slate-800/80 text-slate-300 border-slate-800'
                }`}
              >
                <div
                  onClick={() => onSelectTrackIndex(categoryState.category, idx)}
                  className="flex-1 truncate mr-2 flex items-center space-x-2 cursor-pointer"
                >
                  <span className="font-mono text-[10px] text-slate-400 w-4">#{idx + 1}</span>
                  <span className="truncate">{t.title}</span>
                </div>

                <div className="flex items-center space-x-1">
                  {/* Up / Down Reorder Buttons */}
                  <button
                    onClick={() => onReorderTrack(categoryState.category, idx, Math.max(0, idx - 1))}
                    disabled={idx === 0}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 rounded"
                    title="Mover arriba"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onReorderTrack(categoryState.category, idx, Math.min(categoryState.tracks.length - 1, idx + 1))}
                    disabled={idx === categoryState.tracks.length - 1}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 rounded"
                    title="Mover abajo"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>

                  {!t.isBuiltIn && (
                    <button
                      onClick={() => onRemoveTrack(categoryState.category, t.id)}
                      className="p-1 hover:bg-red-900/40 text-slate-400 hover:text-red-400 rounded"
                      title="Eliminar de playlist"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stream Deck Main Trigger Keypad Button */}
      <button
        onClick={onTriggerPlay}
        className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-base sm:text-lg tracking-wider uppercase transition-all transform active:scale-95 shadow-xl flex items-center justify-center space-x-3 ${
          isActive || isToggleActive
            ? `${themeClasses.btnBg} ${themeClasses.activeRing} animate-pulse`
            : `${themeClasses.btnBg} shadow-lg`
        }`}
      >
        {mode === 'continuous' || mode === 'loop' ? (
          isToggleActive ? <Play className="w-6 h-6 fill-current" /> : <Repeat className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 fill-current" />
        )}
        <span>
          {mode === 'continuous'
            ? `${isToggleActive ? 'REPRODUCIENDO' : 'ACTIVAR REPRODUCCIÓN'} [${hotkeyLabel}]`
            : mode === 'loop'
            ? `${isToggleActive ? 'REPRODUCIENDO' : 'ACTIVAR BUCLE'} [${hotkeyLabel}]`
            : `${isActive ? 'REPRODUCIENDO' : 'DISPARAR'} [${hotkeyLabel}]`}
        </span>
      </button>

    </div>
  );
};

export const StreamDeckPad = React.memo(StreamDeckPadComponent, (prev, next) => {
  if (
    prev.hotkeyLabel !== next.hotkeyLabel ||
    prev.padTheme !== next.padTheme ||
    prev.subtitleInfo !== next.subtitleInfo ||
    prev.mode !== next.mode ||
    prev.padLabel !== next.padLabel ||
    prev.isToggleActive !== next.isToggleActive
  ) {
    return false;
  }

  const prevCat = prev.categoryState;
  const nextCat = next.categoryState;
  if (
    prevCat.category !== nextCat.category ||
    prevCat.name !== nextCat.name ||
    prevCat.currentIndex !== nextCat.currentIndex ||
    prevCat.tracks.length !== nextCat.tracks.length ||
    prevCat.tracks !== nextCat.tracks
  ) {
    return false;
  }

  const prevIsActive = prev.playingState.category === prevCat.category && prev.playingState.isPlaying;
  const nextIsActive = next.playingState.category === nextCat.category && next.playingState.isPlaying;
  if (prevIsActive !== nextIsActive) {
    return false;
  }

  // For active loop/continuous pads, currentTime must propagate to update the elapsed display
  if ((prev.mode === 'loop' || prev.mode === 'continuous') && (prev.isToggleActive || next.isToggleActive)) {
    if (prev.playingState.currentTime !== next.playingState.currentTime) {
      return false;
    }
  }
  if (prevIsActive && prev.playingState.currentTime !== next.playingState.currentTime) {
    return false;
  }

  return (
    prev.onTriggerPlay === next.onTriggerPlay &&
    prev.onSelectTrackIndex === next.onSelectTrackIndex &&
    prev.onReorderTrack === next.onReorderTrack &&
    prev.onRemoveTrack === next.onRemoveTrack
  );
});
