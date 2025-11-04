import express from 'express';
import usersRoutes from './routes/users';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS removed - handled by nginx gateway

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/v1/users', usersRoutes);

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
    apiVersion: 'v1',
    endpoints: {
      health: '/health',
      users: '/api/v1/users',
      userById: '/api/v1/users/:id',
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

// Start server with updated CORS
app.listen(PORT, () => {
  console.log(`🚀 ChatMe Mock API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Users endpoint: http://localhost:${PORT}/api/users`);
  console.log(`🌐 CORS handled by nginx gateway`);
});
