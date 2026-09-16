import { Router, Request, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { DisconnectedProvider } from '../providers/DisconnectedProvider.js';
import { DockerKubernetesProvider } from '../providers/DockerKubernetesProvider.js';

export const providerRouter = Router();

// GET /api/provider/status
providerRouter.get('/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const apiKey = process.env.CLOUD_PROVIDER_API_KEY;
  const isConnected = Boolean(apiKey && apiKey.trim().length > 5);

  const activeProvider = isConnected ? new DockerKubernetesProvider() : new DisconnectedProvider();

  res.json({
    connected: isConnected,
    providerId: activeProvider.id,
    providerName: activeProvider.name,
    message: isConnected 
      ? 'Connected to CloudForge Infrastructure Engine.' 
      : 'Deployment provider not connected. Configure CLOUD_PROVIDER_API_KEY in environment or Settings.',
    supportedRuntimes: ['node', 'docker', 'python', 'static'],
    region: process.env.CLOUD_PROVIDER_REGION || 'North America'
  });
});

// POST /api/provider/connect
providerRouter.post('/connect', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { apiKey, endpoint, region } = req.body;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 5) {
    res.status(400).json({ 
      connected: false, 
      error: 'Invalid API Key provided. Minimum length 5 characters.' 
    });
    return;
  }

  // Set environment variable in memory for current process
  process.env.CLOUD_PROVIDER_API_KEY = apiKey.trim();
  if (endpoint) process.env.CLOUD_PROVIDER_ENDPOINT = endpoint.trim();
  if (region) process.env.CLOUD_PROVIDER_REGION = region.trim();

  const provider = new DockerKubernetesProvider();

  res.json({
    connected: provider.isConnected(),
    providerId: provider.id,
    providerName: provider.name,
    message: 'Infrastructure API Key updated successfully.'
  });
});
