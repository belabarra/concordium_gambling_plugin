import React, { useState } from 'react';
import { setUserInfo, getUser } from '../utils/rgStore';

export default function UserInfo({ userId = 'local-user', onDone }) {
  const existing = getUser(userId);
  const [name, setName] = useState(existing.name || '');
  const [email, setEmail] = useState(existing.email || '');
  const [cookieAccepted, setCookieAccepted] = useState(existing.cookieConsent === true);
  const [error, setError] = useState(null);

  function submit(e) {
    e.preventDefault();
    setError(null);
    if (!name || !email) return setError('Please enter name and email');
    setUserInfo(userId, { name, email, cookieConsent: cookieAccepted });
    if (onDone) onDone();
  }

  return (
    <div className="card">
      <h3>Welcome — tell us about yourself</h3>
      <div className="muted">We need a name and email to personalise your session.</div>
      <form onSubmit={submit} className="form-row" style={{ marginTop: 12 }}>
        <label style={{ flex: 1 }}>
          <div className="muted">Full name</div>
          <input className="input" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label style={{ flex: 1 }}>
          <div className="muted">Email</div>
          <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <div style={{ width: '100%', marginTop: 8 }}>
          <label className="muted">Cookies</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <button type="button" className={`btn ${cookieAccepted ? 'ghost' : ''}`} onClick={() => setCookieAccepted(false)}>Reject</button>
            <button type="button" className={`btn primary ${cookieAccepted ? '' : 'ghost'}`} onClick={() => setCookieAccepted(true)}>Accept</button>
          </div>
        </div>
        <div style={{ width: '100%', marginTop: 12 }}>
          <button className="btn primary" type="submit">Continue</button>
          {error && <div className="danger" style={{ marginTop: 8 }}>{error}</div>}
        </div>
      </form>
    </div>
  );
}
