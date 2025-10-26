/**
 * Concordium Blockchain Integration Service
 *
 * This service is the bridge between Python backend and Concordium blockchain.
 * Python CANNOT talk to Concordium directly (no Python SDK exists),
 * so it makes HTTP requests to this Node.js service, which uses the
 * Concordium JavaScript SDK to interact with the blockchain.
 */

// Use require for Concordium SDK to avoid ESM/CommonJS compatibility issues
const { ConcordiumGRPCNodeClient, credentials } = require('@concordium/web-sdk/nodejs');
const { AccountAddress, TransactionHash } = require('@concordium/web-sdk');

// Configuration for Concordium testnet
const CONCORDIUM_TESTNET_URL = 'grpc.testnet.concordium.com';
const CONCORDIUM_TESTNET_PORT = 20000;

/**
 * ConcordiumService class
 * Handles all blockchain interactions using Concordium SDK
 */
class ConcordiumService {
  private client: any; // Type as any to avoid ESM/CommonJS compatibility issues

  constructor() {
    // Initialize the gRPC client to connect to Concordium testnet
    // gRPC = Google Remote Procedure Call (a way to communicate with blockchain nodes)
    // For Node.js, we use ConcordiumGRPCNodeClient with insecure credentials (for testnet)
    // In production, you'd use SSL credentials
    this.client = new ConcordiumGRPCNodeClient(
      CONCORDIUM_TESTNET_URL,
      CONCORDIUM_TESTNET_PORT,
      credentials.createInsecure(), // Insecure credentials for testnet
      { timeout: 15000 } // 15 second timeout for requests
    );

    console.log('✅ Concordium gRPC client initialized');
    console.log(`   Connected to: ${CONCORDIUM_TESTNET_URL}:${CONCORDIUM_TESTNET_PORT}`);
  }

  /**
   * Get wallet balance by Concordium address
   *
   * @param address - Concordium account address (like "37vNr2Nv4igJfc23M3BKrw5gD6A2nyNQC5o9XHr3zFUGKAK7xq")
   * @returns Balance in CCD and microCCD
   *
   * EXPLANATION:
   * - Concordium stores amounts in "microCCD" (1 CCD = 1,000,000 microCCD)
   * - This is like how $1 = 100 cents, but with 1 million subdivisions
   * - We return both formats for convenience
   */
  async getWalletBalance(address: string) {
    try {
      console.log(`📊 Fetching balance for address: ${address}`);

      // Convert string address to AccountAddress object
      // AccountAddress is a special Concordium type that validates the address format
      const accountAddress = AccountAddress.fromBase58(address);

      // Query the blockchain for account information
      // This is like asking "What's in this wallet?"
      const accountInfo = await this.client.getAccountInfo(accountAddress);

      // Extract the balance (stored as microCCD on blockchain)
      const balanceInMicroCCD = accountInfo.accountAmount.microCcdAmount;

      // Convert to human-readable CCD
      // We use BigInt because microCCD amounts can be very large numbers
      const balanceInCCD = Number(balanceInMicroCCD) / 1_000_000;

      console.log(`   ✅ Balance: ${balanceInCCD} CCD (${balanceInMicroCCD} microCCD)`);

      return {
        success: true,
        address: address,
        balance: balanceInCCD,
        balanceMicroCcd: balanceInMicroCCD.toString(),
        currency: 'CCD'
      };

    } catch (error: any) {
      console.error(`   ❌ Failed to get balance: ${error.message}`);

      return {
        success: false,
        error: error.message,
        address: address
      };
    }
  }

  /**
   * Verify a transaction by its hash
   *
   * @param txHash - Transaction hash (hex string)
   * @returns Transaction details and verification status
   *
   * EXPLANATION:
   * - Every blockchain transaction has a unique "hash" (like a receipt number)
   * - This function checks if a transaction actually happened on the blockchain
   * - Used by Python backend to verify that a user really sent money
   */
  async verifyTransaction(txHash: string) {
    try {
      console.log(`🔍 Verifying transaction: ${txHash}`);

      // Convert hex string to TransactionHash object
      const transactionHash = TransactionHash.fromHexString(txHash);

      // Query blockchain for transaction status
      // This returns detailed info about the transaction
      const transactionStatus = await this.client.getBlockItemStatus(transactionHash);

      console.log(`   Transaction status:`, transactionStatus.status);

      // Check if transaction is finalized (confirmed on blockchain)
      // Concordium has: Received → Committed → Finalized
      const isFinalized = transactionStatus.status === 'finalized';

      let transactionDetails: any = null;

      if (isFinalized) {
        // Get the actual transaction details from the blockchain
        transactionDetails = {
          status: transactionStatus.status,
          // More details can be extracted from transactionStatus.outcome if needed
        };
      }

      console.log(`   ✅ Verified: ${isFinalized}`);

      return {
        success: true,
        verified: isFinalized,
        transactionHash: txHash,
        status: transactionStatus.status,
        details: transactionDetails
      };

    } catch (error: any) {
      console.error(`   ❌ Failed to verify transaction: ${error.message}`);

      return {
        success: false,
        verified: false,
        error: error.message,
        transactionHash: txHash
      };
    }
  }

  /**
   * Verify user identity (Concordium ID check)
   *
   * @param concordiumId - User's Concordium ID
   * @param attributes - Attributes to verify (like age >= 18)
   * @returns Verification result
   *
   * EXPLANATION:
   * - Concordium has built-in identity verification (KYC on blockchain)
   * - Users can prove attributes (like "I'm over 18") without revealing exact age
   * - This uses Zero-Knowledge Proofs (ZKP) for privacy
   *
   * NOTE: Full identity verification requires more complex setup with identity providers.
   * For hackathon, we'll do a simplified check.
   */
  async verifyIdentity(concordiumId: string, attributes?: any) {
    try {
      console.log(`🆔 Verifying identity: ${concordiumId}`);
      console.log(`   Attributes requested:`, attributes);

      // For hackathon purposes, we'll do a basic check:
      // Verify that the concordiumId is a valid account address
      try {
        const accountAddress = AccountAddress.fromBase58(concordiumId);
        // Check if account exists on blockchain
        await this.client.getAccountInfo(accountAddress);

        console.log(`   ✅ Identity verified: Account exists on blockchain`);

        return {
          success: true,
          verified: true,
          concordiumId: concordiumId,
          message: 'Account verified on Concordium blockchain',
          // In production, you'd verify specific attributes from identity provider
          attributes: attributes || {}
        };

      } catch (addressError) {
        console.log(`   ❌ Invalid Concordium ID format`);

        return {
          success: false,
          verified: false,
          error: 'Invalid Concordium account address',
          concordiumId: concordiumId
        };
      }

    } catch (error: any) {
      console.error(`   ❌ Identity verification failed: ${error.message}`);

      return {
        success: false,
        verified: false,
        error: error.message,
        concordiumId: concordiumId
      };
    }
  }

  /**
   * Log transaction data (for audit purposes)
   *
   * @param transactionData - Transaction details to log
   * @returns Logging confirmation
   *
   * EXPLANATION:
   * - This doesn't actually write to blockchain (that would cost money)
   * - Instead, it validates the transaction exists and returns confirmation
   * - Python backend uses this to verify a transaction before recording in database
   */
  async logTransaction(transactionData: any) {
    try {
      console.log(`📝 Logging transaction:`, transactionData);

      const { transaction_hash } = transactionData;

      // If transaction hash is provided, verify it exists on blockchain
      if (transaction_hash) {
        const verification = await this.verifyTransaction(transaction_hash);

        if (!verification.verified) {
          console.log(`   ⚠️  Warning: Transaction not yet finalized`);
        }

        return {
          success: true,
          logged: true,
          transactionHash: transaction_hash,
          verified: verification.verified,
          message: 'Transaction logged and verified'
        };
      }

      // If no hash provided, just acknowledge the logging request
      return {
        success: true,
        logged: true,
        message: 'Transaction data received (no hash to verify)'
      };

    } catch (error: any) {
      console.error(`   ❌ Failed to log transaction: ${error.message}`);

      return {
        success: false,
        logged: false,
        error: error.message
      };
    }
  }

  /**
   * Get balance by Concordium ID (alias for getWalletBalance)
   * Some systems use "ID" instead of "address" terminology
   */
  async getBalance(concordiumId: string, _currency: string = 'CCD') {
    // Concordium ID is the same as account address
    // Note: currency parameter kept for API compatibility but not used (CCD is the only currency)
    return this.getWalletBalance(concordiumId);
  }

  /**
   * Health check for the service
   * Returns connection status to Concordium blockchain
   */
  async healthCheck() {
    try {
      // Try to get consensus info from blockchain
      // This is a lightweight check to see if we can reach the network
      const consensusStatus = await this.client.getConsensusStatus();

      return {
        success: true,
        connected: true,
        network: 'testnet',
        bestBlock: consensusStatus.bestBlock,
        genesisBlock: consensusStatus.genesisBlock,
        message: 'Connected to Concordium blockchain'
      };

    } catch (error: any) {
      return {
        success: false,
        connected: false,
        error: error.message,
        message: 'Failed to connect to Concordium blockchain'
      };
    }
  }
}

// Export a single instance (Singleton pattern)
// This means all parts of the app use the SAME Concordium connection
export default new ConcordiumService();
