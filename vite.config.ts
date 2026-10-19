import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], test: { include: ['src/tests/**/*.test.ts'], environment: 'node' }, build: { rollupOptions:{output:{manualChunks(id){if(id.includes('@dimforge'))return 'physics';if(id.includes('node_modules/three/')||id.includes('node_modules/three-stdlib/'))return 'three';if(id.includes('@react-three'))return 'react-three';}}} }, server: { port: 5173, strictPort: true } });
