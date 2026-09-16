import React, { useState } from 'react';
import { Settings, ShieldCheck, ShieldAlert, Key, Database, Copy, Check, Server } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { api } from '../../lib/api';

export const SettingsView: React.FC = () => {
  const { providerInfo, refreshProviderStatus } = useProject();

  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('https://api.cloudforge-engine.internal');
  const [region, setRegion] = useState('North America');
  const [connecting, setConnecting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleConnectProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setConnecting(true);
    setMsg(null);

    try {
      const res = await api.connectProvider(apiKey.trim(), endpoint, region);
      await refreshProviderStatus();
      setMsg(`Success: ${res.message}`);
      setApiKey('');
    } catch (err: any) {
      setMsg(`Error: ${err.message || 'Failed to connect provider'}`);
    } finally {
      setConnecting(false);
    }
  };

  const handleCopySql = () => {
    const sqlText = `-- Supabase Schema for CloudForge
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'developer',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  region TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  runtime TEXT NOT NULL,
  branch TEXT DEFAULT 'main',
  build_command TEXT,
  start_command TEXT,
  port INTEGER DEFAULT 3000,
  region TEXT NOT NULL,
  public_url TEXT,
  status TEXT DEFAULT 'idle',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own services" ON public.services FOR ALL USING (auth.uid() = user_id);`;

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Platform Settings</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Infrastructure provider connection & Supabase database schema configuration.
          </p>
        </div>
      </div>

      {/* Infrastructure Provider Connection Form */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              providerInfo?.connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Infrastructure Engine Provider</h2>
              <p className="text-xs text-zinc-400">Connect Cloud Run, Kubernetes, or Docker daemon credentials.</p>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
            providerInfo?.connected ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}>
            {providerInfo?.connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {msg && (
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-emerald-400">
            {msg}
          </div>
        )}

        <form onSubmit={handleConnectProvider} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Infrastructure API Key</label>
            <input
              type="password"
              required
              placeholder="e.g. cf_infra_key_993202930219"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Provider Engine Endpoint</label>
              <input
                type="text"
                value={endpoint}
                onChange={e => setEndpoint(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Default Region</label>
              <input
                type="text"
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={connecting}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            {connecting ? 'Connecting...' : 'Connect Infrastructure Provider'}
          </button>
        </form>
      </div>

      {/* Supabase SQL Schema Box */}
      <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Supabase PostgreSQL Schema & RLS</h2>
          </div>
          <button
            onClick={handleCopySql}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center space-x-1 font-mono"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSql ? 'Copied' : 'Copy Schema SQL'}</span>
          </button>
        </div>
        <p className="text-xs text-zinc-400">
          Run this schema in your Supabase SQL Editor to provision tables for users, projects, services, deployments, logs, env vars, domains, usage, and subscriptions with strict Row Level Security (RLS).
        </p>
      </div>
    </div>
  );
};
