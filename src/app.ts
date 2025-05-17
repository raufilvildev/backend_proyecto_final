import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());


// Route configuration

import apiRoutes from './routes/api.routes';
app.use('/api', apiRoutes);

// 404 handler

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: 'Not found'
  });
});

// Error handler

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

export default app;
