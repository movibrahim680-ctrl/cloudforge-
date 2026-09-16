import { Service, Deployment, DeploymentLog, DeploymentStatus, CreateServiceInput } from '../../types/cloudforge.js';

export interface DeployParams {
  service: Service;
  environmentVariables: Record<string, string>;
  trigger?: 'manual' | 'git_push' | 'redeploy' | 'api';
}

export interface DeploymentResult {
  deploymentId: string;
  status: DeploymentStatus;
  message: string;
  publicUrl?: string;
  logs?: string[];
}

export interface DeploymentProvider {
  id: string;
  name: string;
  
  /**
   * Returns whether real infrastructure connection credentials are set.
   */
  isConnected(): boolean;

  /**
   * Trigger a real deployment.
   */
  deploy(params: DeployParams): Promise<DeploymentResult>;

  /**
   * Get latest deployment status from infrastructure.
   */
  getDeploymentStatus(serviceId: string, deploymentId: string): Promise<DeploymentStatus>;

  /**
   * Stream or fetch logs from infrastructure engine.
   */
  getLogs(serviceId: string, deploymentId: string): Promise<DeploymentLog[]>;

  /**
   * Restart a running service.
   */
  restart(serviceId: string): Promise<{ success: boolean; message: string }>;

  /**
   * Stop a running service.
   */
  stop(serviceId: string): Promise<{ success: boolean; message: string }>;

  /**
   * Delete service resources from infrastructure.
   */
  delete(serviceId: string): Promise<{ success: boolean; message: string }>;
}
