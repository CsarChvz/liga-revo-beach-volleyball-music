import type { PlaylistMap, PlaylistCategory, AudioTrack } from '../types/audio';
import { getAllAudioFiles, saveAudioFile, deleteAudioFile } from './supabaseStorageService';
import { FolderScannerService } from './folderScannerService';

export const INITIAL_PLAYLISTS: PlaylistMap = {
  presentation: {
    category: 'presentation',
    name: '1. Presentación & Calentamiento',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
  point_intros: {
    category: 'point_intros',
    name: '2. Entrepuntos (Intros 12s)',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
  technical_timeouts: {
    category: 'technical_timeouts',
    name: '3. Tiempos Técnicos (1 Minuto)',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
  super_spike: {
    category: 'super_spike',
    name: '4. Super Spike Jingles',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
  monster_block: {
    category: 'monster_block',
    name: '5. Monster Block Jingles',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
  fire_ball: {
    category: 'fire_ball',
    name: '6. Fire Ball Jingles',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
  ace: {
    category: 'ace',
    name: '7. Ace Jingles',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
  timeout_continuous: {
    category: 'timeout_continuous',
    name: '8. Tiempo Fuera (Playlist Continua)',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
  awards: {
    category: 'awards',
    name: '9. Premiación (Bucle Infinito)',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
};

export class StorageService {
  /**
   * Load playlists: scans built-in tracks from Supabase + loads uploaded files from Supabase Storage.
   * Track ordering and currentIndex are also fetched from Supabase (playlist_state table).
   */
  public static async loadPlaylistsAsync(): Promise<PlaylistMap> {
    const result: PlaylistMap = JSON.parse(JSON.stringify(INITIAL_PLAYLISTS));

    try {
      const trackMap: Record<string, AudioTrack> = {};

      // 1. Fetch built-in tracks from Supabase (replaces public/audio/ manifest scan)
      const scannedFolderTracks = await FolderScannerService.scanAudioFolders();
      scannedFolderTracks.forEach((t) => {
        trackMap[t.id] = t;
      });

      // 2. Load uploaded files from Supabase Storage (replaces IndexedDB)
      const remoteFiles = await getAllAudioFiles();
      remoteFiles.forEach((f) => {
        trackMap[f.id] = {
          id: f.id,
          title: f.title,
          artist: f.artist,
          category: f.category,
          sourceType: 'local',
          url: f.url,
          duration: f.duration,
          isBuiltIn: false,
        };
      });

      // 3. Restore playlist ordering and currentIndex from Supabase playlist_state
      await StorageService._applyRemoteOrder(result, trackMap);

      // Add any tracks not yet assigned to a saved order slot
      Object.values(trackMap).forEach((t) => {
        if (result[t.category]) {
          const exists = result[t.category].tracks.some((existing) => existing.id === t.id);
          if (!exists) {
            result[t.category].tracks.push(t);
          }
        }
      });

      // Ensure currentIndex is valid for all categories
      (Object.keys(result) as PlaylistCategory[]).forEach((cat) => {
        if (result[cat].tracks.length > 0 && result[cat].currentIndex >= result[cat].tracks.length) {
          result[cat].currentIndex = 0;
        }
      });
    } catch (e) {
      console.warn('Failed to load playlists:', e);
    }

    return result;
  }

  /**
   * Apply remote ordering from Supabase:
   * - tracks table: playlist_order per category
   * - playlist_state table: current_index per category
   * Modifies `result` in place and deletes consumed entries from `trackMap`.
   */
  private static async _applyRemoteOrder(
    result: PlaylistMap,
    trackMap: Record<string, AudioTrack>
  ): Promise<void> {
    // Lazy import to avoid top-level Supabase import in tests/SSR
    const { supabase } = await import('../lib/supabaseClient');

    // Fetch ordered track IDs per category
    const { data: trackRows } = await supabase
      .from('tracks')
      .select('id, category, playlist_order')
      .order('playlist_order', { ascending: true });

    const orderedByCategory: Record<string, string[]> = {};
    (trackRows ?? []).forEach((row) => {
      const cat = row.category as string;
      if (!orderedByCategory[cat]) orderedByCategory[cat] = [];
      orderedByCategory[cat].push(row.id as string);
    });

    // Fetch currentIndex per category
    const { data: stateRows } = await supabase.from('playlist_state').select('category, current_index');
    const currentIndexMap: Record<string, number> = {};
    (stateRows ?? []).forEach((row) => {
      currentIndexMap[row.category as string] = (row.current_index as number) ?? 0;
    });

    (Object.keys(result) as PlaylistCategory[]).forEach((cat) => {
      if (orderedByCategory[cat]) {
        result[cat].currentIndex = currentIndexMap[cat] ?? 0;
        const orderedTracks: AudioTrack[] = [];
        orderedByCategory[cat].forEach((id) => {
          if (trackMap[id]) {
            orderedTracks.push(trackMap[id]);
            delete trackMap[id];
          }
        });
        if (orderedTracks.length > 0) {
          result[cat].tracks = orderedTracks;
        }
      }
    });
  }

  /**
   * Immediate initial state (no tracks yet — folder scanning is async now that it
   * fetches a manifest instead of an eager import.meta.glob). loadPlaylistsAsync
   * hydrates the real tracks moments later.
   */
  public static loadPlaylistsSync(): PlaylistMap {
    return JSON.parse(JSON.stringify(INITIAL_PLAYLISTS));
  }

  public static savePlaylists(playlists: PlaylistMap): void {
    // Fire-and-forget remote save — no await to keep callers synchronous
    StorageService._savePlaylistsRemote(playlists).catch((e) =>
      console.warn('Failed to save playlists remotely:', e)
    );
  }

  private static async _savePlaylistsRemote(playlists: PlaylistMap): Promise<void> {
    const { supabase } = await import('../lib/supabaseClient');

    // Batch upsert playlist_order for every track
    const trackUpdates: { id: string; playlist_order: number }[] = [];
    (Object.keys(playlists) as PlaylistCategory[]).forEach((cat) => {
      playlists[cat].tracks.forEach((t, idx) => {
        trackUpdates.push({ id: t.id, playlist_order: idx });
      });
    });

    if (trackUpdates.length > 0) {
      await supabase.from('tracks').upsert(
        trackUpdates.map((u) => ({ id: u.id, playlist_order: u.playlist_order })),
        { onConflict: 'id', ignoreDuplicates: false }
      );
    }

    // Upsert currentIndex for each category
    const stateUpdates = (Object.keys(playlists) as PlaylistCategory[]).map((cat) => ({
      category: cat,
      current_index: playlists[cat].currentIndex,
    }));

    await supabase.from('playlist_state').upsert(stateUpdates, { onConflict: 'category' });
  }

  public static async saveUploadedFile(
    id: string,
    file: File,
    title: string,
    artist: string,
    category: PlaylistCategory,
    duration: number
  ): Promise<void> {
    try {
      await saveAudioFile(id, file, title, artist, category, duration);
    } catch (e) {
      console.warn('Failed to upload file to Supabase Storage:', e);
    }
  }

  public static async deleteUploadedFile(id: string): Promise<void> {
    try {
      await deleteAudioFile(id);
    } catch (e) {
      console.warn('Failed to delete file from Supabase:', e);
    }
  }
}
