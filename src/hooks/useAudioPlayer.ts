import { useState, useEffect, useCallback, useRef } from 'react';
import type { AudioTrack, PlayingState, PlaylistCategory, PlaylistMap } from '../types/audio';
import { audioEngine } from '../services/audioEngine';
import { StorageService } from '../services/storageService';

export function useAudioPlayer() {
  const [playlists, setPlaylists] = useState<PlaylistMap>(() => StorageService.loadPlaylistsSync());
  const [playingState, setPlayingState] = useState<PlayingState>(() => audioEngine.getCurrentState());
  const [masterVolume, setMasterVolumeState] = useState<number>(() => audioEngine.getMasterVolume());

  const playlistsRef = useRef<PlaylistMap>(playlists);
  playlistsRef.current = playlists;

  // 'none' | 'timeout_continuous' (auto-advance whole playlist) | 'awards' (infinite loop of active track)
  const [specialMode, setSpecialMode] = useState<'none' | 'timeout_continuous' | 'awards'>('none');
  const specialModeRef = useRef(specialMode);
  specialModeRef.current = specialMode;

  // Pre-load active track URLs into audioEngine pool for 0ms latency
  const preloadActiveTracks = useCallback((map: PlaylistMap) => {
    (Object.keys(map) as PlaylistCategory[]).forEach((cat) => {
      const pl = map[cat];
      if (pl && pl.tracks.length > 0) {
        const activeTrack = pl.tracks[pl.currentIndex] || pl.tracks[0];
        if (activeTrack && activeTrack.url) {
          audioEngine.preloadAudio(activeTrack.url);
        }
      }
    });
  }, []);

  // Async load stored tracks from IndexedDB
  useEffect(() => {
    let isMounted = true;
    StorageService.loadPlaylistsAsync().then((loadedPlaylists) => {
      if (isMounted) {
        setPlaylists(loadedPlaylists);
        preloadActiveTracks(loadedPlaylists);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [preloadActiveTracks]);

  // Subscribe to audio engine state updates
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((newState) => {
      setPlayingState(newState);
    });
    return unsubscribe;
  }, []);

  const setMasterVolume = useCallback((vol: number) => {
    audioEngine.setMasterVolume(vol);
    setMasterVolumeState(vol);
  }, []);

  /**
   * Helper to play the current active track of a category playlist,
   * then advance the index for the next call!
   * STABLE REFERENCE: Uses playlistsRef so functions never change across renders!
   */
  const playCategoryPlaylist = useCallback((category: PlaylistCategory) => {
    // Triggering any other category cancels an active continuous/loop toggle mode
    if (category !== 'timeout_continuous' && category !== 'awards' && specialModeRef.current !== 'none') {
      setSpecialMode('none');
    }

    const pl = playlistsRef.current[category];
    if (!pl || pl.tracks.length === 0) return;

    const trackToPlay = pl.tracks[pl.currentIndex] || pl.tracks[0];
    audioEngine.playTrack(trackToPlay);

    // Advance index according to playMode
    setPlaylists((prev) => {
      const currentPl = prev[category];
      if (!currentPl || currentPl.tracks.length === 0) return prev;

      let nextIdx = currentPl.currentIndex;
      if (currentPl.playMode === 'sequential') {
        nextIdx = (currentPl.currentIndex + 1) % currentPl.tracks.length;
      } else if (currentPl.playMode === 'random') {
        nextIdx = Math.floor(Math.random() * currentPl.tracks.length);
      }

      const updated: PlaylistMap = {
        ...prev,
        [category]: {
          ...currentPl,
          currentIndex: nextIdx,
        },
      };
      StorageService.savePlaylists(updated);
      
      // Preload next track
      const nextTrack = updated[category].tracks[nextIdx];
      if (nextTrack && nextTrack.url) {
        audioEngine.preloadAudio(nextTrack.url);
      }
      return updated;
    });
  }, []);

  // Auto-advance the continuous TIME-OUT playlist whenever a track ends naturally
  useEffect(() => {
    audioEngine.setNaturalEndCallback((category) => {
      if (category === 'timeout_continuous' && specialModeRef.current === 'timeout_continuous') {
        playCategoryPlaylist('timeout_continuous');
      }
    });
    return () => audioEngine.setNaturalEndCallback(null);
  }, [playCategoryPlaylist]);

  const selectNextTrackIndex = useCallback((category: PlaylistCategory, index: number) => {
    setPlaylists((prev) => {
      const pl = prev[category];
      if (!pl || index < 0 || index >= pl.tracks.length) return prev;
      const updated: PlaylistMap = {
        ...prev,
        [category]: {
          ...pl,
          currentIndex: index,
        },
      };
      StorageService.savePlaylists(updated);
      const selTrack = pl.tracks[index];
      if (selTrack && selTrack.url) {
        audioEngine.preloadAudio(selTrack.url);
      }
      return updated;
    });
  }, []);

  const reorderTracks = useCallback((category: PlaylistCategory, fromIndex: number, toIndex: number) => {
    setPlaylists((prev) => {
      const pl = prev[category];
      if (!pl || fromIndex < 0 || toIndex < 0 || fromIndex >= pl.tracks.length || toIndex >= pl.tracks.length) {
        return prev;
      }

      const newTracks = [...pl.tracks];
      const [moved] = newTracks.splice(fromIndex, 1);
      newTracks.splice(toIndex, 0, moved);

      const updated: PlaylistMap = {
        ...prev,
        [category]: {
          ...pl,
          tracks: newTracks,
          currentIndex: 0,
        },
      };
      StorageService.savePlaylists(updated);
      return updated;
    });
  }, []);

  const playNextPointIntro = useCallback(() => {
    playCategoryPlaylist('point_intros');
  }, [playCategoryPlaylist]);

  const playSuperSpike = useCallback(() => {
    playCategoryPlaylist('super_spike');
  }, [playCategoryPlaylist]);

  const playMonsterBlock = useCallback(() => {
    playCategoryPlaylist('monster_block');
  }, [playCategoryPlaylist]);

  const playFireBall = useCallback(() => {
    playCategoryPlaylist('fire_ball');
  }, [playCategoryPlaylist]);

  const playAce = useCallback(() => {
    playCategoryPlaylist('ace');
  }, [playCategoryPlaylist]);

  const playTechnicalTimeout = useCallback(() => {
    playCategoryPlaylist('technical_timeouts');
  }, [playCategoryPlaylist]);

  const playPresentation = useCallback(() => {
    playCategoryPlaylist('presentation');
  }, [playCategoryPlaylist]);

  const transitionOutPresentation = useCallback(() => {
    setSpecialMode('none');
    audioEngine.transitionOutPresentation(3000);
  }, []);

  const emergencyStop = useCallback(() => {
    setSpecialMode('none');
    audioEngine.emergencyStop();
  }, []);

  // Toggle ON/OFF: continuously auto-advances through the whole 'timeout_continuous' playlist
  const toggleTimeoutContinuous = useCallback(() => {
    if (specialModeRef.current === 'timeout_continuous') {
      setSpecialMode('none');
      audioEngine.emergencyStop();
    } else {
      setSpecialMode('timeout_continuous');
      playCategoryPlaylist('timeout_continuous');
    }
  }, [playCategoryPlaylist]);

  // Toggle ON/OFF: infinite loop of the active 'awards' track
  const toggleAwardsLoop = useCallback(() => {
    if (specialModeRef.current === 'awards') {
      setSpecialMode('none');
      audioEngine.emergencyStop();
    } else {
      setSpecialMode('awards');
      playCategoryPlaylist('awards');
    }
  }, [playCategoryPlaylist]);

  const addTrackToCategory = useCallback((newTrack: AudioTrack, fileObject?: File) => {
    setPlaylists((prev) => {
      const cat = newTrack.category;
      const pl = prev[cat];
      if (!pl) return prev;

      const updated: PlaylistMap = {
        ...prev,
        [cat]: {
          ...pl,
          tracks: [...pl.tracks, newTrack],
        },
      };
      StorageService.savePlaylists(updated);
      return updated;
    });

    if (fileObject) {
      StorageService.saveUploadedFile(
        newTrack.id,
        fileObject,
        newTrack.title,
        newTrack.artist || '',
        newTrack.category,
        newTrack.duration || 12
      );
    }
  }, []);

  const removeTrackFromCategory = useCallback((category: PlaylistCategory, trackId: string) => {
    setPlaylists((prev) => {
      const pl = prev[category];
      if (!pl) return prev;

      const updated: PlaylistMap = {
        ...prev,
        [category]: {
          ...pl,
          tracks: pl.tracks.filter((t) => t.id !== trackId),
          currentIndex: 0,
        },
      };
      StorageService.savePlaylists(updated);
      return updated;
    });

    StorageService.deleteUploadedFile(trackId);
  }, []);

  const playTrack = useCallback((track: AudioTrack) => {
    audioEngine.playTrack(track);
  }, []);

  return {
    playlists,
    playingState,
    masterVolume,
    setMasterVolume,
    playTrack,
    playCategoryPlaylist,
    selectNextTrackIndex,
    reorderTracks,
    playNextPointIntro,
    playSuperSpike,
    playMonsterBlock,
    playFireBall,
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
  };
}
