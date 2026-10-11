import { build } from 'esbuild';
// One browser-free bundle keeps the existing game/content resolver identical in Deno.
await build({
  entryPoints: ['supabase/functions/game-operation/engine.ts'],
  outfile: 'supabase/functions/game-operation/engine.bundle.js',
  bundle: true, platform: 'neutral', format: 'esm', target: 'es2022',
  treeShaking: true, legalComments: 'none',
});
