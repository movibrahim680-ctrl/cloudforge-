import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest } from '../auth.js';
import { db } from '../db.js';

export const projectsRouter = Router();

// GET /api/projects
projectsRouter.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projects = await db.getProjects(req.userId!);
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id
projectsRouter.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const project = await db.getProjectById(req.userId!, req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch project' });
  }
});

// POST /api/projects
projectsRouter.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, region } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    const validRegions = ['Europe', 'North America', 'Asia'];
    const selectedRegion = validRegions.includes(region) ? region : 'North America';

    const project = await db.createProject(req.userId!, {
      name: name.trim(),
      description: description ? String(description).trim() : '',
      region: selectedRegion
    });

    res.status(201).json(project);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create project' });
  }
});
