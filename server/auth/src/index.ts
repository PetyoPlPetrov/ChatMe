import express from 'express';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 5001;

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'chatme-secret-key-dev';

// Mock user database (in production, this would be a real database)
const mockUsers = [
  {
    id: '1',
    email: 'john@example.com',
    password: 'Password123!',
    name: 'John Doe',
  },
  {
    id: '2',
    email: 'jane@example.com',
    password: 'Password123!',
    name: 'Jane Smith',
  },
  {
    id: '3',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
  },
];

// Middleware
// CORS removed - handled by nginx gateway
app.use(express.json());
app.use(cookieParser());

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
app.post('/api/v1/auth/login', (req, res) => {
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
  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  );
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
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Set JWT in httpOnly cookie
  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  });

  res.json({
    success: true,
    message: 'Authentication successful',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    // Token no longer returned in response body for security
  });
});

app.post('/api/v1/auth/logout', (req, res) => {
  // Clear the authentication cookie
  res.clearCookie('authToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// Auth verification endpoint for nginx auth_request
app.get('/api/v1/auth/verify', (req, res) => {
  // Try to get token from cookie first (new method)
  let token = req.cookies?.authToken;

  // Fallback to Authorization header for backward compatibility during transition
  if (!token) {
    const authorization = req.headers.authorization;
    console.log(
      'No cookie found, checking Authorization header:',
      authorization
    );
    if (authorization) {
      token = authorization.replace('Bearer ', '');
    }
  } else {
    console.log('Found token in cookie');
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided',
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
