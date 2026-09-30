export type PlaylistCategory = 'presentation' | 'point_intros' | 'technical_timeouts' | 'super_spike' | 'monster_block' | 'fire_ball' | 'timeout_continuous' | 'awards' | 'ace';

export type SourceType = 'local' | 'synthetic';

export interface AudioTrack {
  id: string;
  title: string;
  artist?: string;
  category: PlaylistCategory;
  sourceType: SourceType;
  url?: string;
  syntheticType?: 'chona_synth' | 'meneadito_synth' | 'macarena_synth' | 'spike_synth' | 'block_synth' | 'fireball_synth' | 'intro_synth';
  duration?: number; // seconds
  isBuiltIn?: boolean;
  jingleType?: 'super_spike' | 'monster_block' | 'fire_ball' | 'custom';
}

export type PlayMode = 'sequential' | 'random' | 'loop_single';

export interface CategoryPlaylistState {
  category: PlaylistCategory;
  name: string;
  tracks: AudioTrack[];
  currentIndex: number;
  playMode: PlayMode;
}

export type PlaylistMap = Record<PlaylistCategory, CategoryPlaylistState>;

export interface PlayingState {
  trackId: string | null;
  trackTitle: string | null;
  category: PlaylistCategory | null;
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
  volume: number; // 0.0 to 1.0
  isFading: boolean;
  fadeTimeRemaining: number;
  jingleActive: boolean;
}

export interface HotkeyMapping {
  key: string;
  label: string;
  action: string;
  category: string;
}
