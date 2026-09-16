import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Project, Service, ProviderInfo } from '../types/cloudforge';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface ProjectContextType {
  projects: Project[];
  selectedProject: Project | null;
  services: Service[];
  providerInfo: ProviderInfo | null;
  loading: boolean;
  selectProject: (proj: Project | null) => void;
  refreshProjects: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshProviderStatus: () => Promise<void>;
  createProject: (name: string, description: string, region: string) => Promise<Project>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [providerInfo, setProviderInfo] = useState<ProviderInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshProviderStatus = useCallback(async () => {
    try {
      const info = await api.getProviderStatus();
      setProviderInfo(info);
    } catch {
      setProviderInfo({
        type: 'disconnected',
        name: 'No Infrastructure Connected',
        connected: false,
        version: '1.0.0',
        supportedRuntimes: ['node', 'docker', 'python', 'static'],
        region: 'North America',
        message: 'Deployment provider not connected'
      });
    }
  }, []);

  const refreshProjects = useCallback(async () => {
    if (!isAuthenticated) {
      setProjects([]);
      setSelectedProject(null);
      return;
    }

    setLoading(true);
    try {
      const list = await api.getProjects();
      setProjects(list);
      
      // Keep selected project if valid, otherwise select first or null
      setSelectedProject(prev => {
        if (!prev) return list[0] || null;
        const exists = list.find(p => p.id === prev.id);
        return exists || list[0] || null;
      });
    } catch (e) {
      console.error('Error fetching projects:', e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshServices = useCallback(async () => {
    if (!isAuthenticated) {
      setServices([]);
      return;
    }

    try {
      const list = await api.getServices(selectedProject?.id);
      setServices(list);
    } catch (e) {
      console.error('Error fetching services:', e);
    }
  }, [isAuthenticated, selectedProject?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshProjects();
      refreshProviderStatus();
    }
  }, [isAuthenticated, refreshProjects, refreshProviderStatus]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshServices();
    }
  }, [isAuthenticated, selectedProject?.id, refreshServices]);

  const createProject = async (name: string, description: string, region: string): Promise<Project> => {
    const newProj = await api.createProject({ name, description, region });
    await refreshProjects();
    setSelectedProject(newProj);
    return newProj;
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      selectedProject,
      services,
      providerInfo,
      loading,
      selectProject: setSelectedProject,
      refreshProjects,
      refreshServices,
      refreshProviderStatus,
      createProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
