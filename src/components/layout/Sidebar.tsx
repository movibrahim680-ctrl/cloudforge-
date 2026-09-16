import React from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Rocket, 
  Server, 
  Globe, 
  Key, 
  BarChart3, 
  CreditCard, 
  Code2, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'deployments', label: 'Deployments', icon: Rocket },
    { id: 'services', label: 'Services', icon: Server },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'env', label: 'Environment Variables', icon: Key },
    { id: 'usage', label: 'Usage', icon: BarChart3 },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API', icon: Code2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-semibold">
          Cloud Console
        </div>

        <nav className="space-y-0.5">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-tab-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-zinc-800/90 text-white border-l-2 border-emerald-500 font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/80 text-[11px] text-zinc-500">
        <div className="flex items-center justify-between font-mono mb-1">
          <span>Engine v2.4.0</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </div>
        <p className="text-[10px] text-zinc-600">CloudForge Commercial Platform</p>
      </div>
    </aside>
  );
};
