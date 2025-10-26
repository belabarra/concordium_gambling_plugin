/**
 * User Context for Session and State Management
 *
 * This context manages user-related state across the entire application.
 * It works alongside WalletContext to provide complete user session management.
 *
 * WHAT IS REACT CONTEXT?
 * Context is React's way of sharing state across components without "prop drilling"
 * (passing props through many levels of components).
 *
 * Think of it like a "global store" that any component can access.
 *
 * ARCHITECTURE PATTERN: Context + Provider
 * - Context: Defines what data is available
 * - Provider: Wraps app and provides the data
 * - Hook (useUser): Easy way to access the data
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { APIClient } from "../services/apiClient";

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

/**
 * User data from backend
 */
interface User {
  id: string;                    // Database user ID
  name: string;                  // User's name
  age: number;                   // User's age
  concordium_id: string;         // Concordium wallet address
  wallet_address: string;        // Same as concordium_id
  self_excluded: boolean;        // Is user self-excluded?
  created_at?: string;           // When user was created
}

/**
 * Active gambling session
 */
interface Session {
  session_id: string;            // Database session ID
  user_id: string;               // User who owns this session
  platform_id: string;           // Platform identifier
  start_time: string;            // When session started
  total_wagered: number;         // Total amount bet in this session
  total_won: number;             // Total amount won in this session
  currency: string;              // Currency (CCD)
}

/**
 * Spending limits
 */
interface SpendingLimits {
  daily?: number;
  weekly?: number;
  monthly?: number;
  currency: string;
}

/**
 * User context type definition
 * This defines ALL the data and functions available in the context
 */
interface UserContextType {
  // User data
  user: User | null;
  setUser: (user: User | null) => void;

  // Session data
  session: Session | null;
  setSession: (session: Session | null) => void;

  // Loading states
  isLoadingUser: boolean;
  isLoadingSession: boolean;

  // Spending limits
  spendingLimits: SpendingLimits | null;
  setSpendingLimits: (limits: SpendingLimits | null) => void;

  // Functions
  registerUser: (name: string, age: number, walletAddress: string) => Promise<boolean>;
  startSession: (platformId: string) => Promise<boolean>;
  endSession: () => Promise<void>;
  checkSpendingLimit: (amount: number) => Promise<{ allowed: boolean; reason?: string }>;
  updateSessionStats: (wagered: number, won: number) => Promise<void>;
  checkSelfExclusion: () => Promise<boolean>;
}

// ============================================================================
// CREATE CONTEXT
// ============================================================================

/**
 * Create the context with undefined default
 * Will be populated by the Provider
 */
const UserContext = createContext<UserContextType | undefined>(undefined);

// ============================================================================
// CONTEXT PROVIDER COMPONENT
// ============================================================================

/**
 * UserContextProvider Component
 *
 * This wraps your app and provides user state to all child components.
 *
 * USAGE:
 * <UserContextProvider>
 *   <App />
 * </UserContextProvider>
 */
export const UserContextProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [spendingLimits, setSpendingLimits] = useState<SpendingLimits | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  // ==========================================================================
  // FUNCTIONS
  // ==========================================================================

  /**
   * Register a new user
   *
   * FLOW:
   * 1. User connects wallet
   * 2. User verifies age (18+)
   * 3. Frontend calls this function
   * 4. Sends registration request to Python backend
   * 5. Backend creates user record in database
   * 6. Backend verifies Concordium ID via Node.js
   * 7. Returns user data
   * 8. Saves user to context state
   *
   * @param name - User's name
   * @param age - User's age
   * @param walletAddress - Concordium wallet address
   * @returns true if registration successful
   */
  const registerUser = async (
    name: string,
    age: number,
    walletAddress: string
  ): Promise<boolean> => {

    console.log('👤 Registering user:', { name, age, walletAddress });
    setIsLoadingUser(true);

    try {
      // Call API to register user
      const response = await APIClient.users.register({
        name,
        age,
        concordium_id: walletAddress,
        wallet_address: walletAddress,
      });

      if (response.success && response.data) {
        // Save user to state
        setUser(response.data as User);

        // Load user's spending limits
        await loadSpendingLimits(response.data.id);

        console.log('✅ User registered successfully:', response.data);
        return true;
      } else {
        console.error('❌ User registration failed:', response.error);
        return false;
      }

    } catch (error) {
      console.error('💥 User registration exception:', error);
      return false;
    } finally {
      setIsLoadingUser(false);
    }
  };

  /**
   * Load user's spending limits from backend
   *
   * @param userId - User ID
   */
  const loadSpendingLimits = async (userId: string) => {
    try {
      const response = await APIClient.limits.get(userId);
      if (response.success && response.data) {
        setSpendingLimits(response.data as SpendingLimits);
      }
    } catch (error) {
      console.error('Failed to load spending limits:', error);
    }
  };

  /**
   * Start a new gambling session
   *
   * WHEN TO CALL:
   * - After user connects wallet and registers
   * - Before allowing any gambling activity
   *
   * RESPONSIBLE GAMBLING:
   * - Tracks start time
   * - Monitors session duration
   * - Enforces session time limits
   * - Triggers reality checks
   *
   * @param platformId - Platform/game identifier
   * @returns true if session started successfully
   */
  const startSession = async (platformId: string = 'horse_racing'): Promise<boolean> => {

    if (!user) {
      console.error('❌ Cannot start session: No user logged in');
      return false;
    }

    console.log('▶️ Starting gambling session for user:', user.id);
    setIsLoadingSession(true);

    try {
      const response = await APIClient.sessions.start({
        user_id: user.id,
        platform_id: platformId,
        currency: 'CCD',
      });

      if (response.success && response.data) {
        setSession(response.data as Session);
        console.log('✅ Session started:', response.data);
        return true;
      } else {
        console.error('❌ Failed to start session:', response.error);
        return false;
      }

    } catch (error) {
      console.error('💥 Session start exception:', error);
      return false;
    } finally {
      setIsLoadingSession(false);
    }
  };

  /**
   * End the current gambling session
   *
   * WHEN TO CALL:
   * - User disconnects wallet
   * - User closes browser/tab (use beforeunload event)
   * - Session duration limit reached
   * - User manually stops gambling
   *
   * IMPORTANT: Always call this to properly record session statistics!
   */
  const endSession = async () => {
    if (!session) {
      console.warn('⚠️ No active session to end');
      return;
    }

    console.log('⏹️ Ending gambling session:', session.session_id);

    try {
      const response = await APIClient.sessions.end(session.session_id);

      if (response.success) {
        console.log('✅ Session ended:', response.data);
        setSession(null); // Clear session from state
      } else {
        console.error('❌ Failed to end session:', response.error);
      }

    } catch (error) {
      console.error('💥 Session end exception:', error);
    }
  };

  /**
   * Check if proposed bet amount would exceed spending limits
   *
   * CRITICAL FOR RESPONSIBLE GAMBLING:
   * Call this BEFORE allowing user to place bet!
   *
   * @param amount - Proposed bet amount
   * @returns Object with allowed (boolean) and optional reason
   */
  const checkSpendingLimit = async (
    amount: number
  ): Promise<{ allowed: boolean; reason?: string }> => {

    if (!user) {
      return { allowed: false, reason: 'User not logged in' };
    }

    console.log(`🔍 Checking spending limit: ${amount} CCD for user ${user.id}`);

    try {
      const response = await APIClient.limits.check(user.id, amount);

      if (response.success && response.data) {
        return response.data as { allowed: boolean; reason?: string };
      } else {
        // If API call fails, default to denying the bet (safer)
        return { allowed: false, reason: 'Unable to verify spending limit' };
      }

    } catch (error) {
      console.error('💥 Limit check exception:', error);
      return { allowed: false, reason: 'System error' };
    }
  };

  /**
   * Update session statistics after a bet/win
   *
   * WHEN TO CALL:
   * - After each bet is placed (update wagered)
   * - After each win/loss is determined (update won)
   *
   * @param wagered - Amount wagered in this update
   * @param won - Amount won in this update
   */
  const updateSessionStats = async (wagered: number, won: number) => {
    if (!session) {
      console.warn('⚠️ No active session to update');
      return;
    }

    try {
      await APIClient.sessions.updateStats(session.session_id, wagered, won);

      // Update local session state
      setSession({
        ...session,
        total_wagered: session.total_wagered + wagered,
        total_won: session.total_won + won,
      });

    } catch (error) {
      console.error('Failed to update session stats:', error);
    }
  };

  /**
   * Check if user is self-excluded
   *
   * CRITICAL: Call this before allowing ANY gambling!
   *
   * @returns true if user is self-excluded (cannot gamble)
   */
  const checkSelfExclusion = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await APIClient.selfExclusion.check(user.id);

      if (response.success && response.data) {
        const data = response.data as any;
        return data.is_excluded === true;
      }

      return false;

    } catch (error) {
      console.error('Failed to check self-exclusion:', error);
      // If check fails, default to allowing (safer for user experience)
      // In production, you might want to block instead
      return false;
    }
  };

  // ==========================================================================
  // CLEANUP ON UNMOUNT
  // ==========================================================================

  /**
   * End session when component unmounts (user leaves page)
   * This ensures sessions are properly closed
   */
  useEffect(() => {
    return () => {
      if (session) {
        // Don't await, just fire and forget
        APIClient.sessions.end(session.session_id);
      }
    };
  }, [session]);

  // ==========================================================================
  // PROVIDE CONTEXT VALUE
  // ==========================================================================

  /**
   * This object contains all data and functions
   * Any component using useUser() will have access to these
   */
  const contextValue: UserContextType = {
    // State
    user,
    setUser,
    session,
    setSession,
    isLoadingUser,
    isLoadingSession,
    spendingLimits,
    setSpendingLimits,

    // Functions
    registerUser,
    startSession,
    endSession,
    checkSpendingLimit,
    updateSessionStats,
    checkSelfExclusion,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// ============================================================================
// CUSTOM HOOK FOR EASY ACCESS
// ============================================================================

/**
 * useUser Hook
 *
 * Use this hook in any component to access user context.
 *
 * USAGE EXAMPLE:
 * ```typescript
 * import { useUser } from '../context/UserContext';
 *
 * function MyComponent() {
 *   const { user, session, startSession } = useUser();
 *
 *   if (!user) {
 *     return <div>Please log in</div>;
 *   }
 *
 *   return <div>Welcome {user.name}!</div>;
 * }
 * ```
 *
 * @returns UserContext
 * @throws Error if used outside UserContextProvider
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useUser must be used within UserContextProvider');
  }

  return context;
};

export default UserContext;
