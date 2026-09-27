import React from 'react';
import { Volume2, VolumeX, AlertOctagon, Music, Keyboard, FolderPlus } from 'lucide-react';

interface HeaderProps {
  masterVolume: number;
  onVolumeChange: (vol: number) => void;
  onEmergencyStop: () => void;
  onOpenPlaylistManager: () => void;
  onOpenHotkeyGuide: () => void;
  isFading: boolean;
  activeTrackTitle: string | null;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  masterVolume,
  onVolumeChange,
  onEmergencyStop,
  onOpenPlaylistManager,
  onOpenHotkeyGuide,
  isFading,
  activeTrackTitle,
}) => {
  const isMuted = masterVolume === 0;

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Brand & Match Info */}
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
              <Music className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                VOLLEY SOUNDBOARD <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">DJ LIVE</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Liga Voleibol de Playa • Unidad Revolución</p>
            </div>
          </div>

          {/* Mobile shortcut guide trigger */}
          <div className="sm:hidden flex items-center space-x-2">
            <button
              onClick={onOpenHotkeyGuide}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              title="Atajos de teclado"
            >
              <Keyboard className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Active Status Banner */}
        <div className="hidden lg:flex items-center space-x-3 bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2 min-w-[280px]">
          <div className={`w-3 h-3 rounded-full ${activeTrackTitle ? (isFading ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse') : 'bg-slate-600'}`} />
          <div className="text-xs overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-slate-400 block font-semibold text-[10px] uppercase tracking-wider">
              {isFading ? 'FADING OUT DE AUDIO' : activeTrackTitle ? 'EN REPRODUCCIÓN' : 'SISTEMA LISTO'}
            </span>
            <span className="text-white font-bold">
              {activeTrackTitle || 'Sin audio activo'}
            </span>
          </div>
        </div>

        {/* Master Volume & Global Actions */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
          
          {/* Master Volume Slider */}
          <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => onVolumeChange(isMuted ? 0.8 : 0)}
              className="text-slate-400 hover:text-amber-400 transition-colors"
              title={isMuted ? 'Desactivar silencio' : 'Silenciar master'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-24 accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-slate-700"
              title="Volumen Master General"
            />
            <span className="text-xs font-mono font-bold text-amber-400 min-w-[32px] text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          {/* Manage Playlists */}
          <button
            onClick={onOpenPlaylistManager}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-700"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Playlists / MP3</span>
          </button>

          {/* Hotkey Guide Modal Button */}
          <button
            onClick={onOpenHotkeyGuide}
            className="hidden sm:flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition-all border border-slate-700"
            title="Teclas rápidas (Hotkeys)"
          >
            <Keyboard className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Hotkeys</span>
          </button>

          {/* Emergency Stop Button */}
          <button
            onClick={onEmergencyStop}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-red-600/30 transition-all transform active:scale-95 border border-red-500"
            title="Corte de emergencia instantáneo (Esc / S)"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>CORTE [ESC]</span>
          </button>

        </div>

      </div>
    </header>
  );
});
