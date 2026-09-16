import React, { useState } from 'react';
import { 
  Server, 
  FolderKanban, 
  Plus, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Globe, 
  Zap, 
  ShieldAlert, 
  ShieldCheck,
  Code
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';

interface NavbarProps {
  onOpenCreateProject: () => void;
  onOpenAuth: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenCreateProject, 
  onOpenAuth,
  onNavigateTab 
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { projects, selectedProject, selectProject, providerInfo } = useProject();

  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 text-zinc-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
      {/* Brand & Tagline */}
      <div className="flex items-center space-x-6">
        <div 
          onClick={() => onNavigateTab?.('overview')} 
          className="flex items-center space-x-3 cursor-pointer group"
          id="cloudforge-logo-link"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            <Zap className="w-5 h-5 fill-emerald-500/20" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">CloudForge</span>
              <span className="text-[10px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">PAAS</span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">Deploy. Scale. Ship.</p>
          </div>
        </div>

        {/* Project Selector */}
        {isAuthenticated && (
          <div className="relative">
            <button
              id="project-selector-btn"
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium transition-colors text-zinc-200"
            >
              <FolderKanban className="w-4 h-4 text-emerald-400" />
              <span className="max-w-[140px] truncate">
                {selectedProject ? selectedProject.name : 'Select Project'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
            </button>

            {projectDropdownOpen && (
              <div 
                className="absolute left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50 divide-y divide-zinc-800/60"
                id="project-selector-dropdown"
              >
                <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Your Projects ({projects.length})
                </div>

                <div className="max-h-60 overflow-y-auto py-1">
                  {projects.length === 0 ? (
                    <div className="px-3 py-3 text-xs text-zinc-500 text-center">
                      No projects created yet
                    </div>
                  ) : (
                    projects.map(proj => (
                      <button
                        key={proj.id}
                        onClick={() => {
                          selectProject(proj);
                          setProjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-zinc-800/80 transition-colors ${
                          selectedProject?.id === proj.id ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-zinc-300'
                        }`}
                      >
                        <span className="truncate">{proj.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          {proj.region}
                        </span>
                      </button>
                    ))
                  )}
                </div>

                <div className="p-1">
                  <button
                    id="create-project-dropdown-btn"
                    onClick={() => {
                      setProjectDropdownOpen(false);
                      onOpenCreateProject();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Project</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Navbar items */}
      <div className="flex items-center space-x-3">
        {/* Provider Connection Indicator */}
        <div 
          onClick={() => onNavigateTab?.('settings')}
          className={`cursor-pointer hidden md:flex items-center space-x-2 px-2.5 py-1 rounded-full text-xs border font-medium transition-colors ${
            providerInfo?.connected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
          title={providerInfo?.connected ? 'Infrastructure Ready' : 'Deployment Provider Disconnected'}
          id="provider-status-badge"
        >
          {providerInfo?.connected ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{providerInfo?.connected ? 'Infra Engine Active' : 'Provider Not Connected'}</span>
        </div>

        {/* Notifications */}
        {isAuthenticated && (
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500"></span>
            </button>

            {notificationsOpen && (
              <div 
                className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl p-4 z-50 text-xs"
                id="notifications-popover"
              >
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 mb-3">
                  <span className="font-semibold text-zinc-200">System Notifications</span>
                  <span className="text-[10px] font-mono text-zinc-500">REALTIME</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <Server className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-zinc-200 font-medium">CloudForge SaaS Engine Online</p>
                      <p className="text-zinc-500 text-[11px] mt-0.5">Deployment provider abstractions and RLS API layer initialized.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Account / Auth */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              id="user-menu-btn"
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-medium text-zinc-300 hidden sm:inline-block max-w-[100px] truncate">
                {user?.full_name || user?.email}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {userDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl py-1 z-50 divide-y divide-zinc-800/80"
                id="user-menu-dropdown"
              >
                <div className="px-4 py-3">
                  <p className="text-xs font-medium text-zinc-100 truncate">{user?.full_name || 'CloudForge Developer'}</p>
                  <p className="text-[11px] text-zinc-500 truncate font-mono mt-0.5">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigateTab?.('settings');
                    }}
                    className="w-full px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center space-x-2 text-left"
                  >
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Account Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onNavigateTab?.('api');
                    }}
                    className="w-full px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center space-x-2 text-left"
                  >
                    <Code className="w-3.5 h-3.5 text-zinc-400" />
                    <span>API Credentials</span>
                  </button>
                </div>

                <div className="p-1">
                  <button
                    id="logout-btn"
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded flex items-center space-x-2 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            id="auth-sign-in-btn"
            onClick={onOpenAuth}
            className="px-4 py-1.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-md shadow transition-colors"
          >
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
};
