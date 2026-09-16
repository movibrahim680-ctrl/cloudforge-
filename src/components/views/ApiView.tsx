import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ApiView: React.FC = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const apiToken = `cf_live_${user?.id || 'usr_dev'}_${Math.random().toString(36).substring(2, 8)}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const curlExample = `curl -X POST "${window.location.origin}/api/services" \\
  -H "Authorization: Bearer ${apiToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project_id": "proj_123",
    "name": "my-api",
    "source_type": "github",
    "source_url": "https://github.com/myorg/myrepo",
    "runtime": "node",
    "branch": "main",
    "port": 3000,
    "region": "North America"
  }'`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">CloudForge REST API</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Programmatically create projects, trigger deployments, and fetch logs.
          </p>
        </div>
      </div>

      {/* API Key Box */}
      <div className="p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200 flex items-center space-x-2">
          <Key className="w-4 h-4 text-emerald-400" />
          <span>Your Personal API Token</span>
        </h2>
        <div className="flex items-center space-x-2">
          <input
            type="password"
            readOnly
            value={apiToken}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-zinc-300"
          />
          <button
            onClick={() => handleCopy(apiToken)}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center space-x-1 font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* cURL Code Example */}
      <div className="p-5 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2 text-zinc-400">
          <span className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Create Service via API</span>
          </span>
          <button
            onClick={() => handleCopy(curlExample)}
            className="hover:text-white"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <pre className="text-emerald-400 whitespace-pre-wrap overflow-x-auto leading-relaxed">
          {curlExample}
        </pre>
      </div>
    </div>
  );
};
