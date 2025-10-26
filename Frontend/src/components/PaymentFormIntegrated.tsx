import React, { useState, useEffect } from 'react';
import { usePayment } from '../context/PaymentContext';
import { useWallet } from '../context/WalletContext';
import { useResponsibleGambling } from '../context/ResponsibleGamblingContext';

export const PaymentForm: React.FC = () => {
  const { balance, deposit, withdraw, isLoading, error, refreshBalance } = usePayment();
  const { connectedAccount } = useWallet();
  const { checkLimit } = useResponsibleGambling();
  
  const [amount, setAmount] = useState<number>(0);
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    if (connectedAccount) {
      refreshBalance();
    }
  }, [connectedAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!connectedAccount) {
      setMessage('Please connect your wallet first');
      return;
    }

    if (amount <= 0) {
      setMessage('Please enter a valid amount');
      return;
    }

    try {
      if (action === 'deposit') {
        // Check spending limits before deposit
        const allowed = await checkLimit(amount);
        if (!allowed) {
          setMessage('This amount exceeds your spending limit');
          return;
        }
        
        await deposit(amount);
        setMessage('Deposit successful!');
      } else {
        if (amount > balance) {
          setMessage('Insufficient balance');
          return;
        }
        
        await withdraw(amount);
        setMessage('Withdrawal successful!');
      }
      
      setAmount(0);
    } catch (err: any) {
      setMessage(`Transaction failed: ${err.message}`);
    }
  };

  if (!connectedAccount) {
    return (
      <div className="payment-form">
        <p>Please connect your wallet to manage payments</p>
      </div>
    );
  }

  return (
    <div className="payment-form">
      <h2>Wallet Management</h2>
      
      <div className="balance-display">
        <h3>Current Balance</h3>
        <p className="balance-amount">{balance.toFixed(2)} CCD</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="action-selector">
          <label>
            <input
              type="radio"
              value="deposit"
              checked={action === 'deposit'}
              onChange={() => setAction('deposit')}
            />
            Deposit
          </label>
          <label>
            <input
              type="radio"
              value="withdraw"
              checked={action === 'withdraw'}
              onChange={() => setAction('withdraw')}
            />
            Withdraw
          </label>
        </div>
        
        <div className="amount-input">
          <label>Amount (CCD)</label>
          <input
            type="number"
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            placeholder="Enter amount"
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading || amount <= 0}>
          {isLoading ? 'Processing...' : action === 'deposit' ? 'Deposit Funds' : 'Withdraw Funds'}
        </button>
        
        {error && <p className="error-message">{error}</p>}
        {message && <p className={message.includes('successful') ? 'success-message' : 'error-message'}>{message}</p>}
      </form>
    </div>
  );
};
