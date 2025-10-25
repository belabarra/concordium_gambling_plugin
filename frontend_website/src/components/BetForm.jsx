import React, { useState } from 'react';
import { addBet } from '../utils/rgStore';
import { horses, jockeys } from '../data/horses';

export default function BetForm({ userId, onUpdate }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [horseId, setHorseId] = useState(horses.length ? horses[0].id : null);
  const [jockeyId, setJockeyId] = useState(jockeys.length ? jockeys[0].id : null);

  function determineOutcome(winProbability = 0.45) {
    return Math.random() < winProbability ? 'win' : 'loss';
  }

  function submit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const num = parseFloat(amount);
    if (!num || num <= 0) return setError('Enter a positive number');

    // Determine outcome automatically (simulate odds)
  const outcome = determineOutcome();
  const horse = horses.find(h => h.id === horseId)?.name || null;
  const jockey = jockeys.find(j => j.id === jockeyId)?.name || null;
  addBet(userId, num, outcome, horse, jockey);
    setAmount('');
    if (onUpdate) onUpdate();

    // Show a short result message
    if (outcome === 'win') setResult({ type: 'win', text: `You won $${num.toFixed(2)}!` });
    else setResult({ type: 'loss', text: `You lost $${num.toFixed(2)}.` });

    // Clear result after a few seconds
    setTimeout(() => setResult(null), 4000);
  }

  return (
    <form onSubmit={submit} className="form-row" style={{ marginTop: 8 }}>
      <label style={{ flex: 1 }}>
        <div className="muted">Bet amount</div>
        <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" />
      </label>
      <label style={{ minWidth: 180 }}>
        <div className="muted">Horse</div>
        <select className="input" value={horseId} onChange={e => setHorseId(e.target.value)}>
          {horses.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </select>
      </label>
      <label style={{ minWidth: 160 }}>
        <div className="muted">Jockey</div>
        <select className="input" value={jockeyId} onChange={e => setJockeyId(e.target.value)}>
          {jockeys.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
        </select>
      </label>
      <div>
        <button className="btn" type="submit">Place Bet</button>
      </div>
      {error && <div className="danger" style={{ width: '100%' }}>{error}</div>}
      {result && (
        <div style={{ width: '100%', marginTop: 8 }} className={result.type === 'win' ? 'muted' : 'danger'}>
          {result.text}
        </div>
      )}
    </form>
  );
}
