import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Project, 
  Service, 
  Deployment, 
  DeploymentLog, 
  EnvironmentVariable, 
  CustomDomain, 
  UsageMetric, 
  UserProfile,
  CreateServiceInput
} from '../types/cloudforge.js';

class DatabaseService {
  private supabase: SupabaseClient | null = null;
  private memoryStore: {
    users: Map<string, UserProfile>;
    projects: Map<string, Project>;
    services: Map<string, Service>;
    deployments: Map<string, Deployment>;
    logs: Map<string, DeploymentLog[]>;
    envVars: Map<string, EnvironmentVariable>;
    domains: Map<string, CustomDomain>;
    usage: Map<string, UsageMetric[]>;
  };

  constructor() {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('http')) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
        console.log('[CloudForge DB] Initialized Supabase client.');
      } catch (e) {
        console.warn('[CloudForge DB] Failed to initialize Supabase, using local DB manager.', e);
      }
    }

    this.memoryStore = {
      users: new Map(),
      projects: new Map(),
      services: new Map(),
      deployments: new Map(),
      logs: new Map(),
      envVars: new Map(),
      domains: new Map(),
      usage: new Map()
    };
  }

  // --- PROJECTS ---
  async getProjects(userId: string): Promise<Project[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (!error && data) return data as Project[];
    }

    return Array.from(this.memoryStore.projects.values())
      .filter(p => p.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getProjectById(userId: string, projectId: string): Promise<Project | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();
      
      if (!error && data) return data as Project;
    }

    const project = this.memoryStore.projects.get(projectId);
    if (project && project.user_id === userId) return project;
    return null;
  }

  async createProject(userId: string, input: { name: string; description: string; region: any }): Promise<Project> {
    const now = new Date().toISOString();
    const newProject: Project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      name: input.name,
      description: input.description || '',
      region: input.region || 'North America',
      created_at: now,
      updated_at: now
    };

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('projects')
        .insert({
          user_id: userId,
          name: input.name,
          description: input.description,
          region: input.region
        })
        .select()
        .single();

      if (!error && data) return data as Project;
    }

    this.memoryStore.projects.set(newProject.id, newProject);
    return newProject;
  }

  // --- SERVICES ---
  async getServices(userId: string, projectId?: string): Promise<Service[]> {
    if (this.supabase) {
      let query = this.supabase.from('services').select('*').eq('user_id', userId);
      if (projectId) query = query.eq('project_id', projectId);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (!error && data) return data as Service[];
    }

    return Array.from(this.memoryStore.services.values())
      .filter(s => s.user_id === userId && (!projectId || s.project_id === projectId))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getServiceById(userId: string, serviceId: string): Promise<Service | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .eq('user_id', userId)
        .single();
      if (!error && data) return data as Service;
    }

    const service = this.memoryStore.services.get(serviceId);
    if (service && service.user_id === userId) return service;
    return null;
  }

  async createService(userId: string, input: CreateServiceInput): Promise<Service> {
    const now = new Date().toISOString();
    const serviceId = `srv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const publicUrl = `https://${serviceId}.cloudforge.app`;

    const newService: Service = {
      id: serviceId,
      project_id: input.project_id,
      user_id: userId,
      name: input.name,
      source_type: input.source_type,
      source_url: input.source_url,
      runtime: input.runtime,
      branch: input.branch || 'main',
      build_command: input.build_command || 'npm run build',
      start_command: input.start_command || 'npm start',
      port: Number(input.port) || 3000,
      region: input.region,
      public_url: publicUrl,
      status: 'idle',
      health_status: 'unknown',
      created_at: now,
      updated_at: now
    };

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('services')
        .insert({
          project_id: input.project_id,
          user_id: userId,
          name: input.name,
          source_type: input.source_type,
          source_url: input.source_url,
          runtime: input.runtime,
          branch: input.branch,
          build_command: input.build_command,
          start_command: input.start_command,
          port: input.port,
          region: input.region,
          public_url: publicUrl,
          status: 'idle'
        })
        .select()
        .single();

      if (!error && data) {
        const createdSrv = data as Service;
        // Save initial env vars if provided
        if (input.env_vars && input.env_vars.length > 0) {
          for (const ev of input.env_vars) {
            if (ev.key) {
              await this.createEnvVar(userId, {
                service_id: createdSrv.id,
                project_id: createdSrv.project_id,
                key: ev.key,
                value: ev.value,
                is_secret: ev.is_secret ?? true
              });
            }
          }
        }
        return createdSrv;
      }
    }

    this.memoryStore.services.set(serviceId, newService);

    // Save initial env vars in memory
    if (input.env_vars && input.env_vars.length > 0) {
      for (const ev of input.env_vars) {
        if (ev.key) {
          await this.createEnvVar(userId, {
            service_id: serviceId,
            project_id: input.project_id,
            key: ev.key,
            value: ev.value,
            is_secret: ev.is_secret ?? true
          });
        }
      }
    }

    return newService;
  }

  async updateServiceStatus(userId: string, serviceId: string, status: Service['status'], health?: Service['health_status']): Promise<void> {
    if (this.supabase) {
      await this.supabase
        .from('services')
        .update({ status, ...(health ? { health_status: health } : {}), updated_at: new Date().toISOString() })
        .eq('id', serviceId)
        .eq('user_id', userId);
    }

    const srv = this.memoryStore.services.get(serviceId);
    if (srv && srv.user_id === userId) {
      srv.status = status;
      if (health) srv.health_status = health;
      srv.updated_at = new Date().toISOString();
      if (status === 'running') srv.last_deployed_at = new Date().toISOString();
    }
  }

  async deleteService(userId: string, serviceId: string): Promise<boolean> {
    if (this.supabase) {
      const { error } = await this.supabase
        .from('services')
        .delete()
        .eq('id', serviceId)
        .eq('user_id', userId);
      return !error;
    }

    const srv = this.memoryStore.services.get(serviceId);
    if (srv && srv.user_id === userId) {
      this.memoryStore.services.delete(serviceId);
      return true;
    }
    return false;
  }

  // --- DEPLOYMENTS & LOGS ---
  async createDeploymentRecord(
    userId: string, 
    serviceId: string, 
    status: Deployment['status'], 
    trigger: Deployment['trigger'] = 'manual'
  ): Promise<Deployment> {
    const now = new Date().toISOString();
    const id = `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDep: Deployment = {
      id,
      service_id: serviceId,
      user_id: userId,
      status,
      trigger,
      duration_seconds: 0,
      created_at: now
    };

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('deployments')
        .insert({
          id,
          service_id: serviceId,
          user_id: userId,
          status,
          trigger
        })
        .select()
        .single();
      
      if (!error && data) return data as Deployment;
    }

    this.memoryStore.deployments.set(id, newDep);
    return newDep;
  }

  async getDeploymentsForService(userId: string, serviceId: string): Promise<Deployment[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('deployments')
        .select('*')
        .eq('service_id', serviceId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && data) return data as Deployment[];
    }

    return Array.from(this.memoryStore.deployments.values())
      .filter(d => d.service_id === serviceId && d.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async addDeploymentLogs(
    userId: string, 
    deploymentId: string, 
    serviceId: string, 
    logs: { level: DeploymentLog['level']; message: string }[]
  ): Promise<void> {
    const now = new Date().toISOString();
    const logEntries: DeploymentLog[] = logs.map((l, i) => ({
      id: `log_${Date.now()}_${i}`,
      deployment_id: deploymentId,
      service_id: serviceId,
      timestamp: now,
      level: l.level,
      message: l.message
    }));

    if (this.supabase) {
      await this.supabase.from('deployment_logs').insert(
        logEntries.map(l => ({
          deployment_id: deploymentId,
          service_id: serviceId,
          user_id: userId,
          level: l.level,
          message: l.message,
          timestamp: l.timestamp
        }))
      );
    }

    const existing = this.memoryStore.logs.get(deploymentId) || [];
    this.memoryStore.logs.set(deploymentId, [...existing, ...logEntries]);
  }

  async getDeploymentLogs(userId: string, deploymentId: string): Promise<DeploymentLog[]> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('deployment_logs')
        .select('*')
        .eq('deployment_id', deploymentId)
        .eq('user_id', userId)
        .order('timestamp', { ascending: true });
      if (!error && data) return data as DeploymentLog[];
    }

    return this.memoryStore.logs.get(deploymentId) || [];
  }

  // --- ENVIRONMENT VARIABLES ---
  async getEnvVars(userId: string, serviceId?: string, projectId?: string): Promise<EnvironmentVariable[]> {
    if (this.supabase) {
      let query = this.supabase.from('environment_variables').select('*').eq('user_id', userId);
      if (serviceId) query = query.eq('service_id', serviceId);
      if (projectId) query = query.eq('project_id', projectId);

      const { data, error } = await query;
      if (!error && data) return data as EnvironmentVariable[];
    }

    return Array.from(this.memoryStore.envVars.values()).filter(ev => {
      if (ev.user_id !== userId) return false;
      if (serviceId && ev.service_id !== serviceId) return false;
      if (projectId && ev.project_id !== projectId) return false;
      return true;
    });
  }

  async createEnvVar(
    userId: string, 
    input: { service_id: string; project_id: string; key: string; value: string; is_secret?: boolean }
  ): Promise<EnvironmentVariable> {
    const now = new Date().toISOString();
    const id = `env_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newEv: EnvironmentVariable = {
      id,
      service_id: input.service_id,
      project_id: input.project_id,
      user_id: userId,
      key: input.key,
      value: input.value,
      is_secret: input.is_secret ?? true,
      created_at: now,
      updated_at: now
    };

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('environment_variables')
        .insert({
          service_id: input.service_id,
          project_id: input.project_id,
          user_id: userId,
          key: input.key,
          value: input.value,
          is_secret: input.is_secret ?? true
        })
        .select()
        .single();
      if (!error && data) return data as EnvironmentVariable;
    }

    this.memoryStore.envVars.set(id, newEv);
    return newEv;
  }

  // --- DOMAINS ---
  async getDomains(userId: string, serviceId?: string): Promise<CustomDomain[]> {
    if (this.supabase) {
      let query = this.supabase.from('domains').select('*').eq('user_id', userId);
      if (serviceId) query = query.eq('service_id', serviceId);
      const { data, error } = await query;
      if (!error && data) return data as CustomDomain[];
    }

    return Array.from(this.memoryStore.domains.values()).filter(d => {
      if (d.user_id !== userId) return false;
      if (serviceId && d.service_id !== serviceId) return false;
      return true;
    });
  }

  async createDomain(userId: string, input: { service_id: string; project_id: string; domain_name: string }): Promise<CustomDomain> {
    const now = new Date().toISOString();
    const id = `dom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const domain: CustomDomain = {
      id,
      service_id: input.service_id,
      project_id: input.project_id,
      user_id: userId,
      domain_name: input.domain_name,
      status: 'pending',
      ssl_active: false,
      dns_records: [
        { type: 'CNAME', name: input.domain_name, value: `${input.service_id}.cloudforge.app`, verified: false }
      ],
      created_at: now
    };

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('domains')
        .insert({
          service_id: input.service_id,
          project_id: input.project_id,
          user_id: userId,
          domain_name: input.domain_name,
          status: 'pending'
        })
        .select()
        .single();
      if (!error && data) return data as CustomDomain;
    }

    this.memoryStore.domains.set(id, domain);
    return domain;
  }

  // --- USAGE ---
  async getUsage(userId: string, projectId?: string): Promise<UsageMetric[]> {
    if (this.supabase) {
      let query = this.supabase.from('usage').select('*').eq('user_id', userId);
      if (projectId) query = query.eq('project_id', projectId);
      const { data, error } = await query.order('timestamp', { ascending: false });
      if (!error && data) return data as UsageMetric[];
    }

    if (!projectId) return [];
    return this.memoryStore.usage.get(projectId) || [];
  }
}

export const db = new DatabaseService();
