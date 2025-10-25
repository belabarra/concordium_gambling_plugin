// Simple localStorage-backed store for responsible-gambling prototype
const KEY_PREFIX = 'rg_user_';

function getKey(userId) {
  return `${KEY_PREFIX}${userId}`;
}

export function getUser(userId) {
  const raw = localStorage.getItem(getKey(userId));
  if (!raw) return { 
    userId, 
    name: null, 
    email: null, 
    cookieConsent: null, 
    balance: 0, 
    bets: [], 
    payments: [], 
    dob: null, 
    verifiedAge: false, 
    cashBalance: 0, 
    lastAccrued: new Date().toISOString(), // Single timestamp for all interest calculations
    ledger: [], 
    balanceCents: 0, 
    cashBalanceCents: 0 
  };
  try {
    const u = JSON.parse(raw);
    // ensure integer-cent fields exist
    if (typeof u.balanceCents !== 'number') u.balanceCents = Math.round((u.balance || 0) * 100);
    if (typeof u.cashBalanceCents !== 'number') u.cashBalanceCents = Math.round((u.cashBalance || 0) * 100);
    if (!Array.isArray(u.ledger)) u.ledger = [];
    // apply accrued interest on both balances
    _applyAccrual(u);
    // map cents to dollar fields for UI convenience
    u.cashBalance = centsToDollar(u.cashBalanceCents);
    u.balance = centsToDollar(u.balanceCents);
    // map payments/bets amounts if they use amountCents
    if (Array.isArray(u.payments)) u.payments = u.payments.map(p => ({ ...p, amount: p.amountCents != null ? centsToDollar(p.amountCents) : (p.amount || 0) }));
    if (Array.isArray(u.bets)) u.bets = u.bets.map(b => ({ ...b, amount: b.amountCents != null ? centsToDollar(b.amountCents) : (b.amount || 0) }));
    // also expose ledger with dollar amounts
    u.ledger = u.ledger.map(l => ({ ...l, amount: l.amountCents != null ? centsToDollar(l.amountCents) : (l.amount || 0) }));
    // persist accrual changes (if any)
    saveUser(u);
    return u;
  } catch (e) { return { userId, name: null, email: null, cookieConsent: null, balance: 0, bets: [], payments: [], dob: null, verifiedAge: false, cashBalance: 0, cashLastAccrued: new Date().toISOString(), ledger: [], balanceCents: 0, cashBalanceCents: 0 }; }
}

// helper: cents <-> dollars
function toCents(amount) {
  return Math.round(Number(amount || 0) * 100);
}
function centsToDollar(cents) {
  return (typeof cents === 'number') ? (cents / 100) : 0;
}

// Internal helper: apply interest accrual to both balances
function _applyAccrual(user) {
  try {
    const rate = 0.0405; // yearly interest rate (4.05%)
    if (typeof user.balanceCents !== 'number') user.balanceCents = toCents(user.balance || 0);
    if (typeof user.cashBalanceCents !== 'number') user.cashBalanceCents = toCents(user.cashBalance || 0);
    
    const now = Date.now();
    const last = user.lastAccrued ? Date.parse(user.lastAccrued) : now;
    if (!last || isNaN(last) || now <= last) {
      user.lastAccrued = new Date(now).toISOString();
      return user;
    }

    const days = (now - last) / (1000 * 60 * 60 * 24);
    if (days <= 0) {
      user.lastAccrued = new Date(now).toISOString();
      return user;
    }

    // compound interest for the elapsed fraction of year
    const factor = Math.pow(1 + rate, days / 365);

    // Apply to playable balance
    const newBalanceCents = Math.round(user.balanceCents * factor);
    if (newBalanceCents !== user.balanceCents) {
      const interestCents = newBalanceCents - user.balanceCents;
      user.balanceCents = newBalanceCents;
      if (!Array.isArray(user.ledger)) user.ledger = [];
      user.ledger.push({ 
        type: 'interest', 
        amountCents: interestCents, 
        timestamp: new Date().toISOString(), 
        note: 'Interest on playable balance' 
      });
    }

    // Apply to cash balance
    const newCashCents = Math.round(user.cashBalanceCents * factor);
    if (newCashCents !== user.cashBalanceCents) {
      const interestCents = newCashCents - user.cashBalanceCents;
      user.cashBalanceCents = newCashCents;
      if (!Array.isArray(user.ledger)) user.ledger = [];
      user.ledger.push({ 
        type: 'interest', 
        amountCents: interestCents, 
        timestamp: new Date().toISOString(), 
        note: 'Interest on cash balance' 
      });
    }

    user.lastAccrued = new Date(now).toISOString();
    return user;
  } catch (e) {
    user.lastAccrued = new Date().toISOString();
    return user;
  }
}

export function saveUser(user) {
  // ensure ledger entries have amountCents where appropriate and persist
  localStorage.setItem(getKey(user.userId), JSON.stringify(user));
}

// Return a list of known users (reads localStorage keys with our prefix)
export function listUsers() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith(KEY_PREFIX)) continue;
      try {
        const raw = localStorage.getItem(k);
        const u = JSON.parse(raw);
        out.push({ userId: u.userId, name: u.name || null, email: u.email || null });
      } catch (e) {
        // ignore parse errors
      }
    }
  } catch (e) {
    return out;
  }
  return out;
}

export function setUserInfo(userId, { name, email, cookieConsent }) {
  const u = getUser(userId);
  u.name = name || u.name;
  u.email = email || u.email;
  u.cookieConsent = typeof cookieConsent === 'boolean' ? cookieConsent : u.cookieConsent;
  saveUser(u);
  return u;
}

export function addPayment(userId, amount) {
  const u = getUser(userId);
  const cents = toCents(amount);
  
  // First try to use money from cash account
  if (typeof u.cashBalanceCents !== 'number') u.cashBalanceCents = toCents(u.cashBalance || 0);
  const availableCash = u.cashBalanceCents;
  
  if (availableCash >= cents) {
    // Use cash account for the deposit
    u.cashBalanceCents -= cents;
    if (typeof u.balanceCents !== 'number') u.balanceCents = toCents(u.balance || 0);
    u.balanceCents += cents;
    
    // Update dollar amounts for UI
    u.balance = centsToDollar(u.balanceCents);
    u.cashBalance = centsToDollar(u.cashBalanceCents);
    
    // Record the transfer in ledger
    if (!Array.isArray(u.ledger)) u.ledger = [];
    u.ledger.push({ 
      type: 'cashin', 
      amountCents: cents, 
      timestamp: new Date().toISOString(), 
      note: 'Transfer from cash account to playable balance' 
    });
    
    saveUser(u);
    return u;
  }
  
  // If not enough in cash account, process as normal deposit
  const record = { amountCents: cents, amount: centsToDollar(cents), timestamp: new Date().toISOString(), type: 'payment' };
  if (!Array.isArray(u.payments)) u.payments = [];
  u.payments.push(record);
  
  // update cents balances
  if (typeof u.balanceCents !== 'number') u.balanceCents = toCents(u.balance || 0);
  u.balanceCents += cents;
  u.balance = centsToDollar(u.balanceCents);
  
  // ledger entry
  if (!Array.isArray(u.ledger)) u.ledger = [];
  u.ledger.push({ type: 'payment', amountCents: cents, timestamp: new Date().toISOString(), note: 'External deposit' });
  
  saveUser(u);
  return u;
}

export function addBet(userId, amount, outcome, horse = null, jockey = null) {
  const u = getUser(userId);
  const cents = toCents(amount);
  const record = { amountCents: cents, amount: centsToDollar(cents), outcome, horse, jockey, timestamp: new Date().toISOString(), type: 'bet' };
  if (!Array.isArray(u.bets)) u.bets = [];
  u.bets.push(record);
  // Update cents balance: win increases by amount, loss decreases by amount
  if (typeof u.balanceCents !== 'number') u.balanceCents = toCents(u.balance || 0);
  if (outcome === 'win') u.balanceCents += cents;
  else u.balanceCents -= cents;
  u.balance = centsToDollar(u.balanceCents);
  // ledger entry
  if (!Array.isArray(u.ledger)) u.ledger = [];
  u.ledger.push({ type: outcome === 'win' ? 'bet_win' : 'bet_loss', amountCents: outcome === 'win' ? cents : -cents, timestamp: new Date().toISOString(), note: outcome === 'win' ? 'Bet win' : 'Bet loss' });
  saveUser(u);
  return u;
}

// Sum of all deposits (payments)
export function getTotalDeposits(user) {
  if (!user || !Array.isArray(user.payments)) return 0;
  // if payments use amountCents, sum cents then convert
  if (user.payments.length > 0 && user.payments[0].amountCents != null) {
    const cents = user.payments.reduce((s, p) => s + (p.amountCents || 0), 0);
    return centsToDollar(cents);
  }
  return user.payments.reduce((s, p) => s + (p.amount || 0), 0);
}

// Winnings are defined as current balance minus total deposits
export function getWinnings(user) {
  const deposits = getTotalDeposits(user);
  const bal = typeof user.balance === 'number' ? user.balance : 0;
  return Math.max(0, bal - deposits);
}

// Cash out all available winnings into the cash account (accrues interest on existing cash first)
export function cashOutWinnings(userId) {
  const u = getUser(userId); // getUser applies accrual and persists
  const winnings = getWinnings(u);
  if (winnings <= 0) return u;
  const cents = toCents(winnings);
  if (typeof u.balanceCents !== 'number') u.balanceCents = toCents(u.balance || 0);
  u.balanceCents -= cents;
  if (typeof u.cashBalanceCents !== 'number') u.cashBalanceCents = toCents(u.cashBalance || 0);
  u.cashBalanceCents += cents;
  u.balance = centsToDollar(u.balanceCents);
  u.cashBalance = centsToDollar(u.cashBalanceCents);
  u.lastAccrued = new Date().toISOString();
  if (!Array.isArray(u.ledger)) u.ledger = [];
  u.ledger.push({ type: 'cashout_winnings', amountCents: cents, timestamp: new Date().toISOString(), note: 'Cash out winnings' });
  saveUser(u);
  return u;
}

// Cash out the entire playable balance (deposits + winnings) into the cash account
export function cashOutAll(userId) {
  const u = getUser(userId); // applies accrual
  const availableCents = typeof u.balanceCents === 'number' ? u.balanceCents : toCents(u.balance || 0);
  if (availableCents <= 0) return u;
  if (typeof u.cashBalanceCents !== 'number') u.cashBalanceCents = toCents(u.cashBalance || 0);
  u.cashBalanceCents += availableCents;
  u.balanceCents = 0;
  u.balance = centsToDollar(u.balanceCents);
  u.cashBalance = centsToDollar(u.cashBalanceCents);
  u.lastAccrued = new Date().toISOString();
  if (!Array.isArray(u.ledger)) u.ledger = [];
  u.ledger.push({ type: 'cashout_all', amountCents: availableCents, timestamp: new Date().toISOString(), note: 'Cash out all playable balance' });
  saveUser(u);
  return u;
}

// Cash out an explicit amount from either winnings or playable balance
// source: 'winnings' | 'balance'
export function cashOutAmount(userId, amount, source = 'balance') {
  if (typeof amount !== 'number' || amount <= 0) return getUser(userId);
  const u = getUser(userId); // applies accrual
  const availableBalanceCents = typeof u.balanceCents === 'number' ? u.balanceCents : toCents(u.balance || 0);
  const winningsCents = toCents(getWinnings(u));
  const maxAvailable = source === 'winnings' ? winningsCents : availableBalanceCents;
  const requested = toCents(amount);
  const toMove = Math.min(maxAvailable, requested);
  if (toMove <= 0) return u;
  if (typeof u.cashBalanceCents !== 'number') u.cashBalanceCents = toCents(u.cashBalance || 0);
  u.cashBalanceCents += toMove;
  u.balanceCents = (typeof u.balanceCents === 'number' ? u.balanceCents : toCents(u.balance || 0)) - toMove;
  u.cashBalance = centsToDollar(u.cashBalanceCents);
  u.balance = centsToDollar(u.balanceCents);
  u.lastAccrued = new Date().toISOString();
  if (!Array.isArray(u.ledger)) u.ledger = [];
  u.ledger.push({ type: 'cashout_partial', amountCents: toMove, timestamp: new Date().toISOString(), note: `Cash out ${centsToDollar(toMove)} from ${source}` });
  saveUser(u);
  return u;
}

export function setDob(userId, dob) {
  const u = getUser(userId);
  u.dob = dob;
  u.verifiedAge = (new Date().getFullYear() - new Date(dob).getFullYear()) >= 18; // rough
  saveUser(u);
  return u;
}

export default { getUser, saveUser, addPayment, addBet, setDob, setUserInfo };
