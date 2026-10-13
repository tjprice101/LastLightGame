import { readFile, writeFile, unlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const path = 'supabase/tests/.validate-authoritative-game.sql';
const predeploy = process.argv.find(arg => arg.startsWith('--predeploy-'))?.slice('--predeploy-'.length);
const migrationFiles = {
  friends: 'supabase/migrations/20261010084500_authoritative_friends.sql',
  autosave: 'supabase/migrations/20261010090000_autosave_checkpoint.sql',
  profile: 'supabase/migrations/20261010100000_profile_references.sql',
  presence: 'supabase/migrations/20261011090000_friend_presence.sql',
  chat: 'supabase/migrations/20261012030000_friend_chat.sql',
};
const migration = predeploy ? await readFile(migrationFiles[predeploy], 'utf8') : '';
const files = ['supabase/tests/authoritative_game.sql'];
if (predeploy !== 'friends') files.push('supabase/tests/authoritative_friends.sql');
if (predeploy !== 'friends' && predeploy !== 'autosave') files.push('supabase/tests/autosave_checkpoint.sql');
if (!predeploy || ['profile', 'presence', 'chat'].includes(predeploy)) files.push('supabase/tests/profile_references.sql');
if (!predeploy || predeploy === 'presence' || predeploy === 'chat') files.push('supabase/tests/friend_presence.sql');
if (!predeploy || predeploy === 'chat') files.push('supabase/tests/friend_chat.sql');
const tests = (await Promise.all(files.map(path => readFile(path, 'utf8'))))
  .map(sql => sql.replace(/^begin;/, '').replace(/rollback;\s*$/, '')).join('\n');
try {
  await writeFile(path, `begin;\n${migration}\n${tests}\nrollback;\n`);
  const result = spawnSync(process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['supabase', 'db', 'query', '--linked', '--file', path], { stdio: 'inherit', shell: process.platform === 'win32' });
  process.exitCode = result.status ?? 1;
} finally { await unlink(path); }
