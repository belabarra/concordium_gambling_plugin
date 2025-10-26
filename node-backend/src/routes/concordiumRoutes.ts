/**
 * Concordium API Routes
 *
 * These are the HTTP endpoints that Python backend will call.
 * Each endpoint uses the ConcordiumService to interact with blockchain.
 *
 * ROUTE STRUCTURE EXPLAINED:
 * - Express is a web framework for Node.js (like FastAPI in Python)
 * - Router.get/post/etc define HTTP endpoints
 * - (req, res) => {...} is the handler function that runs when endpoint is called
 *   - req = request (incoming data from Python)
 *   - res = response (what we send back to Python)
 */

import { Router, Request, Response } from 'express';
import concordiumService from '../services/concordiumService';

// Create a router (collection of related endpoints)
const router = Router();

/**
 * POST /api/concordium/verify-identity
 *
 * Verify a user's Concordium identity
 *
 * REQUEST BODY (from Python):
 * {
 *   "concordium_id": "37vNr2Nv4igJfc23M3BKrw5gD6A2nyNQC5o9XHr3zFUGKAK7xq",
 *   "attributes": { "min_age": 18 }
 * }
 *
 * RESPONSE (to Python):
 * {
 *   "success": true,
 *   "verified": true,
 *   "concordiumId": "37vNr2Nv4igJfc23M3BKrw5gD6A2nyNQC5o9XHr3zFUGKAK7xq",
 *   "message": "Account verified on Concordium blockchain"
 * }
 */
router.post('/verify-identity', async (req: Request, res: Response) => {
  try {
    // Extract data from request body
    // Python sends JSON, Express automatically parses it into req.body
    const { concordium_id, attributes } = req.body;

    // Validate required fields
    if (!concordium_id) {
      return res.status(400).json({
        success: false,
        error: 'concordium_id is required'
      });
    }

    console.log(`\n🔹 POST /api/concordium/verify-identity`);
    console.log(`   Concordium ID: ${concordium_id}`);

    // Call our Concordium service to verify identity
    const result = await concordiumService.verifyIdentity(concordium_id, attributes);

    // Send response back to Python
    // Status code: 200 = success
    res.status(200).json(result);

  } catch (error: any) {
    console.error('Error in verify-identity:', error);

    // Status code: 500 = server error
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/concordium/verify-transaction/:hash
 *
 * Verify a transaction by its hash
 *
 * URL PARAMETER (from Python):
 * - hash: Transaction hash (hex string)
 *
 * EXAMPLE:
 * GET /api/concordium/verify-transaction/abc123def456...
 *
 * RESPONSE:
 * {
 *   "success": true,
 *   "verified": true,
 *   "transactionHash": "abc123def456...",
 *   "status": "finalized"
 * }
 */
router.get('/verify-transaction/:hash', async (req: Request, res: Response) => {
  try {
    // Extract hash from URL parameter
    // :hash in route definition becomes req.params.hash
    const { hash } = req.params;

    if (!hash) {
      return res.status(400).json({
        success: false,
        error: 'Transaction hash is required'
      });
    }

    console.log(`\n🔹 GET /api/concordium/verify-transaction/${hash}`);

    // Verify the transaction on blockchain
    const result = await concordiumService.verifyTransaction(hash);

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Error in verify-transaction:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/concordium/log-transaction
 *
 * Log transaction data (for audit trail)
 *
 * REQUEST BODY:
 * {
 *   "transaction_hash": "abc123...",
 *   "user_id": "user123",
 *   "amount": 100.5,
 *   "type": "BET"
 * }
 */
router.post('/log-transaction', async (req: Request, res: Response) => {
  try {
    const transactionData = req.body;

    console.log(`\n🔹 POST /api/concordium/log-transaction`);

    // Log and verify transaction
    const result = await concordiumService.logTransaction(transactionData);

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Error in log-transaction:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/concordium/balance/:id
 *
 * Get balance by Concordium ID
 *
 * URL PARAMETER:
 * - id: Concordium account address/ID
 *
 * QUERY PARAMETER (optional):
 * - currency: Currency type (default: CCD)
 *
 * EXAMPLE:
 * GET /api/concordium/balance/37vNr2Nv4igJfc23M3BKrw5gD6A2nyNQC5o9XHr3zFUGKAK7xq?currency=CCD
 */
router.get('/balance/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Query parameters come from URL after "?" (like ?currency=CCD)
    const currency = req.query.currency as string || 'CCD';

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Concordium ID is required'
      });
    }

    console.log(`\n🔹 GET /api/concordium/balance/${id}`);

    // Get balance from blockchain
    const result = await concordiumService.getBalance(id, currency);

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Error in get-balance:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/concordium/wallet/:address/balance
 *
 * Get wallet balance by address (alternative endpoint format)
 *
 * This is the same as /balance/:id but uses "wallet" terminology
 * Python's blockchain_integration_service.py expects this format
 */
router.get('/wallet/:address/balance', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }

    console.log(`\n🔹 GET /api/concordium/wallet/${address}/balance`);

    // Get balance from blockchain
    const result = await concordiumService.getWalletBalance(address);

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Error in get-wallet-balance:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/concordium/transfer
 *
 * Initiate a transfer between addresses
 *
 * NOTE: This endpoint is more complex and requires signing keys.
 * For now, we'll return a not-implemented response because:
 * 1. Transfers should be initiated by Frontend (user signs with their wallet)
 * 2. Backend shouldn't hold private keys (security risk)
 * 3. This is mainly for future expansion if needed
 *
 * REQUEST BODY:
 * {
 *   "from_address": "sender address",
 *   "to_address": "recipient address",
 *   "amount": 100,
 *   "memo": "optional message"
 * }
 */
router.post('/transfer', async (req: Request, res: Response) => {
  try {
    console.log(`\n🔹 POST /api/concordium/transfer`);
    console.log(`   ⚠️  Transfer endpoint not fully implemented`);
    console.log(`   Transfers should be initiated from Frontend with user's wallet`);

    // Return not implemented
    // Status code 501 = Not Implemented
    res.status(501).json({
      success: false,
      error: 'Transfer endpoint not implemented',
      message: 'Transfers should be initiated from Frontend with user wallet signature'
    });

  } catch (error: any) {
    console.error('Error in transfer:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/concordium/health
 *
 * Check if Concordium service is connected and healthy
 *
 * This is called by Python backend to check if Node.js is ready
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    console.log(`\n🔹 GET /api/concordium/health`);

    const result = await concordiumService.healthCheck();

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Error in health check:', error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Export the router so it can be used in server.ts
export default router;
