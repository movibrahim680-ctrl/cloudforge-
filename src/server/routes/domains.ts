import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { db } from '../db.js';

export const domainsRouter = Router();

// GET /api/domains
domainsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const serviceId = req.query.serviceId as string | undefined;
    const domains = await db.getDomains(req.userId!, serviceId);
    res.json(domains);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch domains' });
  }
});

// POST /api/domains
domainsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { service_id, project_id, domain_name } = req.body;

    if (!service_id || !domain_name) {
      res.status(400).json({ error: 'service_id and domain_name are required' });
      return;
    }

    const domain = await db.createDomain(req.userId!, {
      service_id,
      project_id: project_id || 'proj_default',
      domain_name: domain_name.toLowerCase().trim()
    });

    res.status(201).json(domain);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create custom domain' });
  }
});
