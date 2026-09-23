/* Supabase browser client.
   Dual-mode: with URL + anon key the client is created; without them
   every caller stays on localStorage. The service-role key is refused. */

import { createClient } from '@supabase/supabase-js';

const viteEnv = import.meta.env || {};
const url = String(viteEnv.VITE_SUPABASE_URL || '').trim();
const anonKey = String(viteEnv.VITE_SUPABASE_ANON_KEY || '').trim();

function jwtRole(key) {
  try {
    const part = key.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json);
    return payload.role || null;
  } catch {
    return null;
  }
}

const role = anonKey ? jwtRole(anonKey) : null;
const serviceRoleBlocked = role === 'service_role';

export const supabaseConfigured = Boolean(url && anonKey && !serviceRoleBlocked);

if (serviceRoleBlocked) {
  console.warn('[supabase] service_role key ignored in the browser. Use the anon key.');
}

export const supabase = supabaseConfigured
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: 'readly.supabase.auth',
      },
    })
  : null;
