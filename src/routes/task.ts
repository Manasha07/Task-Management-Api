import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByProjectId
} from '../controller/task';

const router = express.Router();
// New route for tasks by project ID
router.get('/by-project/filter', getTasksByProjectId);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);



export default router;
