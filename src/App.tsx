import { useState } from 'react';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useHotkeys } from './hooks/useHotkeys';
import { Header } from './components/Header';
import { StreamDeckPad } from './components/StreamDeckPad';
import { PlaylistManagerModal } from './components/PlaylistManagerModal';
import { HotkeyGuideModal } from './components/HotkeyGuideModal';
import { ShieldCheck, FastForward, Square } from 'lucide-react';

export function App() {
  const {
    playlists,
    playingState,
    masterVolume,
    setMasterVolume,
    selectNextTrackIndex,
    reorderTracks,
    playNextPointIntro,
    playSuperSpike,
    playMonsterBlock,
    playTechnicalTimeout,
    playPresentation,
    transitionOutPresentation,
    emergencyStop,
    addTrackToCategory,
    removeTrackFromCategory,
  } = useAudioPlayer();

  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isHotkeyModalOpen, setIsHotkeyModalOpen] = useState(false);

  // Hotkeys registration
  useHotkeys({
    onPointIntro: playNextPointIntro,
    onSuperSpike: playSuperSpike,
    onMonsterBlock: playMonsterBlock,
    onTechnicalTimeout: playTechnicalTimeout,
    onPresentationPlay: playPresentation,
    onPresentationTransition: transitionOutPresentation,
    onEmergencyStop: emergencyStop,
  });

  const isPresentationActive = playingState.category === 'presentation' && playingState.isPlaying;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header Bar */}
      <Header
        masterVolume={masterVolume}
        onVolumeChange={setMasterVolume}
        onEmergencyStop={emergencyStop}
        onOpenPlaylistManager={() => setIsPlaylistModalOpen(true)}
        onOpenHotkeyGuide={() => setIsHotkeyModalOpen(true)}
        isFading={playingState.isFading}
        activeTrackTitle={playingState.trackTitle}
      />

      {/* Main Soundboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        


        {/* STREAM DECK PHYSICAL CONSOLE FRAME */}
        <div className="bg-slate-900/90 border-4 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 space-y-6">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-black text-white tracking-wider uppercase flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              CONSOLA VOLLEY STREAM DECK (5 PLAYLISTS CON SELECTOR)
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-950 text-slate-400 px-3 py-1 rounded-lg border border-slate-800">
              CERO SUPERPOSICIÓN DE AUDIO
            </span>
          </div>

          {/* STREAM DECK KEYPAD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Stream Deck Pad 1: Presentación & Calentamiento */}
            <div className="flex flex-col space-y-3">
              <StreamDeckPad
                categoryState={playlists.presentation}
                playingState={playingState}
                hotkeyLabel="P"
                padTheme="sky"
                onTriggerPlay={playPresentation}
                onSelectTrackIndex={selectNextTrackIndex}
                onReorderTrack={reorderTracks}
                onRemoveTrack={removeTrackFromCategory}
                subtitleInfo="Música Continua Pre-Partido"
              />

              {/* Transition Out Button for Presentation */}
              <button
                onClick={transitionOutPresentation}
                disabled={!isPresentationActive}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-2 border shadow-md ${
                  playingState.isFading && isPresentationActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 ring-4 ring-amber-500/30 animate-pulse'
                    : isPresentationActive
                    ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-500/30 cursor-pointer'
                    : 'bg-slate-950 text-slate-500 border-slate-800 cursor-not-allowed'
                }`}
              >
                {playingState.isFading && isPresentationActive ? (
                  <FastForward className="w-4 h-4 animate-spin" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                <span>
                  {playingState.isFading && isPresentationActive
                    ? `FADING 3S (${playingState.fadeTimeRemaining.toFixed(1)}s)`
                    : 'TRANSICIÓN A JUEGO [T] (FADE 3S)'}
                </span>
              </button>
            </div>

            {/* Stream Deck Pad 2: Entrepuntos 12s */}
            <StreamDeckPad
              categoryState={playlists.point_intros}
              playingState={playingState}
              hotkeyLabel="ESPACIO"
              padTheme="amber"
              onTriggerPlay={playNextPointIntro}
              onSelectTrackIndex={selectNextTrackIndex}
              onReorderTrack={reorderTracks}
              onRemoveTrack={removeTrackFromCategory}
              subtitleInfo="9s Play + 3s Fade Auto"
            />

            {/* Stream Deck Pad 3: Tiempo Técnico 1 min */}
            <StreamDeckPad
              categoryState={playlists.technical_timeouts}
              playingState={playingState}
              hotkeyLabel="E"
              padTheme="emerald"
              onTriggerPlay={playTechnicalTimeout}
              onSelectTrackIndex={selectNextTrackIndex}
              onReorderTrack={reorderTracks}
              onRemoveTrack={removeTrackFromCategory}
              subtitleInfo="50s Play + 10s Fade Auto"
            />

            {/* Stream Deck Pad 4: Super Spike */}
            <StreamDeckPad
              categoryState={playlists.super_spike}
              playingState={playingState}
              hotkeyLabel="Q"
              padTheme="rose"
              onTriggerPlay={playSuperSpike}
              onSelectTrackIndex={selectNextTrackIndex}
              onReorderTrack={reorderTracks}
              onRemoveTrack={removeTrackFromCategory}
              subtitleInfo="9s Play + 3s Fade Auto"
            />

            {/* Stream Deck Pad 5: Monster Block */}
            <StreamDeckPad
              categoryState={playlists.monster_block}
              playingState={playingState}
              hotkeyLabel="W"
              padTheme="purple"
              onTriggerPlay={playMonsterBlock}
              onSelectTrackIndex={selectNextTrackIndex}
              onReorderTrack={reorderTracks}
              onRemoveTrack={removeTrackFromCategory}
              subtitleInfo="9s Play + 3s Fade Auto"
            />

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 mt-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Volley Stream Deck DJ v3.0 • Cero Superposición de Audio & Selector de Canción</span>
        </div>
        <div>
          Unidad Revolución • Operación en Cancha
        </div>
      </footer>

      {/* Modals */}
      <PlaylistManagerModal
        isOpen={isPlaylistModalOpen}
        onClose={() => setIsPlaylistModalOpen(false)}
        playlists={playlists}
        onAddTrack={addTrackToCategory}
        onRemoveTrack={removeTrackFromCategory}
      />

      <HotkeyGuideModal
        isOpen={isHotkeyModalOpen}
        onClose={() => setIsHotkeyModalOpen(false)}
      />

    </div>
  );
}
export default App;
