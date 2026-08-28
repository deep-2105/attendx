import supabase from './utils/supabase';

// Supabase-backed auth helper.
// Production profile reads use the SECURITY DEFINER RPC. The direct table
// lookup is only a compatibility fallback when the RPC is unavailable.

async function loadProfile(user) {
  if (!user?.id) {
    return { profile: null, error: new Error('Supabase returned no user id') };
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc('get_my_profile');

  if (!rpcError) {
    const profile = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (profile) return { profile, error: null };
    return { profile: null, error: new Error('No matching AttendX profile found') };
  }

  // Compatibility path for environments where the RPC has not been deployed.
  // Do not treat a normal RLS denial as a successful empty profile.
  const primary = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (!primary.error && primary.data) {
    return { profile: primary.data, error: null };
  }

  return {
    profile: null,
    error:
      primary.error ||
      rpcError ||
      new Error('No matching AttendX profile found')
  };
}

function formatProfileError(error) {
  if (!error) return 'Profile not found in Supabase.';
  const code = error.code ? ` [${error.code}]` : '';
  return `${error.message || 'Unable to read profile from Supabase.'}${code}`;
}

export async function getCurrentSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    const session = data?.session ?? null;
    if (!session) return null;

    const user = session.user;
    const result = await loadProfile(user);
    if (result.error) {
      console.error('getCurrentSession profile lookup failed:', result.error);
      return { user, profile: null, profileError: formatProfileError(result.error) };
    }
    return { user, profile: result.profile };
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

    const result = await loadProfile(user);
    if (result.error || !result.profile) {
      console.error('Profile lookup after login failed:', result.error);
      return {
        ok: false,
        error: `Supabase login succeeded, but AttendX could not read your profile. ${formatProfileError(result.error)}`
      };
    }

    const profile = result.profile;

    try {
      const { error: logError } = await supabase
        .from('login_logs')
        .insert([{ user_id: user.id, role: profile.role }]);
      if (logError) console.warn('failed to insert login log', logError);
    } catch (e) {
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

export default {
  getCurrentSession,
  onAuthStateChange,
  signInWithEmail,
  signOut,
};
