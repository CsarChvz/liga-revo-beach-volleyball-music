#!/usr/bin/env node
/**
 * scripts/upload-audio.mjs
 *
 * Sube todos los archivos de audio de public/audio/ al bucket de Supabase Storage.
 *
 * Uso:
 *   1. Instala dependencias (si no las tienes):
 *        npm install
 *
 *   2. Asegúrate de tener .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
 *      (o pasa las variables directo en el comando):
 *        NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... node scripts/upload-audio.mjs
 *
 *   3. Corre el script desde la raíz del proyecto:
 *        node scripts/upload-audio.mjs
 *
 * El script:
 *   - Lee los archivos de public/audio/<categoria>/*.mp3
 *   - Los sube al bucket "audio-files" bajo <categoria>/<nombre-archivo>
 *   - Muestra progreso en consola
 *   - Omite archivos que ya existan en el bucket (no sobreescribe por default)
 *
 * Para forzar resubida de todos (sobreescribir):
 *        node scripts/upload-audio.mjs --overwrite
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// ── Cargar .env.local manualmente (sin dotenv) ─────────────────────────────
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}
loadEnvLocal();

// ── Configuración ──────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const BUCKET = 'audio-files';
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');
const OVERWRITE = process.argv.includes('--overwrite');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('\n❌  Faltan variables de entorno.');
  console.error('   Crea .env.local con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY\n');
  process.exit(1);
}

// Disable Realtime (not needed for uploads) to avoid the Node 20 WebSocket error.
// @supabase/supabase-js requires WebSocket natively from Node 22+; this script only
// uses Storage and the REST API, so we short-circuit the Realtime client entirely.
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  global: {
    fetch: (url, options) => fetch(url, options),
  },
  realtime: {
    // Provide a no-op WebSocket so the Realtime client initialises without crashing.
    // It will never actually be used since we never subscribe to channels.
    transport: class FakeWS {
      constructor() { this.readyState = 3; /* CLOSED */ }
      close() {}
      send() {}
    },
  },
});

// ── Utilidades ─────────────────────────────────────────────────────────────
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|flac|aac)$/i;

/**
 * Sanitize a filename for Supabase Storage:
 * - Normalize unicode (NFD) then strip combining diacritics (accents)
 * - Replace any remaining non-ASCII or problematic chars with safe equivalents
 * Keeps spaces, dots, hyphens, parentheses — all valid in Storage keys.
 */
function sanitizeFileName(name) {
  return name
    .normalize('NFD')                          // decompose accented chars: é → e + ́
    .replace(/[\u0300-\u036f]/g, '')           // strip the combining accent marks
    .replace(/[^\w\s.\-()[\],]/g, '_');        // replace anything else odd with _
}

function mimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const map = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac',
  };
  return map[ext] ?? 'audio/mpeg';
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Colectar archivos ──────────────────────────────────────────────────────
function collectFiles() {
  const files = [];
  if (!fs.existsSync(AUDIO_DIR)) {
    console.error(`❌  No se encontró la carpeta: ${AUDIO_DIR}`);
    process.exit(1);
  }
  for (const category of fs.readdirSync(AUDIO_DIR)) {
    const categoryDir = path.join(AUDIO_DIR, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;
    for (const fileName of fs.readdirSync(categoryDir)) {
      if (!AUDIO_EXT.test(fileName)) continue;
      const localPath = path.join(categoryDir, fileName);
      const safeFileName = sanitizeFileName(fileName);
      const storagePath = `${category}/${safeFileName}`;
      files.push({ localPath, storagePath, category, fileName, safeFileName });
    }
  }
  return files;
}

// ── Subida principal ───────────────────────────────────────────────────────
async function uploadFiles() {
  const files = collectFiles();

  console.log(`\n🎵  Liga Revo — Subida de Audio a Supabase Storage`);
  console.log(`   Bucket : ${BUCKET}`);
  console.log(`   Archivos encontrados: ${files.length}`);
  console.log(`   Modo: ${OVERWRITE ? 'SOBREESCRIBIR (--overwrite)' : 'omitir si ya existe'}\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const { localPath, storagePath, fileName, safeFileName } of files) {
    const stats = fs.statSync(localPath);
    const fileBuffer = fs.readFileSync(localPath);
    const mime = mimeType(fileName);

    if (!OVERWRITE) {
      // Verificar si ya existe
      const { data: existing } = await supabase.storage.from(BUCKET).list(
        path.dirname(storagePath),
        { search: path.basename(storagePath) }
      );
      if (existing && existing.some((f) => f.name === path.basename(storagePath))) {
        console.log(`  ⏭  Omitido (ya existe)  ${storagePath}`);
        skipped++;
        continue;
      }
    }

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileBuffer, {
        contentType: mime,
        upsert: OVERWRITE,
      });

    if (error) {
      // "already exists" no es un error real cuando no está en modo overwrite
      if (error.message?.includes('already exists')) {
        console.log(`  ⏭  Omitido (ya existe)  ${storagePath}`);
        skipped++;
      } else {
        console.error(`  ❌  Error  ${storagePath}: ${error.message}`);
        failed++;
      }
    } else {
      const renamed = safeFileName !== fileName ? ` → ${safeFileName}` : '';
      console.log(`  ✅  Subido  ${storagePath}${renamed}  (${formatBytes(stats.size)})`);
      uploaded++;
    }
  }

  console.log(`\n──────────────────────────────────────────`);
  console.log(`  ✅ Subidos  : ${uploaded}`);
  console.log(`  ⏭  Omitidos : ${skipped}`);
  console.log(`  ❌ Errores  : ${failed}`);
  console.log(`──────────────────────────────────────────`);

  if (failed > 0) {
    console.log('\n⚠️  Algunos archivos fallaron. Revisa los errores arriba y vuelve a correr el script.');
    process.exit(1);
  } else {
    console.log('\n🎉  ¡Todos los archivos fueron procesados exitosamente!');
    console.log('   Siguiente paso: corre el SQL de supabase/seed-builtin-tracks.sql en el dashboard.\n');
  }
}

uploadFiles().catch((err) => {
  console.error('Error inesperado:', err);
  process.exit(1);
});
