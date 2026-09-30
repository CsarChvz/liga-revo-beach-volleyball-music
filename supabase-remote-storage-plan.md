# Plan: Supabase Remote Storage + Fire Ball Pad

## Overview

Replace all local browser storage (IndexedDB blobs, localStorage order, `public/audio/` static files) with **Supabase** as the single remote backend:
- **Supabase Storage** bucket `audio-files` for all audio file blobs
- **Supabase PostgreSQL** table `tracks` for track metadata, category assignments, and playlist ordering

Also add a new **FIRE BALL** jingle pad (between Monster Block and Ace), with hotkey `F`, category `fire_ball`, identical 12s/9+3-fade behavior to the other jingles.

The app is mono-user / no authentication. Supabase Row Level Security will be set to public read/write for simplicity.

---

## Sub-Tasks

---

### Sub-Task 1 — Add `fire_ball` Category to All Type/Data Locations

**Intent**
Introduce the `fire_ball` `PlaylistCategory` value across every file that uses a `Record<PlaylistCategory, ...>` or union type. This is a prerequisite for all other tasks.

**Expected Outcomes**
- TypeScript build (`tsc -b`) passes with the new category.
- `INITIAL_PLAYLISTS`, `categoryDurations`, `durationMap`, `jingleActive`, `validCategories` all include `fire_ball`.
- `syntheticAudio.ts` has a new `playFireBall()` method for the built-in fallback sound.
- `AudioTrack.syntheticType` and `jingleType` union types include `fire_ball` variants.

**Todo List**
- [ ] In `src/types/audio.ts`: add `'fire_ball'` to `PlaylistCategory` union; add `'fireball_synth'` to `syntheticType`; add `'fire_ball'` to `jingleType`.
- [ ] In `src/services/storageService.ts`: add `fire_ball` entry to `INITIAL_PLAYLISTS` with name `"6. Fire Ball Jingles"`.
- [ ] In `src/services/audioEngine.ts`: add `fire_ball: 12` to `categoryDurations`; add `|| track.category === 'fire_ball'` to the `jingleActive` condition; add `fire_ball` to the `autoFadeTimer` category check (9s+3s fade).
- [ ] In `src/services/folderScannerService.ts`: add `fire_ball: 12` to `durationMap`; add `'fire_ball'` to `validCategories` array.
- [ ] In `src/services/syntheticAudio.ts`: add `playFireBall()` method (fire/explosion energy effect using Web Audio API).
- [ ] In `src/services/audioEngine.ts` `playSyntheticTrack()`: add branch for `fire_ball` / `fireball_synth` that calls `syntheticAudio.playFireBall()`.

**Relevant Context**
- `src/types/audio.ts` — `PlaylistCategory`, `AudioTrack.syntheticType`, `AudioTrack.jingleType`
- `src/services/audioEngine.ts` lines 157–204 — `jingleActive`, `categoryDurations`, `autoFadeTimer` block, `playSyntheticTrack()`
- `src/services/folderScannerService.ts` lines 32–52 — `validCategories`, `durationMap`
- `src/services/storageService.ts` lines 7–64 — `INITIAL_PLAYLISTS`
- `src/services/syntheticAudio.ts` — `playSuperSpike()` as the pattern to follow for `playFireBall()`

**Status:** [x] done

---

### Sub-Task 2 — Add Fire Ball UI Pad and Hotkey

**Intent**
Add the FIRE BALL `StreamDeckPad` to `App.tsx` between Monster Block (pad 6) and Ace (pad 7), and register the `F` hotkey in `useHotkeys`.

**Expected Outcomes**
- App renders 9 pads; FIRE BALL appears between MONSTER BLOCK and ACE.
- Pressing `F` triggers FIRE BALL playback.
- `padTheme` is `'red'` — add `'red'` to the `padTheme` union in `StreamDeckPad` props if not already there.
- `useAudioPlayer` exposes a `playFireBall` function.

**Todo List**
- [ ] In `src/components/StreamDeckPad.tsx`: add `'red'` to the `padTheme` union type; add `red` color classes to the theme map inside the component.
- [ ] In `src/hooks/useAudioPlayer.ts`: add `playFireBall` as `useCallback(() => playCategoryPlaylist('fire_ball'), [playCategoryPlaylist])` and include it in the return object.
- [ ] In `src/hooks/useHotkeys.ts`: add `onFireBall: () => void` to `HotkeyHandlers`; add `case 'KeyF': handlersRef.current.onFireBall()` to the switch.
- [ ] In `src/App.tsx`: destructure `playFireBall` from `useAudioPlayer`; pass `onFireBall: playFireBall` to `useHotkeys`; insert a new `<StreamDeckPad>` for `fire_ball` after the Monster Block pad (pad 6, before Ace).

**Relevant Context**
- `src/App.tsx` lines 91–208 — current pad grid, hotkey wiring
- `src/components/StreamDeckPad.tsx` — `padTheme` union, theme CSS map
- `src/hooks/useHotkeys.ts` — `HotkeyHandlers` interface, switch cases
- `src/hooks/useAudioPlayer.ts` — `playAce`, `playSuperSpike` as patterns for `playFireBall`

**Status:** [x] done

---

### Sub-Task 3 — Set Up Supabase Project and Schema

**Intent**
Document the one-time Supabase setup steps (done manually in the Supabase dashboard) and create the environment variable wiring so the app can connect.

**Expected Outcomes**
- Supabase project created with a Storage bucket `audio-files` (public).
- PostgreSQL table `tracks` created with the schema below.
- `.env.local` file created with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `.gitignore` confirms `.env.local` is ignored (already present, verify).
- `supabase-js` package installed.

**Supabase `tracks` Table Schema**
```sql
create table tracks (
  id          text primary key,
  title       text not null,
  artist      text,
  category    text not null,
  source_type text not null default 'local',
  storage_path text,          -- path inside the bucket, e.g. "super_spike/filename.mp3"
  duration    numeric,
  is_built_in boolean default false,
  playlist_order integer,     -- position within category (0-based)
  created_at  timestamptz default now()
);
```

Row Level Security: disabled (mono-user, no auth).

**Todo List**
- [ ] Install `@supabase/supabase-js` via npm.
- [ ] Create `src/lib/supabaseClient.ts` that initializes and exports the Supabase client using `import.meta.env.NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Create `.env.local` with placeholder values and document what to fill in.
- [ ] Verify `.gitignore` ignores `.env.local`.
- [ ] Document the SQL to run in Supabase dashboard (table + bucket creation) in a `supabase/schema.sql` file in the repo root.

**Relevant Context**
- `package.json` — add `@supabase/supabase-js` to dependencies
- Security rules: `VITE_*` env vars are safe for public anon keys (Supabase anon key is designed to be public)
- `src/lib/` directory does not exist yet — create it

**Status:** [x] done

---

### Sub-Task 4 — Replace `dbService.ts` with Supabase Storage Service

**Intent**
Create a new `src/services/supabaseStorageService.ts` that mirrors the `dbService` API (save, getAll, delete audio files) but stores blobs in Supabase Storage and metadata in the `tracks` table. Redirect `storageService.ts` to use it instead of `dbService`.

**Expected Outcomes**
- `supabaseStorageService.ts` exports functions: `saveAudioFile`, `getAllAudioFiles`, `deleteAudioFile`.
- `storageService.ts` imports from `supabaseStorageService` instead of `dbService`.
- Uploading an MP3 in the browser saves the blob to Supabase Storage bucket `audio-files/<category>/filename` and inserts a row in `tracks`.
- Deleting a track removes the blob from Storage and deletes the row from `tracks`.
- `dbService.ts` is kept but no longer called (can be removed later or deprecated).

**Upload flow:**
1. Upload `File` blob to `supabase.storage.from('audio-files').upload('<category>/<filename>', file)`.
2. Get the public URL via `supabase.storage.from('audio-files').getPublicUrl(path)`.
3. Insert a row into `tracks` with the metadata and `storage_path`.

**Todo List**
- [ ] Create `src/services/supabaseStorageService.ts` with `saveAudioFile(item)`, `getAllAudioFiles()`, `deleteAudioFile(id)` matching the `StoredAudioFile` shape.
- [ ] In `getAllAudioFiles()`: query `tracks` table for rows where `is_built_in = false`, map each row's `storage_path` to a public URL, return as array matching `StoredAudioFile` shape (with a synthetic `blob: null` — adjust the `StorageService` consumer to accept `url` directly instead of `URL.createObjectURL`).
- [ ] In `storageService.ts` `loadPlaylistsAsync()`: replace `dbService.getAllAudioFiles()` call with `supabaseStorageService.getAllAudioFiles()` and use the public URL directly (skip `URL.createObjectURL`).
- [ ] In `storageService.ts` `saveUploadedFile()` and `deleteUploadedFile()`: replace `dbService` calls with `supabaseStorageService` equivalents.

**Relevant Context**
- `src/services/dbService.ts` — current interface to match
- `src/services/storageService.ts` lines 82–96 — where `dbFiles` are consumed (note `URL.createObjectURL` call to adapt)
- `src/lib/supabaseClient.ts` — created in Sub-Task 3

**Status:** [x] done

---

### Sub-Task 5 — Replace Folder Scanner with Supabase Track Query

**Intent**
Replace `FolderScannerService` (which fetches `audio-manifest.json` generated from `public/audio/`) with a Supabase DB query for tracks marked `is_built_in = true`. The `audioManifestPlugin` in `vite.config.ts` and the `public/audio/` drop-folder system become optional legacy.

**Expected Outcomes**
- `FolderScannerService.scanAudioFolders()` now queries `select * from tracks where is_built_in = true` from Supabase.
- Tracks previously dropped in `public/audio/` folders can instead be uploaded directly to Supabase Storage via a one-time script or the app's playlist manager.
- `vite.config.ts` `audioManifestPlugin` is kept but bypassed when Supabase is configured (graceful fallback: if Supabase URL env var is set, skip manifest fetch).
- The app works with zero files in `public/audio/`.

**Todo List**
- [ ] Rewrite `FolderScannerService.doScan()` to query Supabase `tracks` table (`is_built_in = true`) and construct `AudioTrack` objects with the public Storage URLs.
- [ ] Keep the old manifest fetch as a fallback path when `import.meta.env.NEXT_PUBLIC_SUPABASE_URL` is not set (for local dev without Supabase).
- [ ] Update `cachedTracksPromise` invalidation: expose a `clearCache()` static method so the cache can be busted after an upload.

**Relevant Context**
- `src/services/folderScannerService.ts` — full rewrite of `doScan()`
- `src/lib/supabaseClient.ts` — created in Sub-Task 3
- `src/services/storageService.ts` line 77 — calls `FolderScannerService.scanAudioFolders()`

**Status:** [x] done

---

### Sub-Task 6 — Replace localStorage Playlist Order with Supabase DB

**Intent**
Replace the `localStorage` key `volley_soundboard_playlists_v3` (which stores only track IDs and `currentIndex` per category) with a `playlist_order` integer column in the `tracks` table and a separate lightweight `playlist_state` table for `currentIndex`.

**Expected Outcomes**
- `StorageService.savePlaylists()` upserts `playlist_order` per track row in Supabase instead of writing to `localStorage`.
- `StorageService.loadPlaylistsAsync()` reads ordering from Supabase (already done via the `tracks` query in Sub-Tasks 4 and 5).
- `localStorage` is no longer written to for playlist state (remove the `STORAGE_KEY_PLAYLISTS` write).
- A `playlist_state` table stores `{ category, current_index }` for persistence of the active track pointer.

**`playlist_state` Table Schema**
```sql
create table playlist_state (
  category      text primary key,
  current_index integer default 0
);
```

**Todo List**
- [ ] Add `playlist_state` table creation to `supabase/schema.sql`.
- [ ] In `StorageService.savePlaylists()`: upsert `playlist_order` for each track (bulk update), upsert `current_index` for each category into `playlist_state`.
- [ ] In `StorageService.loadPlaylistsAsync()`: after assembling tracks from Supabase queries, fetch `playlist_state` rows and apply `current_index` values per category.
- [ ] Remove or ignore reads/writes to `localStorage` key `volley_soundboard_playlists_v3`.

**Relevant Context**
- `src/services/storageService.ts` lines 98–117 — localStorage read/restore logic to replace
- `src/services/storageService.ts` lines 152–165 — `savePlaylists()` write logic to replace
- `src/lib/supabaseClient.ts`

**Status:** [x] done

---

### Sub-Task 7 — Update AGENTS.md

**Intent**
Update project documentation to reflect the new architecture.

**Expected Outcomes**
- `AGENTS.md` documents Supabase as the storage backend, environment variable requirements, and that `public/audio/` is now legacy.
- `AGENTS.md` documents the new `fire_ball` category.
- `.bob/rules-*` files updated accordingly.

**Todo List**
- [ ] Update `AGENTS.md`: replace audio manifest section with Supabase storage section; document `.env.local` requirements; add `fire_ball` to the category list.
- [ ] Update `.bob/rules-agent/AGENTS.md` and `.bob/rules-plan/AGENTS.md` with Supabase architecture notes.

**Status:** [x] done
