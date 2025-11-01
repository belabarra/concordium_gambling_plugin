import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { responsibleGamblingAPI } from '../services/api';

interface RGContextType {
  limits: any;
  isExcluded: boolean;
  activeSession: any;
  isLoading: boolean;
  setLimit: (limitType: string, amount: number, period: string) => Promise<void>;
  checkLimit: (amount: number) => Promise<boolean>;
  selfExclude: (durationDays: number, platforms: string[]) => Promise<void>;
  startSession: () => Promise<void>;
  endSession: () => Promise<void>;
}

const RGContext = createContext<RGContextType | undefined>(undefined);

interface ResponsibleGamblingProviderProps {
  children: ReactNode;
}

export const ResponsibleGamblingProvider: React.FC<ResponsibleGamblingProviderProps> = ({ children }) => {
  const [limits, setLimits] = useState<any>(null);
  const [isExcluded, setIsExcluded] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getUserId = (): string => {
    return localStorage.getItem('userId') || '';
  };

  const platformId = 'platform_main';

  const checkExclusionStatus = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await responsibleGamblingAPI.checkExclusion(userId);
      if (response.data) {
        setIsExcluded(response.data.is_excluded || false);
      }
    } catch (err) {
      console.error('Failed to check exclusion status:', err);
    }
  };

  const loadUserLimits = async () => {
    const userId = getUserId();
    if (!userId) return;

    try {
      const response = await responsibleGamblingAPI.getUserLimits(userId);
      if (response.data.success) {
        setLimits(response.data.limits);
      }
    } catch (err) {
      console.error('Failed to load user limits:', err);
    }
  };

  const setLimit = async (limitType: string, amount: number, period: string) => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    try {
      setIsLoading(true);
      await responsibleGamblingAPI.setLimit(userId, limitType, amount, period);
      await loadUserLimits();
    } catch (err: any) {
      throw new Error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLimit = async (amount: number): Promise<boolean> => {
    const userId = getUserId();
    if (!userId) return false;

    try {
      const response = await responsibleGamblingAPI.checkLimit(userId, amount);
      return response.data.allowed || false;
    } catch (err) {
      console.error('Failed to check limit:', err);
      return false;
    }
  };

  const selfExclude = async (durationDays: number, platforms: string[]) => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    try {
      setIsLoading(true);
      await responsibleGamblingAPI.selfExclude(userId, durationDays, platforms);
      setIsExcluded(true);
    } catch (err: any) {
      throw new Error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const startSession = async () => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    try {
      setIsLoading(true);
      const response = await responsibleGamblingAPI.startSession(userId, platformId);
      if (response.data.success) {
        setActiveSession(response.data.session);
        localStorage.setItem('activeSessionId', response.data.session.session_id);
      }
    } catch (err: any) {
      console.error('Failed to start session:', err);
      throw new Error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const endSession = async () => {
    const sessionId = activeSession?.session_id || localStorage.getItem('activeSessionId');
    if (!sessionId) return;

    try {
      setIsLoading(true);
      await responsibleGamblingAPI.endSession(sessionId);
      setActiveSession(null);
      localStorage.removeItem('activeSessionId');
    } catch (err: any) {
      console.error('Failed to end session:', err);
      throw new Error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const userId = getUserId();
    if (userId) {
      checkExclusionStatus();
      loadUserLimits();
      
      // Check if there's an active session
      const savedSessionId = localStorage.getItem('activeSessionId');
      if (savedSessionId) {
        responsibleGamblingAPI.getSessionSummary(savedSessionId)
          .then(response => {
            if (response.data.session && response.data.session.status === 'active') {
              setActiveSession(response.data.session);
            } else {
              localStorage.removeItem('activeSessionId');
            }
          })
          .catch(() => {
            localStorage.removeItem('activeSessionId');
          });
      }
    }
  }, []);

  return (
    <RGContext.Provider
      value={{
        limits,
        isExcluded,
        activeSession,
        isLoading,
        setLimit,
        checkLimit,
        selfExclude,
        startSession,
        endSession,
      }}
    >
      {children}
    </RGContext.Provider>
  );
};

export const useResponsibleGambling = () => {
  const context = useContext(RGContext);
  if (!context) {
    throw new Error('useResponsibleGambling must be used within ResponsibleGamblingProvider');
  }
  return context;
};
