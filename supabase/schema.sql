-- ============================================================
-- Liga Revo Beach Volleyball Music — Supabase Schema
-- Run this SQL in your Supabase project:
--   Dashboard → SQL Editor → New query → paste & run
-- ============================================================

-- ----------------------------------------------------------------
-- 1. Storage bucket
-- ----------------------------------------------------------------
-- Create this via: Storage → New bucket
--   Name:   audio-files
--   Public: true (allows public URL access for audio playback)
-- Or with the Storage API:
-- insert into storage.buckets (id, name, public)
-- values ('audio-files', 'audio-files', true);


-- ----------------------------------------------------------------
-- 2. tracks table
--    Stores metadata for every audio file (uploaded + built-in).
--    playlist_order = position within category (0-based).
-- ----------------------------------------------------------------
create table if not exists tracks (
  id            text primary key,
  title         text not null,
  artist        text,
  category      text not null,
  source_type   text not null default 'local',
  storage_path  text,          -- e.g. "super_spike/mi-cancion.mp3"
  duration      numeric,
  is_built_in   boolean default false,
  playlist_order integer default 0,
  created_at    timestamptz default now()
);

-- Index for fast per-category queries
create index if not exists tracks_category_idx on tracks (category, playlist_order);


-- ----------------------------------------------------------------
-- 3. playlist_state table
--    Persists the currentIndex (next track pointer) per category.
-- ----------------------------------------------------------------
create table if not exists playlist_state (
  category      text primary key,
  current_index integer default 0
);

-- Seed one row per category so upserts always work
insert into playlist_state (category, current_index) values
  ('presentation', 0),
  ('point_intros', 0),
  ('technical_timeouts', 0),
  ('super_spike', 0),
  ('monster_block', 0),
  ('fire_ball', 0),
  ('ace', 0),
  ('timeout_continuous', 0),
  ('awards', 0)
on conflict (category) do nothing;


-- ----------------------------------------------------------------
-- 4. Row Level Security
--    Disabled — this is a single-operator app with no auth.
--    All access is through the public anon key.
-- ----------------------------------------------------------------
alter table tracks disable row level security;
alter table playlist_state disable row level security;
