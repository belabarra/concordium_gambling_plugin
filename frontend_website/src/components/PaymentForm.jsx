import React, { useState } from 'react';
import { addPayment, getUser } from '../utils/rgStore';

export default function PaymentForm({ userId, onUpdate }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  function submit(e) {
    e.preventDefault();
    setError(null);
    const num = parseFloat(amount);
    if (!num || num <= 0) return setError('Enter a positive number');
    
    // Get current user state to check cash balance
    const user = getUser(userId);
    const cashAvailable = user.cashBalance;
    
    if (cashAvailable >= num) {
      // Using cash account
      addPayment(userId, num);
      setAmount('');
      if (onUpdate) onUpdate();
    } else {
      // Show warning about external deposit
      if (window.confirm(`Not enough funds in cash account ($${cashAvailable.toFixed(2)} available). Proceed with external deposit?`)) {
        addPayment(userId, num);
        setAmount('');
        if (onUpdate) onUpdate();
      }
    }
  }

  return (
    <form onSubmit={submit} className="form-row" style={{ marginTop: 8 }}>
      <label style={{ flex: 1 }}>
        <div className="muted">Deposit amount</div>
        <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" />
      </label>
      <div>
        <button className="btn" type="submit">Deposit</button>
      </div>
      {error && <div className="danger" style={{ width: '100%' }}>{error}</div>}
    </form>
  );
}
