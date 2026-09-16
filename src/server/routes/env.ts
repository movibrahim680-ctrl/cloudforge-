import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { db } from '../db.js';

export const envRouter = Router();

// GET /api/environment-variables
envRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const serviceId = req.query.serviceId as string | undefined;
    const projectId = req.query.projectId as string | undefined;

    const envVars = await db.getEnvVars(req.userId!, serviceId, projectId);
    res.json(envVars);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch environment variables' });
  }
});

// POST /api/environment-variables
envRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { service_id, project_id, key, value, is_secret } = req.body;

    if (!service_id || !key || value === undefined) {
      res.status(400).json({ error: 'service_id, key, and value are required' });
      return;
    }

    const created = await db.createEnvVar(req.userId!, {
      service_id,
      project_id: project_id || 'proj_default',
      key: String(key).toUpperCase().trim(),
      value: String(value),
      is_secret: is_secret ?? true
    });

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create environment variable' });
  }
});
