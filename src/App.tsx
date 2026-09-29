import { useState, useCallback } from 'react';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useHotkeys } from './hooks/useHotkeys';
import { Header } from './components/Header';
import { StreamDeckPad } from './components/StreamDeckPad';
import { PlaylistManagerModal } from './components/PlaylistManagerModal';
import { HotkeyGuideModal } from './components/HotkeyGuideModal';
import { ShieldCheck, Square } from 'lucide-react';

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
    playAce,
    playTechnicalTimeout,
    playPresentation,
    transitionOutPresentation,
    emergencyStop,
    addTrackToCategory,
    removeTrackFromCategory,
    specialMode,
    toggleTimeoutContinuous,
    toggleAwardsLoop,
  } = useAudioPlayer();

  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isHotkeyModalOpen, setIsHotkeyModalOpen] = useState(false);

  const handleOpenPlaylistManager = useCallback(() => setIsPlaylistModalOpen(true), []);
  const handleClosePlaylistManager = useCallback(() => setIsPlaylistModalOpen(false), []);
  const handleOpenHotkeyGuide = useCallback(() => setIsHotkeyModalOpen(true), []);
  const handleCloseHotkeyGuide = useCallback(() => setIsHotkeyModalOpen(false), []);

  // Hotkeys registration
  useHotkeys({
    onPointIntro: playNextPointIntro,
    onSuperSpike: playSuperSpike,
    onMonsterBlock: playMonsterBlock,
    onAce: playAce,
    onTechnicalTimeout: playTechnicalTimeout,
    onPresentationPlay: playPresentation,
    onPresentationTransition: transitionOutPresentation,
    onToggleTimeoutContinuous: toggleTimeoutContinuous,
    onToggleAwardsLoop: toggleAwardsLoop,
    onEmergencyStop: emergencyStop,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Header Bar */}
      <Header
        masterVolume={masterVolume}
        onVolumeChange={setMasterVolume}
        onEmergencyStop={emergencyStop}
        onOpenPlaylistManager={handleOpenPlaylistManager}
        onOpenHotkeyGuide={handleOpenHotkeyGuide}
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
              CONSOLA VOLLEY STREAM DECK (5 BOTONES PRINCIPALES)
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-950 text-slate-400 px-3 py-1 rounded-lg border border-slate-800">
              CERO SUPERPOSICIÓN DE AUDIO
            </span>
          </div>

          {/* STREAM DECK KEYPAD GRID: 2 FILAS x 3 COLUMNAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Pad 1: TECHNICAL TIME-OUT */}
            <StreamDeckPad
              categoryState={playlists.technical_timeouts}
              playingState={playingState}
              hotkeyLabel="E"
              padTheme="green"
              padLabel="TECHNICAL TIME-OUT"
              mode="trigger"
              onTriggerPlay={playTechnicalTimeout}
              onSelectTrackIndex={selectNextTrackIndex}
              onReorderTrack={reorderTracks}
              onRemoveTrack={removeTrackFromCategory}
              subtitleInfo="50s Play + 10s Fade Auto"
            />

            {/* Pad 2: INTRO (Presentación & Calentamiento) */}
            <StreamDeckPad
              categoryState={playlists.presentation}
              playingState={playingState}
              hotkeyLabel="P"
              padTheme="sky"
              padLabel="INTRO"
              mode="trigger"
              onTriggerPlay={playPresentation}
              onSelectTrackIndex={selectNextTrackIndex}
              onReorderTrack={reorderTracks}
              onRemoveTrack={removeTrackFromCategory}
              subtitleInfo="Música Continua Pre-Partido"
            />

            {/* Pad 3: BREAKS (Entrepuntos 12s) */}
            <StreamDeckPad
              categoryState={playlists.point_intros}
              playingState={playingState}
              hotkeyLabel="ESPACIO"
              padTheme="orange"
              padLabel="BREAKS"
              mode="trigger"
              onTriggerPlay={playNextPointIntro}
              onSelectTrackIndex={selectNextTrackIndex}
              onReorderTrack={reorderTracks}
              onRemoveTrack={removeTrackFromCategory}
              subtitleInfo="9s Play + 3s Fade Auto"
            />

            {/* Pad 4: TIME-OUT (Reproducción Continua, Toggle ON/OFF) */}
            <StreamDeckPad
              categoryState={playlists.timeout_continuous}
              playingState={playingState}
              hotkeyLabel="1"
              padTheme="purple"
              padLabel="TIME-OUT"
              mode="continuous"
              isToggleActive={specialMode === 'timeout_continuous'}
              onTriggerPlay={toggleTimeoutContinuous}
              onSelectTrackIndex={selectNextTrackIndex}
              onReorderTrack={reorderTracks}
              onRemoveTrack={removeTrackFromCategory}
            />

            {/* Pad 5: AWARDS (Bucle Infinito, Toggle ON/OFF) */}
            <StreamDeckPad
              categoryState={playlists.awards}
              playingState={playingState}
              hotkeyLabel="A"
              padTheme="emerald"
              padLabel="AWARDS"
              mode="loop"
              isToggleActive={specialMode === 'awards'}
              onTriggerPlay={toggleAwardsLoop}
              onSelectTrackIndex={selectNextTrackIndex}
              onReorderTrack={reorderTracks}
              onRemoveTrack={removeTrackFromCategory}
            />

          </div>

          {/* JINGLES ADICIONALES (OPCIONAL) */}
          <div className="border-t border-slate-800 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-400 tracking-wider uppercase flex items-center gap-2">
                <Square className="w-3 h-3 text-slate-600" />
                JINGLES ADICIONALES (OPCIONAL)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Super Spike */}
              <StreamDeckPad
                categoryState={playlists.super_spike}
                playingState={playingState}
                hotkeyLabel="Q"
                padTheme="rose"
                padLabel="SUPER SPIKE"
                mode="trigger"
                onTriggerPlay={playSuperSpike}
                onSelectTrackIndex={selectNextTrackIndex}
                onReorderTrack={reorderTracks}
                onRemoveTrack={removeTrackFromCategory}
                subtitleInfo="9s Play + 3s Fade Auto"
              />

              {/* Monster Block */}
              <StreamDeckPad
                categoryState={playlists.monster_block}
                playingState={playingState}
                hotkeyLabel="W"
                padTheme="purple"
                padLabel="MONSTER BLOCK"
                mode="trigger"
                onTriggerPlay={playMonsterBlock}
                onSelectTrackIndex={selectNextTrackIndex}
                onReorderTrack={reorderTracks}
                onRemoveTrack={removeTrackFromCategory}
                subtitleInfo="9s Play + 3s Fade Auto"
              />

              {/* Ace */}
              <StreamDeckPad
                categoryState={playlists.ace}
                playingState={playingState}
                hotkeyLabel="R"
                padTheme="amber"
                padLabel="ACE"
                mode="trigger"
                onTriggerPlay={playAce}
                onSelectTrackIndex={selectNextTrackIndex}
                onReorderTrack={reorderTracks}
                onRemoveTrack={removeTrackFromCategory}
                subtitleInfo="9s Play + 3s Fade Auto"
              />
            </div>
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
        onClose={handleClosePlaylistManager}
        playlists={playlists}
        onAddTrack={addTrackToCategory}
        onRemoveTrack={removeTrackFromCategory}
      />

      <HotkeyGuideModal
        isOpen={isHotkeyModalOpen}
        onClose={handleCloseHotkeyGuide}
      />

    </div>
  );
}
export default App;
