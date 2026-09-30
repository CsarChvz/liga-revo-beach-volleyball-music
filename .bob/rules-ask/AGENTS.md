# Project Documentation Context (Non-Obvious Only)

- The `public/audio-manifest.json` file is **auto-generated** by Vite at build/dev-server start — do not edit it manually and do not commit it as a source-of-truth.
- `README.md` is the default Vite template README and contains no real project docs; ignore it for architecture questions.
- Audio categories with "Jingles" in their display name (`super_spike`, `monster_block`, `ace`) share identical timing logic (12s with 9+3 fade) — `jingleActive` flag in `PlayingState` covers all three.
- `syntheticAudio` service provides Web Audio API fallback sounds when no real MP3s exist; it is not a testing stub — it ships to production as a built-in demo.
- The `timeout_continuous` category auto-advances through its playlist via a `naturalEndCallback` set on the engine — this is not standard sequential playback; it's a fire-and-callback loop managed in `useAudioPlayer`.
