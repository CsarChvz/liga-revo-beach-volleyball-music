# Project Coding Rules (Non-Obvious Only)

- **Never import audio files through Vite**. `import.meta.glob` for MP3s causes Rollup to hash-copy every file into `dist/assets`. Use Supabase Storage URLs instead.
- **Always import the `audioEngine` singleton** from `src/services/audioEngine.ts` — never instantiate `AudioEngineService` directly.
- `verbatimModuleSyntax` is ON → **use `import type`** for all type-only imports or the build (`tsc -b`) will fail.
- `noUnusedLocals` and `noUnusedParameters` are errors — unused variables break the build.
- Stable-callback pattern in hooks: store the latest handler in a `useRef`, reference only the ref inside the event listener, keep `useEffect` deps empty (see `useHotkeys.ts`, `useAudioPlayer.ts`).
- `StorageService.savePlaylists()` is **fire-and-forget async** — it calls `_savePlaylistsRemote()` without await, so callers stay synchronous. Do not await `savePlaylists()`.
- `FolderScannerService.clearCache()` must be called after uploading a built-in track to force a fresh Supabase query on next load.
- When adding a new `PlaylistCategory`, update **five** locations: `src/types/audio.ts`, `storageService.ts` (INITIAL_PLAYLISTS), `audioEngine.ts` (categoryDurations + jingleActive + auto-fade), `folderScannerService.ts` (validCategories + durationMap), `supabase/schema.sql` (playlist_state seed).
- `supabase/schema.sql` must be re-run manually in the Supabase dashboard after any schema changes — there is no migration runner.
