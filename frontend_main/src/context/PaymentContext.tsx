import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { paymentAPI, walletAPI } from '../services/api';

interface PaymentContextType {
  balance: number;
  isLoading: boolean;
  error: string | null;
  deposit: (amount: number, txHash?: string) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  recordWinnings: (amount: number, gameId: string, sessionId: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
  paymentHistory: any[];
  analytics: any;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

interface PaymentProviderProps {
  children: ReactNode;
}

export const PaymentProvider: React.FC<PaymentProviderProps> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const getUserId = (): string => {
    return localStorage.getItem('userId') || '';
  };

  const refreshBalance = async () => {
    const userId = getUserId();
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const response = await walletAPI.getBalance(userId);
      if (response.data.success) {
        setBalance(response.data.balance || 0);
      }
    } catch (err: any) {
      console.error('Failed to refresh balance:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deposit = async (amount: number, txHash?: string) => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await paymentAPI.deposit(userId, amount, txHash);
      
      if (response.data.success) {
        await refreshBalance();
        await loadPaymentHistory();
      } else {
        throw new Error(response.data.error || 'Deposit failed');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const withdraw = async (amount: number) => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await paymentAPI.withdraw(userId, amount);
      
      if (response.data.success) {
        await refreshBalance();
        await loadPaymentHistory();
      } else {
        throw new Error(response.data.error || 'Withdrawal failed');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const recordWinnings = async (amount: number, gameId: string, sessionId: string) => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await paymentAPI.recordWinnings(userId, amount, gameId, sessionId);
      
      if (response.data.success) {
        await refreshBalance();
        await loadPaymentHistory();
      } else {
        throw new Error(response.data.error || 'Failed to record winnings');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await paymentAPI.getHistory(userId);
      if (response.data.success) {
        setPaymentHistory(response.data.payments || []);
      }
    } catch (err: any) {
      console.error('Failed to load payment history:', err);
    }
  };

  const loadAnalytics = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await paymentAPI.getAnalytics(userId);
      if (response.data.success) {
        setAnalytics(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      refreshBalance();
      loadPaymentHistory();
      loadAnalytics();
    }
  }, []);

  return (
    <PaymentContext.Provider
      value={{
        balance,
        isLoading,
        error,
        deposit,
        withdraw,
        recordWinnings,
        refreshBalance,
        paymentHistory,
        analytics,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
};
