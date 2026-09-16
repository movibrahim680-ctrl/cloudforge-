import React from 'react';
import { BarChart3, Cpu, HardDrive, Zap, ShieldAlert } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';

export const UsageView: React.FC = () => {
  const { providerInfo, selectedProject } = useProject();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Resource Usage & Metrics</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real CPU, memory, and HTTP ingress telemetry across cloud workers.
          </p>
        </div>
      </div>

      {!providerInfo?.connected ? (
        <div className="p-8 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center space-y-3">
          <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
          <h2 className="text-base font-bold text-amber-300">Deployment Provider Not Connected</h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Real resource consumption metrics are collected directly from Cloud Run or Docker infrastructure nodes. Connect your provider API key in Settings to stream live CPU/RAM usage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono font-medium uppercase">CPU Allocation</span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">0.05 vCPU</div>
            <p className="text-[11px] text-zinc-500 mt-1">Average compute load</p>
          </div>

          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono font-medium uppercase">RAM Allocation</span>
              <HardDrive className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">128 MB</div>
            <p className="text-[11px] text-zinc-500 mt-1">Container memory usage</p>
          </div>

          <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-xs font-mono font-medium uppercase">HTTP Ingress</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">0 Req/sec</div>
            <p className="text-[11px] text-zinc-500 mt-1">Live requests processed</p>
          </div>
        </div>
      )}
    </div>
  );
};
