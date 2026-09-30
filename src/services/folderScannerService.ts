import type { AudioTrack, PlaylistCategory } from '../types/audio';

const validCategories: PlaylistCategory[] = [
  'presentation',
  'point_intros',
  'technical_timeouts',
  'super_spike',
  'monster_block',
  'fire_ball',
  'ace',
  'timeout_continuous',
  'awards',
];

const durationMap: Record<PlaylistCategory, number> = {
  presentation: 180,
  point_intros: 12,
  technical_timeouts: 60,
  super_spike: 12,
  monster_block: 12,
  fire_ball: 12,
  ace: 12,
  timeout_continuous: 180,
  awards: 180,
};

/**
 * Fetches built-in audio tracks from the Supabase `tracks` table (is_built_in = true).
 * All audio files live in Supabase Storage bucket "audio-files".
 */
export class FolderScannerService {
  private static cachedTracksPromise: Promise<AudioTrack[]> | null = null;

  public static scanAudioFolders(): Promise<AudioTrack[]> {
    if (!this.cachedTracksPromise) {
      this.cachedTracksPromise = this.doScan();
    }
    return this.cachedTracksPromise;
  }

  /** Bust the cache — call after uploading a new built-in track. */
  public static clearCache(): void {
    this.cachedTracksPromise = null;
  }

  private static async doScan(): Promise<AudioTrack[]> {
    try {
      const { supabase } = await import('../lib/supabaseClient');
      const BUCKET = 'audio-files';

      const { data, error } = await supabase
        .from('tracks')
        .select('id, title, artist, category, duration, storage_path')
        .eq('is_built_in', true)
        .order('playlist_order', { ascending: true });

      if (error) {
        console.warn('[FolderScanner] Supabase query failed:', error.message);
        return [];
      }

      return (data ?? [])
        .filter((row) => validCategories.includes(row.category as PlaylistCategory))
        .map((row) => {
          const { data: urlData } = supabase.storage
            .from(BUCKET)
            .getPublicUrl(row.storage_path as string);

          return {
            id: row.id as string,
            title: row.title as string,
            artist: (row.artist as string) ?? 'Archivo Remoto',
            category: row.category as PlaylistCategory,
            sourceType: 'local' as const,
            url: urlData.publicUrl,
            duration: (row.duration as number) ?? durationMap[row.category as PlaylistCategory] ?? 12,
            isBuiltIn: true,
          };
        });
    } catch (e) {
      console.warn('[FolderScanner] Scan failed:', e);
      return [];
    }
  }
}
