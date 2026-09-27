import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Server,
  Layers,
  Terminal,
} from 'lucide-react';
import {
  getSupabaseConfig,
  setSupabaseConfig,
  isSupabaseConfigured,
  testSupabaseConnection,
  SUPABASE_SQL_SETUP_SCRIPT,
} from '../../services/supabase';

interface SupabaseSettingsProps {
  onConnectionChange?: () => void;
}

export const SupabaseSettings: React.FC<SupabaseSettingsProps> = ({ onConnectionChange }) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.supabaseUrl);
  const [key, setKey] = useState(currentConfig.supabaseAnonKey);
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [hasServerKey, setHasServerKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  useEffect(() => {
    // Check if server already has config & service role key
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.supabaseUrl && !url) setUrl(data.supabaseUrl);
        if (data.supabaseAnonKey && !key) setKey(data.supabaseAnonKey);
        if (data.hasServiceRoleKey) setHasServerKey(true);
      })
      .catch(() => {});

    if (isSupabaseConfigured()) {
      handleTestConnection();
    }
  }, []);

  const handleSave = async () => {
    setSupabaseConfig(url.trim(), key.trim(), true);
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supabaseUrl: url.trim(),
          supabaseAnonKey: key.trim(),
          ...(serviceRoleKey.trim() ? { supabaseServiceRoleKey: serviceRoleKey.trim() } : {}),
        }),
      });
      if (serviceRoleKey.trim()) setHasServerKey(true);
    } catch (err) {
      console.warn('Error saving to server /api/config:', err);
    }

    onConnectionChange?.();
    handleTestConnection();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection();
    setTestResult(result);
    setTesting(false);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const envSample = `# Environment Variables for Vercel & GameHub
VITE_SUPABASE_URL="${url || 'https://your-project.supabase.co'}"
VITE_SUPABASE_ANON_KEY="${key || 'your-anon-public-key'}"
`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="space-y-8 animate-in fade-in duration-150 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Supabase & Cloud Storage Configuration
        </h1>
        <p className="text-xs text-neutral-400 mt-1">
          Connect your dedicated Supabase project for persistent cloud storage of APK packages, images, and database records.
        </p>
      </div>

      {/* Connection Status Banner */}
      <div
        className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isConnected && testResult?.success
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : isConnected
            ? 'bg-neutral-900 border-neutral-800'
            : 'bg-neutral-900/60 border-neutral-800'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isConnected && testResult?.success
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-neutral-800 text-neutral-400'
            }`}
          >
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {isConnected && testResult?.success
                  ? 'Supabase Cloud Connected & Ready'
                  : isConnected
                  ? 'Supabase Credentials Configured'
                  : 'Local Storage Engine (Supabase-Ready)'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isConnected && testResult?.success
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {isConnected ? 'Connected' : 'Offline / Local'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {testResult?.message ||
                (isConnected
                  ? 'Verifying connection to your Supabase tables and storage buckets...'
                  : 'Currently running on local persistent engine. Configure your Supabase project keys below.')}
            </p>
          </div>
        </div>

        <button
          onClick={handleTestConnection}
          disabled={testing || !isConnected}
          className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-xs font-semibold text-neutral-200 transition-colors shrink-0"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {/* Supabase API Credentials Form */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Supabase Project Credentials
          </h2>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Open Supabase Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Project URL (<code className="text-emerald-400">VITE_SUPABASE_URL</code>)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Anon / Public API Key (<code className="text-emerald-400">VITE_SUPABASE_ANON_KEY</code>)
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 placeholder-neutral-600 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Never expose the secret <code className="text-neutral-400">service_role</code> key. Only provide your public <code className="text-neutral-400">anon</code> key.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Save Credentials
            </button>
            {url && (
              <button
                onClick={() => {
                  setUrl('');
                  setKey('');
                  setSupabaseConfig('', '');
                  onConnectionChange?.();
                }}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-400 hover:text-white transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SQL Script for Supabase SQL Editor */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Supabase Database & Storage Setup SQL</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Run this script once in your Supabase SQL Editor to create the <code className="text-neutral-300">games</code> table, RLS policies, and storage buckets.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied SQL!' : 'Copy Script'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-72 leading-relaxed">
            {SUPABASE_SQL_SETUP_SCRIPT}
          </pre>
        </div>
      </div>

      {/* Vercel Deployment Checklist */}
      <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <span>Vercel Deployment Checklist</span>
          </h2>
          <button
            onClick={handleCopyEnv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-200 transition-colors"
          >
            {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedEnv ? 'Copied .env!' : 'Copy .env variables'}</span>
          </button>
        </div>

        <div className="text-xs text-neutral-300 space-y-2 leading-relaxed">
          <p>When deploying GameHub to Vercel:</p>
          <ol className="list-decimal ml-4 space-y-1.5 text-neutral-400">
            <li>
              Add the two environment variables <code className="text-emerald-400">VITE_SUPABASE_URL</code> and <code className="text-emerald-400">VITE_SUPABASE_ANON_KEY</code> in your Vercel Project Settings → Environment Variables.
            </li>
            <li>
              Ensure your Supabase Storage buckets (<code className="text-neutral-300">games-apks</code> and <code className="text-neutral-300">games-images</code>) are set to Public.
            </li>
            <li>
              Run the SQL script above in Supabase to enable RLS public reads and authenticated admin writes.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
