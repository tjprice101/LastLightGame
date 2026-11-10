import { createClient } from 'npm:@supabase/supabase-js@2';
import { createGameOperationHandler } from './engine.bundle.js';

const url = Deno.env.get('SUPABASE_URL');
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!url || !serviceKey) throw new Error('Game service configuration missing.');
const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
Deno.serve(createGameOperationHandler(admin, {
  // Radiant is the live battle system; it still requires the entropy secret.
  enabled: 'true',
  secret: Deno.env.get('RADIANT_STUDY_SECRET'),
  calibration: Deno.env.get('RADIANT_STUDY_CALIBRATION'),
}));
