import React, { useState } from 'react';
import { FolderKanban, Plus, Globe, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Region } from '../../types/cloudforge';

interface ProjectsViewProps {
  onSelectProjectAndNavigate: (proj: any) => void;
  onOpenCreateProject: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ 
  onSelectProjectAndNavigate,
  onOpenCreateProject 
}) => {
  const { projects, selectedProject, selectProject } = useProject();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Projects</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Isolated cloud namespaces grouping microservices, domains, and secrets.
          </p>
        </div>
        <button
          id="projects-create-btn"
          onClick={onOpenCreateProject}
          className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/60 border border-zinc-800 rounded-xl">
          <FolderKanban className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-zinc-300">No projects created yet</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            Create your first project to organize Node.js, Docker, or static web deployments.
          </p>
          <button
            onClick={onOpenCreateProject}
            className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-lg transition-colors"
          >
            Create First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(proj => {
            const isSelected = selectedProject?.id === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => {
                  selectProject(proj);
                  onSelectProjectAndNavigate(proj);
                }}
                className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-zinc-900 border-emerald-500/60 shadow-lg shadow-emerald-500/5'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/90'
                }`}
                id={`project-card-${proj.id}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base text-zinc-100">{proj.name}</span>
                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
                      {proj.region}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-zinc-600" />
                    <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-400 hover:underline">
                    <span>Manage Services</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
