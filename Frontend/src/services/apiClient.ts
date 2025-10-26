/**
 * API Client for Python Backend Communication
 *
 * This service handles ALL HTTP requests to the Python FastAPI backend.
 * It provides a centralized, type-safe way to interact with backend endpoints.
 *
 * ARCHITECTURE:
 * Frontend (React) --[HTTP]--> Python Backend (FastAPI)
 *                              Python Backend --[HTTP]--> Node.js Backend
 *                                                        Node.js --[gRPC]--> Concordium
 *
 * WHY THIS FILE EXISTS:
 * 1. Centralization: All API calls in one place
 * 2. Reusability: Functions used across multiple components
 * 3. Type Safety: TypeScript interfaces for requests/responses
 * 4. Error Handling: Consistent error handling
 * 5. Easy Configuration: Change base URL once
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Base URL for Python backend API
 *
 * EXPLANATION:
 * - In development: Python backend runs on localhost:8000
 * - In production: Would be your actual domain
 * - Environment variables allow easy switching between environments
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

// Full API URL: http://localhost:8000/api/v1
const BASE_URL = `${API_BASE_URL}${API_PREFIX}`;

// ============================================================================
// TYPESCRIPT INTERFACES (Type Definitions)
// ============================================================================

/**
 * These interfaces define the "shape" of our data.
 * TypeScript uses them to catch errors at compile-time.
 */

// User registration data
interface UserRegistrationData {
  name: string;
  age: number;
  concordium_id: string;  // User's Concordium wallet address
  wallet_address: string;
}

// Session data
interface SessionData {
  user_id: string;
  platform_id: string;
  currency?: string;
}

// Transaction/Bet data
interface TransactionData {
  user_id: string;
  amount: number;
  transaction_type: 'BET' | 'WIN' | 'LOSS';
  game_id?: string;
  session_id?: string;
  tx_hash?: string;  // Blockchain transaction hash
}

// Spending limit data
interface LimitData {
  user_id: string;
  limit_type: 'daily' | 'weekly' | 'monthly';
  amount: number;
  currency: string;
}

// API Response wrapper (all responses follow this format)
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generic HTTP request handler
 *
 * This function is the CORE of our API client.
 * It handles all HTTP communication with the backend.
 *
 * @param endpoint - API endpoint (e.g., "/users/register")
 * @param options - Fetch options (method, body, headers)
 * @returns Promise with response data
 *
 * EXPLANATION OF ASYNC/AWAIT:
 * - async = this function returns a Promise
 * - await = wait for Promise to resolve before continuing
 * - Promises = handle asynchronous operations (like network requests)
 */
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {

  // Build full URL: http://localhost:8000/api/v1 + endpoint
  const url = `${BASE_URL}${endpoint}`;

  // Default headers for all requests
  const headers = {
    'Content-Type': 'application/json', // We're sending JSON data
    ...options.headers, // Merge with any custom headers
  };

  try {
    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

    // Make HTTP request using Fetch API
    // fetch() is built into browsers, makes HTTP requests
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Parse response body as JSON
    const data = await response.json();

    // Check if request was successful (status 200-299)
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status}`, data);
      return {
        success: false,
        error: data.detail || data.error || 'Request failed',
      };
    }

    console.log(`✅ API Success:`, data);
    return {
      success: true,
      data,
    };

  } catch (error: any) {
    // Network error or JSON parsing error
    console.error(`💥 API Exception:`, error);
    return {
      success: false,
      error: error.message || 'Network error',
    };
  }
}

/**
 * HTTP GET request
 * Used for READING data (no request body)
 */
async function get<T>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'GET' });
}

/**
 * HTTP POST request
 * Used for CREATING data or SENDING data (has request body)
 */
async function post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * HTTP PUT request
 * Used for UPDATING existing data
 */
async function put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
  return request<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * HTTP DELETE request
 * Used for DELETING data
 */
async function del<T>(endpoint: string): Promise<ApiResponse<T>> {
  return request<T>(endpoint, { method: 'DELETE' });
}

// ============================================================================
// API CLIENT FUNCTIONS
// ============================================================================

/**
 * APIClient object
 * Contains all API functions organized by category
 *
 * USAGE EXAMPLE:
 * import { APIClient } from './services/apiClient';
 * const result = await APIClient.users.register(userData);
 */
export const APIClient = {

  // ==========================================================================
  // USER ENDPOINTS
  // ==========================================================================

  users: {
    /**
     * Register a new user
     *
     * FLOW:
     * 1. User connects wallet in Frontend
     * 2. Frontend calls this function with user data
     * 3. Python backend creates user record in database
     * 4. Python backend verifies Concordium ID via Node.js
     * 5. Returns user record
     *
     * @param userData - User registration information
     * @returns User record from database
     */
    async register(userData: UserRegistrationData) {
      console.log('📝 Registering user:', userData);
      return post('/users/register', userData);
    },

    /**
     * Get user information by ID
     *
     * @param userId - User's database ID
     * @returns User record
     */
    async getById(userId: string) {
      return get(`/users/${userId}`);
    },

    /**
     * Update user information
     *
     * @param userId - User's database ID
     * @param userData - Updated user data
     */
    async update(userId: string, userData: Partial<UserRegistrationData>) {
      return put(`/users/${userId}`, userData);
    },
  },

  // ==========================================================================
  // SESSION ENDPOINTS
  // ==========================================================================

  sessions: {
    /**
     * Start a new gambling session
     *
     * EXPLANATION:
     * A "session" tracks how long a user is actively gambling.
     * This is crucial for responsible gambling:
     * - Track time spent
     * - Enforce session limits
     * - Trigger reality checks
     * - Calculate session statistics
     *
     * FLOW:
     * 1. User connects wallet and verifies age
     * 2. Frontend calls startSession
     * 3. Backend creates session record with start time
     * 4. Returns session_id
     * 5. Frontend stores session_id for this gambling session
     *
     * @param sessionData - Session information
     * @returns Session record with session_id
     */
    async start(sessionData: SessionData) {
      console.log('▶️ Starting gambling session:', sessionData);
      return post('/sessions/start', sessionData);
    },

    /**
     * End a gambling session
     *
     * WHEN TO CALL:
     * - User disconnects wallet
     * - User closes browser/tab
     * - Session duration limit reached
     * - User manually stops gambling
     *
     * @param sessionId - Active session ID
     * @returns Session summary with statistics
     */
    async end(sessionId: string) {
      console.log('⏹️ Ending gambling session:', sessionId);
      return post(`/sessions/${sessionId}/end`);
    },

    /**
     * Get session details
     *
     * @param sessionId - Session ID
     * @returns Session record with stats
     */
    async get(sessionId: string) {
      return get(`/sessions/${sessionId}`);
    },

    /**
     * Update session statistics
     *
     * WHEN TO CALL:
     * - After each bet (update wagered amount)
     * - After each win/loss (update won amount)
     *
     * @param sessionId - Session ID
     * @param wagered - Amount wagered in this update
     * @param won - Amount won in this update
     */
    async updateStats(sessionId: string, wagered: number, won: number) {
      return put(`/sessions/${sessionId}/stats`, { wagered, won });
    },

    /**
     * Check if session has exceeded duration limits
     *
     * RETURNS:
     * - exceeded: boolean (true if over limit)
     * - duration: number (minutes spent)
     * - limit: number (maximum allowed minutes)
     *
     * @param sessionId - Session ID
     */
    async checkDuration(sessionId: string) {
      return get(`/sessions/${sessionId}/check`);
    },

    /**
     * Get user's session history
     *
     * @param userId - User ID
     * @param limit - Number of sessions to return (default 10)
     */
    async getHistory(userId: string, limit: number = 10) {
      return get(`/users/${userId}/sessions?limit=${limit}`);
    },
  },

  // ==========================================================================
  // LIMIT ENFORCEMENT ENDPOINTS
  // ==========================================================================

  limits: {
    /**
     * Set spending limit for user
     *
     * RESPONSIBLE GAMBLING:
     * Users can set daily/weekly/monthly spending limits.
     * Backend enforces these limits before allowing bets.
     *
     * @param limitData - Limit configuration
     */
    async set(limitData: LimitData) {
      console.log('💰 Setting spending limit:', limitData);
      return post('/limits/set', limitData);
    },

    /**
     * Get user's current limits
     *
     * @param userId - User ID
     * @returns All active limits for user
     */
    async get(userId: string) {
      return get(`/limits/${userId}`);
    },

    /**
     * Check if transaction would exceed limit
     *
     * CRITICAL FUNCTION:
     * Call this BEFORE allowing user to place bet!
     *
     * FLOW:
     * 1. User enters bet amount
     * 2. Frontend calls checkLimit(userId, amount)
     * 3. Backend checks:
     *    - Current spending today/week/month
     *    - User's set limits
     *    - Would this bet exceed any limit?
     * 4. Returns:
     *    - allowed: true/false
     *    - reason: why not allowed (if applicable)
     * 5. Frontend allows or blocks the bet
     *
     * @param userId - User ID
     * @param amount - Proposed bet amount
     * @returns Whether bet is allowed
     */
    async check(userId: string, amount: number) {
      console.log(`🔍 Checking limit: User ${userId} wants to bet ${amount}`);
      return post('/limits/check', { user_id: userId, amount });
    },
  },

  // ==========================================================================
  // SELF-EXCLUSION ENDPOINTS
  // ==========================================================================

  selfExclusion: {
    /**
     * Add user to self-exclusion registry
     *
     * RESPONSIBLE GAMBLING:
     * Users can voluntarily exclude themselves from gambling.
     * Once self-excluded, they CANNOT gamble for the set duration.
     *
     * @param userId - User ID
     * @param duration - Duration in days (default 180)
     * @param reason - Optional reason for exclusion
     */
    async add(userId: string, duration: number = 180, reason?: string) {
      console.log(`🚫 Self-excluding user ${userId} for ${duration} days`);
      return post('/self-exclusion', {
        user_id: userId,
        duration_days: duration,
        reason,
      });
    },

    /**
     * Check if user is self-excluded
     *
     * CRITICAL: Check this before allowing ANY gambling!
     *
     * @param userId - User ID
     * @returns Whether user is self-excluded and until when
     */
    async check(userId: string) {
      return get(`/self-exclusion/${userId}`);
    },

    /**
     * Remove user from self-exclusion (after period expires)
     *
     * @param userId - User ID
     */
    async remove(userId: string) {
      return del(`/self-exclusion/${userId}`);
    },
  },

  // ==========================================================================
  // TRANSACTION ENDPOINTS
  // ==========================================================================

  transactions: {
    /**
     * Record a transaction
     *
     * WHEN TO CALL:
     * - After blockchain transaction is confirmed
     * - Records bet/win/loss in database
     *
     * @param transactionData - Transaction details
     */
    async record(transactionData: TransactionData) {
      console.log('📊 Recording transaction:', transactionData);
      return post('/transactions', transactionData);
    },

    /**
     * Get transaction details
     *
     * @param transactionId - Transaction ID
     */
    async get(transactionId: string) {
      return get(`/transactions/${transactionId}`);
    },

    /**
     * Get user's transaction history
     *
     * @param userId - User ID
     * @param limit - Number of transactions to return
     */
    async getHistory(userId: string, limit: number = 50) {
      return get(`/users/${userId}/transactions?limit=${limit}`);
    },
  },

  // ==========================================================================
  // ANALYTICS ENDPOINTS
  // ==========================================================================

  analytics: {
    /**
     * Calculate user's risk score
     *
     * RISK ASSESSMENT:
     * Backend analyzes user behavior and calculates risk score:
     * - Spending patterns
     * - Time patterns
     * - Win/loss ratio
     * - Session frequency
     *
     * Returns score 0-100 (higher = higher risk)
     *
     * @param userId - User ID
     */
    async getRiskScore(userId: string) {
      return get(`/analytics/risk-score/${userId}`);
    },

    /**
     * Analyze spending patterns
     *
     * @param userId - User ID
     * @param days - Number of days to analyze (default 30)
     */
    async getSpendingPattern(userId: string, days: number = 30) {
      return get(`/analytics/spending-pattern/${userId}?days=${days}`);
    },

    /**
     * Generate wellness report
     *
     * Comprehensive report of user's gambling behavior
     *
     * @param userId - User ID
     */
    async getWellnessReport(userId: string) {
      return get(`/analytics/wellness-report/${userId}`);
    },
  },

  // ==========================================================================
  // PAYMENT ENDPOINTS
  // ==========================================================================

  payments: {
    /**
     * Connect wallet to user account
     *
     * @param userId - User ID
     * @param walletAddress - Concordium wallet address
     */
    async connectWallet(userId: string, walletAddress: string) {
      return post('/wallet/connect', {
        user_id: userId,
        concordium_address: walletAddress,
      });
    },

    /**
     * Get wallet information
     *
     * @param userId - User ID
     */
    async getWallet(userId: string) {
      return get(`/wallet/${userId}`);
    },

    /**
     * Get wallet balance
     *
     * @param userId - User ID
     */
    async getBalance(userId: string) {
      return get(`/wallet/${userId}/balance`);
    },

    /**
     * Sync balance with blockchain
     *
     * @param userId - User ID
     */
    async syncBalance(userId: string) {
      return post(`/wallet/${userId}/sync`);
    },

    /**
     * Record a deposit
     *
     * @param userId - User ID
     * @param amount - Deposit amount
     * @param fromAddress - Source wallet address
     */
    async deposit(userId: string, amount: number, fromAddress?: string) {
      return post('/payment/deposit', {
        user_id: userId,
        amount,
        from_address: fromAddress,
      });
    },

    /**
     * Process winnings
     *
     * @param userId - User ID
     * @param amount - Winnings amount
     * @param gameId - Game identifier
     * @param sessionId - Session ID
     */
    async processWinnings(
      userId: string,
      amount: number,
      gameId: string,
      sessionId?: string
    ) {
      return post('/payment/winnings', {
        user_id: userId,
        amount,
        game_id: gameId,
        session_id: sessionId,
      });
    },

    /**
     * Get payment history
     *
     * @param userId - User ID
     * @param type - Payment type filter (optional)
     * @param limit - Number of records to return
     */
    async getHistory(
      userId: string,
      type?: 'deposit' | 'withdrawal' | 'winnings',
      limit: number = 100
    ) {
      const query = type ? `?payment_type=${type}&limit=${limit}` : `?limit=${limit}`;
      return get(`/payment/history/${userId}${query}`);
    },
  },

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  /**
   * Check if Python backend is running
   *
   * USAGE:
   * Call this when app loads to verify backend connectivity
   */
  async healthCheck() {
    return get('/health');
  },
};

// Export for use in components
export default APIClient;
