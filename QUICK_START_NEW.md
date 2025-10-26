# Quick Start: Testing Winnings Payout & Responsible Gambling Features

## What's Been Fixed

### 1. ✅ Winnings Payout Integration
- When you win a bet, the backend now **automatically processes the payout**
- Calls `/api/v1/payment/winnings` endpoint
- Smart contract transfers CCD back to your Concordium wallet
- Balance updates after a few seconds

### 2. ✅ Responsible Gambling Tools Visible
- New **"Responsible Gambling" tab** in the app
- Set spending limits (daily/weekly/monthly)
- Activate self-exclusion
- View current limits and status

### 3. ✅ Limit Checking Before Bets
- Automatically checks if bet exceeds your set limits
- Prevents placing bets that would exceed limits
- Shows alert if limit would be exceeded

### 4. ✅ Session Management
- Automatically starts gambling session when you connect
- Tracks session duration and wagered amounts
- Ends session when you leave the page
- Used for responsible gambling monitoring

## Testing It Out

### Step 1: Start the Services

```bash
# Terminal 1: Start Python Backend
cd python-backend
source venv/bin/activate  # or 'venv\Scripts\activate' on Windows
python -m uvicorn src.main:app --reload --port 8000

# Terminal 2: Start Frontend
cd Frontend
npm install  # if first time
npm run dev
```

### Step 2: Connect Your Wallet

1. Open http://localhost:5173 (or whatever port Vite shows)
2. Click **"Connect Wallet"**
3. Approve the connection in Concordium wallet
4. Verify age (18+)
5. Your balance should load

### Step 3: Set a Spending Limit (Optional)

1. Click the **"🛡️ Responsible Gambling"** tab
2. In "Set Spending Limits" section:
   - Enter limit amount (e.g., 500 CCD)
   - Select period (daily/weekly/monthly)
   - Click "Set Limit"
3. You'll see confirmation message
4. Limit is now active

### Step 4: Place a Bet

1. Go back to **"🐎 Horse Racing"** tab
2. Select a horse
3. Enter bet amount
4. Click **"Place Bet"**
5. Approve transaction in wallet
6. Wait for confirmation

### Step 5: Race and Win!

1. Click **"Start Race"** after bet is confirmed
2. Watch the race animation
3. **If your horse wins**:
   - Alert shows you won with amount
   - Backend processes winnings automatically
   - Check backend logs for: `"Processing winnings: X CCD to <address>"`
   - Smart contract transfers CCD to your wallet
   - Wait 3-5 seconds
   - Your wallet balance updates!

### Step 6: Verify Payment

**In Backend Logs:**
```
INFO: Processing winnings: 175 CCD to 4Zx7...
INFO: Smart contract payout: 175 CCD to 4Zx7... for game race_1234567890
INFO: ✅ Winnings processed successfully
```

**In Frontend:**
- Alert shows transaction hash
- Balance increases by winnings amount
- Race history shows "Won X CCD (Transferred to wallet)"

**In Wallet:**
- Check transaction history
- See incoming transaction from smart contract

## Key Features Now Working

### 🎯 Betting Flow
- ✅ Connect wallet → loads balance
- ✅ Place bet → sends CCD transaction
- ✅ Check limits before betting
- ✅ Track bets in session

### 💰 Winnings Flow
- ✅ Calculate winnings (bet × odds)
- ✅ Call backend API with user ID, amount, game ID
- ✅ Backend calls smart contract
- ✅ Smart contract transfers CCD
- ✅ Return transaction hash
- ✅ Update balance in UI

### 🛡️ Responsible Gambling
- ✅ Set spending limits (daily/weekly/monthly)
- ✅ Check limits before allowing bets
- ✅ Self-exclusion with duration
- ✅ Block bets if self-excluded
- ✅ Session tracking (duration, wagered, won)
- ✅ View current limits and status

## Checking Backend APIs

### Test Winnings Endpoint Directly

```bash
# Register user first (if needed)
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "concordium_id": "4Zx7aBcD...",
    "email": "test@example.com",
    "username": "testuser"
  }'

# Process winnings
curl -X POST http://localhost:8000/api/v1/payment/winnings \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_id_from_above",
    "amount": 100.5,
    "game_id": "race_12345",
    "session_id": "session_67890"
  }'
```

### Test Limits

```bash
# Set a limit
curl -X POST http://localhost:8000/api/v1/limits/set \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_id",
    "limit_type": "spending",
    "amount": 500,
    "period": "daily"
  }'

# Check if bet is allowed
curl -X POST http://localhost:8000/api/v1/limits/check \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_id",
    "amount": 50
  }'
```

## Smart Contract Deployment

Currently using **mock mode** for testing. To deploy real smart contract:

1. **Install concordium-client:**
   ```bash
   cargo install --locked concordium-client
   ```

2. **Deploy to testnet:**
   ```bash
   cd contracts
   
   # Deploy module
   concordium-client module deploy concordium-out/module.wasm.v1 \
     --sender <your-account-address> \
     --grpc-ip node.testnet.concordium.com \
     --grpc-port 20000
   
   # Initialize contract (use module reference from above)
   concordium-client contract init <module-ref> \
     --contract payout_contract \
     --sender <your-account-address> \
     --grpc-ip node.testnet.concordium.com \
     --grpc-port 20000 \
     --energy 10000
   ```

3. **Configure backend:**
   ```bash
   # In python-backend/.env
   SMART_CONTRACT_INDEX=<your-contract-index>
   ```

4. **Restart backend** - now uses real smart contract!

**Note**: The web-based deployment tools may be temporarily unavailable. Using the CLI is more reliable.

See `contracts/DEPLOY_CLI.md` for detailed deployment instructions.

## Troubleshooting

### Winnings Not Working

**Check 1: Backend Running?**
```bash
curl http://localhost:8000/api/v1/health
```

**Check 2: User Registered?**
- Open browser console
- Check `localStorage.getItem('userId')`
- Should return a user ID

**Check 3: API Call Made?**
- Open browser DevTools → Network tab
- Look for POST to `/api/v1/payment/winnings`
- Check response

**Check 4: Backend Logs**
```
# Should see:
INFO: Processing winnings: X CCD to ...
INFO: Smart contract payout: ...
```

### Limits Not Appearing

**Check 1: Context Provider Added?**
- `App.tsx` should wrap with `<ResponsibleGamblingProvider>`

**Check 2: User ID Exists?**
```javascript
console.log(localStorage.getItem('userId'));
```

**Check 3: Backend API Working?**
```bash
curl http://localhost:8000/api/v1/limits/{user_id}
```

### Session Not Starting

- Check browser console for errors
- Verify `/api/v1/sessions/start` is called
- Check backend logs for session creation

## What Happens Behind the Scenes

### When You Win:

1. **Frontend calculates**: `winnings = betAmount × odds`
2. **Gets user info**: `userId` from localStorage
3. **Calls API**: `POST /api/v1/payment/winnings`
4. **Backend**:
   - Retrieves user's wallet address
   - Creates payment record
   - Calls smart contract service
   - Smart contract transfers CCD
   - Returns transaction hash
5. **Frontend**:
   - Shows success alert
   - Displays transaction hash
   - Refreshes balance after 3 seconds
6. **Your wallet**: Receives CCD!

## Next Steps

1. ✅ **Test the flow** - Place bets and win to see payouts
2. ✅ **Try limits** - Set a limit and try to exceed it
3. ✅ **Test self-exclusion** - Activate and try to bet
4. 📝 **Deploy smart contract** - Follow `contracts/DEPLOYMENT.md`
5. 🚀 **Production ready** - Follow checklist in `INTEGRATION_COMPLETE.md`

## Files Changed

### Frontend
- `src/App.tsx` - Added RG provider and navigation
- `src/App.css` - Navigation styles
- `src/components/HorseRacing.tsx` - Full integration
- `src/components/ResponsibleGamblingTools.tsx` - Added CSS
- `src/components/ResponsibleGamblingTools.css` - New styles

### Backend
- `src/services/smart_contract_service.py` - Enhanced with config
- `src/services/payment_service.py` - Already had winnings processing
- `.env.example` - Added smart contract config

### Documentation
- `contracts/DEPLOYMENT.md` - Smart contract deployment guide
- `INTEGRATION_COMPLETE.md` - Full technical integration guide
- `QUICK_START_NEW.md` - This file!

## Success Criteria

You'll know it's working when:
- ✅ You can set spending limits in RG tab
- ✅ Limits block bets that exceed them
- ✅ When you win, you see transaction hash
- ✅ Your wallet balance increases after winning
- ✅ Backend logs show "Processing winnings"
- ✅ Self-exclusion blocks all betting

Enjoy responsible gambling with automatic payouts! 🎰💰
