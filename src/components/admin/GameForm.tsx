import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileCheck,
  Image as ImageIcon,
  Layers,
  ArrowRight,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  HardDrive,
  Plus,
  MoveUp,
  MoveDown,
  Trash2,
  Save,
} from 'lucide-react';
import { Game, GameCategory, GAME_CATEGORIES, GameFormData } from '../../types/game';
import { generateSlug, createGame, updateGame } from '../../services/gameService';
import { GameDetailsPage } from '../game/GameDetailsPage';

interface GameFormProps {
  initialGame?: Game | null;
  allGames: Game[];
  onSaved: (game: Game) => void;
  onCancel: () => void;
}

export const GameForm: React.FC<GameFormProps> = ({
  initialGame,
  allGames,
  onSaved,
  onCancel,
}) => {
  const isEditing = Boolean(initialGame);

  // Form State
  const [name, setName] = useState(initialGame?.name || '');
  const [slug, setSlug] = useState(initialGame?.slug || '');
  const [shortDesc, setShortDesc] = useState(initialGame?.short_description || '');
  const [description, setDescription] = useState(initialGame?.description || '');
  const [category, setCategory] = useState<GameCategory>(initialGame?.category || 'Action');
  const [version, setVersion] = useState(initialGame?.version || '1.0.0');

  // Images state
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>(initialGame?.icon_path || '');

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(initialGame?.cover_path || '');

  const [screenshots, setScreenshots] = useState<
    { id: string; file?: File; previewUrl: string }[]
  >(
    initialGame?.screenshots?.map((url, i) => ({
      id: `ss-${i}-${Date.now()}`,
      previewUrl: url,
    })) || []
  );

  // APK state
  const [apkFile, setApkFile] = useState<File | null>(null);
  const [apkFileName, setApkFileName] = useState(initialGame?.apk_file_name || initialGame?.apk_path?.split('/').pop() || '');
  const [apkSize, setApkSize] = useState(initialGame?.apk_size || '');
  const [apkProgress, setApkProgress] = useState(0);

  // Process / Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // File input refs
  const iconInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  const apkInputRef = useRef<HTMLInputElement>(null);

  // Auto-slug sync when name changes (if not editing an existing custom slug)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || slug === generateSlug(initialGame?.name || '')) {
      setSlug(generateSlug(val));
    }
  };

  // Image Upload Handlers
  const handleIconSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleScreenshotsSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const newItems = files.map((file) => ({
        id: `ss-${Date.now()}-${Math.random()}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setScreenshots((prev) => [...prev, ...newItems]);
    }
  };

  const removeScreenshot = (id: string) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const moveScreenshot = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= screenshots.length) return;
    const newArr = [...screenshots];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    setScreenshots(newArr);
  };

  // APK File Upload Handler
  const handleApkSelect = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.apk')) {
      setErrorMsg('Invalid file format. Please upload an Android Package (.apk) file.');
      return;
    }
    setErrorMsg(null);
    setApkFile(file);
    setApkFileName(file.name);
    const sizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
    setApkSize(sizeFormatted);
  };

  // Prepare draft / published game data for preview
  const getPreviewGameData = (publishedState = true): Game => {
    return {
      id: initialGame?.id || 'preview-game-id',
      name: name || 'Untitled Game',
      slug: slug || generateSlug(name || 'untitled-game'),
      short_description: shortDesc || 'No short description provided yet.',
      description: description || 'No detailed gameplay description provided yet.',
      icon_path: iconPreview || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80',
      cover_path: coverPreview || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80',
      screenshots: screenshots.map((s) => s.previewUrl),
      category,
      version: version || '1.0.0',
      apk_path: initialGame?.apk_path || `preview://${slug}.apk`,
      apk_size: apkSize || '45.0 MB',
      apk_file_name: apkFileName || `${slug}.apk`,
      download_count: initialGame?.download_count || 0,
      published: publishedState,
      created_at: initialGame?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };

  const handleSubmit = async (publish: boolean) => {
    // Validation
    if (!name.trim()) {
      setErrorMsg('Game name is required.');
      return;
    }
    if (!shortDesc.trim()) {
      setErrorMsg('Short description is required.');
      return;
    }
    if (!iconPreview) {
      setErrorMsg('Game icon is required. Please upload an icon.');
      return;
    }
    if (!coverPreview) {
      setErrorMsg('Game cover image is required. Please upload a cover.');
      return;
    }
    if (!isEditing && !apkFile) {
      setErrorMsg('Android APK file is required. Please upload a .apk file.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    setApkProgress(10);

    try {
      if (isEditing && initialGame) {
        // Update existing game
        const res = await updateGame(
          initialGame.id,
          {
            name: name.trim(),
            slug: slug.trim(),
            short_description: shortDesc.trim(),
            description: description.trim(),
            category,
            version: version.trim(),
            icon_path: iconPreview,
            cover_path: coverPreview,
            screenshots: screenshots.map((s) => s.previewUrl),
            published: publish,
          },
          apkFile,
          (prog) => setApkProgress(prog)
        );

        if (res.success && res.game) {
          onSaved(res.game);
        } else {
          setErrorMsg(res.error || 'Failed to update game');
        }
      } else {
        // Create new game
        const formData: GameFormData = {
          name: name.trim(),
          slug: slug.trim() || generateSlug(name),
          short_description: shortDesc.trim(),
          description: description.trim(),
          category,
          version: version.trim() || '1.0.0',
          icon_file: iconFile,
          icon_preview_url: iconPreview,
          cover_file: coverFile,
          cover_preview_url: coverPreview,
          screenshot_files: screenshots.map((s) => ({
            id: s.id,
            file: s.file,
            preview_url: s.previewUrl,
          })),
          apk_file: apkFile,
          apk_file_name: apkFileName,
          apk_size: apkSize || '35.0 MB',
          published: publish,
        };

        const res = await createGame(formData, (prog) => setApkProgress(prog));

        if (res.success && res.game) {
          onSaved(res.game);
        } else {
          setErrorMsg(res.error || 'Failed to publish game');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while saving the game.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {isEditing ? `Edit "${initialGame?.name}"` : 'Publish New Android Game'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Fill in metadata, upload visual media and APK binaries. Cloud powered by Supabase.
          </p>
        </div>

        {/* Action Buttons top bar */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700/80 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preview Page</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-300 transition-colors"
          >
            Save Draft
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Publishing ({apkProgress}%)...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Publish Game</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Basic Info & Description */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section: Basic Information */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Basic Information</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Game Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Cyber Velocity 2099"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  URL Slug (Auto-generated) *
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 rounded-l-xl bg-neutral-950 border border-r-0 border-neutral-800 text-xs text-neutral-500 font-mono">
                    /games/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-r-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as GameCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-emerald-500"
                >
                  {GAME_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Package Version *
              </label>
              <input
                type="text"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="1.0.0"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Short Description (1-2 sentences for cards) *
              </label>
              <textarea
                rows={2}
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder="Brief summary of gameplay and aesthetic..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Full Description (Supports markdown headings & bullets)
              </label>
              <textarea
                rows={7}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed gameplay features, controls, story, and device specifications..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Tip: Use <code className="text-emerald-400">### Heading</code> and <code className="text-emerald-400">* Bullet point</code> for clear formatted sections.
              </p>
            </div>
          </div>

          {/* Section: APK Package Upload */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Android Package (APK)</span>
              </h3>
              {apkSize && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {apkSize}
                </span>
              )}
            </div>

            {/* Drag & Drop APK Area */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleApkSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => apkInputRef.current?.click()}
              className="p-8 rounded-2xl border-2 border-dashed border-neutral-700/80 hover:border-emerald-500/60 bg-neutral-950/60 hover:bg-neutral-950/90 text-center cursor-pointer transition-all duration-200 group"
            >
              <input
                ref={apkInputRef}
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                onChange={(e) => e.target.files?.[0] && handleApkSelect(e.target.files[0])}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 group-hover:bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 transition-colors">
                <Upload className="w-6 h-6" />
              </div>

              {apkFileName ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-400">
                    <FileCheck className="w-4 h-4" />
                    <span className="truncate max-w-xs">{apkFileName}</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Calculated Package Size: <span className="text-white font-mono">{apkSize}</span>
                  </p>
                  <p className="text-[11px] text-neutral-500 pt-1">
                    Click to replace this APK package
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-neutral-200">
                    Drag and drop your Android APK here
                  </p>
                  <p className="text-xs text-neutral-500">
                    Or click to browse your local device files (.apk only)
                  </p>
                  <div className="pt-2 text-[11px] text-neutral-600 font-mono">
                    Directly uploaded to Supabase Storage <code className="text-neutral-400">games-apks</code> bucket
                  </div>
                </div>
              )}
            </div>

            {isSubmitting && apkProgress > 0 && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-neutral-400">
                  <span>Uploading APK package to Cloud Storage...</span>
                  <span className="font-mono">{apkProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${apkProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visual Assets (Icon, Cover, Screenshots) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Game Icon */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Game Icon (Square 1:1) *
            </h3>

            <input
              ref={iconInputRef}
              type="file"
              accept="image/*"
              onChange={handleIconSelect}
              className="hidden"
            />

            <div className="flex items-center gap-4">
              <div
                onClick={() => iconInputRef.current?.click()}
                className="w-20 h-20 rounded-2xl border-2 border-dashed border-neutral-700 hover:border-emerald-500 bg-neutral-950 flex items-center justify-center overflow-hidden cursor-pointer shrink-0 transition-colors group"
              >
                {iconPreview ? (
                  <img
                    src={iconPreview}
                    alt="Icon preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-1">
                    <ImageIcon className="w-5 h-5 text-neutral-500 mx-auto group-hover:text-emerald-400 transition-colors" />
                    <span className="text-[10px] text-neutral-500 block mt-1">Upload</span>
                  </div>
                )}
              </div>

              <div className="text-xs text-neutral-400 space-y-1">
                <button
                  type="button"
                  onClick={() => iconInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs transition-colors"
                >
                  Choose Icon File
                </button>
                <p className="text-[11px] text-neutral-500">
                  Recommended: 512x512px PNG or JPG
                </p>
              </div>
            </div>
          </div>

          {/* Main / Cover Image */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Cover Image (Cinematic 16:9) *
            </h3>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
            />

            <div
              onClick={() => coverInputRef.current?.click()}
              className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-neutral-700 hover:border-emerald-500 bg-neutral-950 flex items-center justify-center overflow-hidden cursor-pointer transition-colors relative group"
            >
              {coverPreview ? (
                <>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-xs font-semibold text-white">
                    Click to replace cover
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-6 h-6 text-neutral-500 mx-auto mb-1 group-hover:text-emerald-400 transition-colors" />
                  <span className="text-xs font-medium text-neutral-300">
                    Upload Marquee Cover Image
                  </span>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Used for hero banners and cards (16:9 ratio)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Screenshots Gallery */}
          <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Gameplay Screenshots ({screenshots.length})
              </h3>

              <button
                type="button"
                onClick={() => screenshotInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Screenshots</span>
              </button>
            </div>

            <input
              ref={screenshotInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleScreenshotsSelect}
              className="hidden"
            />

            {screenshots.length === 0 ? (
              <div
                onClick={() => screenshotInputRef.current?.click()}
                className="p-6 rounded-xl border border-neutral-800 bg-neutral-950/60 text-center cursor-pointer hover:border-neutral-700 transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-neutral-500 mx-auto mb-1" />
                <p className="text-xs text-neutral-400">No screenshots added yet</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">Click to select 1 or more images</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {screenshots.map((ss, idx) => (
                  <div
                    key={ss.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800/80"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={ss.previewUrl}
                        alt={`Screenshot ${idx + 1}`}
                        className="w-16 h-10 object-cover rounded-lg border border-neutral-800 shrink-0"
                      />
                      <span className="text-xs text-neutral-300 font-mono">
                        Screenshot #{idx + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveScreenshot(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveScreenshot(idx, 'down')}
                        disabled={idx === screenshots.length - 1}
                        className="p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeScreenshot(ss.id)}
                        className="p-1 text-neutral-400 hover:text-red-400"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal before publishing */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950">
          <div className="sticky top-0 z-50 bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase">
                Preview Mode
              </span>
              <span className="text-xs text-neutral-300">
                This is exactly how your game page will look to visitors.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-neutral-200 transition-colors"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewOpen(false);
                  handleSubmit(true);
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs font-bold uppercase transition-all"
              >
                Looks Great, Publish!
              </button>
            </div>
          </div>

          <div className="pt-4">
            <GameDetailsPage
              game={getPreviewGameData(true)}
              allGames={allGames}
              onBack={() => setPreviewOpen(false)}
              onSelectGame={() => {}}
            />
          </div>
        </div>
      )}
    </div>
  );
};
