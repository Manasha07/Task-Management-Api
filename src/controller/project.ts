import { Request, Response } from 'express';
import { db } from '../config/db';

// GET all projects
export const getAllProjects = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [projects] = await db.query('SELECT * FROM projects');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// GET project by ID
export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [projects]: [any[], any] = await db.query('SELECT * FROM projects WHERE id = ?', [req.params.id]);

    if (projects.length === 0) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json(projects[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project' });
  }
};

// POST create project
export const createProject = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name || name.length > 255) {
    res.status(400).json({ message: 'Project name is required and must be <= 255 characters' });
    return;
  }

  try {
    await db.query('INSERT INTO projects (name, description) VALUES (?, ?)', [name, description || null]);
    res.status(201).json({ message: 'Project created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating project' });
  }
};

// PUT update project
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  const { name, description } = req.body;

  if (!name || name.length > 255) {
    res.status(400).json({ message: 'Project name is required and must be <= 255 characters' });
    return;
  }

  try {
    const [result] = await db.query('UPDATE projects SET name = ?, description = ? WHERE id = ?', [
      name,
      description || null,
      req.params.id,
    ]);

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating project' });
  }
};

// DELETE project
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const [result] = await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) {
      res.status(404).json({ message: 'Project not found' });
      return;
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
};
