import React, { useState, useEffect } from 'react';
import { Key, Lock, Plus, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { EnvironmentVariable } from '../../types/cloudforge';
import { api } from '../../lib/api';

export const EnvVarsView: React.FC = () => {
  const { services, selectedProject } = useProject();
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [isSecret, setIsSecret] = useState(true);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const loadEnvVars = async () => {
    try {
      const list = await api.getEnvVars(selectedServiceId);
      setEnvVars(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadEnvVars();
  }, [selectedServiceId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim() || !selectedServiceId) return;

    try {
      await api.createEnvVar({
        service_id: selectedServiceId,
        project_id: selectedProject?.id || 'proj_default',
        key: key.trim().toUpperCase(),
        value,
        is_secret: isSecret
      });
      setKey('');
      setValue('');
      await loadEnvVars();
    } catch (err: any) {
      alert(err.message || 'Failed to save environment variable');
    }
  };

  const toggleShowValue = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Environment Variables</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Centralized secrets manager with masked secret projection.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleAdd} className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
        <h2 className="text-sm font-semibold text-zinc-200">Add Variable to Service</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Target Service</label>
            <select
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Key Name</label>
            <input
              type="text"
              required
              placeholder="DATABASE_URL"
              value={key}
              onChange={e => setKey(e.target.value.toUpperCase())}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Value</label>
            <input
              type={isSecret ? 'password' : 'text'}
              required
              placeholder="secret_value"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100"
            />
          </div>

          <div className="flex items-end space-x-2">
            <button
              type="button"
              onClick={() => setIsSecret(!isSecret)}
              className={`p-2 rounded-lg border text-xs font-mono ${
                isSecret ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-950 text-zinc-400 border-zinc-800'
              }`}
            >
              {isSecret ? 'Secret' : 'Plaintext'}
            </button>
            <button
              type="submit"
              disabled={services.length === 0}
              className="flex-1 py-2 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center justify-center space-x-1 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800">
        {envVars.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <Key className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">No environment variables configured</p>
            <p className="text-xs text-zinc-500 mt-1">Add secrets above for your target service.</p>
          </div>
        ) : (
          envVars.map(ev => {
            const isVisible = showValues[ev.id];
            return (
              <div key={ev.id} className="p-4 flex items-center justify-between font-mono text-xs">
                <div className="flex items-center space-x-3">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-zinc-100">{ev.key}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-zinc-400">
                    {ev.is_secret && !isVisible ? '••••••••••••••••' : ev.value}
                  </span>
                  <button
                    onClick={() => toggleShowValue(ev.id)}
                    className="p-1 text-zinc-500 hover:text-zinc-200"
                  >
                    {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
