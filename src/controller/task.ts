import { Request, Response } from 'express';
import { db } from '../config/db';

// GET all tasks
export const getAllTasks = async (req: Request, res: Response): Promise<void> => {
  const { status, priority, dueDate } = req.query;

  try {
    let query = 'SELECT * FROM task WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }

    if (dueDate) {
      query += ' AND DATE(due_date) = ?';  // Compare only the date part
      params.push(dueDate);
    }

    const [tasks] = await db.query(query, params);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks with filters:', error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// GET task by ID
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const [tasks]: [any[], any] = await db.query('SELECT * FROM task WHERE id = ?', [req.params.id]);

    if (tasks.length === 0) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json(tasks[0]);
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    res.status(500).json({ message: 'Error fetching task' });
  }
};

// POST create task
export const createTask = async (req: Request, res: Response): Promise<void> => {
  const { title, description, status, priority, project_id, due_date } = req.body;

  if (!title || title.trim() === '') {
    res.status(400).json({ message: 'Task title is required' });
    return;
  }

  if (!project_id) {
    res.status(400).json({ message: 'Project ID is required' });
    return;
  }

  if (title.length > 255) {
    res.status(400).json({ message: 'Title must be 255 characters or less' });
    return;
  }

  if (description && description.length > 1000) {
    res.status(400).json({ message: 'Description must be 1000 characters or less' });
    return;
  }

  if (!due_date || isNaN(Date.parse(due_date))) {
    res.status(400).json({ message: 'Valid due date is required' });
    return;
  }

  const due = new Date(due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (due < today) {
    res.status(400).json({ message: 'Due date cannot be in the past' });
    return;
  }

  try {
    await db.query(
      'INSERT INTO task (title, description, status, priority, project_id, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || null, status || 'To Do', priority || 'Medium', project_id, due_date]
    );
    res.status(201).json({ message: 'Task created successfully' });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

// PUT update task
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  const { title, description, status, priority, project_id, due_date } = req.body;

  if (!title || title.length > 255) {
    res.status(400).json({ message: 'Task title is required and must be <= 255 characters' });
    return;
  }

  if (!due_date || isNaN(Date.parse(due_date))) {
    res.status(400).json({ message: 'Valid due date is required' });
    return;
  }

  try {
    const [result] = await db.query(
      'UPDATE task SET title = ?, description = ?, status = ?, priority = ?, project_id = ?, due_date = ? WHERE id = ?',
      [title, description || null, status || 'To Do', priority || 'Medium', project_id, due_date, req.params.id]
    );

    if ((result as any).affectedRows === 0) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

// DELETE task
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const [result] = await db.query('DELETE FROM task WHERE id = ?', [req.params.id]);
    if ((result as any).affectedRows === 0) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};

// ✅ GET tasks by project ID
export const getTasksByProjectId = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;

  if (!projectId) {
    res.status(400).json({ message: 'projectId is required' });
    return;
  }

  try {
    const [tasks] = await db.query('SELECT * FROM task WHERE project_id = ?', [projectId]);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks by project ID:', error);
    res.status(500).json({ message: 'Error fetching tasks by project' });
  }
};
