import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'express-async-errors';

import { appConfig } from './config/auth';
import { errorHandler, notFoundMiddleware } from './middleware/auth';

import authRoutes from './routes/auth';
import profileRoutes from './routes/profiles';
import recommendationRoutes from './routes/recommendations';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/profiles', profileRoutes);
app.use('/recommendations', recommendationRoutes);

// Error handling
app.use(errorHandler);
app.use(notFoundMiddleware);

// Start server
const port = appConfig.port;
app.listen(port, () => {
  console.log(`Server running on port ${port} in ${appConfig.environment} mode`);
  console.log(`Health check: http://localhost:${port}/health`);
});

export default app;
