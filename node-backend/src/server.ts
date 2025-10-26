import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import concordiumRoutes from './routes/concordiumRoutes';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Middleware
// CORS = Cross-Origin Resource Sharing (allows Python backend to call this API)
app.use(cors());
// Parse JSON request bodies (so we can read data from Python)
app.use(express.json());
// Parse URL-encoded bodies (for form data)
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests (helpful for debugging)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`\n📨 ${req.method} ${req.path}`);
  next(); // Continue to next middleware/route
});

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Concordium Gambling Backend API - Node.js Bridge',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      concordium: '/api/concordium/*'
    }
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    message: 'Node.js backend is running and ready to receive requests from Python'
  });
});

// Mount Concordium routes at /api/concordium
// This means all routes in concordiumRoutes.ts are prefixed with /api/concordium
// Example: router.get('/health') becomes GET /api/concordium/health
app.use('/api/concordium', concordiumRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/health`);
});

