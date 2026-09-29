import type { PlaylistMap, PlaylistCategory, AudioTrack } from '../types/audio';
import { dbService } from './dbService';
import { FolderScannerService } from './folderScannerService';

const STORAGE_KEY_PLAYLISTS = 'volley_soundboard_playlists_v3';

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
  ace: {
    category: 'ace',
    name: '6. Ace Jingles',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
  timeout_continuous: {
    category: 'timeout_continuous',
    name: '7. Tiempo Fuera (Playlist Continua)',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
  awards: {
    category: 'awards',
    name: '8. Premiación (Bucle Infinito)',
    currentIndex: 0,
    playMode: 'sequential',
    tracks: [],
  },
};

export class StorageService {
  /**
   * Load playlists: automatically scans project folders + loads stored files from IndexedDB
   */
  public static async loadPlaylistsAsync(): Promise<PlaylistMap> {
    const result: PlaylistMap = JSON.parse(JSON.stringify(INITIAL_PLAYLISTS));

    try {
      const trackMap: Record<string, AudioTrack> = {};

      // 1. Scan physical files placed in public/audio/ subfolders
      const scannedFolderTracks = FolderScannerService.scanAudioFolders();
      scannedFolderTracks.forEach((t) => {
        trackMap[t.id] = t;
      });

      // 2. Load saved audio blobs from IndexedDB
      const dbFiles = await dbService.getAllAudioFiles();
      dbFiles.forEach((f) => {
        const objectUrl = URL.createObjectURL(f.blob);
        trackMap[f.id] = {
          id: f.id,
          title: f.title,
          artist: f.artist,
          category: f.category as PlaylistCategory,
          sourceType: 'local',
          url: objectUrl,
          duration: f.duration,
          isBuiltIn: false,
        };
      });

      // 3. Load category track ordering from localStorage
      const storedJson = localStorage.getItem(STORAGE_KEY_PLAYLISTS);
      if (storedJson) {
        const parsedOrder: Record<PlaylistCategory, { currentIndex: number; trackIds: string[] }> = JSON.parse(storedJson);

        (Object.keys(result) as PlaylistCategory[]).forEach((cat) => {
          if (parsedOrder[cat]) {
            result[cat].currentIndex = parsedOrder[cat].currentIndex || 0;
            const orderedTracks: AudioTrack[] = [];

            // Restore saved sequence order
            parsedOrder[cat].trackIds.forEach((id) => {
              if (trackMap[id]) {
                orderedTracks.push(trackMap[id]);
                delete trackMap[id];
              }
            });
            result[cat].tracks = orderedTracks;
          }
        });
      }

      // Add all newly scanned or unassigned tracks to their category playlists
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

  public static loadPlaylistsSync(): PlaylistMap {
    const scanned = FolderScannerService.scanAudioFolders();
    const result: PlaylistMap = JSON.parse(JSON.stringify(INITIAL_PLAYLISTS));
    scanned.forEach((t) => {
      if (result[t.category]) {
        result[t.category].tracks.push(t);
      }
    });
    return result;
  }

  public static savePlaylists(playlists: PlaylistMap): void {
    try {
      const orderToSave: Record<string, { currentIndex: number; trackIds: string[] }> = {};
      (Object.keys(playlists) as PlaylistCategory[]).forEach((cat) => {
        orderToSave[cat] = {
          currentIndex: playlists[cat].currentIndex,
          trackIds: playlists[cat].tracks.map((t) => t.id),
        };
      });
      localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(orderToSave));
    } catch (e) {
      console.warn('Failed to save playlists order:', e);
    }
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
      await dbService.saveAudioFile({
        id,
        blob: file,
        fileName: file.name,
        title,
        artist,
        category,
        duration,
      });
    } catch (e) {
      console.warn('Failed to persist MP3 blob in IndexedDB:', e);
    }
  }

  public static async deleteUploadedFile(id: string): Promise<void> {
    try {
      await dbService.deleteAudioFile(id);
    } catch (e) {
      console.warn('Failed to delete file from IndexedDB:', e);
    }
  }
}
