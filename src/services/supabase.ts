import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default keys from environment variables or localStorage
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('gamehub_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('gamehub_supabase_key') : null;

  return {
    supabaseUrl: localUrl || envUrl,
    supabaseAnonKey: localKey || envKey,
  };
};

export const setSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem('gamehub_supabase_url', url);
    else localStorage.removeItem('gamehub_supabase_url');

    if (key) localStorage.setItem('gamehub_supabase_key', key);
    else localStorage.removeItem('gamehub_supabase_key');
  }
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!supabaseInstance || supabaseInstance['supabaseUrl'] !== supabaseUrl) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
};

export const isSupabaseConfigured = (): boolean => {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

export const testSupabaseConnection = async (): Promise<{ success: boolean; message: string }> => {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, message: 'Supabase URL or Anon Key is missing.' };
  }

  try {
    const { error } = await client.from('games').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          success: true,
          message: 'Connected to Supabase! The "games" table has not been created yet. Run the SQL setup script.',
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Connected successfully to Supabase and "games" table is ready!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Connection test failed' };
  }
};

export const SUPABASE_SQL_SETUP_SCRIPT = `-- ==========================================
-- GameHub: Supabase Production Schema & Storage
-- ==========================================

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
    download_count INTEGER DEFAULT 0,
    published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup by slug and category
CREATE INDEX IF NOT EXISTS idx_games_slug ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_category ON public.games(category);
CREATE INDEX IF NOT EXISTS idx_games_published ON public.games(published);

-- Enable Row Level Security (RLS)
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- 2. RLS Policies:
-- Allow anyone to read published games
CREATE POLICY "Public read published games" 
ON public.games FOR SELECT 
USING (published = true OR auth.role() = 'authenticated');

-- Allow authenticated users (Admins) full access
CREATE POLICY "Admins full access to games" 
ON public.games FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Allow public to increment download count
CREATE OR REPLACE FUNCTION increment_game_download(game_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.games
  SET download_count = download_count + 1
  WHERE id = game_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('games-apks', 'games-apks', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('games-images', 'games-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage Policies:
-- Allow public download from both buckets
CREATE POLICY "Public read games-apks" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'games-apks');

CREATE POLICY "Public read games-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'games-images');

-- Allow authenticated users to upload and manage storage
CREATE POLICY "Admin upload games-apks" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'games-apks');

CREATE POLICY "Admin update games-apks" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'games-apks');

CREATE POLICY "Admin delete games-apks" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'games-apks');

CREATE POLICY "Admin upload games-images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'games-images');

CREATE POLICY "Admin update games-images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'games-images');

CREATE POLICY "Admin delete games-images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'games-images');
`;
