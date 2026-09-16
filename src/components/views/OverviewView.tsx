import React from 'react';
import { 
  FolderKanban, 
  Server, 
  Rocket, 
  Activity, 
  Plus, 
  ShieldAlert, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

interface OverviewViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateProject: () => void;
  onOpenCreateService: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ 
  onNavigateTab, 
  onOpenCreateProject, 
  onOpenCreateService 
}) => {
  const { projects, services, providerInfo, selectedProject } = useProject();

  const runningServicesCount = services.filter(s => s.status === 'running').length;
  const activeDeploymentsCount = services.filter(s => s.status === 'building' || s.status === 'deploying').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">System Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time telemetry and infrastructure engine state.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            id="overview-create-project-btn"
            onClick={onOpenCreateProject}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg text-xs font-semibold text-zinc-200 flex items-center space-x-2 transition-colors"
          >
            <FolderKanban className="w-3.5 h-3.5 text-emerald-400" />
            <span>New Project</span>
          </button>
          <button
            id="overview-create-service-btn"
            onClick={onOpenCreateService}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy Service</span>
          </button>
        </div>
      </div>

      {/* Provider Disconnected Warning Banner if applicable */}
      {!providerInfo?.connected && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3" id="provider-warning-banner">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h3 className="font-semibold text-amber-300">Infrastructure Provider Disconnected</h3>
            <p className="text-zinc-400 mt-1">
              CloudForge is currently in disconnected engine mode. Real database records are synced via Supabase backend APIs.
              Deployments will show <code className="text-amber-400 font-mono">provider_not_connected</code> status until an active infrastructure API key is connected in Settings.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('settings')}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-xs font-mono font-semibold transition-colors shrink-0"
          >
            Connect Engine
          </button>
        </div>
      )}

      {/* Dashboard Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Card */}
        <div 
          onClick={() => onNavigateTab('projects')}
          className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
          id="card-projects"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono tracking-wider">Projects</span>
            <FolderKanban className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          {projects.length === 0 ? (
            <div className="py-2">
              <span className="text-sm font-semibold text-zinc-400 italic">No projects yet</span>
              <p className="text-[11px] text-zinc-500 mt-1">Create your first isolation group</p>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold text-white font-mono">{projects.length}</div>
              <p className="text-[11px] text-zinc-400 mt-1 flex items-center space-x-1">
                <span>Active project regions</span>
                <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              </p>
            </div>
          )}
        </div>

        {/* Running Services Card */}
        <div 
          onClick={() => onNavigateTab('services')}
          className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
          id="card-running-services"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono tracking-wider">Running Services</span>
            <Server className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
          </div>
          {services.length === 0 ? (
            <div className="py-2">
              <span className="text-sm font-semibold text-zinc-400 italic">No services created</span>
              <p className="text-[11px] text-zinc-500 mt-1">Deploy Node.js or Docker apps</p>
            </div>
          ) : (
            <div>
              <div className="text-2xl font-bold text-white font-mono">{runningServicesCount} / {services.length}</div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {runningServicesCount > 0 ? `${runningServicesCount} active container instances` : '0 instances currently active'}
              </p>
            </div>
          )}
        </div>

        {/* Deployments Card */}
        <div 
          onClick={() => onNavigateTab('deployments')}
          className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
          id="card-deployments"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono tracking-wider">Deployments</span>
            <Rocket className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono">{services.length}</div>
            <p className="text-[11px] text-zinc-400 mt-1">
              {activeDeploymentsCount > 0 ? `${activeDeploymentsCount} builds in progress` : 'All builds up to date'}
            </p>
          </div>
        </div>

        {/* Monthly Usage Card */}
        <div 
          onClick={() => onNavigateTab('usage')}
          className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
          id="card-monthly-usage"
        >
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase font-mono tracking-wider">Monthly Usage</span>
            <Activity className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-xl font-bold text-zinc-200 font-mono">
              {providerInfo?.connected ? '0.24 GB-hrs' : '0.00 GB-hrs'}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">
              {providerInfo?.connected ? 'Real compute metrics recorded' : 'Provider disconnected'}
            </p>
          </div>
        </div>
      </div>

      {/* Services List Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Active Microservices</h2>
            <p className="text-xs text-zinc-400">
              {selectedProject ? `Filtered by project: ${selectedProject.name}` : 'All services across projects'}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('services')}
            className="text-xs font-mono text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <span>View All Services</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {services.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <Server className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">No services deployed yet</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Use the deployment wizard to connect a GitHub repository, Docker image, or Node.js codebase.
            </p>
            <button
              onClick={onOpenCreateService}
              className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition-colors"
            >
              Create Service Now
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 overflow-x-auto">
            {services.map(srv => (
              <div key={srv.id} className="p-4 flex items-center justify-between hover:bg-zinc-850/50 transition-colors text-xs">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono font-bold text-zinc-300 uppercase">
                    {srv.runtime.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-zinc-100">{srv.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        {srv.region}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5 truncate max-w-md">
                      {srv.source_url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Status badge */}
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border ${
                    srv.status === 'running'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : srv.status === 'provider_not_connected'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {srv.status === 'provider_not_connected' ? 'provider_not_connected' : srv.status.toUpperCase()}
                  </span>

                  {/* Public URL */}
                  {srv.public_url && (
                    <a
                      href={srv.public_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-400 hover:text-emerald-400 flex items-center space-x-1 font-mono text-[11px] bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800"
                    >
                      <span className="truncate max-w-[150px]">{srv.public_url.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
