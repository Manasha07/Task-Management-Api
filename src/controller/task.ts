import { Request, Response } from 'express';
import { db } from '../config/db';

// GET all tasks
export const getAllTasks = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [tasks] = await db.query('SELECT * FROM task');
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
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

  // ✅ 1. Check required fields
  if (!title || title.trim() === '') {
    res.status(400).json({ message: 'Task title is required' });
    return;
  }

  if (!project_id) {
    res.status(400).json({ message: 'Project ID is required' });
    return;
  }

  // ✅ 2. Validate max length
  if (title.length > 255) {
    res.status(400).json({ message: 'Title must be 255 characters or less' });
    return;
  }

  if (description && description.length > 1000) {
    res.status(400).json({ message: 'Description must be 1000 characters or less' });
    return;
  }

  // ✅ 3. Validate due date
  if (!due_date || isNaN(Date.parse(due_date))) {
    res.status(400).json({ message: 'Valid due date is required' });
    return;
  }

  const due = new Date(due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // remove time for accurate comparison

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
