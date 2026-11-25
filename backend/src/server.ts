import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import authRoutes from './routes/auth.routes.js';
import capsulesRoutes from './routes/capsules.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';

const app = express();

// Middleware
app.use(
  cors({
    origin: [ENV.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'ChronoVault Temporal Engine API',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV,
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsulesRoutes);
app.use('/api/notifications', notificationsRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(ENV.PORT, () => {
  console.log(`
🚀 ChronoVault REST API Server Running
📡 URL: http://localhost:${ENV.PORT}
🔒 Temporal Lock Engine: Active
🌐 Frontend Allowed: ${ENV.FRONTEND_URL}
  `);
});

export default app;
