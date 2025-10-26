import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "../context/WalletContext";
import { useResponsibleGambling } from "../context/ResponsibleGamblingContext";
import { Trophy, Coins, Play, RotateCcw, RefreshCw } from "lucide-react";
import { paymentAPI, userAPI } from "../services/api";
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
  const { connectedAccount, isAgeVerified, provider } = useWallet();
  const { checkLimit, isExcluded, startSession, endSession, activeSession } = useResponsibleGambling();
  const { network } = walletConnectionProps;
  const grpcClient = useGrpcClient(network);
  
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [userId, setUserId] = useState<string | null>(null);
  
  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finishLine = 100;
  
  // House account where bets are sent
  const HOUSE_ACCOUNT = "37vNr2Nv4igJfc23M3BKrw5gD6A2nyNQC5o9XHr3zFUGKAK7xq";

  // Fetch account balance from the blockchain using the gRPC client
  const fetchBalance = async () => {
	console.log(grpcClient)
    if (!connectedAccount || !grpcClient) {
      setBalance(null);
      return;
    }

    setIsLoadingBalance(true);
    
    // Check if we have a cached balance for this account
    const cachedBalanceKey = `balance_${connectedAccount}`;
    
    try {
      // Fetch from blockchain using the gRPC client from react-components
      const accountAddress = AccountAddress.fromBase58(connectedAccount);
      const accountInfo = await grpcClient.getAccountInfo(accountAddress);
      
      console.log('Account Info:', accountInfo);
      
      // Convert microCCD to CCD - accountAmount is already in microCCD format
      const balanceInMicroCCD = accountInfo.accountAmount.microCcdAmount;
      const balanceInCCD = Number(balanceInMicroCCD) / 1_000_000;
      
      console.log('Balance in microCCD:', balanceInMicroCCD);
      console.log('Balance in CCD:', balanceInCCD);
      
      setBalance(balanceInCCD);
      
      // Cache the balance
      localStorage.setItem(cachedBalanceKey, JSON.stringify({
        balance: balanceInCCD,
        timestamp: Date.now()
      }));
      
      console.log(`✅ Account balance fetched: ${balanceInCCD} CCD`);
    } catch (error) {
      console.error("Error fetching balance:", error);
      
      // Use demo balance for frontend testing if gRPC fails
      const demoBalance = 1000;
      setBalance(demoBalance);
      
      console.warn(`Using demo balance: ${demoBalance} CCD. Error: ${error}`);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Register or get user ID
  const initializeUser = async () => {
    if (!connectedAccount) return;

    try {
      // Check if user already exists in localStorage
      let storedUserId = localStorage.getItem('userId');
      
      if (!storedUserId) {
        // Register new user
        console.log('Registering new user...');
        const response = await userAPI.register(connectedAccount);
        
        if (response.data.success) {
          storedUserId = response.data.user.user_id;
          if (storedUserId) {
            localStorage.setItem('userId', storedUserId);
            console.log('User registered:', storedUserId);
          }
        }
      }
      
      if (storedUserId) {
        setUserId(storedUserId);
        
        // Start gambling session
        if (!activeSession) {
          await startSession();
          console.log('Gambling session started');
        }
      }
    } catch (error) {
      console.error('Failed to initialize user:', error);
    }
  };

  // Fetch balance when account or gRPC client changes
  useEffect(() => {
    if (connectedAccount && isAgeVerified && grpcClient) {
      fetchBalance();
      initializeUser();
    } else {
      setBalance(null);
    }
  }, [connectedAccount, isAgeVerified, grpcClient]);

  // Send CCD transaction to house account
  const sendTransaction = async (amount: number): Promise<string> => {
    if (!provider || !connectedAccount || !grpcClient) {
      throw new Error("Wallet not connected");
    }

    try {
      // Get account nonce
      const accountAddress = AccountAddress.fromBase58(connectedAccount);
      const nextNonce = await grpcClient.getNextAccountNonce(accountAddress);
      
      // Prepare transaction header
      const header: AccountTransactionHeader = {
        expiry: TransactionExpiry.futureMinutes(60),
        nonce: nextNonce.nonce,
        sender: accountAddress,
      };

      // Prepare transfer payload
      const payload: SimpleTransferPayload = {
        amount: CcdAmount.fromMicroCcd(amount * 1_000_000), // Convert CCD to microCCD
        toAddress: AccountAddress.fromBase58(HOUSE_ACCOUNT),
      };

      // Create transaction
      const transaction = {
        header,
        payload,
        type: AccountTransactionType.Transfer,
      };

      console.log("Sending transaction:", transaction);

      // Request wallet to sign and send the transaction
      const txHash = await provider.signAndSendTransaction(
        accountAddress,
        transaction.type,
        payload,
        header
      );

      console.log("Transaction sent! Hash:", txHash);
      return txHash;
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  };

  // Place bet with actual CCD transaction
  const placeBet = async () => {
    if (!selectedHorse || !betAmount || parseFloat(betAmount) <= 0) {
      alert("Please select a horse and enter a valid bet amount!");
      return;
    }

    const amount = parseFloat(betAmount);

    // Check if user is self-excluded
    if (isExcluded) {
      alert("❌ You are currently self-excluded from gambling.");
      return;
    }

    // Check spending limits
    try {
      const limitAllowed = await checkLimit(amount);
      if (!limitAllowed) {
        alert("❌ This bet would exceed your spending limit. Please adjust your bet or modify your limits in the Responsible Gambling section.");
        return;
      }
    } catch (error) {
      console.error("Failed to check limit:", error);
    }

    setIsSendingTransaction(true);
    
    try {
      // Send CCD transaction to house account
      const txHash = await sendTransaction(amount);
      setTransactionHash(txHash);
      
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
      console.error("Failed to place bet:", error);
      alert(
        `❌ Failed to place bet!\n\n` +
        `Error: ${error.message || "Transaction was rejected or failed"}\n\n` +
        `Please try again.`
      );
    } finally {
      setIsSendingTransaction(false);
    }
  };

  // Start race
  const startRace = () => {
    if (!currentBet) {
      alert("Please place a bet first!");
      return;
    }

    setIsRacing(true);
    setWinner(null);

    // Reset horses
    const resetHorses = horses.map(horse => ({
      ...horse,
      position: 0,
      speed: Math.random() * 2 + 1, // Random speed between 1-3
    }));
    setHorses(resetHorses);

    // Start race animation
    raceIntervalRef.current = setInterval(() => {
      setHorses(prevHorses => {
        const updatedHorses = prevHorses.map(horse => {
          if (horse.position >= finishLine) return horse;
          
          // Add some randomness to movement
          const acceleration = Math.random() * 0.5;
          const newPosition = Math.min(
            horse.position + horse.speed + acceleration,
            finishLine
          );
          
          return { ...horse, position: newPosition };
        });

        // Check for winner
        const finishedHorse = updatedHorses.find(h => h.position >= finishLine);
        if (finishedHorse && !winner) {
          handleRaceEnd(finishedHorse);
        }

        return updatedHorses;
      });
    }, 100);
  };

  // Handle race end
  const handleRaceEnd = async (winningHorse: Horse) => {
    if (raceIntervalRef.current) {
      clearInterval(raceIntervalRef.current);
    }

    setWinner(winningHorse);
    setIsRacing(false);

    // Calculate winnings
    if (currentBet && currentBet.horseId === winningHorse.id) {
      const winnings = currentBet.amount * winningHorse.odds;
      
      // Process winnings through backend API
      try {
        const storedUserId = localStorage.getItem('userId');
        const sessionId = activeSession?.session_id || localStorage.getItem('activeSessionId');
        
        if (storedUserId) {
          console.log('Processing winnings:', { userId: storedUserId, amount: winnings });
          
          const response = await paymentAPI.recordWinnings(
            storedUserId,
            winnings,
            `race_${Date.now()}`,
            sessionId || 'default_session'
          );
          
          if (response.data.success) {
            console.log('✅ Winnings processed successfully:', response.data);
            
            setRaceHistory(prev => [
              `🏆 Won ${winnings.toFixed(2)} CCD on ${winningHorse.name}! (Transferred to wallet)`,
              ...prev.slice(0, 4)
            ]);
            
            alert(
              `🎉 Congratulations! ${winningHorse.name} won!\n\n` +
              `You won ${winnings.toFixed(2)} CCD!\n` +
              `The winnings have been transferred to your Concordium wallet.\n` +
              `Transaction Hash: ${response.data.tx_hash?.substring(0, 8)}...${response.data.tx_hash?.substring(response.data.tx_hash.length - 6) || 'processing'}`
            );
          } else {
            throw new Error(response.data.error || 'Failed to process winnings');
          }
        } else {
          console.warn('User ID not found, displaying winnings without processing');
          setRaceHistory(prev => [
            `🏆 Won ${winnings.toFixed(2)} CCD on ${winningHorse.name}!`,
            ...prev.slice(0, 4)
          ]);
          alert(`🎉 Congratulations! ${winningHorse.name} won! You earned ${winnings.toFixed(2)} CCD!`);
        }
      } catch (error: any) {
        console.error('Failed to process winnings:', error);
        setRaceHistory(prev => [
          `🏆 Won ${winnings.toFixed(2)} CCD on ${winningHorse.name}! (Processing pending)`,
          ...prev.slice(0, 4)
        ]);
        alert(
          `🎉 Congratulations! ${winningHorse.name} won!\n\n` +
          `You won ${winnings.toFixed(2)} CCD!\n` +
          `Note: There was an issue processing the payout automatically.\n` +
          `Error: ${error.message}\n\n` +
          `Please contact support with your race details.`
        );
      }
    } else {
      setRaceHistory(prev => [
        `❌ Lost ${currentBet?.amount.toFixed(2)} CCD - ${winningHorse.name} won`,
        ...prev.slice(0, 4)
      ]);
      alert(`😔 ${winningHorse.name} won. Better luck next time!`);
    }

    setCurrentBet(null);
    
    // Refresh balance after race (winnings should be reflected)
    setTimeout(() => fetchBalance(), 3000);
  };

  // Reset race
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (raceIntervalRef.current) {
        clearInterval(raceIntervalRef.current);
      }
      // End session on unmount if active
      if (activeSession) {
        endSession().catch(err => console.error('Failed to end session:', err));
      }
    };
  }, [activeSession, endSession]);

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

  return (
    <div className="horse-racing-container">
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
                {isSendingTransaction ? "Sending Transaction..." : "Place Bet"}
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

