# ChatMe

A full-stack chat application with a clean, Airbnb-inspired design featuring React frontend and Node.js backend.

## Project Structure

```
ChatMe/
├── frontend/          # React TypeScript frontend
├── server/           # Node.js TypeScript backend
├── .github/
│   └── workflows/
│       └── ci.yml    # GitHub Actions CI/CD pipeline
└── README.md
```

## Technology Stack

### Frontend
- React 19 with TypeScript
- Redux Toolkit with RTK Query for state management
- React Router for navigation
- Clean, minimalistic design inspired by Airbnb
- Prettier code formatting
- ESLint code quality

### Backend
- Node.js with Express and TypeScript
- CORS enabled for cross-origin requests
- Mock API endpoints for users
- Automatic TypeScript compilation
- Development hot-reload with nodemon

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm

### Development Setup

1. **Install Dependencies**

   Frontend:
   ```bash
   cd frontend
   npm install
   ```

   Server:
   ```bash
   cd server
   npm install
   ```

2. **Start Development Servers**

   Frontend (runs on http://localhost:3000):
   ```bash
   cd frontend
   npm start
   ```

   Server (runs on http://localhost:5000):
   ```bash
   cd server
   npm run dev
   # or with nodemon for auto-restart:
   npm run dev:nodemon
   ```

## Available Scripts

### Frontend Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Server Scripts

- `npm run dev` - Start development server with ts-node-dev
- `npm run dev:nodemon` - Start development server with nodemon
- `npm start` - Start production server
- `npm run build` - Build TypeScript to JavaScript
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run clean` - Remove build directory

## API Endpoints

The server provides the following endpoints:

- `GET /health` - Health check
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `GET /` - API documentation

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment. The pipeline runs on every push and pull request to `main` and `develop` branches.

### Pipeline Features

**Frontend CI:**
- ✅ Code formatting check with Prettier
- ✅ ESLint code quality checks
- ✅ TypeScript type checking
- ✅ Test execution with coverage
- ✅ Production build verification
- ✅ Build artifact upload

**Server CI:**
- ✅ Code formatting check with Prettier
- ✅ TypeScript type checking
- ✅ Production build verification
- ✅ Build artifact upload

**Integration Tests:**
- ✅ End-to-end API testing
- ✅ Server health checks
- ✅ Cross-service integration validation

**Security & Quality:**
- ✅ npm audit security scanning
- ✅ Sensitive file detection
- ✅ Multi-version Node.js testing (18.x, 20.x)

### Local Quality Checks

Before pushing code, run these commands to ensure CI passes:

```bash
# Frontend checks
cd frontend
npm run format:check
npm run lint
npm run build
npm test

# Server checks
cd server
npm run format:check
npm run build
```

### Auto-formatting

To automatically format your code:

```bash
# Format frontend code
cd frontend
npm run format

# Format server code
cd server
npm run format
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run local quality checks
5. Push to your fork
6. Create a pull request

The CI pipeline will automatically run all checks when you create or update a pull request.