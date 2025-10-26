/**
 * Horse Racing Component - Integrated with Backend
 *
 * This version integrates with Python backend for responsible gambling features.
 *
 * ARCHITECTURE FLOW:
 * 1. User connects wallet → WalletContext
 * 2. User registers → UserContext → Python Backend
 * 3. Session starts → UserContext → Python Backend
 * 4. User places bet:
 *    a. Check limits → Python Backend
 *    b. If approved → Sign blockchain transaction
 *    c. Record bet → Python Backend
 * 5. Race runs (local animation)
 * 6. Winner determined → Record result → Python Backend
 */

import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "../context/WalletContext";
import { useUser } from "../context/UserContext";
import { Trophy, Coins, Play, RotateCcw, RefreshCw, UserPlus, LogIn } from "lucide-react";
import {
  AccountAddress,
  CcdAmount,
  AccountTransactionType,
  TransactionExpiry,
  AccountTransactionHeader,
  SimpleTransferPayload
} from "@concordium/web-sdk";
import {
  useGrpcClient,
  WalletConnectionProps
} from "@concordium/react-components";
import "./HorseRacing.css";

interface Horse {
  id: number;
  name: string;
  color: string;
  odds: number;
  position: number;
  speed: number;
}

interface Bet {
  horseId: number;
  amount: number;
}

interface HorseRacingProps {
  walletConnectionProps: WalletConnectionProps;
}

export const HorseRacing: React.FC<HorseRacingProps> = ({ walletConnectionProps }) => {
  // ==========================================================================
  // CONTEXT HOOKS
  // ==========================================================================
  const { connectedAccount, isAgeVerified, provider } = useWallet();
  const {
    user,
    session,
    registerUser,
    startSession,
    endSession,
    checkSpendingLimit,
    updateSessionStats,
    checkSelfExclusion
  } = useUser();

  const { network } = walletConnectionProps;
  const grpcClient = useGrpcClient(network);

  // ==========================================================================
  // STATE MANAGEMENT
  // ==========================================================================

  // Initial horses setup
  const initialHorses: Horse[] = [
    { id: 1, name: "Thunder Bolt", color: "#FF6B6B", odds: 3.5, position: 0, speed: 0 },
    { id: 2, name: "Lightning Strike", color: "#4ECDC4", odds: 2.8, position: 0, speed: 0 },
    { id: 3, name: "Storm Chaser", color: "#FFE66D", odds: 4.2, position: 0, speed: 0 },
    { id: 4, name: "Wind Runner", color: "#95E1D3", odds: 3.0, position: 0, speed: 0 },
    { id: 5, name: "Fire Spirit", color: "#F38181", odds: 5.5, position: 0, speed: 0 },
  ];

  const [horses, setHorses] = useState<Horse[]>(initialHorses);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState<string>("10");
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState<Horse | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState<boolean>(false);
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [raceHistory, setRaceHistory] = useState<string[]>([]);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // Registration state
  const [userName, setUserName] = useState<string>("");
  const [userAge, setUserAge] = useState<string>("18");
  const [isRegistering, setIsRegistering] = useState(false);

  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finishLine = 100;

  // House account where bets are sent
  const HOUSE_ACCOUNT = "37vNr2Nv4igJfc23M3BKrw5gD6A2nyNQC5o9XHr3zFUGKAK7xq";

  // ==========================================================================
  // BALANCE FETCHING
  // ==========================================================================

  const fetchBalance = async () => {
    console.log(grpcClient)
    if (!connectedAccount || !grpcClient) {
      setBalance(null);
      return;
    }

    setIsLoadingBalance(true);

    try {
      // Fetch from blockchain using the gRPC client
      const accountAddress = AccountAddress.fromBase58(connectedAccount);
      const accountInfo = await grpcClient.getAccountInfo(accountAddress);

      const balanceInMicroCCD = accountInfo.accountAmount.microCcdAmount;
      const balanceInCCD = Number(balanceInMicroCCD) / 1_000_000;

      setBalance(balanceInCCD);
      console.log(`✅ Account balance fetched: ${balanceInCCD} CCD`);

    } catch (error) {
      console.error("Error fetching balance:", error);
      const demoBalance = 1000;
      setBalance(demoBalance);
      console.warn(`Using demo balance: ${demoBalance} CCD`);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (connectedAccount && isAgeVerified && grpcClient) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connectedAccount, isAgeVerified, grpcClient]);

  // ==========================================================================
  // USER REGISTRATION
  // ==========================================================================

  /**
   * Handle user registration
   *
   * FLOW:
   * 1. User enters name and age
   * 2. Frontend calls registerUser() from UserContext
   * 3. UserContext → API Client → Python Backend
   * 4. Python creates user record in database
   * 5. User is now registered and ready to gamble
   */
  const handleRegister = async () => {
    if (!userName || userName.trim() === "") {
      alert("Please enter your name");
      return;
    }

    const age = parseInt(userAge);
    if (age < 18) {
      alert("You must be 18 or older to gamble");
      return;
    }

    if (!connectedAccount) {
      alert("Please connect your wallet first");
      return;
    }

    setIsRegistering(true);

    try {
      console.log('🎯 Registering user with backend...');
      const success = await registerUser(userName, age, connectedAccount);

      if (success) {
        alert(`✅ Welcome ${userName}! You are now registered.`);
        // Auto-start session after registration
        await handleStartSession();
      } else {
        alert("❌ Registration failed. Please try again.");
      }

    } catch (error) {
      console.error("Registration error:", error);
      alert("❌ Registration failed. Please check console for details.");
    } finally {
      setIsRegistering(false);
    }
  };

  // ==========================================================================
  // SESSION MANAGEMENT
  // ==========================================================================

  /**
   * Start gambling session
   */
  const handleStartSession = async () => {
    console.log('🎯 Starting gambling session...');
    const success = await startSession('horse_racing');

    if (success) {
      console.log('✅ Session started successfully');
    } else {
      alert("❌ Failed to start session. Please try again.");
    }
  };

  /**
   * End gambling session when user disconnects or leaves
   */
  useEffect(() => {
    return () => {
      if (session) {
        endSession();
      }
    };
  }, [session]);

  // ==========================================================================
  // BLOCKCHAIN TRANSACTION
  // ==========================================================================

  /**
   * Send CCD transaction to house account
   */
  const sendTransaction = async (amount: number): Promise<string> => {
    if (!provider || !connectedAccount || !grpcClient) {
      throw new Error("Wallet not connected");
    }

    try {
      const accountAddress = AccountAddress.fromBase58(connectedAccount);
      const nextNonce = await grpcClient.getNextAccountNonce(accountAddress);

      const header: AccountTransactionHeader = {
        expiry: TransactionExpiry.futureMinutes(60),
        nonce: nextNonce.nonce,
        sender: accountAddress,
      };

      const payload: SimpleTransferPayload = {
        amount: CcdAmount.fromMicroCcd(amount * 1_000_000),
        toAddress: AccountAddress.fromBase58(HOUSE_ACCOUNT),
      };

      const transaction = {
        header,
        payload,
        type: AccountTransactionType.Transfer,
      };

      console.log("📤 Sending blockchain transaction:", transaction);

      const txHash = await provider.signAndSendTransaction(
        accountAddress,
        transaction.type,
        payload,
        header
      );

      console.log("✅ Transaction sent! Hash:", txHash);
      return txHash;

    } catch (error) {
      console.error("❌ Transaction failed:", error);
      throw error;
    }
  };

  // ==========================================================================
  // BETTING FLOW WITH RESPONSIBLE GAMBLING
  // ==========================================================================

  /**
   * Place bet with responsible gambling checks
   *
   * NEW FLOW (Integrated):
   * 1. Check if user is self-excluded
   * 2. Check if bet would exceed spending limits
   * 3. If checks pass, send blockchain transaction
   * 4. Record bet in backend database
   * 5. Update session statistics
   */
  const placeBet = async () => {
    // Validation
    if (!selectedHorse || !betAmount || parseFloat(betAmount) <= 0) {
      alert("Please select a horse and enter a valid bet amount!");
      return;
    }

    if (!user || !session) {
      alert("Please register and start a session first!");
      return;
    }

    const amount = parseFloat(betAmount);

    if (balance === null || amount > balance) {
      alert("Insufficient balance!");
      return;
    }

    setIsSendingTransaction(true);

    try {
      // STEP 1: Check self-exclusion
      console.log('🔍 Checking self-exclusion...');
      const isSelfExcluded = await checkSelfExclusion();

      if (isSelfExcluded) {
        alert("❌ You are self-excluded and cannot place bets at this time.");
        setIsSendingTransaction(false);
        return;
      }

      // STEP 2: Check spending limits
      console.log('🔍 Checking spending limits...');
      const limitCheck = await checkSpendingLimit(amount);

      if (!limitCheck.allowed) {
        alert(`❌ Bet not allowed: ${limitCheck.reason || 'Would exceed spending limit'}`);
        setIsSendingTransaction(false);
        return;
      }

      console.log('✅ All checks passed! Proceeding with bet...');

      // STEP 3: Send blockchain transaction
      console.log('📤 Sending blockchain transaction...');
      const txHash = await sendTransaction(amount);
      setTransactionHash(txHash);

      // STEP 4: Record bet in backend
      // Note: This would typically be done in a separate transaction endpoint
      // For now, we'll update session stats directly

      // STEP 5: Update session statistics
      console.log('📊 Updating session stats...');
      await updateSessionStats(amount, 0); // Wagered amount, won = 0 for now

      // Set current bet after successful transaction
      setCurrentBet({ horseId: selectedHorse, amount });

      alert(
        `✅ Bet placed successfully!\n\n` +
        `Amount: ${amount} CCD\n` +
        `Horse: ${horses.find(h => h.id === selectedHorse)?.name}\n` +
        `Transaction: ${txHash.substring(0, 8)}...${txHash.substring(txHash.length - 6)}`
      );

      // Refresh balance after transaction
      setTimeout(() => fetchBalance(), 2000);

    } catch (error: any) {
      console.error("❌ Failed to place bet:", error);
      alert(
        `❌ Failed to place bet!\n\n` +
        `Error: ${error.message || "Transaction was rejected or failed"}\n\n` +
        `Please try again.`
      );
    } finally {
      setIsSendingTransaction(false);
    }
  };

  // ==========================================================================
  // RACE LOGIC (Unchanged from original)
  // ==========================================================================

  const startRace = () => {
    if (!currentBet) {
      alert("Please place a bet first!");
      return;
    }

    setIsRacing(true);
    setWinner(null);

    const resetHorses = horses.map(horse => ({
      ...horse,
      position: 0,
      speed: Math.random() * 2 + 1,
    }));
    setHorses(resetHorses);

    raceIntervalRef.current = setInterval(() => {
      setHorses(prevHorses => {
        const updatedHorses = prevHorses.map(horse => {
          if (horse.position >= finishLine) return horse;

          const acceleration = Math.random() * 0.5;
          const newPosition = Math.min(
            horse.position + horse.speed + acceleration,
            finishLine
          );

          return { ...horse, position: newPosition };
        });

        const finishedHorse = updatedHorses.find(h => h.position >= finishLine);
        if (finishedHorse && !winner) {
          handleRaceEnd(finishedHorse);
        }

        return updatedHorses;
      });
    }, 100);
  };

  /**
   * Handle race end with backend integration
   */
  const handleRaceEnd = async (winningHorse: Horse) => {
    if (raceIntervalRef.current) {
      clearInterval(raceIntervalRef.current);
    }

    setWinner(winningHorse);
    setIsRacing(false);

    // Calculate winnings
    if (currentBet && currentBet.horseId === winningHorse.id) {
      const winnings = currentBet.amount * winningHorse.odds;

      // Update session with winnings
      if (session) {
        await updateSessionStats(0, winnings); // Wagered = 0, won = winnings
      }

      setRaceHistory(prev => [
        `🏆 Won ${winnings.toFixed(2)} CCD on ${winningHorse.name}!`,
        ...prev.slice(0, 4)
      ]);
      alert(`🎉 Congratulations! ${winningHorse.name} won! You earned ${winnings.toFixed(2)} CCD!`);
    } else {
      setRaceHistory(prev => [
        `❌ Lost ${currentBet?.amount.toFixed(2)} CCD - ${winningHorse.name} won`,
        ...prev.slice(0, 4)
      ]);
      alert(`😔 ${winningHorse.name} won. Better luck next time!`);
    }

    setCurrentBet(null);
    fetchBalance();
  };

  const resetRace = () => {
    if (raceIntervalRef.current) {
      clearInterval(raceIntervalRef.current);
    }

    setHorses(initialHorses);
    setIsRacing(false);
    setWinner(null);
    setCurrentBet(null);
    setSelectedHorse(null);
  };

  useEffect(() => {
    return () => {
      if (raceIntervalRef.current) {
        clearInterval(raceIntervalRef.current);
      }
    };
  }, []);

  // ==========================================================================
  // RENDER CONDITIONS
  // ==========================================================================

  // Step 1: Wallet not connected
  if (!connectedAccount) {
    return (
      <div className="horse-racing-container">
        <div className="connect-prompt">
          <h2>🐎 Horse Racing</h2>
          <p>Please connect your wallet to start betting!</p>
        </div>
      </div>
    );
  }

  // Step 2: Age not verified
  if (!isAgeVerified) {
    return (
      <div className="horse-racing-container">
        <div className="connect-prompt">
          <h2>🐎 Horse Racing</h2>
          <p>Please verify your age (18+) to access betting features.</p>
        </div>
      </div>
    );
  }

  // Step 3: User not registered
  if (!user) {
    return (
      <div className="horse-racing-container">
        <div className="connect-prompt">
          <h2>🐎 Welcome to Horse Racing!</h2>
          <p>Please register to start gambling responsibly.</p>

          <div className="registration-form">
            <div className="form-group">
              <label htmlFor="userName">Your Name:</label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                disabled={isRegistering}
              />
            </div>

            <div className="form-group">
              <label htmlFor="userAge">Your Age:</label>
              <input
                id="userAge"
                type="number"
                value={userAge}
                onChange={(e) => setUserAge(e.target.value)}
                min="18"
                max="120"
                disabled={isRegistering}
              />
            </div>

            <button
              className="register-button"
              onClick={handleRegister}
              disabled={isRegistering}
            >
              <UserPlus size={20} />
              {isRegistering ? "Registering..." : "Register"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Session not started
  if (!session) {
    return (
      <div className="horse-racing-container">
        <div className="connect-prompt">
          <h2>🐎 Welcome back, {user.name}!</h2>
          <p>Start a gambling session to begin playing.</p>

          <button
            className="start-session-button"
            onClick={handleStartSession}
          >
            <LogIn size={20} />
            Start Session
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // MAIN GAME UI (Same as original, but with integrated betting)
  // ==========================================================================

  return (
    <div className="horse-racing-container">
      {/* Session Info */}
      <div className="session-info">
        <p>👤 Player: {user.name} | 💰 Session Wagered: {session.total_wagered} CCD | 🏆 Session Won: {session.total_won} CCD</p>
      </div>

      <div className="racing-header">
        <h1>🐎 Horse Racing Betting</h1>
        <div className="balance-display">
          <Coins size={20} />
          {isLoadingBalance ? (
            <span>Loading...</span>
          ) : balance !== null ? (
            <span>{balance.toFixed(2)} CCD</span>
          ) : (
            <span>-- CCD</span>
          )}
          <button
            className="refresh-balance-btn"
            onClick={fetchBalance}
            disabled={isLoadingBalance || !connectedAccount}
            title="Refresh balance"
          >
            <RefreshCw size={16} className={isLoadingBalance ? "spinning" : ""} />
          </button>
        </div>
      </div>

      {/* Race Track */}
      <div className="race-track">
        <div className="track-background">
          {horses.map((horse) => (
            <div key={horse.id} className="track-lane">
              <div className="lane-number">{horse.id}</div>
              <div className="lane-track">
                <div
                  className={`horse ${winner?.id === horse.id ? 'winner' : ''}`}
                  style={{
                    left: `${horse.position}%`,
                    transition: isRacing ? 'none' : 'left 0.3s ease'
                  }}
                >
                  <div className="horse-icon" style={{ color: horse.color }}>
                    🐎
                  </div>
                </div>
              </div>
              <div className="finish-line">🏁</div>
            </div>
          ))}
        </div>

        {winner && (
          <div className="winner-announcement">
            <Trophy size={40} color="#FFD700" />
            <h2>{winner.name} Wins!</h2>
          </div>
        )}
      </div>

      {/* Betting Panel */}
      <div className="betting-panel">
        <div className="horses-list">
          <h3>Select Your Horse</h3>
          <div className="horse-cards">
            {horses.map((horse) => (
              <div
                key={horse.id}
                className={`horse-card ${selectedHorse === horse.id ? 'selected' : ''} ${
                  winner?.id === horse.id ? 'winner-card' : ''
                }`}
                onClick={() => !isRacing && !currentBet && setSelectedHorse(horse.id)}
              >
                <div className="horse-card-header">
                  <span className="horse-number" style={{ backgroundColor: horse.color }}>
                    #{horse.id}
                  </span>
                  <span className="horse-odds">
                    {horse.odds.toFixed(1)}x
                  </span>
                </div>
                <div className="horse-card-body">
                  <div className="horse-emoji" style={{ color: horse.color }}>
                    🐎
                  </div>
                  <div className="horse-name">{horse.name}</div>
                </div>
                {winner?.id === horse.id && (
                  <div className="winner-badge">
                    <Trophy size={16} /> Winner
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="betting-controls">
          <div className="bet-input-group">
            <label>Bet Amount (CCD)</label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              min="1"
              max={balance !== null ? balance : undefined}
              disabled={isRacing || !!currentBet}
              placeholder="Enter amount"
            />
            <div className="quick-bet-buttons">
              <button onClick={() => setBetAmount("10")} disabled={isRacing || !!currentBet}>10</button>
              <button onClick={() => setBetAmount("50")} disabled={isRacing || !!currentBet}>50</button>
              <button onClick={() => setBetAmount("100")} disabled={isRacing || !!currentBet}>100</button>
              <button
                onClick={() => balance !== null && setBetAmount(Math.floor(balance).toString())}
                disabled={isRacing || !!currentBet || balance === null}
              >
                All In
              </button>
            </div>
          </div>

          {selectedHorse && !currentBet && (
            <div className="potential-winnings">
              <span>Potential Winnings:</span>
              <strong>
                {(parseFloat(betAmount || "0") * horses.find(h => h.id === selectedHorse)!.odds).toFixed(2)} CCD
              </strong>
            </div>
          )}

          {currentBet && (
            <div className="current-bet-display">
              <div className="bet-info">
                <span>Current Bet:</span>
                <strong>{currentBet.amount.toFixed(2)} CCD</strong>
              </div>
              <div className="bet-info">
                <span>On Horse:</span>
                <strong>{horses.find(h => h.id === currentBet.horseId)?.name}</strong>
              </div>
            </div>
          )}

          <div className="action-buttons">
            {!currentBet ? (
              <button
                className="place-bet-button"
                onClick={placeBet}
                disabled={!selectedHorse || isRacing || isSendingTransaction}
              >
                <Coins size={20} />
                {isSendingTransaction ? "Processing..." : "Place Bet"}
              </button>
            ) : (
              <>
                {!isRacing && !winner && (
                  <button
                    className="start-race-button"
                    onClick={startRace}
                  >
                    <Play size={20} />
                    Start Race
                  </button>
                )}
                {(winner || (!isRacing && currentBet)) && (
                  <button
                    className="reset-button"
                    onClick={resetRace}
                  >
                    <RotateCcw size={20} />
                    New Race
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      {transactionHash && currentBet && (
        <div className="transaction-status">
          <h3>Current Bet Transaction</h3>
          <p>
            <strong>Transaction Hash:</strong>{" "}
            <a
              href={`https://testnet.ccdscan.io/transactions/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transactionHash.substring(0, 10)}...{transactionHash.substring(transactionHash.length - 8)}
            </a>
          </p>
          <p>
            <strong>Amount:</strong> {currentBet.amount} CCD
          </p>
          <p>
            <strong>Horse:</strong> {horses.find(h => h.id === currentBet.horseId)?.name}
          </p>
        </div>
      )}

      {/* Race History */}
      {raceHistory.length > 0 && (
        <div className="race-history">
          <h3>Recent Races</h3>
          <ul>
            {raceHistory.map((entry, index) => (
              <li key={index}>{entry}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
