import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { db } from '../db.js';
import { DeploymentProvider } from '../providers/DeploymentProvider.js';
import { DisconnectedProvider } from '../providers/DisconnectedProvider.js';
import { DockerKubernetesProvider } from '../providers/DockerKubernetesProvider.js';
import { ExternalHttpProvider } from '../providers/ExternalHttpProvider.js';

export const servicesRouter = Router();

function getActiveProvider(): DeploymentProvider {
  const providerType = (process.env.DEPLOYMENT_PROVIDER || process.env.CLOUD_PROVIDER_TYPE || 'disconnected').toLowerCase();

  if (providerType === 'external' || providerType === 'docker_k8s' || providerType === 'kubernetes' || providerType === 'cloudrun') {
    return new ExternalHttpProvider();
  }

  const legacyKey = process.env.CLOUD_PROVIDER_API_KEY;
  if (legacyKey && legacyKey.trim().length > 5) {
    return new DockerKubernetesProvider();
  }

  return new DisconnectedProvider();
}

// GET /api/services
servicesRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const services = await db.getServices(req.userId!, projectId);
    res.json(services);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch services' });
  }
});

// GET /api/services/:id
servicesRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = await db.getServiceById(req.userId!, req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    res.json(service);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch service' });
  }
});

// POST /api/services
servicesRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      project_id, 
      name, 
      source_type, 
      source_url, 
      runtime, 
      branch, 
      build_command, 
      start_command, 
      port, 
      region,
      env_vars 
    } = req.body;

    if (!project_id || !name || !source_type || !runtime) {
      res.status(400).json({ error: 'Missing required fields (project_id, name, source_type, runtime)' });
      return;
    }

    const service = await db.createService(req.userId!, {
      project_id,
      name,
      source_type,
      source_url: source_url || 'https://github.com/cloudforge/app-template',
      runtime,
      branch: branch || 'main',
      build_command: build_command || (runtime === 'node' ? 'npm run build' : ''),
      start_command: start_command || (runtime === 'node' ? 'npm start' : ''),
      port: Number(port) || 3000,
      region: region || 'North America',
      env_vars
    });

    res.status(201).json(service);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create service' });
  }
});

// POST /api/services/:id/deploy
servicesRouter.post('/:id/deploy', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = await db.getServiceById(req.userId!, req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const provider = getActiveProvider();
    if (!provider.isConnected()) {
      res.status(503).json({
        error: 'Infrastructure provider not configured',
        code: 'INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED'
      });
      return;
    }

    // Fetch environment variables
    const envVarsList = await db.getEnvVars(req.userId!, service.id);
    const envMap: Record<string, string> = {};
    envVarsList.forEach(e => { envMap[e.key] = e.value; });

    // Execute deploy with provider
    const result = await provider.deploy({
      service,
      environmentVariables: envMap,
      trigger: 'manual'
    });

    // Update service & create deployment record in DB
    const newStatus = result.status;
    await db.updateServiceStatus(req.userId!, service.id, newStatus);

    const deploymentRecord = await db.createDeploymentRecord(req.userId!, service.id, newStatus, 'manual');

    // Store log entries
    if (result.logs && result.logs.length > 0) {
      await db.addDeploymentLogs(
        req.userId!, 
        deploymentRecord.id, 
        service.id, 
        result.logs.map(l => ({
          level: l.includes('[ERROR]') ? 'error' : 'info',
          message: l
        }))
      );
    }

    res.json({
      message: result.message,
      deployment: deploymentRecord,
      providerConnected: provider.isConnected(),
      providerName: provider.name
    });
  } catch (err: any) {
    if (err.message === 'INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED') {
      res.status(503).json({
        error: 'Infrastructure provider not configured',
        code: 'INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED'
      });
      return;
    }
    res.status(500).json({ error: err.message || 'Failed to deploy service' });
  }
});

// GET /api/services/:id/status
servicesRouter.get('/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = await db.getServiceById(req.userId!, req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const provider = getActiveProvider();
    const deployments = await db.getDeploymentsForService(req.userId!, service.id);
    const latestDeployment = deployments[0];

    let currentStatus = service.status;
    if (latestDeployment) {
      currentStatus = await provider.getDeploymentStatus(service.id, latestDeployment.id);
    }

    res.json({
      serviceId: service.id,
      status: currentStatus,
      providerConnected: provider.isConnected(),
      latestDeployment: latestDeployment || null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch service status' });
  }
});

// GET /api/services/:id/logs
servicesRouter.get('/:id/logs', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = await db.getServiceById(req.userId!, req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const provider = getActiveProvider();
    const deployments = await db.getDeploymentsForService(req.userId!, service.id);
    const latestDeployment = deployments[0];

    if (!latestDeployment) {
      res.json([]);
      return;
    }

    const logs = await db.getDeploymentLogs(req.userId!, latestDeployment.id);
    if (logs.length > 0) {
      res.json(logs);
      return;
    }

    // Fallback to provider getLogs
    const providerLogs = await provider.getLogs(service.id, latestDeployment.id);
    res.json(providerLogs);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch logs' });
  }
});

// POST /api/services/:id/restart
servicesRouter.post('/:id/restart', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = await db.getServiceById(req.userId!, req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const provider = getActiveProvider();
    if (!provider.isConnected()) {
      res.status(503).json({
        error: 'Infrastructure provider not configured',
        code: 'INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED'
      });
      return;
    }

    const resResult = await provider.restart(service.id);
    
    if (resResult.success) {
      await db.updateServiceStatus(req.userId!, service.id, 'running');
    }

    res.json(resResult);
  } catch (err: any) {
    if (err.message === 'INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED') {
      res.status(503).json({
        error: 'Infrastructure provider not configured',
        code: 'INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED'
      });
      return;
    }
    res.status(500).json({ error: err.message || 'Failed to restart service' });
  }
});

// POST /api/services/:id/stop
servicesRouter.post('/:id/stop', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = await db.getServiceById(req.userId!, req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const provider = getActiveProvider();
    if (!provider.isConnected()) {
      res.status(503).json({
        error: 'Infrastructure provider not configured',
        code: 'INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED'
      });
      return;
    }

    const resResult = await provider.stop(service.id);

    if (resResult.success) {
      await db.updateServiceStatus(req.userId!, service.id, 'stopped');
    }

    res.json(resResult);
  } catch (err: any) {
    if (err.message === 'INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED') {
      res.status(503).json({
        error: 'Infrastructure provider not configured',
        code: 'INFRASTRUCTURE_PROVIDER_NOT_CONFIGURED'
      });
      return;
    }
    res.status(500).json({ error: err.message || 'Failed to stop service' });
  }
});

// DELETE /api/services/:id
servicesRouter.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = await db.getServiceById(req.userId!, req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }

    const provider = getActiveProvider();
    await provider.delete(service.id);
    await db.deleteService(req.userId!, service.id);

    res.json({ message: 'Service successfully deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete service' });
  }
});
