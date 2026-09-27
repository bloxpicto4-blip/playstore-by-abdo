import { Game, GameFormData } from '../types/game';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { uploadApkFile, uploadImageFile, deleteStorageFile } from './storageService';

// Image assets generated for the platform
import heroBannerImg from '../assets/images/hero_banner_gaming_1790511595362.jpg';
import cyberRacerImg from '../assets/images/cyber_racer_cover_1790511607105.jpg';
import shadowBladeImg from '../assets/images/shadow_blade_cover_1790511624656.jpg';
import nebulaStrikeImg from '../assets/images/nebula_strike_cover_1790511643800.jpg';

export const ASSET_IMAGES = {
  heroBanner: heroBannerImg,
  cyberRacer: cyberRacerImg,
  shadowBlade: shadowBladeImg,
  nebulaStrike: nebulaStrikeImg,
};

const LOCAL_GAMES_STORAGE_KEY = 'gamehub_published_games_v1';

// Initial seed games with rich details
const INITIAL_SEED_GAMES: Game[] = [
  {
    id: 'game-cyber-velocity-99',
    name: 'Cyber Velocity 2099',
    slug: 'cyber-velocity-2099',
    short_description: 'High-octane futuristic anti-gravity street racing through neon-drenched megacities.',
    description: `Experience the next generation of mobile arcade racing! Cyber Velocity 2099 places you behind the wheel of supersonic mag-lev vehicles racing along anti-gravity magnetic tracks suspended thousands of feet above sprawling metropolis skylines.

### Game Features
* **Supersonic Physics Engine:** Feel every high-G drift, sonic boost, and vertical corkscrew with console-grade touch controls.
* **Over 24 Customizable Vehicles:** Upgrade thrusters, neon chassis underglow, energy shields, and EMP countermeasures.
* **Dynamic Time & Weather:** Race through torrential acid rainstorms, electromagnetic surges, and midnight neon skylines.
* **Offline & Online Modes:** Full single-player career campaign plus local Wi-Fi and Bluetooth multiplayer.

### System Requirements
* Android 8.0 (Oreo) or higher
* Minimum 3GB RAM recommended
* Vulkan or OpenGL ES 3.1 support`,
    icon_path: cyberRacerImg,
    cover_path: cyberRacerImg,
    screenshots: [
      cyberRacerImg,
      heroBannerImg,
      nebulaStrikeImg,
    ],
    category: 'Racing',
    version: '1.4.2',
    apk_path: 'local-apk://cyber-velocity-2099/CyberVelocity2099_v1.4.2.apk',
    apk_size: '86.4 MB',
    apk_file_name: 'CyberVelocity2099_v1.4.2.apk',
    download_count: 14820,
    published: true,
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'game-shadow-blade-ronin',
    name: 'Shadow Blade: Cyber Ronin',
    slug: 'shadow-blade-cyber-ronin',
    short_description: 'Fast-paced precision hack-and-slash action RPG set in feudal cyber-dystopia.',
    description: `Walk the path of the exiled cyber samurai. Unleash razor-sharp katana combos, deflect high-caliber plasma fire, and dismantle corrupted corporate warlords in this critically acclaimed 60fps action RPG.

### Highlights
* **Fluid Combat System:** Master parries, dash strikes, and elemental ninjutsu stances.
* **Expansive Skill Tree:** Unlock over 40 cybernetic augments, blade enchantments, and stealth tactics.
* **Atmospheric Soundtrack:** Traditional Japanese instruments fused with heavy industrial synthwave.
* **Controller Support:** Full native support for Xbox, PlayStation, and Razer mobile gamepads.

### Technical Specifications
* Optimized for 60fps and 120Hz high-refresh displays
* Zero mandatory microtransactions, full premium standalone experience
* Android 9.0+ compatibility`,
    icon_path: shadowBladeImg,
    cover_path: shadowBladeImg,
    screenshots: [
      shadowBladeImg,
      heroBannerImg,
      cyberRacerImg,
    ],
    category: 'Action',
    version: '2.1.0',
    apk_path: 'local-apk://shadow-blade-cyber-ronin/ShadowBladeRonin_v2.1.0.apk',
    apk_size: '124.8 MB',
    apk_file_name: 'ShadowBladeRonin_v2.1.0.apk',
    download_count: 28410,
    published: true,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'game-nebula-strike-vanguard',
    name: 'Nebula Strike: Vanguard',
    slug: 'nebula-strike-vanguard',
    short_description: 'Tactical sci-fi space combat and starfleet armada management across deep cosmos.',
    description: `Command the vanguard fleet against an unknown extra-galactic threat. Build your flagship, deploy fighter squadrons, research quantum weaponry, and liberate contested orbital sectors.

### Tactical Gameplay
* **Real-time Tactical Fleet Battles:** Command frigates, dreadnoughts, and stealth corvettes with intuitive pinch-to-zoom tactical overview.
* **Procedural Star Systems:** Explore hundreds of uncharted planetary systems with unique asteroid hazards and resource nodes.
* **Deep Ship Customization:** Equip hyper-drive stabilizers, ion cannons, and point-defense laser arrays.
* **Campaign & Endless Horde Mode:** Test your tactical fleet doctrine against increasingly ruthless alien waves.`,
    icon_path: nebulaStrikeImg,
    cover_path: nebulaStrikeImg,
    screenshots: [
      nebulaStrikeImg,
      heroBannerImg,
      shadowBladeImg,
    ],
    category: 'Strategy',
    version: '1.0.8',
    apk_path: 'local-apk://nebula-strike-vanguard/NebulaStrikeVanguard_v1.0.8.apk',
    apk_size: '94.2 MB',
    apk_file_name: 'NebulaStrikeVanguard_v1.0.8.apk',
    download_count: 9340,
    published: true,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Helper to generate a clean URL-safe slug from title
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const getLocalGames = (): Game[] => {
  if (typeof window === 'undefined') return INITIAL_SEED_GAMES;
  const stored = localStorage.getItem(LOCAL_GAMES_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_GAMES_STORAGE_KEY, JSON.stringify(INITIAL_SEED_GAMES));
    return INITIAL_SEED_GAMES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_SEED_GAMES;
  }
};

const saveLocalGames = (games: Game[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_GAMES_STORAGE_KEY, JSON.stringify(games));
  }
};

/**
 * Fetch all games (with optional filter for published only)
 */
export const getAllGames = async (publishedOnly = false): Promise<Game[]> => {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('games').select('*').order('created_at', { ascending: false });
      if (publishedOnly) {
        query = query.eq('published', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as Game[];
      }
    } catch (err) {
      console.warn('Failed to fetch games from Supabase, using local state:', err);
    }
  }

  const localGames = getLocalGames();
  if (publishedOnly) {
    return localGames.filter((g) => g.published);
  }
  return localGames;
};

/**
 * Fetch a single game by its unique slug
 */
export const getGameBySlug = async (slug: string): Promise<Game | null> => {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('slug', slug)
        .single();
      if (!error && data) {
        return data as Game;
      }
    } catch (err) {
      console.warn('Failed to fetch game by slug from Supabase:', err);
    }
  }

  const localGames = getLocalGames();
  return localGames.find((g) => g.slug === slug) || null;
};

/**
 * Increment game download count
 */
export const incrementDownloadCount = async (gameId: string): Promise<number> => {
  // Update local games first
  const localGames = getLocalGames();
  const index = localGames.findIndex((g) => g.id === gameId);
  let newCount = 1;
  if (index !== -1) {
    localGames[index].download_count = (localGames[index].download_count || 0) + 1;
    newCount = localGames[index].download_count;
    saveLocalGames(localGames);
  }

  // Update Supabase if connected
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.rpc('increment_game_download', { game_id: gameId });
    } catch (err) {
      // Fallback update
      try {
        await supabase
          .from('games')
          .update({ download_count: newCount, updated_at: new Date().toISOString() })
          .eq('id', gameId);
      } catch {
        // Ignore
      }
    }
  }

  return newCount;
};

/**
 * Create and publish a new game
 */
export const createGame = async (
  formData: GameFormData,
  onApkProgress?: (progress: number) => void
): Promise<{ success: boolean; game?: Game; error?: string }> => {
  try {
    const slug = formData.slug || generateSlug(formData.name);

    // 1. Upload Icon
    let iconPath = formData.icon_preview_url;
    if (formData.icon_file) {
      const uploadRes = await uploadImageFile(formData.icon_file, 'icons', slug);
      iconPath = uploadRes.publicUrl;
    }

    // 2. Upload Cover
    let coverPath = formData.cover_preview_url;
    if (formData.cover_file) {
      const uploadRes = await uploadImageFile(formData.cover_file, 'covers', slug);
      coverPath = uploadRes.publicUrl;
    }

    // 3. Upload Screenshots
    const screenshotPaths: string[] = [];
    for (const ss of formData.screenshot_files) {
      if (ss.file) {
        const uploadRes = await uploadImageFile(ss.file, 'screenshots', slug);
        screenshotPaths.push(uploadRes.publicUrl);
      } else if (ss.preview_url) {
        screenshotPaths.push(ss.preview_url);
      }
    }

    // 4. Upload APK
    let apkPath = '';
    let apkSize = formData.apk_size || '25.0 MB';
    let apkFileName = formData.apk_file_name || `${slug}.apk`;

    if (formData.apk_file) {
      const apkRes = await uploadApkFile(formData.apk_file, slug, onApkProgress);
      apkPath = apkRes.path;
      apkSize = apkRes.sizeFormatted;
      apkFileName = formData.apk_file.name;
    } else {
      apkPath = `local-apk://${slug}/${apkFileName}`;
    }

    const newGame: Game = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `game-${Date.now()}`,
      name: formData.name.trim(),
      slug,
      short_description: formData.short_description.trim(),
      description: formData.description.trim(),
      icon_path: iconPath,
      cover_path: coverPath,
      screenshots: screenshotPaths,
      category: formData.category,
      version: formData.version.trim() || '1.0.0',
      apk_path: apkPath,
      apk_size: apkSize,
      apk_file_name: apkFileName,
      download_count: 0,
      published: formData.published,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to Supabase if configured
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('games').insert(newGame).select().single();
        if (error) {
          console.warn('Failed to insert into Supabase games table:', error);
        } else if (data) {
          newGame.id = data.id;
        }
      } catch (err) {
        console.warn('Error saving to Supabase:', err);
      }
    }

    // Always update local games for instantaneous UI responsiveness
    const localGames = getLocalGames();
    // Check if slug exists in local
    const filtered = localGames.filter((g) => g.slug !== slug);
    filtered.unshift(newGame);
    saveLocalGames(filtered);

    return { success: true, game: newGame };
  } catch (err: any) {
    console.error('Failed to create game:', err);
    return { success: false, error: err?.message || 'Failed to publish game' };
  }
};

/**
 * Update an existing game
 */
export const updateGame = async (
  gameId: string,
  updates: Partial<Game>,
  newApkFile?: File | null,
  onApkProgress?: (progress: number) => void
): Promise<{ success: boolean; game?: Game; error?: string }> => {
  try {
    const localGames = getLocalGames();
    const index = localGames.findIndex((g) => g.id === gameId);
    if (index === -1) {
      return { success: false, error: 'Game not found' };
    }

    const current = localGames[index];
    let apkPath = current.apk_path;
    let apkSize = current.apk_size;
    let apkFileName = current.apk_file_name;

    // Handle APK replacement
    if (newApkFile) {
      const uploadRes = await uploadApkFile(newApkFile, current.slug, onApkProgress);
      // Clean up old apk file
      if (current.apk_path && current.apk_path !== uploadRes.path) {
        await deleteStorageFile('games-apks', current.apk_path);
      }
      apkPath = uploadRes.path;
      apkSize = uploadRes.sizeFormatted;
      apkFileName = newApkFile.name;
    }

    const updatedGame: Game = {
      ...current,
      ...updates,
      apk_path: apkPath,
      apk_size: apkSize,
      apk_file_name: apkFileName,
      updated_at: new Date().toISOString(),
    };

    localGames[index] = updatedGame;
    saveLocalGames(localGames);

    // Update in Supabase
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('games').update(updatedGame).eq('id', gameId);
      } catch (err) {
        console.warn('Supabase game update error:', err);
      }
    }

    return { success: true, game: updatedGame };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update game' };
  }
};

/**
 * Delete a game and clean up its storage assets
 */
export const deleteGame = async (gameId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const localGames = getLocalGames();
    const game = localGames.find((g) => g.id === gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    // Clean up files in Supabase/IndexedDB storage
    if (game.apk_path) {
      await deleteStorageFile('games-apks', game.apk_path);
    }
    if (game.icon_path) {
      await deleteStorageFile('games-images', game.icon_path);
    }
    if (game.cover_path) {
      await deleteStorageFile('games-images', game.cover_path);
    }
    if (game.screenshots && game.screenshots.length > 0) {
      for (const ss of game.screenshots) {
        await deleteStorageFile('games-images', ss);
      }
    }

    // Remove from Supabase
    const supabase = getSupabaseClient();
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('games').delete().eq('id', gameId);
      } catch (err) {
        console.warn('Supabase game delete error:', err);
      }
    }

    // Remove from local storage
    const updatedGames = localGames.filter((g) => g.id !== gameId);
    saveLocalGames(updatedGames);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete game' };
  }
};

/**
 * Toggle game published status
 */
export const togglePublishGame = async (gameId: string, published: boolean): Promise<boolean> => {
  const res = await updateGame(gameId, { published });
  return res.success;
};
