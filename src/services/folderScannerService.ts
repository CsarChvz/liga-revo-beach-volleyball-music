import type { AudioTrack, PlaylistCategory } from '../types/audio';

/**
 * Automatically scans all audio files placed inside public/audio/ subfolders
 * using Vite's import.meta.glob feature.
 */
export class FolderScannerService {
  private static cachedTracks: AudioTrack[] | null = null;

  public static scanAudioFolders(): AudioTrack[] {
    if (this.cachedTracks) {
      return this.cachedTracks;
    }

    const tracks: AudioTrack[] = [];

    try {
      // Vite glob import for all audio files in public/audio/
      const modules = import.meta.glob<string>('/public/audio/**/*.{mp3,wav,ogg,m4a,flac,aac}', {
        query: '?url',
        import: 'default',
        eager: true,
      });

      Object.keys(modules).forEach((filePath) => {
        const url = modules[filePath];

        // Example path: /public/audio/point_intros/la_chona.mp3
        const parts = filePath.split('/');
        // Extract category folder (e.g. point_intros) and file name
        const folderName = parts[parts.length - 2] as PlaylistCategory;
        const rawFileName = parts[parts.length - 1];

        const validCategories: PlaylistCategory[] = [
          'presentation',
          'point_intros',
          'technical_timeouts',
          'super_spike',
          'monster_block',
          'ace',
          'timeout_continuous',
          'awards',
        ];

        if (validCategories.includes(folderName)) {
          // Format title: remove extension, replace _ and - with spaces, capitalize words
          const cleanTitle = rawFileName
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())
            .trim();

          // Transform public path to relative browser URL (e.g. /audio/point_intros/la_chona.mp3)
          const rawRelativePath = filePath.replace(/^\/public/, '');
          const audioUrl = typeof url === 'string' ? url : encodeURI(rawRelativePath);

          const durationMap: Record<PlaylistCategory, number> = {
            presentation: 180,
            point_intros: 12,
            technical_timeouts: 60,
            super_spike: 12,
            monster_block: 12,
            ace: 12,
            timeout_continuous: 180,
            awards: 180,
          };

          tracks.push({
            id: `scanned-${folderName}-${encodeURIComponent(cleanTitle.toLowerCase().replace(/\s+/g, '-'))}`,
            title: cleanTitle,
            artist: 'Archivo Local de Carpeta',
            category: folderName,
            sourceType: 'local',
            url: audioUrl,
            duration: durationMap[folderName] || 12,
            isBuiltIn: false,
          });
        }
      });
    } catch (e) {
      console.warn('Error scanning audio folders:', e);
    }

    this.cachedTracks = tracks;
    return tracks;
  }
}
