import { 
  DeploymentProvider, 
  DeployParams, 
  DeploymentResult 
} from './DeploymentProvider.js';
import { 
  DeploymentLog, 
  DeploymentStatus 
} from '../../types/cloudforge.js';

export class DockerKubernetesProvider implements DeploymentProvider {
  id = 'cloudforge-engine';
  name = 'CloudForge Container Engine (Cloud Run / Docker)';

  private apiKey: string | undefined;
  private endpoint: string | undefined;

  constructor() {
    this.apiKey = process.env.CLOUD_PROVIDER_API_KEY;
    this.endpoint = process.env.CLOUD_PROVIDER_ENDPOINT || 'https://api.cloudforge-engine.internal';
  }

  isConnected(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async deploy(params: DeployParams): Promise<DeploymentResult> {
    const deploymentId = `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    if (!this.isConnected()) {
      return {
        deploymentId,
        status: 'provider_not_connected',
        message: 'Deployment provider not connected. Please set CLOUD_PROVIDER_API_KEY in environment variables.',
        logs: [
          `[${new Date().toISOString()}] [SYSTEM] Service build requested for "${params.service.name}".`,
          `[${new Date().toISOString()}] [ERROR] Infrastructure Engine error: Deployment provider not connected.`,
          `[${new Date().toISOString()}] [ACTION] Connect CloudForge API Key in CloudForge Settings to route builds to Cloud Run / Kubernetes.`
        ]
      };
    }

    // Real API call to external provider engine when connected:
    try {
      const response = await fetch(`${this.endpoint}/v1/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          serviceId: params.service.id,
          serviceName: params.service.name,
          runtime: params.service.runtime,
          sourceType: params.service.source_type,
          sourceUrl: params.service.source_url,
          branch: params.service.branch,
          buildCommand: params.service.build_command,
          startCommand: params.service.start_command,
          port: params.service.port,
          region: params.service.region,
          envVars: params.environmentVariables
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Infrastructure Provider rejected deployment: ${errorText}`);
      }

      const data = await response.json() as any;
      return {
        deploymentId: data.deploymentId || deploymentId,
        status: 'building',
        message: 'Deployment dispatched to CloudForge infrastructure engine.',
        publicUrl: data.publicUrl || `https://${params.service.id}.cloudforge.app`,
        logs: data.initialLogs || [`[${new Date().toISOString()}] [BUILD] Build container initialized on ${params.service.region} worker node.`]
      };
    } catch (err: any) {
      return {
        deploymentId,
        status: 'failed',
        message: err.message || 'Infrastructure provider connection failed.',
        logs: [`[${new Date().toISOString()}] [FATAL] ${err.message || 'Connection error'}`]
      };
    }
  }

  async getDeploymentStatus(serviceId: string, deploymentId: string): Promise<DeploymentStatus> {
    if (!this.isConnected()) return 'provider_not_connected';

    try {
      const res = await fetch(`${this.endpoint}/v1/services/${serviceId}/deployments/${deploymentId}/status`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      if (!res.ok) return 'failed';
      const data = await res.json() as any;
      return data.status || 'running';
    } catch {
      return 'failed';
    }
  }

  async getLogs(serviceId: string, deploymentId: string): Promise<DeploymentLog[]> {
    if (!this.isConnected()) {
      return [
        {
          id: `log_${Date.now()}_1`,
          deployment_id: deploymentId,
          service_id: serviceId,
          timestamp: new Date().toISOString(),
          level: 'error',
          message: 'Deployment provider not connected. Connect API Key in Settings to stream live container logs.'
        }
      ];
    }

    try {
      const res = await fetch(`${this.endpoint}/v1/services/${serviceId}/deployments/${deploymentId}/logs`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json() as any;
      return data.logs || [];
    } catch (err: any) {
      return [
        {
          id: `log_err_${Date.now()}`,
          deployment_id: deploymentId,
          service_id: serviceId,
          timestamp: new Date().toISOString(),
          level: 'error',
          message: `Error fetching live infrastructure logs: ${err.message}`
        }
      ];
    }
  }

  async restart(serviceId: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConnected()) {
      return { success: false, message: 'Deployment provider not connected.' };
    }

    try {
      const res = await fetch(`${this.endpoint}/v1/services/${serviceId}/restart`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return { success: res.ok, message: res.ok ? 'Restart signal sent.' : 'Restart failed.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async stop(serviceId: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConnected()) {
      return { success: false, message: 'Deployment provider not connected.' };
    }

    try {
      const res = await fetch(`${this.endpoint}/v1/services/${serviceId}/stop`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return { success: res.ok, message: res.ok ? 'Service stopped.' : 'Stop request failed.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  async delete(serviceId: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConnected()) {
      return { success: true, message: 'Service removed from CloudForge registry.' };
    }

    try {
      await fetch(`${this.endpoint}/v1/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      });
      return { success: true, message: 'Service and container resources deleted.' };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }
}
