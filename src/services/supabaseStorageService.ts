/**
 * Supabase Storage Service — replaces IndexedDB (dbService.ts) for uploaded audio files.
 *
 * Files are stored in the 'audio-files' Supabase Storage bucket under:
 *   <category>/<sanitised-filename>
 *
 * Metadata is persisted in the 'tracks' table (is_built_in = false).
 */

import { supabase } from '../lib/supabaseClient';
import type { PlaylistCategory } from '../types/audio';

const BUCKET = 'audio-files';

// Shape returned from getAllAudioFiles() — mirrors the fields StorageService needs.
export interface RemoteAudioFile {
  id: string;
  title: string;
  artist: string;
  category: PlaylistCategory;
  duration: number;
  url: string; // public URL — use directly, no createObjectURL needed
  storagePath: string;
}

function sanitiseFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\-]/g, '_');
}

/**
 * Upload a File blob to Supabase Storage and insert a metadata row in `tracks`.
 */
export async function saveAudioFile(
  id: string,
  file: File,
  title: string,
  artist: string,
  category: PlaylistCategory,
  duration: number
): Promise<void> {
  const safeName = sanitiseFileName(file.name);
  const storagePath = `${category}/${id}_${safeName}`;

  // 1. Upload blob to bucket
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.warn('[SupabaseStorage] Upload failed:', uploadError.message);
    throw uploadError;
  }

  // 2. Insert metadata row
  const { error: dbError } = await supabase.from('tracks').upsert({
    id,
    title,
    artist,
    category,
    source_type: 'local',
    storage_path: storagePath,
    duration,
    is_built_in: false,
    playlist_order: 9999, // will be corrected by savePlaylists on next save
  });

  if (dbError) {
    console.warn('[SupabaseStorage] Metadata insert failed:', dbError.message);
    throw dbError;
  }
}

/**
 * Fetch all uploaded (non-built-in) tracks from Supabase and return their public URLs.
 */
export async function getAllAudioFiles(): Promise<RemoteAudioFile[]> {
  const { data, error } = await supabase
    .from('tracks')
    .select('id, title, artist, category, duration, storage_path')
    .eq('is_built_in', false)
    .order('playlist_order', { ascending: true });

  if (error) {
    console.warn('[SupabaseStorage] Failed to fetch tracks:', error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(row.storage_path as string);

    return {
      id: row.id as string,
      title: row.title as string,
      artist: (row.artist as string) ?? '',
      category: row.category as PlaylistCategory,
      duration: (row.duration as number) ?? 12,
      url: urlData.publicUrl,
      storagePath: row.storage_path as string,
    };
  });
}

/**
 * Delete a track's blob from Storage and remove its metadata row.
 */
export async function deleteAudioFile(id: string): Promise<void> {
  // 1. Fetch storage_path first
  const { data, error: fetchError } = await supabase
    .from('tracks')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.warn('[SupabaseStorage] Could not find track to delete:', fetchError.message);
    return;
  }

  const storagePath = data?.storage_path as string | null;

  // 2. Delete from DB
  await supabase.from('tracks').delete().eq('id', id);

  // 3. Delete blob from storage (best-effort)
  if (storagePath) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([storagePath]);
    if (storageError) {
      console.warn('[SupabaseStorage] Blob delete failed:', storageError.message);
    }
  }
}
