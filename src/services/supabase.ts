import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Global cached config
let cachedConfig = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
};

// Default keys from environment variables, localStorage, or server config
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('gamehub_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('gamehub_supabase_key') : null;

  return {
    supabaseUrl: localUrl || cachedConfig.supabaseUrl || envUrl,
    supabaseAnonKey: localKey || cachedConfig.supabaseAnonKey || envKey,
  };
};

export const initSupabaseConfig = async (): Promise<{ supabaseUrl: string; supabaseAnonKey: string }> => {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
        cachedConfig.supabaseUrl = data.supabaseUrl;
        cachedConfig.supabaseAnonKey = data.supabaseAnonKey;
        if (typeof window !== 'undefined') {
          localStorage.setItem('gamehub_supabase_url', data.supabaseUrl);
          localStorage.setItem('gamehub_supabase_key', data.supabaseAnonKey);
        }
        return { supabaseUrl: data.supabaseUrl, supabaseAnonKey: data.supabaseAnonKey };
      }
    }
  } catch (err) {
    // Backend API not reachable or static deployment
  }

  return getSupabaseConfig();
};

export const setSupabaseConfig = (url: string, key: string, saveToServer = true) => {
  cachedConfig.supabaseUrl = url;
  cachedConfig.supabaseAnonKey = key;

  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('gamehub_supabase_url', url);
    else localStorage.removeItem('gamehub_supabase_url');

    if (key) localStorage.setItem('gamehub_supabase_key', key);
    else localStorage.removeItem('gamehub_supabase_key');
  }

  // Also sync to server so all other devices and public visitors get it
  if (saveToServer && url && key) {
    fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supabaseUrl: url, supabaseAnonKey: key }),
    }).catch((err) => console.warn('Could not sync config to server:', err));
  }
};

let adminSupabaseInstance: SupabaseClient | null = null;
let publicSupabaseInstance: SupabaseClient | null = null;
let cachedPublicUrl = '';
let cachedPublicKey = '';
let cachedAdminUrl = '';
let cachedAdminKey = '';

/**
 * Dedicated unauthenticated public Supabase client.
 * Does NOT persist or send any admin session token.
 * Used for public visitors to SELECT published games only.
 */
export const getPublicSupabaseClient = (): SupabaseClient | null => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (
    !publicSupabaseInstance ||
    cachedPublicUrl !== supabaseUrl ||
    cachedPublicKey !== supabaseAnonKey
  ) {
    try {
      publicSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });
      cachedPublicUrl = supabaseUrl;
      cachedPublicKey = supabaseAnonKey;
    } catch (err) {
      console.warn('Failed to initialize public Supabase client:', err);
      return null;
    }
  }

  return publicSupabaseInstance;
};

/**
 * Supabase client with auth session support.
 * Used for Admin operations (login, add/edit/delete games, storage upload).
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (
    !adminSupabaseInstance ||
    cachedAdminUrl !== supabaseUrl ||
    cachedAdminKey !== supabaseAnonKey
  ) {
    try {
      adminSupabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      cachedAdminUrl = supabaseUrl;
      cachedAdminKey = supabaseAnonKey;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return adminSupabaseInstance;
};

export const isSupabaseConfigured = (): boolean => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  // Test with public client to verify public anon read access
  const client = getPublicSupabaseClient() || getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase URL or Anon Key is missing.' };
  }

  try {
    const { data, error } = await client.from('games').select('id, published').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! The "games" table has not been created yet. Run the SQL setup script.',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected successfully! Public visitors can read published games.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection test failed' };
  }
};

export const SUPABASE_SQL_SETUP_SCRIPT = `-- ===================================================
-- GameHub: Production PostgreSQL Database & Security Rules
-- ===================================================

-- 1. Create the games table
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    short_description TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_path TEXT NOT NULL,
    cover_path TEXT NOT NULL,
    screenshots TEXT[] DEFAULT '{}',
    category TEXT NOT NULL,
    version TEXT NOT NULL,
    apk_path TEXT NOT NULL,
    apk_size TEXT NOT NULL,
    apk_file_name TEXT,
    download_count INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure apk_file_name column exists if table was created previously
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS apk_file_name TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_category ON public.games(category);
CREATE INDEX IF NOT EXISTS idx_games_published ON public.games(published);

-- Enable Row Level Security (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Clean up any previous policies
DROP POLICY IF EXISTS "Public read published games" ON public.games;
DROP POLICY IF EXISTS "Admins full access to games" ON public.games;
DROP POLICY IF EXISTS "Public select published games" ON public.games;
DROP POLICY IF EXISTS "Admins select all games" ON public.games;
DROP POLICY IF EXISTS "Admins insert games" ON public.games;
DROP POLICY IF EXISTS "Admins update games" ON public.games;
DROP POLICY IF EXISTS "Admins delete games" ON public.games;

-- 2. RLS POLICIES FOR GAMES TABLE:
-- Anonymous & Public visitors: SELECT published games ONLY
CREATE POLICY "Public select published games" 
ON public.games FOR SELECT 
TO anon, authenticated 
USING (published = true);

-- Authenticated Admins: Full SELECT (including drafts), INSERT, UPDATE, DELETE
CREATE POLICY "Admins select all games" 
ON public.games FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Admins insert games" 
ON public.games FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Admins update games" 
ON public.games FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Admins delete games" 
ON public.games FOR DELETE 
TO authenticated 
USING (true);

-- 3. Stored function for public download counter increment (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION increment_game_download(game_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.games
  SET download_count = download_count + 1
  WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_game_download(UUID) TO anon, authenticated;

-- 4. STORAGE BUCKETS CONFIGURATION:
-- games-apks: PRIVATE bucket (public = false) - downloaded via secure signed URLs
INSERT INTO storage.buckets (id, name, public) 
VALUES ('games-apks', 'games-apks', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- games-images: PUBLIC bucket (public = true) - icons, covers, screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('games-images', 'games-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. STORAGE POLICIES:
-- Public can read images (icons, covers, screenshots)
DROP POLICY IF EXISTS "Public read games-images" ON storage.objects;
CREATE POLICY "Public read games-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'games-images');

-- Admins full access to both buckets
DROP POLICY IF EXISTS "Admin upload games-apks" ON storage.objects;
CREATE POLICY "Admin upload games-apks" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'games-apks');

DROP POLICY IF EXISTS "Admin update games-apks" ON storage.objects;
CREATE POLICY "Admin update games-apks" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'games-apks');

DROP POLICY IF EXISTS "Admin delete games-apks" ON storage.objects;
CREATE POLICY "Admin delete games-apks" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'games-apks');

DROP POLICY IF EXISTS "Admin upload games-images" ON storage.objects;
CREATE POLICY "Admin upload games-images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'games-images');

DROP POLICY IF EXISTS "Admin update games-images" ON storage.objects;
CREATE POLICY "Admin update games-images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'games-images');

DROP POLICY IF EXISTS "Admin delete games-images" ON storage.objects;
CREATE POLICY "Admin delete games-images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'games-images');
`;
