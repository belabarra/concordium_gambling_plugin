import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Wallet API
export const walletAPI = {
  connect: async (userId: string, concordiumAddress: string) => {
    return apiClient.post('/wallet/connect', { 
      user_id: userId, 
      concordium_address: concordiumAddress 
    });
  },
  
  getWallet: async (userId: string) => {
    return apiClient.get(`/wallet/${userId}`);
  },
  
  getBalance: async (userId: string) => {
    return apiClient.get(`/wallet/${userId}/balance`);
  },
  
  syncBalance: async (userId: string) => {
    return apiClient.post(`/wallet/${userId}/sync`);
  },
};

// Payment API
export const paymentAPI = {
  deposit: async (userId: string, amount: number, txHash?: string) => {
    return apiClient.post('/payment/deposit', {
      user_id: userId,
      amount,
      tx_hash: txHash || `tx_${Date.now()}`,
    });
  },
  
  withdraw: async (userId: string, amount: number) => {
    return apiClient.post('/payment/withdraw', {
      user_id: userId,
      amount,
    });
  },
  
  recordWinnings: async (
    userId: string, 
    amount: number, 
    gameId: string, 
    sessionId: string
  ) => {
    return apiClient.post('/payment/winnings', {
      user_id: userId,
      amount,
      game_id: gameId,
      session_id: sessionId,
    });
  },
  
  getHistory: async (userId: string, limit: number = 50) => {
    return apiClient.get(`/payment/history/${userId}`, { params: { limit } });
  },
  
  getAnalytics: async (userId: string) => {
    return apiClient.get(`/payment/analytics/${userId}`);
  },
};

// Responsible Gambling API
export const responsibleGamblingAPI = {
  setLimit: async (userId: string, limitType: string, amount: number, period: string) => {
    return apiClient.post('/limits/set', {
      user_id: userId,
      limit_type: limitType,
      amount,
      period,
    });
  },
  
  getUserLimits: async (userId: string) => {
    return apiClient.get(`/limits/${userId}`);
  },
  
  checkLimit: async (userId: string, amount: number) => {
    return apiClient.post('/limits/check', { 
      user_id: userId, 
      amount 
    });
  },
  
  selfExclude: async (userId: string, durationDays: number, platforms: string[]) => {
    return apiClient.post('/self-exclusion', {
      user_id: userId,
      duration_days: durationDays,
      platforms,
    });
  },
  
  checkExclusion: async (userId: string) => {
    return apiClient.get(`/self-exclusion/${userId}`);
  },
  
  startSession: async (userId: string, platformId: string) => {
    return apiClient.post('/sessions/start', { 
      user_id: userId, 
      platform_id: platformId 
    });
  },
  
  endSession: async (sessionId: string) => {
    return apiClient.post(`/sessions/${sessionId}/end`);
  },
  
  getSessionSummary: async (sessionId: string) => {
    return apiClient.get(`/sessions/${sessionId}`);
  },
};

// User API
export const userAPI = {
  register: async (concordiumAddress: string, email?: string, username?: string) => {
    return apiClient.post('/users/register', {
      concordium_id: concordiumAddress,
      email,
      username,
    });
  },
  
  getUser: async (userId: string) => {
    return apiClient.get(`/users/${userId}`);
  },
};

// Analytics API
export const analyticsAPI = {
  getRiskScore: async (userId: string) => {
    return apiClient.get(`/analytics/risk-score/${userId}`);
  },
  
  getSpendingPattern: async (userId: string, days: number = 30) => {
    return apiClient.get(`/analytics/spending-pattern/${userId}`, { params: { days } });
  },
  
  getWellnessReport: async (userId: string) => {
    return apiClient.get(`/analytics/wellness-report/${userId}`);
  },
};

export default apiClient;
