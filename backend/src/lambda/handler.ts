import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes from '../routes/auth';
import profileRoutes from '../routes/profiles';
import recommendationRoutes from '../routes/recommendations';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/profiles', profileRoutes);
app.use('/recommendations', recommendationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Export Lambda handler
export const handler = serverless(app);
