import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve, join } from 'node:path';

// Isolated PostgreSQL/WASM; never contacts or mutates the hosted database.
// npm install --prefix .social-sql-validation --no-save --package-lock=false @electric-sql/pglite
const require = createRequire(import.meta.url);
const { PGlite } = require(require.resolve('@electric-sql/pglite', {
  paths: [process.cwd(), resolve('.social-sql-validation')],
}));
const database = new PGlite();
try {
  await database.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users (id uuid primary key, raw_user_meta_data jsonb);
    create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;`);
  const directory = join('supabase', 'migrations');
  const migrations = (await readdir(directory)).filter(file => file.endsWith('.sql')).sort();
  for (const migration of migrations) await database.exec(await readFile(join(directory, migration), 'utf8'));
  await database.exec(await readFile(join('supabase', 'tests', 'social_calendar.sql'), 'utf8'));
  await database.exec(await readFile(join('supabase', 'tests', 'acquisition_markers.sql'), 'utf8'));
  console.log('PASS: all migrations applied locally; social/calendar and acquisition SQL assertions passed (transactions rolled back).');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally { await database.close(); }
