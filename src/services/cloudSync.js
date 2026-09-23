/* Optional cloud sync. localStorage stays the source of truth for the demo.
   When the anon URL + key are set, a signed-in parent syncs under RLS.
   VITE_READLY_CLOUD=0 forces on-device mode even if a key is present.
   Missing env, a failed request, or no login all fall back silently. */

import { supabase, supabaseConfigured } from '../lib/supabase.js';

const viteEnv = import.meta.env || {};
const forceLocal = String(viteEnv.VITE_READLY_CLOUD ?? '') === '0';
const MAP_KEY = 'readly.cloud.ids.v1';
const CURSOR_KEY = 'readly.cloud.cursor.v1';

export function cloudMode() {
  if (forceLocal || !supabaseConfigured || !supabase) return 'off';
  return 'ready';
}

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('[cloud] could not persist map', err);
  }
}

let timer = null;
let pushing = false;

export function scheduleCloudPush(state) {
  if (cloudMode() === 'off') return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    pushState(state).catch((err) => {
      console.warn('[cloud] push skipped', err?.message || err);
    });
  }, 700);
}

async function currentUser() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.user) return null;
  return data.session.user;
}

async function ensureChildId(user, profile, map, lang) {
  if (map[profile.id]) return map[profile.id];
  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      owner_id: user.id,
      display_name: profile.name || 'Child',
      age: profile.age || null,
      locale: lang || 'ru',
      interests: profile.interests || [],
      theme: profile.mascot || null,
      demo: Boolean(profile.demo),
      profile_json: profile,
    })
    .select('id')
    .single();
  if (error) throw error;
  map[profile.id] = data.id;
  writeJson(MAP_KEY, map);
  const link = await supabase.from('parent_child_links').insert({
    parent_id: user.id,
    child_id: data.id,
  });
  if (link.error && link.error.code !== '23505') {
    console.warn('[cloud] parent link skipped', link.error.message);
  }
  return data.id;
}

export async function pushState(state) {
  if (cloudMode() === 'off' || pushing) return { pushed: false };
  pushing = true;
  try {
    const user = await currentUser();
    if (!user) return { pushed: false, reason: 'no-session' };
    const map = readJson(MAP_KEY);
    const cursor = readJson(CURSOR_KEY);

    for (const profile of state.profiles || []) {
      const childId = await ensureChildId(user, profile, map, state.lang);
      const { error } = await supabase
        .from('child_profiles')
        .update({
          display_name: profile.name || 'Child',
          age: profile.age || null,
          locale: state.lang || 'ru',
          interests: profile.interests || [],
          theme: profile.mascot || null,
          demo: Boolean(profile.demo),
          profile_json: profile,
          updated_at: new Date().toISOString(),
        })
        .eq('id', childId);
      if (error) throw error;

      const seen = cursor[profile.id] || 0;
      const fresh = (profile.history || []).filter((h) => (h.at || 0) > seen).slice(0, 40);
      if (fresh.length) {
        const rows = fresh.map((h) => ({
          child_id: childId,
          kind: h.module || 'practice',
          payload: {
            ok: Boolean(h.ok),
            skill: h.skill || null,
            word: h.word || null,
            at: h.at || null,
          },
        }));
        const { error: evErr } = await supabase.from('progress_events').insert(rows);
        if (evErr) throw evErr;
        cursor[profile.id] = Math.max(...fresh.map((h) => h.at || 0));
        writeJson(CURSOR_KEY, cursor);
      }
    }

    for (const story of state.stories || []) {
      const childId = map[story.owner];
      if (!childId) continue;
      const storyKey = `story:${story.id}`;
      const row = {
        title: story.title || 'Story',
        body: (story.sentences || []).join('\n'),
        meta: story,
      };
      if (map[storyKey]) {
        const { error } = await supabase.from('stories').update(row).eq('id', map[storyKey]);
        if (error) console.warn('[cloud] story update skipped', error.message);
      } else {
        const { data, error } = await supabase
          .from('stories')
          .insert({ ...row, child_id: childId })
          .select('id')
          .single();
        if (error) {
          console.warn('[cloud] story insert skipped', error.message);
        } else {
          map[storyKey] = data.id;
          writeJson(MAP_KEY, map);
        }
      }
    }
    return { pushed: true };
  } finally {
    pushing = false;
  }
}

export async function pullCloudState() {
  if (cloudMode() === 'off') return null;
  const user = await currentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('child_profiles')
    .select('id, profile_json, display_name, age, interests, theme, demo')
    .order('updated_at', { ascending: false });
  if (error || !data?.length) return null;

  const map = readJson(MAP_KEY);
  const profiles = data.map((row) => {
    const local = row.profile_json && typeof row.profile_json === 'object' ? row.profile_json : {};
    const known = Object.keys(map).find((k) => map[k] === row.id && !k.startsWith('story:'));
    const localId = known || local.id || row.id;
    map[localId] = row.id;
    return {
      ...local,
      id: localId,
      name: local.name || row.display_name,
      age: local.age ?? row.age,
      interests: local.interests || row.interests || [],
      mascot: local.mascot || row.theme,
      demo: local.demo ?? row.demo,
    };
  });
  writeJson(MAP_KEY, map);

  const { data: stories } = await supabase.from('stories').select('meta');
  const restored = (stories || [])
    .map((s) => s.meta)
    .filter((meta) => meta && typeof meta === 'object' && meta.id);
  return { profiles, stories: restored };
}

export async function getParentSession() {
  if (cloudMode() === 'off' || !supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data?.session || null;
}

export async function signInParent(email, password) {
  if (!supabase) return { error: new Error('unconfigured') };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUpParent(email, password) {
  if (!supabase) return { error: new Error('unconfigured') };
  return supabase.auth.signUp({ email, password });
}

export async function signOutParent() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
