import React from 'react';
import { 
  Zap, 
  Server, 
  Github, 
  Container, 
  Terminal, 
  Globe2, 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Code2, 
  CheckCircle2, 
  Activity, 
  Layers 
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: () => void;
  onEnterDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onEnterDashboard }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-zinc-950">
      {/* Top Header */}
      <header className="h-16 border-b border-zinc-800/80 px-6 flex items-center justify-between sticky top-0 bg-zinc-950/90 backdrop-blur-md z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5 fill-emerald-500/20" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">CloudForge</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onEnterDashboard}
            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            Explore Platform
          </button>
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs shadow-lg shadow-emerald-500/10 transition-colors"
          >
            Sign In / Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        <div className="text-center space-y-6 max-w-3xl mx-auto pt-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>Commercial Cloud Deployment Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Deploy. Scale. Ship.
          </h1>

          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            The developer-first cloud SaaS platform for Node.js microservices, Docker containers, Python APIs, and static websites. Built on Supabase, Express, and provider abstractions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-xl shadow-emerald-500/15 transition-all"
            >
              <span>Launch CloudForge Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onEnterDashboard}
              className="w-full sm:w-auto px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold rounded-xl text-sm transition-colors"
            >
              View Live Dashboard Architecture
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Github className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">GitHub & Container Source</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Connect public and private Git repos or pull prebuilt Docker images directly into regional worker clusters.
            </p>
          </div>

          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Encrypted Env Secrets & RLS</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Isolated user data protected via Supabase PostgreSQL Row Level Security and server-side secret projection.
            </p>
          </div>

          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Clean Provider Abstraction</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Standardized <code className="text-emerald-400">DeploymentProvider</code> interface designed to plug seamlessly into Cloud Run, Kubernetes, or CapRover nodes.
            </p>
          </div>
        </div>

        {/* Console Preview Container */}
        <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-2xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 text-zinc-400">
            <span className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>CloudForge Dispatch Engine</span>
            </span>
            <span className="text-[10px] uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
              READY
            </span>
          </div>
          <div className="space-y-1 text-zinc-300">
            <p className="text-zinc-500">[SYSTEM] Express REST API listening on port 3000</p>
            <p className="text-emerald-400">[SUPABASE] PostgreSQL database schema & RLS policies verified</p>
            <p className="text-zinc-300">[DEPLOYMENT] Registered provider: DockerKubernetesProvider & DisconnectedProvider</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 p-6 text-center text-xs text-zinc-600 font-mono">
        CloudForge Platform — Commercial Cloud SaaS Architecture
      </footer>
    </div>
  );
};
