import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const projectRoot = fileURLToPath(new URL('./', import.meta.url));
const cacheDirectory = fileURLToPath(new URL('./node_modules/.vite', import.meta.url));

export default defineConfig({
  root: projectRoot,
  cacheDir: cacheDirectory,
  plugins: [react()],
});
