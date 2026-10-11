import { readFile, writeFile, unlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const path = 'supabase/tests/.validate-authoritative-game.sql';
const migration = process.argv.includes('--predeploy-friends')
  ? await readFile('supabase/migrations/20261010084500_authoritative_friends.sql', 'utf8') : '';
const files = ['supabase/tests/authoritative_game.sql', 'supabase/tests/authoritative_friends.sql'];
const tests = (await Promise.all(files.map(path => readFile(path, 'utf8'))))
  .map(sql => sql.replace(/^begin;/, '').replace(/rollback;\s*$/, '')).join('\n');
try {
  await writeFile(path, `begin;\n${migration}\n${tests}\nrollback;\n`);
  const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['supabase', 'db', 'query', '--linked', '--file', path], { stdio: 'inherit', shell: process.platform === 'win32' });
  process.exitCode = result.status ?? 1;
} finally { await unlink(path); }
