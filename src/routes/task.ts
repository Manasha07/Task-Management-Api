import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from '../controller/task';  // Adjust the import based on your project structure

const router = express.Router();

// GET all tasks
router.get('/', getAllTasks);

// GET task by ID
router.get('/:id', getTaskById);

// POST create task
router.post('/', createTask);

// PUT update task
router.put('/:id', updateTask);

// DELETE task
router.delete('/:id', deleteTask);

export default router;
