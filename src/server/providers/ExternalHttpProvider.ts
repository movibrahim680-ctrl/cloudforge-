import { 
  DeploymentProvider, 
  DeployParams, 
  DeploymentResult 
} from './DeploymentProvider.js';
import { 
  DeploymentLog, 
  DeploymentStatus 
} from '../../types/cloudforge.js';

export class ExternalHttpProvider implements DeploymentProvider {
  id = 'external';
  name = 'External Infrastructure Provider';

  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = (process.env.DEPLOYMENT_API_URL || process.env.CLOUD_PROVIDER_ENDPOINT || '').replace(/\/+$/, '');
    this.apiToken = process.env.DEPLOYMENT_API_TOKEN || process.env.CLOUD_PROVIDER_API_KEY || '';
  }

  isConnected(): boolean {
    return Boolean(this.apiUrl && this.apiToken && this.apiToken.trim().length > 0);
  }

  async deploy(params: DeployParams): Promise<DeploymentResult> {
    if (!this.isConnected()) {
      throw new Error('INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED');
    }

    const response = await fetch(`${this.apiUrl}/deploy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`External provider deploy failed (${response.status}): ${errText}`);
    }

    const data = await response.json();

    const allowedStatuses: DeploymentStatus[] = ['queued', 'building', 'deploying', 'running', 'failed', 'stopped'];
    const status: DeploymentStatus = allowedStatuses.includes(data.status) ? data.status : 'building';

    return {
      deploymentId: data.deploymentId || data.id || `dep_${Date.now()}`,
      status,
      message: data.message || 'Deployment dispatched to external provider',
      publicUrl: data.publicUrl || data.url,
      logs: data.logs || []
    };
  }

  async getDeploymentStatus(serviceId: string, deploymentId: string): Promise<DeploymentStatus> {
    if (!this.isConnected()) {
      return 'provider_not_connected';
    }

    try {
      const response = await fetch(`${this.apiUrl}/services/${serviceId}/deployments/${deploymentId}/status`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      if (!response.ok) {
        return 'failed';
      }

      const data = await response.json();
      const allowedStatuses: DeploymentStatus[] = ['queued', 'building', 'deploying', 'running', 'failed', 'stopped'];
      return allowedStatuses.includes(data.status) ? data.status : 'building';
    } catch {
      return 'failed';
    }
  }

  async getLogs(serviceId: string, deploymentId: string): Promise<DeploymentLog[]> {
    if (!this.isConnected()) {
      return [];
    }

    try {
      const response = await fetch(`${this.apiUrl}/services/${serviceId}/deployments/${deploymentId}/logs`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return Array.isArray(data) ? data : data.logs || [];
    } catch {
      return [];
    }
  }

  async restart(serviceId: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConnected()) {
      throw new Error('INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED');
    }

    const response = await fetch(`${this.apiUrl}/services/${serviceId}/restart`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      }
    });

    if (!response.ok) {
      return { success: false, message: `Failed to restart on external provider (${response.status})` };
    }

    const data = await response.json();
    return { success: data.success ?? true, message: data.message || 'Service restarted' };
  }

  async stop(serviceId: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConnected()) {
      throw new Error('INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED');
    }

    const response = await fetch(`${this.apiUrl}/services/${serviceId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      }
    });

    if (!response.ok) {
      return { success: false, message: `Failed to stop on external provider (${response.status})` };
    }

    const data = await response.json();
    return { success: data.success ?? true, message: data.message || 'Service stopped' };
  }

  async delete(serviceId: string): Promise<{ success: boolean; message: string }> {
    if (!this.isConnected()) {
      return { success: true, message: 'Provider not connected, local record deleted.' };
    }

    const response = await fetch(`${this.apiUrl}/services/${serviceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`
      }
    });

    return { success: response.ok, message: 'Deleted on external provider' };
  }
}
