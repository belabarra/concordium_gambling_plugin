import React, { useEffect, useState } from 'react';
import { getUser } from '../utils/rgStore';

export default function ResultsChart({ userId = 'local-user', max = 48, tick = 0 }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const u = getUser(userId);
    // Merge payments, bets and ledger into a sorted timeline so chart shows all money movements
    const payments = (u.payments || []).map(p => ({ type: 'payment', amount: p.amount, amountCents: p.amountCents, timestamp: p.timestamp }));
    const bets = (u.bets || []).map(b => ({ type: 'bet', amount: b.amount, amountCents: b.amountCents, outcome: b.outcome, timestamp: b.timestamp }));
    const ledger = (u.ledger || []).map(l => ({ type: l.type || 'ledger', amount: l.amount != null ? l.amount : (l.amountCents != null ? (l.amountCents / 100) : 0), amountCents: l.amountCents, timestamp: l.timestamp, note: l.note }));
    const merged = payments.concat(bets).concat(ledger).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    // Keep only the last `max` events
    const tail = merged.slice(-max);
    // Compute cumulative balance after each event (use ev.amount for payments, ledger entries; for bets use outcome)
    let balance = 0;
    const withBalance = tail.map(ev => {
      if (ev.type === 'payment') balance += (ev.amount || 0);
      else if (ev.type === 'bet') balance += (ev.outcome === 'win' ? (ev.amount || 0) : -(ev.amount || 0));
      else if (ev.type === 'bet_win') balance += (ev.amount || 0);
      else if (ev.type === 'bet_loss') balance -= Math.abs(ev.amount || 0);
      else if (ev.type === 'interest') balance += (ev.amount || 0);
      else if (ev.type && ev.type.startsWith('cashout')) balance -= Math.abs(ev.amount || 0);
      else if (ev.type === 'cashin') balance += (ev.amount || 0);
      else {
        // fallback: if ledger entry has amount, apply it
        if (ev.amount) balance += ev.amount;
      }
      return { ...ev, balance };
    });
    setEvents(withBalance);
    // `tick` is included in deps so chart re-reads when parent signals an update
  }, [userId, max, tick]);

  if (!events || events.length === 0) return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="muted">No activity recorded yet.</div>
    </div>
  );

  const barWidth = 22; // wider bars for visibility
  const chartHeight = 180; // inner chart height (larger)
  const topMargin = 12;
  const bottomMargin = 36;
  const leftMargin = 64; // more space for y axis labels
  const svgWidth = leftMargin + events.length * barWidth + 12;
  const svgHeight = topMargin + chartHeight + bottomMargin;

  // Compute scale for bar heights (use max absolute amount)
  const maxAmt = Math.max(...events.map(e => Math.abs(e.amount || 0)), 1);
  // Compute balance range for polyline
  const balances = events.map(e => e.balance);
  const minBal = Math.min(...balances, 0);
  const maxBal = Math.max(...balances, 0);
  const balRange = Math.max(1, maxBal - minBal);

  // Helper to map balance to y coordinate in SVG (chart coordinate system)
  const balY = (b) => {
    const pct = (b - minBal) / balRange; // 0..1
    // map to chart area (topMargin .. topMargin+chartHeight)
    return topMargin + (chartHeight - Math.round(pct * (chartHeight - 12)));
  };

  const points = events.map((e, i) => `${leftMargin + i * barWidth + barWidth / 2},${balY(e.balance)}`).join(' ');

  // Y axis ticks (4 ticks)
  const yTicks = 4;
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => minBal + (i * (balRange / yTicks))).reverse();

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <h4 style={{ marginTop: 0 }}>Recent activity</h4>
      <svg className="chart" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="xMinYMin meet">
        {/* Y axis grid and labels */}
        {yTickValues.map((val, idx) => {
          const y = balY(val);
          return (
            <g key={`yt${idx}`}>
              <line x1={leftMargin} x2={svgWidth - 8} y1={y} y2={y} stroke="rgba(255,255,255,0.03)" />
              <text x={leftMargin - 8} y={y + 4} textAnchor="end" fontSize={12} fill="#cfe6ff">${val.toFixed(0)}</text>
            </g>
          );
        })}

        {/* bars for bets (payments are not bars) */}
        {events.map((e, i) => {
          if (e.type !== 'bet') return null;
          const h = Math.max(4, Math.round((Math.abs(e.amount) / maxAmt) * (chartHeight - 24)));
          const x = leftMargin + i * barWidth + 2;
          const y = topMargin + chartHeight - h - 12;
          const cls = e.outcome === 'win' ? 'bar-rect win' : 'bar-rect loss';
          return (
            <g key={`b${i}`} transform={`translate(${x},0)`}> 
              <rect className={cls} x={0} y={y} width={barWidth - 6} height={h}></rect>
              <title>{`${e.outcome.toUpperCase()} — $${e.amount.toFixed(2)} — ${new Date(e.timestamp).toLocaleString()}`}</title>
            </g>
          );
        })}

        {/* polyline for balance */}
        <polyline fill="none" stroke="#93c5fd" strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
        {/* small circle markers */}
        {events.map((e, i) => (
          <circle key={`p${i}`} cx={leftMargin + i * barWidth + barWidth / 2} cy={balY(e.balance)} r={2.4} fill="#93c5fd" />
        ))}

        {/* X axis labels (show every Nth label to avoid overlap) */}
        {events.map((e, i) => {
          const labelEvery = Math.ceil(events.length / 6);
          if (i % labelEvery !== 0 && i !== events.length - 1) return null;
          const x = leftMargin + i * barWidth + barWidth / 2;
          const y = topMargin + chartHeight + 16;
          const dt = new Date(e.timestamp);
          const label = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return <text key={`x${i}`} x={x} y={y} textAnchor="middle" fontSize={11} fill="#cfe6ff">{label}</text>;
        })}
      </svg>
      <div className="chart-legend">
        <div className="legend-item"><span className="legend-swatch legend-win"/> <span>Win</span></div>
        <div className="legend-item"><span className="legend-swatch legend-loss"/> <span>Loss</span></div>
        <div className="legend-item" style={{ marginLeft: 8 }}><span className="muted">Balance trend</span></div>
      </div>
    </div>
  );
}
