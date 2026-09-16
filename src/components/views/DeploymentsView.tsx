import React, { useState, useEffect } from 'react';
import { Rocket, RefreshCw, Terminal, CheckCircle2, ShieldAlert, Clock, Play } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Service, DeploymentLog } from '../../types/cloudforge';
import { api } from '../../lib/api';

export const DeploymentsView: React.FC = () => {
  const { services, selectedProject } = useProject();
  const [selectedService, setSelectedService] = useState<Service | null>(services[0] || null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (serviceId: string) => {
    setLoading(true);
    try {
      const data = await api.getServiceLogs(serviceId);
      setLogs(data);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedService) {
      fetchLogs(selectedService.id);
    }
  }, [selectedService?.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Deployments</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real build & dispatch events streamed from infrastructure provider.
          </p>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-500">
          <Rocket className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
          <p className="text-sm font-medium text-zinc-400">No deployment logs available</p>
          <p className="text-xs mt-1">Create and deploy a service to inspect live build telemetry.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Services selector sidebar */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 space-y-1">
            <span className="text-[10px] font-mono font-semibold uppercase text-zinc-500 px-3 py-1 block">
              Active Services ({services.length})
            </span>
            {services.map(srv => {
              const isSelected = selectedService?.id === srv.id;
              return (
                <button
                  key={srv.id}
                  onClick={() => setSelectedService(srv)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected 
                      ? 'bg-zinc-800 border-emerald-500/50 text-white font-medium' 
                      : 'bg-zinc-950/40 border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{srv.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      srv.status === 'running' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {srv.status}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-zinc-500 mt-1 truncate">{srv.public_url}</p>
                </button>
              );
            })}
          </div>

          {/* Logs viewer */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">
                Log Telemetry for <span className="text-emerald-400 font-bold">{selectedService?.name}</span>
              </span>
              {selectedService && (
                <button
                  onClick={() => fetchLogs(selectedService.id)}
                  className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-md text-xs flex items-center space-x-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
              {loading ? (
                <p className="text-zinc-500 italic">Fetching logs from infrastructure backend...</p>
              ) : logs.length === 0 ? (
                <p className="text-zinc-500 italic">No logs recorded for this service. Click "Redeploy" in Services to trigger a build.</p>
              ) : (
                logs.map(l => (
                  <div key={l.id} className="flex items-start space-x-2 py-0.5 border-b border-zinc-900/60 text-[11px]">
                    <span className="text-zinc-600 shrink-0 text-[10px]">{new Date(l.timestamp).toLocaleTimeString()}</span>
                    <span className={`shrink-0 font-bold uppercase text-[9px] px-1 rounded ${
                      l.level === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 text-emerald-400'
                    }`}>
                      {l.level}
                    </span>
                    <span className={l.level === 'error' ? 'text-rose-300' : 'text-zinc-300'}>
                      {l.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
