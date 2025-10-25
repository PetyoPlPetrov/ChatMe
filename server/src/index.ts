import express from 'express';
import cors from 'cors';
import usersRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: ['http://localhost:3000'], // Frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/users', usersRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'ChatMe Mock API Server',
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ChatMe Mock API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      userById: '/api/users/:id',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Error handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error('Server error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ChatMe Mock API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Users endpoint: http://localhost:${PORT}/api/users`);
  console.log(`🌐 CORS enabled for: http://localhost:3000`);
});
