import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { visualizer } from "rollup-plugin-visualizer";
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss(), visualizer({ open: true })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          leaflet: ["leaflet"],
        },
      },
    },
  },
});
