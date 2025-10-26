import React, { useState, useEffect } from 'react';
import { useResponsibleGambling } from '../context/ResponsibleGamblingContext';
import { useWallet } from '../context/WalletContext';

export const ResponsibleGamblingTools: React.FC = () => {
  const { 
    setLimit, 
    selfExclude, 
    limits, 
    isExcluded, 
    isLoading 
  } = useResponsibleGambling();
  const { connectedAccount } = useWallet();
  
  const [limitAmount, setLimitAmount] = useState<number>(0);
  const [limitPeriod, setLimitPeriod] = useState<string>('daily');
  const [exclusionDays, setExclusionDays] = useState<number>(30);
  const [message, setMessage] = useState<string>('');

  const handleSetLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    
    if (!connectedAccount) {
      setMessage('Please connect your wallet first');
      return;
    }

    if (limitAmount <= 0) {
      setMessage('Please enter a valid limit amount');
      return;
    }

    try {
      await setLimit('spending', limitAmount, limitPeriod);
      setMessage('Spending limit set successfully!');
      setLimitAmount(0);
    } catch (err: any) {
      setMessage(`Failed to set limit: ${err.message}`);
    }
  };

  const handleSelfExclude = async () => {
    if (!connectedAccount) {
      setMessage('Please connect your wallet first');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to self-exclude for ${exclusionDays} days? This action cannot be reversed.`
    );
    
    if (!confirmed) return;
    
    try {
      await selfExclude(exclusionDays, ['platform_main']);
      setMessage('Self-exclusion activated successfully');
    } catch (err: any) {
      setMessage(`Failed to activate self-exclusion: ${err.message}`);
    }
  };

  if (!connectedAccount) {
    return (
      <div className="rg-tools">
        <p>Please connect your wallet to access responsible gambling tools</p>
      </div>
    );
  }

  if (isExcluded) {
    return (
      <div className="rg-excluded">
        <h2>⚠️ Self-Excluded</h2>
        <p>You are currently self-excluded from gambling.</p>
        <p>You cannot place bets during your self-exclusion period.</p>
        <p>This is for your own protection and wellbeing.</p>
      </div>
    );
  }

  return (
    <div className="rg-tools">
      <h2>Responsible Gambling Tools</h2>
      
      <section className="rg-section">
        <h3>Set Spending Limits</h3>
        <p>Control your gambling by setting spending limits</p>
        
        {limits && (
          <div className="current-limits">
            <p>Current Limits:</p>
            <ul>
              {Object.entries(limits).map(([key, value]: [string, any]) => (
                <li key={key}>
                  {key}: {value.amount} CCD ({value.period})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <form onSubmit={handleSetLimit}>
          <div className="form-group">
            <label>Limit Amount (CCD)</label>
            <input
              type="number"
              value={limitAmount || ''}
              onChange={(e) => setLimitAmount(parseFloat(e.target.value) || 0)}
              placeholder="e.g., 500"
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Period</label>
            <select value={limitPeriod} onChange={(e) => setLimitPeriod(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Setting Limit...' : 'Set Limit'}
          </button>
        </form>
      </section>
      
      <section className="rg-section self-exclusion">
        <h3>Self-Exclusion</h3>
        <p>Take a break from gambling by self-excluding your account</p>
        <p className="warning">⚠️ This action cannot be reversed during the exclusion period</p>
        
        <div className="form-group">
          <label>Exclusion Duration (Days)</label>
          <input
            type="number"
            value={exclusionDays}
            onChange={(e) => setExclusionDays(parseInt(e.target.value) || 30)}
            placeholder="e.g., 30"
            min="1"
            max="365"
          />
        </div>
        
        <button 
          onClick={handleSelfExclude} 
          className="danger-button"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Activate Self-Exclusion'}
        </button>
      </section>
      
      {message && (
        <div className={message.includes('success') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}
      
      <section className="rg-resources">
        <h3>Need Help?</h3>
        <p>If you're struggling with gambling, help is available:</p>
        <ul>
          <li>🔗 <a href="https://www.begambleaware.org" target="_blank" rel="noopener noreferrer">BeGambleAware</a></li>
          <li>📞 National Gambling Helpline: 0808 8020 133</li>
          <li>💬 <a href="https://www.gamblersanonymous.org.uk" target="_blank" rel="noopener noreferrer">Gamblers Anonymous</a></li>
        </ul>
      </section>
    </div>
  );
};
