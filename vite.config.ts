import fs from 'node:fs'
import path from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const AUDIO_EXT_RE = /\.(mp3|wav|ogg|m4a|flac|aac)$/i

/**
 * Scans publicDir/audio/<category>/<file> on disk (plain fs, no Vite asset pipeline)
 * so folderScannerService can discover tracks at runtime via a JSON manifest instead
 * of importing every mp3 through import.meta.glob (which forced Vite/Rollup to hash
 * and duplicate hundreds of MB of audio into dist/assets on every build).
 */
function scanAudioManifest(publicDir: string): { category: string; fileName: string }[] {
  const audioDir = path.join(publicDir, 'audio')
  const manifest: { category: string; fileName: string }[] = []
  if (!fs.existsSync(audioDir)) return manifest

  for (const category of fs.readdirSync(audioDir)) {
    const categoryDir = path.join(audioDir, category)
    if (!fs.statSync(categoryDir).isDirectory()) continue
    for (const fileName of fs.readdirSync(categoryDir)) {
      if (AUDIO_EXT_RE.test(fileName)) {
        manifest.push({ category, fileName })
      }
    }
  }
  return manifest
}

function audioManifestPlugin(): Plugin {
  let publicDir = ''
  return {
    name: 'audio-manifest',
    configResolved(config) {
      publicDir = config.publicDir
    },
    // Production build: bake the manifest into public/ once, so Vite's normal
    // publicDir passthrough copies it (and only it, not the source mp3s) to dist/.
    buildStart() {
      fs.writeFileSync(
        path.join(publicDir, 'audio-manifest.json'),
        JSON.stringify(scanAudioManifest(publicDir))
      )
    },
    // Dev server: always compute fresh so newly-dropped files show up without a restart.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/audio-manifest.json') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(scanAudioManifest(publicDir)))
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), audioManifestPlugin()],
})

