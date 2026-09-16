import { 
  Project, 
  Service, 
  Deployment, 
  DeploymentLog, 
  EnvironmentVariable, 
  CustomDomain, 
  ProviderInfo,
  CreateServiceInput,
  UsageMetric
} from '../types/cloudforge';

class CloudForgeApi {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('cloudforge_token') || 'usr_dev_101';
    const email = localStorage.getItem('cloudforge_email') || 'developer@cloudforge.app';

    headers['Authorization'] = `Bearer ${token}`;
    headers['x-cloudforge-user-id'] = token;
    headers['x-cloudforge-user-email'] = email;

    return headers;
  }

  // --- PROJECTS ---
  async getProjects(): Promise<Project[]> {
    const res = await fetch('/api/projects', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  }

  async getProject(id: string): Promise<Project> {
    const res = await fetch(`/api/projects/${id}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  }

  async createProject(data: { name: string; description: string; region: string }): Promise<Project> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create project' }));
      throw new Error(err.error || 'Failed to create project');
    }
    return res.json();
  }

  // --- SERVICES ---
  async getServices(projectId?: string): Promise<Service[]> {
    const url = projectId ? `/api/services?projectId=${projectId}` : '/api/services';
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch services');
    return res.json();
  }

  async getService(id: string): Promise<Service> {
    const res = await fetch(`/api/services/${id}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch service');
    return res.json();
  }

  async createService(input: CreateServiceInput): Promise<Service> {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(input)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to create service' }));
      throw new Error(err.error || 'Failed to create service');
    }
    return res.json();
  }

  async deployService(id: string): Promise<{
    message: string;
    deployment: Deployment;
    providerConnected: boolean;
    providerName: string;
  }> {
    const res = await fetch(`/api/services/${id}/deploy`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to trigger deployment');
    return res.json();
  }

  async getServiceStatus(id: string): Promise<{
    serviceId: string;
    status: Service['status'];
    providerConnected: boolean;
    latestDeployment: Deployment | null;
  }> {
    const res = await fetch(`/api/services/${id}/status`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch service status');
    return res.json();
  }

  async getServiceLogs(id: string): Promise<DeploymentLog[]> {
    const res = await fetch(`/api/services/${id}/logs`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch service logs');
    return res.json();
  }

  async restartService(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/services/${id}/restart`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to restart service');
    return res.json();
  }

  async stopService(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/services/${id}/stop`, {
      method: 'POST',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to stop service');
    return res.json();
  }

  async deleteService(id: string): Promise<{ message: string }> {
    const res = await fetch(`/api/services/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete service');
    return res.json();
  }

  // --- ENVIRONMENT VARIABLES ---
  async getEnvVars(serviceId?: string, projectId?: string): Promise<EnvironmentVariable[]> {
    let url = '/api/environment-variables?';
    if (serviceId) url += `serviceId=${serviceId}&`;
    if (projectId) url += `projectId=${projectId}`;
    
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch environment variables');
    return res.json();
  }

  async createEnvVar(data: { service_id: string; project_id?: string; key: string; value: string; is_secret?: boolean }): Promise<EnvironmentVariable> {
    const res = await fetch('/api/environment-variables', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to save environment variable');
    return res.json();
  }

  // --- DOMAINS ---
  async getDomains(serviceId?: string): Promise<CustomDomain[]> {
    const url = serviceId ? `/api/domains?serviceId=${serviceId}` : '/api/domains';
    const res = await fetch(url, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch domains');
    return res.json();
  }

  async createDomain(data: { service_id: string; project_id?: string; domain_name: string }): Promise<CustomDomain> {
    const res = await fetch('/api/domains', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add custom domain');
    return res.json();
  }

  // --- PROVIDER & INFRASTRUCTURE STATUS ---
  async getProviderStatus(): Promise<ProviderInfo> {
    const res = await fetch('/api/provider/status', { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch provider status');
    return res.json();
  }

  async connectProvider(apiKey: string, endpoint?: string, region?: string): Promise<ProviderInfo> {
    const res = await fetch('/api/provider/connect', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ apiKey, endpoint, region })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Connection failed' }));
      throw new Error(err.error || 'Failed to connect provider');
    }
    return res.json();
  }
}

export const api = new CloudForgeApi();
