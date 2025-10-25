import React, { useState, useEffect, useRef } from "react";
import { useWallet } from "../context/WalletContext";
import { Trophy, Coins, Play, RotateCcw, RefreshCw } from "lucide-react";
import { ConcordiumGRPCWebClient, AccountAddress } from "@concordium/web-sdk";
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

export const HorseRacing: React.FC = () => {
  const { connectedAccount, isAgeVerified, provider } = useWallet();
  
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
  
  const raceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const finishLine = 100;

  // Fetch account balance from the blockchain
  const fetchBalance = async () => {
    if (!connectedAccount || !provider) {
      setBalance(null);
      return;
    }

    setIsLoadingBalance(true);
    
    // Check if we have a cached balance for this account
    const cachedBalanceKey = `balance_${connectedAccount}`;
    const cached = localStorage.getItem(cachedBalanceKey);
    
    if (cached) {
      const { balance: cachedBalance, timestamp } = JSON.parse(cached);
      const fiveMinutes = 5 * 60 * 1000;
      
      if (Date.now() - timestamp < fiveMinutes) {
        setBalance(cachedBalance);
        setIsLoadingBalance(false);
        return;
      }
    }

    try {
      // Try to fetch from gRPC endpoint
      const grpcClient = new ConcordiumGRPCWebClient(
        "https://grpc.testnet.concordium.com:20000",
        443,
        { timeout: 15000 }
      );
      
      const accountAddress = AccountAddress.fromBase58(connectedAccount);
      const accountInfo = await grpcClient.getAccountInfo(accountAddress);
      
      // Convert microCCD to CCD (1 CCD = 1,000,000 microCCD)
      const balanceInMicroCCD = accountInfo.accountAmount.microCcdAmount;
      const balanceInCCD = Number(balanceInMicroCCD) / 1_000_000;
      
      setBalance(balanceInCCD);
      
      // Cache the balance
      localStorage.setItem(cachedBalanceKey, JSON.stringify({
        balance: balanceInCCD,
        timestamp: Date.now()
      }));
      
      console.log(`Account balance: ${balanceInCCD} CCD`);
    } catch (error) {
      console.error("Error fetching balance:", error);
      
      // Use demo balance for frontend testing
      // In production, you would need a backend proxy to query the blockchain
      const demoBalance = 1000; // Demo balance for testing
      setBalance(demoBalance);
      
      console.warn(`Using demo balance: ${demoBalance} CCD. To use real balance, implement a backend proxy for gRPC calls.`);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Fetch balance when account changes
  useEffect(() => {
    if (connectedAccount && isAgeVerified) {
      fetchBalance();
    } else {
      setBalance(null);
    }
  }, [connectedAccount, isAgeVerified]);

  // Place bet
  const placeBet = () => {
    if (!selectedHorse || !betAmount || parseFloat(betAmount) <= 0) {
      alert("Please select a horse and enter a valid bet amount!");
      return;
    }

    const amount = parseFloat(betAmount);
    if (balance === null || amount > balance) {
      alert("Insufficient balance!");
      return;
    }

    setCurrentBet({ horseId: selectedHorse, amount });
    // Note: In a real implementation, the balance would be deducted via smart contract
    // For now, we'll just track the bet locally
    alert(`Bet placed: ${amount} CCD on ${horses.find(h => h.id === selectedHorse)?.name}!`);
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
  const handleRaceEnd = (winningHorse: Horse) => {
    if (raceIntervalRef.current) {
      clearInterval(raceIntervalRef.current);
    }

    setWinner(winningHorse);
    setIsRacing(false);

    // Calculate winnings
    if (currentBet && currentBet.horseId === winningHorse.id) {
      const winnings = currentBet.amount * winningHorse.odds;
      setRaceHistory(prev => [
        `🏆 Won ${winnings.toFixed(2)} CCD on ${winningHorse.name}!`,
        ...prev.slice(0, 4)
      ]);
      alert(`🎉 Congratulations! ${winningHorse.name} won! You would have earned ${winnings.toFixed(2)} CCD!`);
    } else {
      setRaceHistory(prev => [
        `❌ Lost ${currentBet?.amount.toFixed(2)} CCD - ${winningHorse.name} won`,
        ...prev.slice(0, 4)
      ]);
      alert(`😔 ${winningHorse.name} won. Better luck next time!`);
    }

    setCurrentBet(null);
    
    // Refresh balance after race (in real implementation, this would be updated by smart contract)
    fetchBalance();
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
    };
  }, []);

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
                disabled={!selectedHorse || isRacing}
              >
                <Coins size={20} />
                Place Bet
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

