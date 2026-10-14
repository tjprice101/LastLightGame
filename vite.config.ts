import { defineConfig } from 'vite';

export default defineConfig({
  base: '/LastLightGame/',
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: 'index.html',
        animationPreview: 'animation-preview.html',
        vfxPreview: 'vfx-preview.html',
      },
    },
  },
});
