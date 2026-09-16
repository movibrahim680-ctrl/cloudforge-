import React, { useState, useEffect } from 'react';
import { Globe, Plus, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { CustomDomain } from '../../types/cloudforge';
import { api } from '../../lib/api';

export const DomainsView: React.FC = () => {
  const { services, selectedProject } = useProject();
  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);

  const loadDomains = async () => {
    try {
      const list = await api.getDomains();
      setDomains(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || !selectedServiceId) return;

    setLoading(true);
    try {
      await api.createDomain({
        service_id: selectedServiceId,
        project_id: selectedProject?.id || 'proj_default',
        domain_name: newDomain.trim()
      });
      setNewDomain('');
      await loadDomains();
    } catch (err: any) {
      alert(err.message || 'Failed to add domain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Custom Domains</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Map custom domain names and SSL certificates to your microservices.
          </p>
        </div>
      </div>

      {/* Domain Creation Form */}
      <form onSubmit={handleAddDomain} className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4">
        <h2 className="text-sm font-semibold text-zinc-200">Connect New Custom Domain</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Target Service</label>
            <select
              value={selectedServiceId}
              onChange={e => setSelectedServiceId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.public_url})</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Domain Name</label>
            <div className="flex space-x-2">
              <input
                type="text"
                required
                placeholder="api.yourcompany.com"
                value={newDomain}
                onChange={e => setNewDomain(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-100"
              />
              <button
                type="submit"
                disabled={loading || services.length === 0}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg flex items-center space-x-1 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add Domain</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Domains Table */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-800">
        {domains.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <Globe className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p className="text-sm font-medium text-zinc-400">No custom domains mapped yet</p>
            <p className="text-xs text-zinc-500 mt-1">Add your brand domain above to configure HTTPS CNAME routing.</p>
          </div>
        ) : (
          domains.map(dom => (
            <div key={dom.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-emerald-400 font-mono text-sm">{dom.domain_name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                    {dom.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-zinc-400 mt-1">
                  CNAME Target: <code className="text-zinc-200">{dom.service_id}.cloudforge.app</code>
                </p>
              </div>
              <div className="text-[11px] font-mono text-zinc-500">
                Created: {new Date(dom.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
