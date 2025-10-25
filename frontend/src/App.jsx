import React, { useState, useEffect } from 'react';
import './App.css';
import AgeVerification from './components/AgeVerification';
import ResponsibleGambling from './components/ResponsibleGambling';
import UserInfo from './components/UserInfo';
import TrendingPicks from './components/TrendingPicks';
import Sponsors from './components/Sponsors';
import SponsorDetail from './components/SponsorDetail';
import { getUser, listUsers } from './utils/rgStore';

function App() {
  const [verified, setVerified] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [knownUsers, setKnownUsers] = useState([]);
  const [userReady, setUserReady] = useState(false);
  const [creatingUserId, setCreatingUserId] = useState(null);
  const [sponsorSlug, setSponsorSlug] = useState(null);

  useEffect(() => {
    setKnownUsers(listUsers());
    // pick the first existing user if any
    const users = listUsers();
    if (users && users.length > 0) {
      setSelectedUserId(users[0].userId);
      // always require name/email/cookie consent form on reloads
      setUserReady(false);
    } else {
      // no users yet
      setSelectedUserId(null);
      setUserReady(false);
    }
  }, []);

  // hash-based routing for sponsor pages
  useEffect(() => {
    function handleHash() {
      const hash = window.location.hash || '';
      if (hash.startsWith('#sponsor/')) {
        const slug = hash.split('/')[1];
        setSponsorSlug(slug || null);
      } else {
        setSponsorSlug(null);
      }
    }
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  function handleSelectUser(id) {
    setSelectedUserId(id);
    setVerified(false);
    const existing = getUser(id);
    setUserReady(!!(existing && existing.name && existing.email));
  }

  function handleNewUser() {
    const id = `user-${Date.now()}`;
    setCreatingUserId(id);
    setSelectedUserId(id);
    setUserReady(false);
    setVerified(false);
    // refresh known users after user is created in UserInfo onDone
  }

  return (
    <div className="App">
      {verified && <TrendingPicks />}
      <header className="App-header">
        <div className="container">
          {/* If sponsorSlug is present, show the sponsor detail view */}
          {sponsorSlug ? (
            <div style={{ width: '100%' }}>
              <button className="btn" onClick={() => { window.location.hash = ''; }}>← Back</button>
              <SponsorDetail slug={sponsorSlug} />
            </div>
          ) : null}
          <h1>Horse Racing — Prototype</h1>
          <div className="subtitle">Responsible gambling demo — age checks, deposit/bet simulation and risk flags</div>

          {!userReady && (
            <div>
              {/* User selector / new user control */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                {knownUsers.length > 0 && (
                  <select value={selectedUserId || ''} onChange={e => handleSelectUser(e.target.value)}>
                    <option value="">Select user...</option>
                    {knownUsers.map(u => (
                      <option key={u.userId} value={u.userId}>{u.name || u.email || u.userId}</option>
                    ))}
                  </select>
                )}
                <button className="btn primary" onClick={handleNewUser}>New user</button>
              </div>
              {/* show the profile form for the selected/creating user */}
              <UserInfo userId={selectedUserId || creatingUserId || `user-${Date.now()}`} onDone={() => { setKnownUsers(listUsers()); setUserReady(true); setVerified(false); setCreatingUserId(null); }} />
            </div>
          )}

          {userReady && (
            <>
              {!verified && <AgeVerification userId={selectedUserId} onVerified={() => setVerified(true)} />}

              {verified && (
                <div>
                  <div className="card">
                    <p style={{ margin: 0 }}>Welcome — your age is verified.</p>
                  </div>
                  <ResponsibleGambling userId={selectedUserId} />
                </div>
              )}
            </>
          )}
        </div>
        
        {verified && <Sponsors />}
      </header>
    </div>
  );
}

export default App;
