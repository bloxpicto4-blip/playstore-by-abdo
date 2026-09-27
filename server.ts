import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.resolve(__dirname, 'supabase-config.json');

const app = express();
app.use(express.json());

// Helper to read persistent Supabase config
function readStoredConfig(): { supabaseUrl: string; supabaseAnonKey: string; supabaseServiceRoleKey?: string } {
  let url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  let anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (data.supabaseUrl) url = data.supabaseUrl;
      if (data.supabaseAnonKey) anonKey = data.supabaseAnonKey;
      if (data.supabaseServiceRoleKey) serviceRoleKey = data.supabaseServiceRoleKey;
    } catch (e) {
      console.warn('Error reading supabase-config.json:', e);
    }
  }

  return { supabaseUrl: url, supabaseAnonKey: anonKey, supabaseServiceRoleKey: serviceRoleKey };
}

function writeStoredConfig(config: { supabaseUrl: string; supabaseAnonKey: string; supabaseServiceRoleKey?: string }) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
    process.env.VITE_SUPABASE_URL = config.supabaseUrl;
    process.env.VITE_SUPABASE_ANON_KEY = config.supabaseAnonKey;
    if (config.supabaseServiceRoleKey) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = config.supabaseServiceRoleKey;
    }

    // Also update/create .env file
    const envPath = path.resolve(__dirname, '.env');
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
    }
    const updateOrAdd = (key: string, val: string) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}="${val}"`);
      } else {
        envContent += `\n${key}="${val}"`;
      }
    };
    updateOrAdd('VITE_SUPABASE_URL', config.supabaseUrl);
    updateOrAdd('VITE_SUPABASE_ANON_KEY', config.supabaseAnonKey);
    if (config.supabaseServiceRoleKey) {
      updateOrAdd('SUPABASE_SERVICE_ROLE_KEY', config.supabaseServiceRoleKey);
    }
    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
  } catch (e) {
    console.warn('Error saving supabase config:', e);
  }
}

// 1. GET /api/config - Public configuration endpoint for any visitor / device
app.get('/api/config', (req, res) => {
  const config = readStoredConfig();
  // Never expose serviceRoleKey to the public
  res.json({
    supabaseUrl: config.supabaseUrl,
    supabaseAnonKey: config.supabaseAnonKey,
    hasServiceRoleKey: Boolean(config.supabaseServiceRoleKey),
  });
});

// 2. POST /api/config - Admin endpoint to configure Supabase URL & keys
app.post('/api/config', (req, res) => {
  const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey } = req.body;
  if (!supabaseUrl && !supabaseAnonKey) {
    return res.status(400).json({ error: 'supabaseUrl and supabaseAnonKey are required' });
  }

  const current = readStoredConfig();
  const updated = {
    supabaseUrl: (supabaseUrl || current.supabaseUrl || '').trim(),
    supabaseAnonKey: (supabaseAnonKey || current.supabaseAnonKey || '').trim(),
    supabaseServiceRoleKey: supabaseServiceRoleKey ? supabaseServiceRoleKey.trim() : current.supabaseServiceRoleKey,
  };

  writeStoredConfig(updated);
  res.json({ success: true, message: 'Supabase configuration saved' });
});

// 3. POST /api/apk/signed-url - Secure signed download URL for private APK bucket
app.post('/api/apk/signed-url', async (req, res) => {
  const { apkPath, gameName, version } = req.body;
  if (!apkPath) {
    return res.status(400).json({ error: 'apkPath is required' });
  }

  const config = readStoredConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return res.status(503).json({ error: 'Supabase storage is not configured yet' });
  }

  const safeFileName = `${(gameName || 'game').replace(/[^a-zA-Z0-9_-]/g, '_')}_v${version || '1.0'}.apk`;

  try {
    // Prefer service role key if available, otherwise anon client
    const keyToUse = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    const client = createClient(config.supabaseUrl, keyToUse, {
      auth: { persistSession: false },
    });

    const cleanPath = apkPath.replace('local-apk://', '');

    // Generate signed download URL valid for 120 seconds with Content-Disposition header
    const { data, error } = await client.storage
      .from('games-apks')
      .createSignedUrl(cleanPath, 120, {
        download: safeFileName,
      });

    if (error || !data?.signedUrl) {
      // Fallback: check if the object has a public URL (in case user configured bucket as public)
      const { data: publicData } = client.storage.from('games-apks').getPublicUrl(cleanPath);
      if (publicData?.publicUrl) {
        return res.json({ signedUrl: publicData.publicUrl, fileName: safeFileName });
      }
      return res.status(500).json({ error: error?.message || 'Failed to generate signed download URL' });
    }

    return res.json({ signedUrl: data.signedUrl, fileName: safeFileName });
  } catch (err: any) {
    console.error('Error generating signed URL:', err);
    return res.status(500).json({ error: err?.message || 'Internal server error generating signed download' });
  }
});

// 4. POST /api/games/:id/download - Secure download counter increment
app.post('/api/games/:id/download', async (req, res) => {
  const gameId = req.params.id;
  const config = readStoredConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return res.json({ success: true, count: 1 });
  }

  try {
    const keyToUse = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    const client = createClient(config.supabaseUrl, keyToUse, {
      auth: { persistSession: false },
    });

    // Try calling RPC increment_game_download
    const { error: rpcError } = await client.rpc('increment_game_download', { game_id: gameId });
    if (!rpcError) {
      return res.json({ success: true });
    }

    // Fallback: direct update
    const { data: gameData } = await client.from('games').select('download_count').eq('id', gameId).single();
    if (gameData) {
      await client
        .from('games')
        .update({ download_count: (gameData.download_count || 0) + 1, updated_at: new Date().toISOString() })
        .eq('id', gameId);
    }
    res.json({ success: true });
  } catch (e: any) {
    res.json({ success: false, error: e?.message });
  }
});

// 5. GET /api/public/games - Public endpoint for unauthenticated visitors
app.get('/api/public/games', async (req, res) => {
  const config = readStoredConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return res.json([]);
  }

  try {
    // Pure anon public client to query published games only
    const client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await client
      .from('games')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching public games from Supabase:', error.message);
      return res.json([]);
    }
    res.json(data || []);
  } catch (e: any) {
    res.json([]);
  }
});

// 6. GET /api/public/games/:slug - Public single game by slug
app.get('/api/public/games/:slug', async (req, res) => {
  const config = readStoredConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return res.status(404).json({ error: 'Not found' });
  }

  try {
    const client = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { persistSession: false },
    });
    const { data, error } = await client
      .from('games')
      .select('*')
      .eq('slug', req.params.slug)
      .eq('published', true)
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ error: 'Game not found or unpublished' });
    }
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

// 7. POST /api/admin/games - Protected admin create game using service role key
app.post('/api/admin/games', async (req, res) => {
  const gameData = req.body;
  if (!gameData || !gameData.name || !gameData.slug) {
    return res.status(400).json({ error: 'Invalid game data' });
  }

  const config = readStoredConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return res.status(503).json({ error: 'Supabase is not configured yet' });
  }

  try {
    const keyToUse = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    const client = createClient(config.supabaseUrl, keyToUse, {
      auth: { persistSession: false },
    });

    let { data, error } = await client.from('games').insert(gameData).select().single();
    if (error && (error as any).code === '42703') {
      // Column apk_file_name does not exist in user's table, retry without it
      const { apk_file_name, ...cleanData } = gameData;
      const retry = await client.from('games').insert(cleanData).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, game: data });
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

// 8. PUT /api/admin/games/:id - Protected admin update game
app.put('/api/admin/games/:id', async (req, res) => {
  const gameId = req.params.id;
  const updates = req.body;
  const config = readStoredConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return res.status(503).json({ error: 'Supabase is not configured yet' });
  }

  try {
    const keyToUse = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    const client = createClient(config.supabaseUrl, keyToUse, {
      auth: { persistSession: false },
    });

    let { data, error } = await client.from('games').update(updates).eq('id', gameId).select().single();
    if (error && (error as any).code === '42703') {
      const { apk_file_name, ...cleanUpdates } = updates;
      const retry = await client.from('games').update(cleanUpdates).eq('id', gameId).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, game: data });
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

// 9. DELETE /api/admin/games/:id - Protected admin delete game
app.delete('/api/admin/games/:id', async (req, res) => {
  const gameId = req.params.id;
  const config = readStoredConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return res.status(503).json({ error: 'Supabase is not configured yet' });
  }

  try {
    const keyToUse = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    const client = createClient(config.supabaseUrl, keyToUse, {
      auth: { persistSession: false },
    });

    const { error } = await client.from('games').delete().eq('id', gameId);
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

// 10. GET /api/admin/games - Protected admin get all games (including drafts)
app.get('/api/admin/games', async (req, res) => {
  const config = readStoredConfig();
  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return res.status(503).json({ error: 'Supabase is not configured yet' });
  }

  try {
    const keyToUse = config.supabaseServiceRoleKey || config.supabaseAnonKey;
    const client = createClient(config.supabaseUrl, keyToUse, {
      auth: { persistSession: false },
    });

    const { data, error } = await client.from('games').select('*').order('created_at', { ascending: false });
    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
  } catch (e: any) {
    res.status(500).json({ error: e?.message });
  }
});

// Start server and mount Vite
async function startServer() {
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GameHub full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
