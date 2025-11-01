import React from 'react';

export default function CashHistory({ ledger = [], onClose = () => {} }) {
  if (!ledger || ledger.length === 0) return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Cash history</h4>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
      <div className="muted" style={{ marginTop: 12 }}>No cash movements recorded yet.</div>
    </div>
  );

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Cash history</h4>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 8px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '6px 8px' }}>Type</th>
              <th style={{ textAlign: 'right', padding: '6px 8px' }}>Amount</th>
              <th style={{ textAlign: 'left', padding: '6px 8px' }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {ledger.slice().reverse().map((l, i) => (
              <tr key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <td style={{ padding: '8px' }}>{new Date(l.timestamp).toLocaleString()}</td>
                <td style={{ padding: '8px' }}>{l.type}</td>
                <td style={{ padding: '8px', textAlign: 'right' }}>{(l.amountCents != null ? (l.amountCents / 100) : (l.amount || 0)).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
                <td style={{ padding: '8px' }}>{l.note || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
