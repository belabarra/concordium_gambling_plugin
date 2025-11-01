import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ConcordiumGRPCWebClient, AccountAddress, TransactionHash } from '@concordium/web-sdk';

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

// Initialize Concordium gRPC Web client (works with HTTPS endpoints)
const CONCORDIUM_NODE_URL = process.env.CONCORDIUM_NODE_URL || 'https://grpc.testnet.concordium.com';
const CONCORDIUM_NODE_PORT = parseInt(process.env.CONCORDIUM_NODE_PORT || '20000', 10);

const grpcClient = new ConcordiumGRPCWebClient(
  CONCORDIUM_NODE_URL,
  CONCORDIUM_NODE_PORT
);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Welcome to Concordium Gambling Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Concordium blockchain endpoints
app.get('/api/concordium/balance/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const accountAddress = AccountAddress.fromBase58(address);
    const accountInfo = await grpcClient.getAccountInfo(accountAddress);
    
    const balanceInMicroCCD = accountInfo.accountAmount.microCcdAmount;
    const balanceInCCD = Number(balanceInMicroCCD) / 1_000_000;
    
    res.json({
      success: true,
      balance: balanceInCCD,
      currency: 'CCD',
      address: address
    });
  } catch (error: any) {
    console.error('Error fetching balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch balance',
      message: error.message
    });
  }
});

app.get('/api/concordium/verify-transaction/:txHash', async (req: Request, res: Response) => {
  try {
    const { txHash } = req.params;
    const transactionHash = TransactionHash.fromHexString(txHash);
    const transactionStatus = await grpcClient.getBlockItemStatus(transactionHash);
    
    res.json({
      success: true,
      verified: true,
      status: transactionStatus,
      transaction_hash: txHash
    });
  } catch (error: any) {
    console.error('Error verifying transaction:', error);
    res.status(500).json({
      success: false,
      verified: false,
      error: 'Failed to verify transaction',
      message: error.message
    });
  }
});

app.post('/api/concordium/verify-identity', async (req: Request, res: Response) => {
  try {
    const { concordium_id } = req.body;
    
    // Verify account exists on Concordium
    const accountAddress = AccountAddress.fromBase58(concordium_id);
    const accountInfo = await grpcClient.getAccountInfo(accountAddress);
    
    res.json({
      success: true,
      verified: true,
      concordium_id: concordium_id,
      account_exists: true
    });
  } catch (error: any) {
    console.error('Error verifying identity:', error);
    res.status(400).json({
      success: false,
      verified: false,
      error: 'Failed to verify identity',
      message: error.message
    });
  }
});

// Example API endpoint
app.get('/api/example', (req: Request, res: Response) => {
  res.json({ 
    message: 'This is an example endpoint',
    data: { example: 'value' }
  });
});

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

