import React from 'react';
import { CreditCard, Check, ShieldCheck, Zap } from 'lucide-react';

export const BillingView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Billing & Subscriptions</h1>
          <p className="text-xs text-zinc-400 mt-1">
            CloudForge SaaS compute tier allocation and limits.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hobby Plan */}
        <div className="p-6 bg-zinc-900/60 border border-emerald-500/50 rounded-xl space-y-4 relative">
          <span className="absolute top-4 right-4 text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Current Tier
          </span>
          <div>
            <h3 className="text-lg font-bold text-white">Developer Hobby</h3>
            <p className="text-xs text-zinc-400 mt-1">For side projects & microservices</p>
            <div className="text-2xl font-bold font-mono text-white mt-3">$0 <span className="text-xs text-zinc-500 font-sans">/ month</span></div>
          </div>

          <ul className="space-y-2 text-xs text-zinc-300 font-mono">
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>3 Isolated Cloud Projects</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>5 Microservices</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>512 MB RAM per Service</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Custom Domains & SSL</span>
            </li>
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4 opacity-80 hover:opacity-100 transition-opacity">
          <div>
            <h3 className="text-lg font-bold text-white">Pro Team</h3>
            <p className="text-xs text-zinc-400 mt-1">For commercial production SaaS</p>
            <div className="text-2xl font-bold font-mono text-white mt-3">$29 <span className="text-xs text-zinc-500 font-sans">/ month</span></div>
          </div>

          <ul className="space-y-2 text-xs text-zinc-300 font-mono">
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Unlimited Projects & Services</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>8 GB RAM per Container</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Auto-Scaling Cloud Run</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dedicated DB Pooling</span>
            </li>
          </ul>

          <button
            disabled
            className="w-full py-2 bg-zinc-800 text-zinc-500 font-bold text-xs rounded-lg cursor-not-allowed"
          >
            Upgrade (Stripe Integration Coming Soon)
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="p-6 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-4 opacity-80 hover:opacity-100 transition-opacity">
          <div>
            <h3 className="text-lg font-bold text-white">Enterprise Cluster</h3>
            <p className="text-xs text-zinc-400 mt-1">Self-hosted Kubernetes & CapRover</p>
            <div className="text-2xl font-bold font-mono text-white mt-3">Custom</div>
          </div>

          <ul className="space-y-2 text-xs text-zinc-300 font-mono">
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dedicated Kubernetes Worker Nodes</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>SAML / SSO Enforced Auth</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>99.99% SLA & 24/7 Support</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
