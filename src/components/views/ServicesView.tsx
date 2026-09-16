import React, { useState } from 'react';
import { 
  Server, 
  Plus, 
  Play, 
  RotateCw, 
  Square, 
  Trash2, 
  ExternalLink, 
  ShieldAlert, 
  Terminal, 
  Code, 
  ChevronRight 
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Service } from '../../types/cloudforge';
import { api } from '../../lib/api';

interface ServicesViewProps {
  onOpenCreateService: () => void;
  onSelectService: (service: Service) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ 
  onOpenCreateService, 
  onSelectService 
}) => {
  const { services, refreshServices, selectedProject } = useProject();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleAction = async (e: React.MouseEvent, serviceId: string, action: 'deploy' | 'restart' | 'stop' | 'delete') => {
    e.stopPropagation();
    setActionLoading(`${serviceId}_${action}`);

    try {
      if (action === 'deploy') {
        await api.deployService(serviceId);
      } else if (action === 'restart') {
        await api.restartService(serviceId);
      } else if (action === 'stop') {
        await api.stopService(serviceId);
      } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this service?')) {
          await api.deleteService(serviceId);
        }
      }
      await refreshServices();
    } catch (err: any) {
      alert(err.message || `Failed to execute ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Services</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {selectedProject ? `Active microservices in ${selectedProject.name}` : 'All services across projects'}
          </p>
        </div>
        <button
          id="services-create-btn"
          onClick={onOpenCreateService}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Deploy Service</span>
        </button>
      </div>

      {services.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <Server className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-zinc-300">No services created yet</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Use the 5-step wizard to deploy your Node.js, Docker, Python, or Static website code.
          </p>
          <button
            onClick={onOpenCreateService}
            className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors"
          >
            Launch Wizard
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(srv => {
            const isPending = actionLoading?.startsWith(srv.id);
            return (
              <div
                key={srv.id}
                onClick={() => onSelectService(srv)}
                className="p-5 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                id={`service-item-${srv.id}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-bold text-emerald-400 shrink-0">
                    {srv.runtime.toUpperCase().slice(0, 3)}
                  </div>

                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                        {srv.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${
                        srv.status === 'running'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : srv.status === 'provider_not_connected'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}>
                        {srv.status}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-950 text-zinc-500 border border-zinc-800">
                        {srv.region}
                      </span>
                    </div>

                    <p className="text-xs font-mono text-zinc-400 mt-1 truncate max-w-md">
                      {srv.source_url} ({srv.branch})
                    </p>

                    {srv.public_url && (
                      <div className="mt-2 flex items-center space-x-2">
                        <a
                          href={srv.public_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center space-x-1"
                        >
                          <span>{srv.public_url}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-800/80">
                  <button
                    onClick={e => handleAction(e, srv.id, 'deploy')}
                    disabled={isPending}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 hover:border-emerald-500/50 text-xs flex items-center space-x-1 transition-colors"
                    title="Redeploy Service"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span className="hidden sm:inline text-[11px]">Deploy</span>
                  </button>

                  <button
                    onClick={e => handleAction(e, srv.id, 'restart')}
                    disabled={isPending}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs transition-colors"
                    title="Restart Instance"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={e => handleAction(e, srv.id, 'stop')}
                    disabled={isPending}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 text-xs transition-colors"
                    title="Stop Instance"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>

                  <button
                    onClick={e => handleAction(e, srv.id, 'delete')}
                    disabled={isPending}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-rose-400 border border-zinc-700 hover:border-rose-500/40 text-xs transition-colors"
                    title="Delete Service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 transition-colors ml-2" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
