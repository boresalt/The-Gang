import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Relative base so the built app works from boresalt.github.io/The-Gang/planner/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: { outDir: '../planner', emptyOutDir: true },
})
