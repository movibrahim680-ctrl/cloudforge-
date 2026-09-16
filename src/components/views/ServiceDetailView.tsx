import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  RotateCw, 
  Square, 
  Trash2, 
  ExternalLink, 
  Terminal, 
  Key, 
  Globe, 
  Activity, 
  Settings, 
  ShieldAlert, 
  Clock, 
  Lock, 
  Plus,
  RefreshCw
} from 'lucide-react';
import { Service, DeploymentLog, EnvironmentVariable, CustomDomain } from '../../types/cloudforge';
import { api } from '../../lib/api';

interface ServiceDetailViewProps {
  service: Service;
  onBack: () => void;
  onRefresh: () => void;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({ 
  service, 
  onBack, 
  onRefresh 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'env' | 'domains' | 'settings'>('logs');
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // New Env Var state
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvVal, setNewEnvVal] = useState('');
  const [newEnvSecret, setNewEnvSecret] = useState(true);

  // New Domain state
  const [newDomainName, setNewDomainName] = useState('');

  const loadLogs = async () => {
    try {
      const logsData = await api.getServiceLogs(service.id);
      setLogs(logsData);
    } catch (e) {
      console.error('Error loading logs:', e);
    }
  };

  const loadEnvVars = async () => {
    try {
      const vars = await api.getEnvVars(service.id);
      setEnvVars(vars);
    } catch (e) {
      console.error('Error loading env vars:', e);
    }
  };

  const loadDomains = async () => {
    try {
      const doms = await api.getDomains(service.id);
      setDomains(doms);
    } catch (e) {
      console.error('Error loading domains:', e);
    }
  };

  useEffect(() => {
    loadLogs();
    loadEnvVars();
    loadDomains();
  }, [service.id]);

  const handleAction = async (action: 'deploy' | 'restart' | 'stop' | 'delete') => {
    setLoading(true);
    setActionMessage(null);

    try {
      if (action === 'deploy') {
        const res = await api.deployService(service.id);
        setActionMessage(`Deploy triggered: ${res.message}`);
      } else if (action === 'restart') {
        const res = await api.restartService(service.id);
        setActionMessage(res.message);
      } else if (action === 'stop') {
        const res = await api.stopService(service.id);
        setActionMessage(res.message);
      } else if (action === 'delete') {
        if (confirm('Delete service permanently?')) {
          await api.deleteService(service.id);
          onBack();
          return;
        }
      }
      await loadLogs();
      onRefresh();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnvVar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvKey.trim()) return;

    try {
      await api.createEnvVar({
        service_id: service.id,
        project_id: service.project_id,
        key: newEnvKey.trim(),
        value: newEnvVal,
        is_secret: newEnvSecret
      });
      setNewEnvKey('');
      setNewEnvVal('');
      await loadEnvVars();
    } catch (err: any) {
      alert(err.message || 'Failed to save environment variable');
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName.trim()) return;

    try {
      await api.createDomain({
        service_id: service.id,
        project_id: service.project_id,
        domain_name: newDomainName.trim()
      });
      setNewDomainName('');
      await loadDomains();
    } catch (err: any) {
      alert(err.message || 'Failed to add custom domain');
    }
  };

  return (
    <div className="space-y-6 text-zinc-100">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight">{service.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono border ${
                service.status === 'running'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : service.status === 'provider_not_connected'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}>
                {service.status}
              </span>
            </div>
            {service.public_url && (
              <a
                href={service.public_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-emerald-400 hover:underline flex items-center space-x-1 mt-0.5"
              >
                <span>{service.public_url}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleAction('deploy')}
            disabled={loading}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center space-x-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Redeploy</span>
          </button>
          <button
            onClick={() => handleAction('restart')}
            disabled={loading}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-xs flex items-center space-x-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Restart</span>
          </button>
          <button
            onClick={() => handleAction('stop')}
            disabled={loading}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 rounded-lg text-xs flex items-center space-x-1.5"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop</span>
          </button>
          <button
            onClick={() => handleAction('delete')}
            disabled={loading}
            className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs flex items-center space-x-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-emerald-400 font-mono">
          {actionMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-zinc-800 font-medium text-xs">
        {[
          { id: 'logs', label: 'Real Logs', icon: Terminal },
          { id: 'env', label: 'Environment Variables', icon: Key },
          { id: 'domains', label: 'Custom Domains', icon: Globe },
          { id: 'overview', label: 'Service Specs', icon: Activity },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 flex items-center space-x-2 border-b-2 transition-colors ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 font-semibold'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: REAL LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400">Streamed infrastructure build & runtime logs</span>
            <button
              onClick={loadLogs}
              className="p-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-md text-xs flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh Logs</span>
            </button>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs space-y-1 max-h-[500px] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-zinc-500 italic">No logs recorded yet. Click "Redeploy" to dispatch build to infrastructure engine.</p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="flex items-start space-x-3 py-0.5 leading-relaxed">
                  <span className="text-zinc-600 shrink-0 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className={`shrink-0 font-bold uppercase text-[10px] px-1 rounded ${
                    log.level === 'error' ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 text-emerald-400'
                  }`}>
                    {log.level}
                  </span>
                  <span className={log.level === 'error' ? 'text-rose-300' : 'text-zinc-300'}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: ENV VARS */}
      {activeTab === 'env' && (
        <div className="space-y-6">
          <form onSubmit={handleAddEnvVar} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200">Add Environment Variable</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="KEY (e.g. DATABASE_URL)"
                value={newEnvKey}
                onChange={e => setNewEnvKey(e.target.value.toUpperCase())}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100"
              />
              <input
                type={newEnvSecret ? 'password' : 'text'}
                placeholder="VALUE"
                value={newEnvVal}
                onChange={e => setNewEnvVal(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setNewEnvSecret(!newEnvSecret)}
                  className={`p-2 rounded-lg border text-xs font-mono ${
                    newEnvSecret ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {newEnvSecret ? 'Secret' : 'Plaintext'}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </form>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {envVars.length === 0 ? (
              <p className="p-6 text-xs text-zinc-500 text-center">No environment variables set.</p>
            ) : (
              envVars.map(ev => (
                <div key={ev.id} className="p-3.5 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-zinc-200">{ev.key}</span>
                  </div>
                  <span className="text-zinc-500">
                    {ev.is_secret ? '••••••••••••' : ev.value}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: DOMAINS */}
      {activeTab === 'domains' && (
        <div className="space-y-6">
          <form onSubmit={handleAddDomain} className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-zinc-200">Connect Custom Domain</h3>
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="api.yourcompany.com"
                value={newDomainName}
                onChange={e => setNewDomainName(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Domain</span>
              </button>
            </div>
          </form>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl divide-y divide-zinc-800">
            {domains.length === 0 ? (
              <p className="p-6 text-xs text-zinc-500 text-center">No custom domains mapped.</p>
            ) : (
              domains.map(dom => (
                <div key={dom.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold font-mono text-xs text-emerald-400">{dom.domain_name}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                      CNAME VERIFICATION REQUIRED
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-400">
                    Point CNAME record <code className="text-zinc-200">{dom.domain_name}</code> to <code className="text-emerald-400">{service.id}.cloudforge.app</code>
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: SPECS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-zinc-900/60 p-6 rounded-xl border border-zinc-800">
          <div>
            <span className="text-zinc-500">Service ID:</span>
            <p className="text-zinc-200 mt-0.5">{service.id}</p>
          </div>
          <div>
            <span className="text-zinc-500">Runtime:</span>
            <p className="text-zinc-200 mt-0.5">{service.runtime.toUpperCase()}</p>
          </div>
          <div>
            <span className="text-zinc-500">Source Repository:</span>
            <p className="text-zinc-200 mt-0.5">{service.source_url}</p>
          </div>
          <div>
            <span className="text-zinc-500">Branch & Port:</span>
            <p className="text-zinc-200 mt-0.5">{service.branch} (Port {service.port})</p>
          </div>
          <div>
            <span className="text-zinc-500">Build Command:</span>
            <p className="text-zinc-300 mt-0.5">{service.build_command || 'None'}</p>
          </div>
          <div>
            <span className="text-zinc-500">Start Command:</span>
            <p className="text-zinc-300 mt-0.5">{service.start_command || 'None'}</p>
          </div>
        </div>
      )}
    </div>
  );
};
