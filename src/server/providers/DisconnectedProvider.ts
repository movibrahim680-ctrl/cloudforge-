import { 
  DeploymentProvider, 
  DeployParams, 
  DeploymentResult 
} from './DeploymentProvider.js';
import { 
  DeploymentLog, 
  DeploymentStatus 
} from '../../types/cloudforge.js';

export class DisconnectedProvider implements DeploymentProvider {
  id = 'disconnected';
  name = 'No Infrastructure Connected';

  isConnected(): boolean {
    return false;
  }

  async deploy(params: DeployParams): Promise<DeploymentResult> {
    const deploymentId = `dep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // As per CloudForge requirements: Do not fake deployment success when provider is not connected.
    return {
      deploymentId,
      status: 'provider_not_connected',
      message: 'Deployment provider not connected. Configure CLOUD_PROVIDER_API_KEY in server environment settings.',
      logs: [
        `[${new Date().toISOString()}] [SYSTEM] Initiating deployment for service: ${params.service.name}`,
        `[${new Date().toISOString()}] [ERROR] Deployment provider not connected. No active cloud infrastructure (Cloud Run / Docker / Kubernetes) configured.`,
        `[${new Date().toISOString()}] [INFO] Please set CLOUD_PROVIDER_API_KEY or select an active infrastructure provider in Settings.`
      ]
    };
  }

  async getDeploymentStatus(serviceId: string, deploymentId: string): Promise<DeploymentStatus> {
    return 'provider_not_connected';
  }

  async getLogs(serviceId: string, deploymentId: string): Promise<DeploymentLog[]> {
    return [
      {
        id: `log_${Date.now()}_1`,
        deployment_id: deploymentId,
        service_id: serviceId,
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Deployment provider not connected. Infrastructure logs unavailable until Cloud Run / Docker endpoint is connected.'
      }
    ];
  }

  async restart(serviceId: string): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'Deployment provider not connected. Cannot restart service without an active infrastructure provider.'
    };
  }

  async stop(serviceId: string): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: 'Deployment provider not connected. Cannot stop service without an active infrastructure provider.'
    };
  }

  async delete(serviceId: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Service record marked for deletion.'
    };
  }
}
