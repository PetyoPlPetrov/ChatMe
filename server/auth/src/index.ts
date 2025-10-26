import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'chatme-auth-service',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      email, password
    },
    token: 'mock-jwt-token-' + Date.now(),
  });
});

app.post('/api/auth/logout', (req, res) => {
  // For now, always return success
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    service: 'chatme-auth-service',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🔐 ChatMe Auth Service running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
});