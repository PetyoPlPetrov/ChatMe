import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 5001;

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'chatme-secret-key-dev';

// Mock user database (in production, this would be a real database)
const mockUsers = [
  { id: '1', email: 'john@example.com', password: 'Password123!', name: 'John Doe' },
  { id: '2', email: 'jane@example.com', password: 'Password123!', name: 'Jane Smith' },
  { id: '3', email: 'admin@example.com', password: 'admin123', name: 'Admin User' },
];

// Middleware
// CORS removed - handled by nginx gateway
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
console.log('Login attempt for email:', email);
  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  // Find user in mock database
  const user = mockUsers.find(u => u.email === email && u.password === password);
  console.log('user found:', user);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  });
});

app.post('/api/auth/logout', (req, res) => {
  // For now, always return success
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Auth verification endpoint for nginx auth_request
app.get('/api/auth/verify', (req, res) => {
  const authorization = req.headers.authorization;
console.log("Authorization in verify:", authorization);
  if (!authorization) {
    return res.status(401).json({
      success: false,
      message: 'No authorization header provided',
    });
  }

  const token = authorization.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided',
    });
  }

  try {
    // Verify and decode JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Set headers for nginx to forward to core service
    res.set('X-User-Email', decoded.email);
    res.set('X-User-ID', decoded.userId);
    res.set('X-User-Name', decoded.name);

    return res.status(200).json({
      success: true,
      message: 'Token valid',
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
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