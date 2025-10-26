# Complete Integration Guide

This guide explains how all components work together to enable betting with winnings payouts and responsible gambling features.

## System Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React/TS)     │
│  - Horse Racing │
│  - RG Tools     │
└────────┬────────┘
         │
         │ HTTP API Calls
         ▼
┌─────────────────┐
│  Python Backend │
│   (FastAPI)     │
│  - Payments     │
│  - RG Features  │
│  - Sessions     │
└────────┬────────┘
         │
         │ Smart Contract Calls
         ▼
┌─────────────────┐
│   Concordium    │
│   Blockchain    │
│  - Smart Cont.  │
│  - Wallet Txns  │
└─────────────────┘
```

## Complete Flow: Betting and Winnings

### 1. User Connection & Registration

**Frontend** (`HorseRacing.tsx`):
```typescript
// When wallet connects
useEffect(() => {
  if (connectedAccount) {
    initializeUser(); // Registers user if new
  }
}, [connectedAccount]);
```

**Backend** (`user_service.py`):
- Creates user record with Concordium address
- Stores user_id in localStorage for future requests

### 2. Session Management

**Frontend** starts gambling session:
```typescript
await startSession(); // Called in initializeUser()
```

**Backend** (`session_service.py`):
- Creates active session record
- Tracks duration and statistics
- Used for responsible gambling monitoring

### 3. Placing a Bet

#### Step 3a: Check Limits (Frontend)
```typescript
const limitAllowed = await checkLimit(amount);
if (!limitAllowed) {
  alert("This bet exceeds your spending limit");
  return;
}
```

**Backend** (`limit_enforcement_service.py`):
- Checks user's set spending limits
- Considers daily/weekly/monthly periods
- Returns whether bet is allowed

#### Step 3b: Send CCD Transaction
```typescript
const txHash = await sendTransaction(amount);
```

**Concordium Wallet**:
- User approves transaction
- CCD transferred from user → house account
- Returns transaction hash

### 4. Race Simulation

**Frontend**:
- Animates horses racing
- Determines winner randomly (based on odds)
- Calls `handleRaceEnd(winningHorse)`

### 5. Winnings Payout (The Key Part!)

#### Step 5a: Check if User Won
```typescript
if (currentBet.horseId === winningHorse.id) {
  const winnings = currentBet.amount * winningHorse.odds;
  // Process winnings...
}
```

#### Step 5b: Call Backend API
```typescript
const response = await paymentAPI.recordWinnings(
  userId,
  winnings,
  `race_${Date.now()}`,
  sessionId
);
```

#### Step 5c: Backend Processes Payout
**Backend** (`payment_service.py`):
```python
async def process_winnings(user_id, amount, game_id, session_id):
    # 1. Get user's wallet address
    wallet = await wallet_service.get_wallet(user_id)
    
    # 2. Call smart contract to payout
    tx_result = await contract_service.payout_winnings(
        winner_address=wallet['concordium_address'],
        amount=amount,
        game_id=game_id
    )
    
    # 3. Record payment
    payment = Payment(
        payment_type=PaymentType.WINNINGS,
        amount=amount,
        status=PaymentStatus.COMPLETED,
        tx_hash=tx_result['tx_hash']
    )
    
    return {'success': True, 'tx_hash': tx_result['tx_hash']}
```

#### Step 5d: Smart Contract Executes Transfer
**Smart Contract** (`lib.rs`):
```rust
fn payout(ctx: &ReceiveContext, host: &mut Host<State>) {
    let params: PayoutParams = ctx.parameter_cursor().get()?;
    
    // Transfer CCD to winner
    host.invoke_transfer(&params.winner, params.amount)?;
    
    // Update total payouts
    host.state_mut().total_payouts += params.amount;
}
```

#### Step 5e: Frontend Receives Confirmation
```typescript
if (response.data.success) {
  alert(`You won ${winnings} CCD! 
         Transferred to your wallet.
         TX: ${response.data.tx_hash}`);
  
  // Refresh balance to show new funds
  setTimeout(() => fetchBalance(), 3000);
}
```

## Responsible Gambling Features

### Setting Limits

**Frontend** (`ResponsibleGamblingTools.tsx`):
```typescript
<form onSubmit={handleSetLimit}>
  <input type="number" value={limitAmount} />
  <select value={limitPeriod}>
    <option value="daily">Daily</option>
    <option value="weekly">Weekly</option>
    <option value="monthly">Monthly</option>
  </select>
  <button type="submit">Set Limit</button>
</form>
```

**Backend** (`limit_enforcement_service.py`):
- Stores limit in database
- Checks against limit before allowing bets
- Resets counters based on period

### Self-Exclusion

**Frontend**:
```typescript
await selfExclude(durationDays, ['platform_main']);
```

**Backend** (`self_exclusion_service.py`):
- Creates self-exclusion record
- Sets end date based on duration
- Blocks all betting during exclusion period

**HorseRacing checks exclusion**:
```typescript
if (isExcluded) {
  alert("You are currently self-excluded from gambling.");
  return;
}
```

### Session Tracking

**Backend** tracks:
- Session duration
- Amount wagered in session
- Amount won in session
- Time patterns

**Used for**:
- Reality checks ("You've been playing for 2 hours")
- Risk assessment
- Behavioral analytics

## API Endpoints Reference

### Payments
- `POST /api/v1/payment/winnings` - Process winnings payout
- `GET /api/v1/payment/history/{user_id}` - Payment history
- `GET /api/v1/payment/analytics/{user_id}` - Profit/loss analysis

### Responsible Gambling
- `POST /api/v1/limits/set` - Set spending limit
- `GET /api/v1/limits/{user_id}` - Get user limits
- `POST /api/v1/limits/check` - Check if amount allowed
- `POST /api/v1/self-exclusion` - Activate self-exclusion
- `GET /api/v1/self-exclusion/{user_id}` - Check exclusion status

### Sessions
- `POST /api/v1/sessions/start` - Start gambling session
- `POST /api/v1/sessions/{session_id}/end` - End session
- `GET /api/v1/sessions/{session_id}` - Get session summary

### Users
- `POST /api/v1/users/register` - Register new user
- `GET /api/v1/users/{user_id}` - Get user details

## Configuration

### Frontend (.env)
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

### Backend (.env)
```env
DATABASE_URL=sqlite:///./responsible_gambling.db
CONCORDIUM_SERVICE_URL=http://localhost:3000
SMART_CONTRACT_INDEX=<your-contract-index>
```

## Testing the Complete Flow

### 1. Start Services
```bash
# Terminal 1: Python Backend
cd python-backend
python -m uvicorn src.main:app --reload

# Terminal 2: Frontend
cd Frontend
npm start
```

### 2. Test Betting Flow

1. **Connect Wallet**: Click "Connect Wallet" and approve
2. **Verify Age**: Confirm you're 18+
3. **View Balance**: Check your CCD balance loads
4. **Set Limit** (Optional): Go to Responsible Gambling tab, set a limit
5. **Place Bet**:
   - Select a horse
   - Enter bet amount
   - Click "Place Bet"
   - Approve wallet transaction
6. **Start Race**: Click "Start Race" after bet is confirmed
7. **Watch Race**: Race animation runs
8. **Win Scenario**:
   - If your horse wins
   - Backend automatically processes winnings
   - Smart contract transfers CCD to your wallet
   - Balance updates after a few seconds

### 3. Monitor Backend Logs

Backend logs show:
```
INFO: User registered: user_123abc
INFO: Gambling session started: session_456def
INFO: Limit check passed: 50 CCD
INFO: Processing winnings: 175 CCD to 4Zx7...
INFO: Smart contract payout: 175 CCD to 4Zx7... for game race_1234567890
```

### 4. Check Blockchain Explorer

Visit: https://testnet.ccdscan.io/

Search for:
- Your transaction hash (bet placement)
- Payout transaction hash (winnings)

## Troubleshooting

### Winnings Not Received

1. **Check Backend Logs**: Look for payout errors
2. **Verify Contract**: Ensure SMART_CONTRACT_INDEX is set
3. **Check Balance**: Contract needs CCD to pay winners
4. **API Response**: Check browser console for API errors

### Limits Not Working

1. **Check Registration**: Ensure user_id in localStorage
2. **Backend Connection**: Verify API calls succeed
3. **Database**: Check limits table has user's limits

### Smart Contract Issues

1. **Not Deployed**: Set mock mode works for testing
2. **Insufficient Funds**: Contract needs CCD balance
3. **Wrong Address**: Verify contract index is correct

## Production Checklist

- [ ] Deploy smart contract to mainnet
- [ ] Set SMART_CONTRACT_INDEX in production .env
- [ ] Fund contract with sufficient CCD
- [ ] Switch CONCORDIUM_SERVICE_URL to mainnet node
- [ ] Use PostgreSQL instead of SQLite
- [ ] Enable HTTPS for API
- [ ] Set strong SECRET_KEY and API_KEY
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Test all flows with real CCD
- [ ] Implement rate limiting
- [ ] Add transaction confirmation checks

## Security Considerations

1. **Smart Contract**: Only owner can trigger payouts
2. **API Keys**: Use secure API keys in production
3. **Rate Limiting**: Prevent abuse of payout endpoints
4. **Transaction Verification**: Verify bets before payouts
5. **Session Management**: Prevent session hijacking
6. **Limit Bypass**: Ensure limits can't be circumvented

## Further Improvements

1. **Automated Testing**: Add integration tests
2. **Error Recovery**: Handle failed payouts with retry
3. **Real-time Updates**: WebSocket for balance updates
4. **Transaction Queue**: Queue payouts during high load
5. **Multi-currency**: Support PLT tokens
6. **Advanced RG**: ML-based risk detection
7. **Audit Trail**: Comprehensive logging of all actions
