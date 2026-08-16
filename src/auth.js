import supabase from './utils/supabase';

// Supabase-backed auth helper. This wrapper keeps auth interactions
// centralized and returns a simple session object with `user` and `profile`.

export async function getCurrentSession() {
  try {
    const { data } = await supabase.auth.getSession();
    const session = data?.session ?? null;
    if (!session) return null;
    const user = session.user;
    // fetch profile
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (pErr) return { user, profile: null };
    return { user, profile };
  } catch (e) {
    console.error('getCurrentSession error', e);
    return null;
  }
}

export function onAuthStateChange(handler) {
  return supabase.auth.onAuthStateChange((event, session) => {
    handler(event, session);
  });
}

export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    const user = data.user;
    if (!user) return { ok: false, error: 'No user returned from Supabase' };

    // fetch profile
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (pErr) {
      // profile missing — still allow but notify caller
      return { ok: true, session: { user, profile: null }, warning: 'Profile not found' };
    }

    // insert login log
    try {
      await supabase.from('login_logs').insert([{ user_id: user.id, role: profile.role }]);
    } catch (e) {
      // non-fatal
      console.warn('failed to insert login log', e);
    }

    return { ok: true, session: { user, profile } };
  } catch (e) {
    console.error('signInWithEmail', e);
    return { ok: false, error: e.message || String(e) };
  }
}

export async function signOut() {
  try {
    await supabase.auth.signOut();
    return { ok: true };
  } catch (e) {
    console.error('signOut', e);
    return { ok: false, error: e.message };
  }
}

export const DEMO = {
  professor: { email: 'professor@attendx.demo' },
  studentPassword: 'student123',
};

export default {
  getCurrentSession,
  onAuthStateChange,
  signInWithEmail,
  signOut,
};
