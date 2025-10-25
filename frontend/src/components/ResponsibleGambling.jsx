import React, { useEffect, useState } from 'react';
import { getUser, cashOutWinnings, cashOutAmount, getWinnings } from '../utils/rgStore';
import CashHistory from './CashHistory';
import PaymentForm from './PaymentForm';
import BetForm from './BetForm';
import ResultsChart from './ResultsChart';

function yearsSince(dateIso) {
  if (!dateIso) return 0;
  const dob = new Date(dateIso);
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
  return years;
}

function paymentsInPeriod(payments = [], days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return payments.filter(p => new Date(p.timestamp).getTime() >= cutoff);
}

function lossesInPeriod(bets = [], days) {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return bets.filter(b => new Date(b.timestamp).getTime() >= cutoff && b.outcome === 'loss');
}

export default function ResponsibleGambling({ userId = 'local-user' }) {
  const [status, setStatus] = useState(null);
  const [tick, setTick] = useState(0);
  const [cashSource, setCashSource] = useState('winnings');
  const [cashAmount, setCashAmount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  function computeStatus() {
    const u = getUser(userId);
    const age = yearsSince(u.dob);
    const verified = !!u.verifiedAge;
    const balance = typeof u.balance === 'number' ? u.balance : 0;
    const cashBalance = typeof u.cashBalance === 'number' ? u.cashBalance : 0;
    const winnings = getWinnings(u);
    const payments7 = paymentsInPeriod(u.payments, 7).length;
    const bets30 = u.bets.filter(b => (Date.now() - new Date(b.timestamp).getTime()) <= 30 * 24 * 60 * 60 * 1000);
    const losses30 = bets30.filter(b => b.outcome === 'loss');
    const totalLoss30 = losses30.reduce((s, b) => s + b.amount, 0);
    let lossStreak = 0;
    for (let i = u.bets.length - 1; i >= 0; i--) { if (u.bets[i].outcome === 'loss') lossStreak++; else break; }
    const status = {
      userId,
      age,
      verified,
      balance,
      cashBalance,
      winnings,
      ledger: Array.isArray(u.ledger) ? u.ledger : [],
      recentPayments7Days: payments7,
      lossStreak,
      totalLoss30Days: totalLoss30,
      highFrequencyPayments: payments7 > 5,
      atRisk: lossStreak >= 3 || totalLoss30 > 1000
    };
    setStatus(status);
    // bump tick so children (charts) can re-read store and re-render
    setTick(t => t + 1);
  }

  useEffect(() => { computeStatus(); }, [userId]);

  if (!status) return <div className="card">Loading responsible gambling status...</div>;
  if (status.error) return <div className="card danger">{status.error}</div>;
  return (
    <div className="card rg-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Responsible gambling</h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="muted">User: {status.userId}</div>
          <button 
            className={`btn ${showHistory ? 'primary' : ''}`}
            onClick={() => setShowHistory(true)}
          >
            Cash history
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
        <div>
          <div className="muted">Age</div>
          <div>{status.age} {status.verified ? <span className="muted">(verified)</span> : <span className="muted">(not verified)</span>}</div>
        </div>
        <div>
          <div className="muted">Recent payments (7d)</div>
          <div>{status.recentPayments7Days}</div>
        </div>
        <div>
          <div className="muted">Loss streak</div>
          <div>{status.lossStreak}</div>
        </div>
        <div>
          <div className="muted">Total losses (30d)</div>
          <div>${status.totalLoss30Days}</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="muted">Account balance (earns 4.05% yearly)</div>
        <div style={{ fontSize: 20, fontWeight: 700 }}>${status.balance.toFixed(2)}</div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div className="muted">Cash account (earns 4.05% yearly)</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>${status.cashBalance.toFixed(2)}</div>
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="cashSource" value="winnings" checked={cashSource === 'winnings'} onChange={() => { setCashSource('winnings'); setCashAmount(status.winnings); }} />
              <span className="muted">Winnings (${status.winnings.toFixed(2)})</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="cashSource" value="balance" checked={cashSource === 'balance'} onChange={() => { setCashSource('balance'); setCashAmount(status.balance); }} />
              <span className="muted">Playable balance (${status.balance.toFixed(2)})</span>
            </label>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="number" step="0.01" min="0" value={cashAmount} onChange={e => setCashAmount(parseFloat(e.target.value || '0'))} style={{ width: 160, padding: '6px 8px' }} />
            <button className="btn" onClick={() => {
              const amt = Number(Number(cashAmount).toFixed(2));
              if (!amt || amt <= 0) { alert('Enter an amount > 0'); return; }
              const max = cashSource === 'winnings' ? status.winnings : status.balance;
              if (amt > max) { if (!window.confirm(`Requested amount $${amt.toFixed(2)} exceeds available $${max.toFixed(2)}. Cash out available amount $${max.toFixed(2)} instead?`)) return; }
              cashOutAmount(userId, amt, cashSource);
              computeStatus();
            }}>Cash out</button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {status.highFrequencyPayments && <div className="warning">High deposit frequency — consider cooling off</div>}
        {status.atRisk && <div className="danger">At risk — show limits and offer help</div>}
      </div>

  <ResultsChart userId={userId} tick={tick} />

      {/* Cash history modal/panel */}
      {showHistory && (
        <div 
          style={{ marginTop: 12 }} 
          ref={el => el?.scrollIntoView({ behavior: 'smooth' })}
        >
          <CashHistory ledger={status.ledger} onClose={() => setShowHistory(false)} />
        </div>
      )}

      <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 12 }}>
        <PaymentForm userId={userId} onUpdate={computeStatus} />
        <BetForm userId={userId} onUpdate={computeStatus} />
      </div>
    </div>
  );
}

