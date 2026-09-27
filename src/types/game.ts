export type GameCategory = 
  | 'Action'
  | 'Adventure'
  | 'Arcade'
  | 'Horror'
  | 'Racing'
  | 'Puzzle'
  | 'Strategy'
  | 'Casual';

export const GAME_CATEGORIES: GameCategory[] = [
  'Action',
  'Adventure',
  'Arcade',
  'Horror',
  'Racing',
  'Puzzle',
  'Strategy',
  'Casual',
];

export interface Game {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  icon_path: string;
  cover_path: string;
  screenshots: string[];
  category: GameCategory;
  version: string;
  apk_path: string;
  apk_size: string;
  apk_file_name?: string;
  download_count: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GameFormData {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  category: GameCategory;
  version: string;
  icon_file: File | null;
  icon_preview_url: string;
  cover_file: File | null;
  cover_preview_url: string;
  screenshot_files: { id: string; file?: File; preview_url: string }[];
  apk_file: File | null;
  apk_file_name: string;
  apk_size: string;
  published: boolean;
}

export interface DownloadProgress {
  status: 'idle' | 'preparing' | 'downloading' | 'completed' | 'error';
  progress: number;
  message?: string;
}
