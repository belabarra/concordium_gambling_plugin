import React, { useState } from 'react';
import { setDob, getUser } from '../utils/rgStore';

export default function AgeVerification({ onVerified, userId = 'local-user' }) {
  const [dob, setDobLocal] = useState('');
  const [error, setError] = useState(null);

  function submit(e) {
    e.preventDefault();
    setError(null);
    if (!dob) return setError('Please enter your date of birth');
    try {
      const user = setDob(userId, dob);
      if (user.verifiedAge) onVerified(user);
      else setError('You must be 18 or older to use this app.');
    } catch (err) {
      setError('Unable to verify age');
    }
  }

  return (
    <div className="card">
      <h3>Age verification</h3>
      <div className="muted">We need to confirm you are 18 years or older to continue.</div>
      <form onSubmit={submit} className="form-row">
        <label style={{ flex: 1 }}>
          <div className="muted">Date of birth</div>
          <input className="input" type="date" value={dob} onChange={e => setDobLocal(e.target.value)} />
        </label>
        <div>
          <button className="btn primary" type="submit">Verify</button>
        </div>
      </form>
      {error && <div className="danger" style={{ marginTop: 8 }}>{error}</div>}
    </div>
  );
}
