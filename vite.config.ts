import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

/** Copies public/apple-touch-icon.png to standard PWA PNG sizes (never overwrites the source). */
function ensurePwaIcons(): Plugin {
  const syncIcons = () => {
    const pub = join(rootDir, 'public')
    mkdirSync(pub, { recursive: true })

    const source = join(pub, 'apple-touch-icon.png')
    if (!existsSync(source)) return

    for (const name of [
      'android-chrome-512x512.png',
      'android-chrome-192x192.png',
      'og-image.png',
    ]) {
      copyFileSync(source, join(pub, name))
    }
  }

  return {
    name: 'ensure-pwa-icons',
    buildStart() {
      syncIcons()
    },
    configureServer() {
      syncIcons()
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ensurePwaIcons(),
  ],
})
