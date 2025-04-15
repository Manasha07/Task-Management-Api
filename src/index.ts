import express from 'express';
import projectRoutes from './routes/project';
import taskRoutes from './routes/task';
const app = express();
app.use(express.json());
app.use('/project', projectRoutes);
app.use('/task', taskRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
})