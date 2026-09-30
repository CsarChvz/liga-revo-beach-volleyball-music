# Project Architecture Rules (Non-Obvious Only)

- **Zero-overlap constraint is architectural**: `audioEngine.playTrack()` always calls `emergencyStop()` first. Any feature needing overlapping audio (e.g., jingle over music) would require a second audio context channel — the current engine has no mixing.
- **Two-phase playlist load is intentional**: `loadPlaylistsSync()` → empty shell (no tracks, renders immediately); `loadPlaylistsAsync()` → hydrates from Supabase moments later. UI must tolerate empty playlists on first render.
- **`FolderScannerService` has a cached promise** — it only hits Supabase once per page load. Call `clearCache()` after inserting a new built-in track or the new track won't appear until refresh.
- **`savePlaylists()` is fire-and-forget** — Supabase upserts run async in the background. There is no feedback if they fail (only console.warn). The UI never blocks on saves.
- `FolderScannerService` auto-detects Supabase vs. manifest fallback by checking `import.meta.env.NEXT_PUBLIC_SUPABASE_URL`. If the env var is unset, it falls back to `public/audio/` + `audio-manifest.json` silently.
- **`_applyRemoteOrder` in StorageService** fetches two separate Supabase tables (`tracks` + `playlist_state`) in parallel. Track IDs that exist in the remote order but not in the local `trackMap` (e.g., tracks deleted from Supabase) are silently skipped.
- Tailwind v4 has **no `tailwind.config.js`** — custom theme tokens go in `src/index.css` using CSS `@theme`.
- The Supabase anon key is intentionally public (by Supabase design) — it is safe to include in `VITE_*` env vars.
- `supabase/schema.sql` seeds all 9 categories into `playlist_state` — adding a new category requires updating both the seed and the TypeScript union.
