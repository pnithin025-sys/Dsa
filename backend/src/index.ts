import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// If running in Vercel Serverless environment, ensure SQLite dev.db is in writable /tmp
if (process.env.VERCEL) {
  const tmpDbPath = '/tmp/dev.db';
  const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
    try {
      fs.copyFileSync(bundledDbPath, tmpDbPath);
      console.log('✅ SQLite database copied to /tmp/dev.db for Vercel execution');
    } catch (e) {
      console.warn('Could not copy SQLite to /tmp:', e);
    }
  }
  process.env.DATABASE_URL = `file:${tmpDbPath}`;
}

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
    environment: process.env.VERCEL ? 'VERCEL_CLOUD' : 'STANDALONE_NODE',
    timestamp: new Date().toISOString(),
  });
});

// Root welcome / health
app.get('/', (req, res) => {
  res.json({
    name: 'Smart Hostel Management System API',
    version: '1.0.0',
    status: 'OPERATIONAL',
    docs: '/api/health',
  });
});

// Centralized Routes
app.use('/api', apiRouter);

// Lazy DSA initialization flag
let isInitialized = false;
async function ensureDsaInitialized() {
  if (!isInitialized) {
    try {
      const dsaService = DSAService.getInstance();
      await dsaService.initialize();
      isInitialized = true;
      console.log('📊 DSA Service initialized in cloud environment');
    } catch (error) {
      console.warn('DSA initialization fallback note:', error);
    }
  }
}

// Serverless handler wrapper
app.use(async (req, res, next) => {
  await ensureDsaInitialized();
  next();
});

// Local dev server listener
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  ensureDsaInitialized().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Smart Hostel Backend Server running on http://localhost:${PORT}`);
      console.log(`📊 DSA Service initialized: Linked List, Stack, Queue, Hash Table, Tree, Graph`);
    });
  });
}

export default app;
