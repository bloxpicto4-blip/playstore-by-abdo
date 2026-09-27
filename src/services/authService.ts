import { getSupabaseClient, isSupabaseConfigured } from './supabase';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  provider: 'supabase' | 'local';
}

const LOCAL_ADMIN_KEY = 'gamehub_admin_session';

export const getCurrentAdmin = async (): Promise<AdminUser | null> => {
  // 1. Check Supabase Auth if configured
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return {
          id: session.user.id,
          email: session.user.email || 'admin@gamehub.io',
          role: 'admin',
          provider: 'supabase',
        };
      }
    } catch (err) {
      console.warn('Supabase auth getSession check failed:', err);
    }
  }

  // 2. Check local admin session
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem(LOCAL_ADMIN_KEY);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed?.email === 'admin@gamehub.io' || parsed?.id === 'admin_local_primary') {
          localStorage.removeItem(LOCAL_ADMIN_KEY);
          return null;
        }
        return parsed;
      } catch {
        localStorage.removeItem(LOCAL_ADMIN_KEY);
      }
    }
  }

  return null;
};

export const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> => {
  const supabase = getSupabaseClient();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If user doesn't exist yet in Supabase Auth, attempt sign up or notify
        if (error.message.includes('Invalid login credentials')) {
          // If demo admin credentials are used, provide clear error with fallback hint
          return { success: false, error: 'Invalid credentials in Supabase project. If you haven\'t created the admin user in Supabase Auth yet, please add it in the Supabase Dashboard.' };
        }
        return { success: false, error: error.message };
      }

      if (data.user) {
        const admin: AdminUser = {
          id: data.user.id,
          email: data.user.email || email,
          role: 'admin',
          provider: 'supabase',
        };
        return { success: true, user: admin };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Supabase authentication failed' };
    }
  }

  // Admin credentials verification
  const normalizedUser = (email || '').toLowerCase().trim();
  if (
    (normalizedUser === 'body' || normalizedUser === 'body@gamehub.io') &&
    password === 'adminuser'
  ) {
    const admin: AdminUser = {
      id: 'admin_body_primary',
      email: normalizedUser,
      role: 'admin',
      provider: 'local',
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(admin));
    }
    return { success: true, user: admin };
  }

  return {
    success: false,
    error: 'Invalid username or password. Please check your credentials.',
  };
};

export const logoutAdmin = async (): Promise<void> => {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign out error:', err);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_ADMIN_KEY);
  }
};
