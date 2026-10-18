import { defineConfig, type Plugin } from 'vite';

const buildId = process.env.GITHUB_SHA ?? `local-${Date.now()}`;

/** Publishes version.json beside the game so open tabs can detect a newer deployment (D-339). */
function buildVersion(): Plugin {
  return {
    name: 'last-light-build-version',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ build: buildId }) });
    },
  };
}

export default defineConfig({
  base: '/LastLightGame/',
  define: { __BUILD_ID__: JSON.stringify(buildId) },
  plugins: [buildVersion()],
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
