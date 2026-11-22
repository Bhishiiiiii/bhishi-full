import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB, getDbStatus } from './config/db.js';
import { seedDatabase } from './seed/seedDatabase.js';
import { blockchainService } from './services/blockchainService.js';
import User from './models/User.js';

// Route handlers
import authRoutes from './routes/authRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import contributionRoutes from './routes/contributionRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import blockchainRoutes from './routes/blockchainRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import ledgerRoutes from './routes/ledgerRoutes.js';

const app = express();
const PORT = process.env.PORT || 5001;

// CORS Configuration
const clientOrigin = process.env.CLIENT_ORIGIN;
const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (defaultAllowedOrigins.includes(origin) || (clientOrigin && origin === clientOrigin)) {
      return callback(null, true);
    }
    // Allow localhost/127.0.0.1 on any dev port
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-demo-role']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Root Health Check (Maintains backward compatibility with test 1)
app.get('/health', (req, res) => {
  const isFallback = blockchainService.getNetworkStatus().isFallback;
  res.json({
    status: 'OK',
    service: 'Bishi Backend API & Sepolia Verification Layer',
    network: 'Ethereum Sepolia Testnet',
    db: getDbStatus(),
    chain: isFallback ? 'fallback' : 'sepolia',
    timestamp: new Date().toISOString()
  });
});

// Standard API Health Check
app.get('/api/health', (req, res) => {
  const isFallback = blockchainService.getNetworkStatus().isFallback;
  const contractAddr = process.env.CONTRACT_ADDRESS || process.env.LEDGER_CONTRACT_ADDRESS || blockchainService.contractAddress || '0x892a014a51e605d3b6a98711ef84b01e3b52601a';
  res.json({
    status: 'ok',
    db: getDbStatus(),
    chain: isFallback ? 'fallback' : 'sepolia',
    contractAddress: contractAddr,
    service: 'Bishi Backend API & Sepolia Verification Layer',
    network: 'Ethereum Sepolia Testnet',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ledger', ledgerRoutes);

// JSON 404 Handler (never returns HTML)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NotFound',
    message: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Central JSON Error Handler (never returns HTML)
app.use((err, req, res, next) => {
  console.error('[ServerError]', err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start Server
export async function startServer() {
  try {
    await connectDB();

    const dbMode = getDbStatus();
    const shouldSeed = process.env.SEED_ON_START === 'true' ||
      (process.env.SEED_ON_START !== 'false' && (dbMode === 'memory' || process.env.NODE_ENV !== 'production'));

    const userCount = await User.countDocuments();
    if (userCount === 0 && shouldSeed) {
      console.log('[Startup] Empty database detected. Auto-seeding initial data...');
      await seedDatabase();
    }

    const server = app.listen(PORT, () => {
      console.log('================================================================');
      console.log(`Bishi API Server running on port: ${PORT}`);
      console.log(`Base URL: http://localhost:${PORT}/api`);
      console.log(`Database Status: ${dbMode}`);
      console.log(`Blockchain Mode: ${blockchainService.getNetworkStatus().isFallback ? 'Deterministic Fallback' : 'Live Sepolia'}`);
      console.log(`Contract: ${process.env.CONTRACT_ADDRESS || blockchainService.contractAddress || '0x892a014a51e605d3b6a98711ef84b01e3b52601a'}`);
      console.log('================================================================');
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

const isDirectRun = process.argv[1] && process.argv[1].endsWith('index.js');
if (isDirectRun && process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
