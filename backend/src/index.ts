import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRouter from './routes';
import { DSAService } from './services/dsaService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Smart Hostel Management System API',
    dsaEngine: 'ACTIVE',
    timestamp: new Date().toISOString(),
  });
});

// Centralized Routes
app.use('/api', apiRouter);

// Initialize DSA in-memory structures and start server
async function startServer() {
  try {
    const dsaService = DSAService.getInstance();
    await dsaService.initialize();

    app.listen(PORT, () => {
      console.log(`🚀 Smart Hostel Backend Server running on http://localhost:${PORT}`);
      console.log(`📊 DSA Service initialized: Linked List, Stack, Queue, Hash Table, Tree, Graph`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
