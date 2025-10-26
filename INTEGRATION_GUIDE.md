# Integration Guide - Concordium Gambling Plugin

## Overview
This guide explains how the frontend, backend, and smart contracts are integrated to create a fully functional responsible gambling platform.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (React + TypeScript)               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Wallet     │  │   Payment    │  │     RG       │     │
│  │   Context    │  │   Context    │  │   Context    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                     API Client (axios)                       │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────┐
│              Python Backend (FastAPI)                        │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Payment    │  │   Wallet     │  │     RG       │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                   PostgreSQL Database                        │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP/JSON-RPC
                             ▼
┌─────────────────────────────────────────────────────────────┐
│         Node.js Backend (Concordium Integration)             │
│                                                              │
│  - Concordium SDK                                           │
│  - Wallet Connection                                        │
│  - Identity Verification                                    │
└────────────────────────────┬────────────────────────────────┘
                             │ Concordium SDK
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Concordium Blockchain                       │
│                                                              │
│  - Identity Layer    - Smart Contracts    - PLT Payments    │
└─────────────────────────────────────────────────────────────┘
```

## Component Integration

### 1. Frontend Integration

#### Context Providers
The frontend uses React Context API for state management:

**WalletContext** (`Frontend/src/context/WalletContext.tsx`)
- Manages Concordium wallet connection
- Handles user authentication
- Registers users with backend
- Connects wallet to backend via API

**PaymentContext** (`Frontend/src/context/PaymentContext.tsx`)
- Manages payment operations (deposit, withdraw, winnings)
- Tracks user balance
- Payment history and analytics
- Integrates with wallet context for user identity

**ResponsibleGamblingContext** (`Frontend/src/context/ResponsibleGamblingContext.tsx`)
- Manages spending limits
- Self-exclusion functionality
- Session tracking
- Limit checking before transactions

#### API Client
**`Frontend/src/services/api.ts`**
- Centralized API client using axios
- Organized by feature (wallet, payment, RG, analytics)
- Consistent error handling
- Base URL configuration from environment

### 2. Backend Integration

#### API Endpoints (`python-backend/src/api/`)

**Main Routes** (`routes.py`)
- User registration and management
- Session tracking
- Transaction recording
- Behavioral analytics
- Audit logging

**Payment Routes** (`payment_routes.py`)
- `/wallet/connect` - Connect wallet
- `/wallet/{user_id}/balance` - Get balance
- `/payment/deposit` - Deposit funds
- `/payment/withdraw` - Withdraw funds
- `/payment/winnings` - Record winnings
- `/payment/history/{user_id}` - Payment history
- `/payment/analytics/{user_id}` - Financial analytics

#### Services Layer (`python-backend/src/services/`)

**WalletService** (`wallet_service.py`)
- Connect wallet to user account
- Sync balance with blockchain
- Update balance after transactions

**PaymentService** (`payment_service.py`)
- Process deposits
- Handle withdrawals
- Record winnings
- Calculate analytics

**ResponsibleGamblingService** (various files)
- `limit_enforcement_service.py` - Check and enforce limits
- `self_exclusion_service.py` - Manage exclusions
- `session_service.py` - Track gambling sessions
- `behavior_analytics_service.py` - Risk assessment

**BlockchainIntegrationService** (`blockchain_integration_service.py`)
- Interface with Node.js backend
- Get wallet balance from blockchain
- Transfer funds
- Verify transactions

### 3. Node.js Backend Integration

**Purpose**: Bridge between Python backend and Concordium blockchain

**Key Endpoints**:
- `/api/concordium/balance/{address}` - Get wallet balance
- `/api/concordium/transfer` - Transfer CCD
- `/api/concordium/verify-identity` - Verify user identity
- `/api/concordium/log-transaction` - Log on-chain

**Integration**: Python backend calls Node.js via HTTP

### 4. Smart Contract Integration

**Payout Contract** (`contracts/src/lib.rs`)
- Automated winner payouts
- Owner-controlled for security
- On-chain audit trail

**Integration Flow**:
```
User wins → Frontend → Python Backend → Smart Contract → Blockchain → User Wallet
```

## Data Flow Examples

### User Registration & Wallet Connection

```
1. User connects Concordium wallet in frontend
   ↓
2. Frontend calls walletAPI.register(address)
   ↓
3. Python backend creates user record
   ↓
4. Backend verifies identity via Node.js service
   ↓
5. Node.js calls Concordium blockchain
   ↓
6. Identity verified, user registered
   ↓
7. Frontend stores userId in localStorage
   ↓
8. User can now make transactions
```

### Deposit Flow

```
1. User clicks "Deposit" in PaymentForm
   ↓
2. PaymentContext checks spending limits via RG Context
   ↓
3. If allowed, frontend calls paymentAPI.deposit(userId, amount)
   ↓
4. Python backend receives request
   ↓
5. PaymentService validates and records deposit
   ↓
6. Database updated with transaction
   ↓
7. WalletService updates balance
   ↓
8. Response sent to frontend
   ↓
9. Frontend refreshes balance and history
   ↓
10. User sees updated balance
```

### Placing a Bet & Winning

```
1. User selects horse and amount in HorseRacing component
   ↓
2. Frontend checks if user is self-excluded (RG Context)
   ↓
3. Frontend checks spending limit (RG Context)
   ↓
4. If allowed, bet is placed (deducted from balance)
   ↓
5. Race completes, user wins
   ↓
6. Frontend calls paymentAPI.recordWinnings(userId, amount, gameId, sessionId)
   ↓
7. Python backend receives winnings request
   ↓
8. PaymentService records winning transaction
   ↓
9. SmartContractService triggers payout (optional)
   ↓
10. Smart contract transfers funds to user wallet
   ↓
11. Database updated
   ↓
12. Frontend refreshes balance
   ↓
13. User sees winnings credited
```

### Setting Spending Limit

```
1. User fills limit form in ResponsibleGamblingTools
   ↓
2. Frontend calls responsibleGamblingAPI.setLimit(userId, type, amount, period)
   ↓
3. Python backend receives request
   ↓
4. LimitEnforcementService validates and creates limit
   ↓
5. Database stores limit record
   ↓
6. All future transactions check against this limit
   ↓
7. Cross-platform enforcement (via Concordium identity)
```

### Self-Exclusion

```
1. User activates self-exclusion
   ↓
2. Frontend shows confirmation dialog
   ↓
3. User confirms, frontend calls responsibleGamblingAPI.selfExclude(userId, days, platforms)
   ↓
4. Python backend receives request
   ↓
5. SelfExclusionService creates exclusion record
   ↓
6. Exclusion logged on blockchain (optional)
   ↓
7. Database updated with exclusion
   ↓
8. User immediately blocked from gambling
   ↓
9. Exclusion enforced across all platforms
   ↓
10. After expiry period, exclusion automatically lifts
```

## Environment Configuration

### Frontend `.env`
```env
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
REACT_APP_NODE_BACKEND_URL=http://localhost:3000
REACT_APP_OPERATOR_ID=platform_main
REACT_APP_CONCORDIUM_NETWORK=testnet
```

### Python Backend `.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/responsible_gambling
NODE_BACKEND_URL=http://localhost:3000
DEBUG=true
HOST=0.0.0.0
PORT=8000
CONCORDIUM_NODE_URL=https://grpc.testnet.concordium.com:20000
```

### Node.js Backend `.env`
```env
PORT=3000
NODE_ENV=development
CONCORDIUM_NODE_URL=https://grpc.testnet.concordium.com:20000
CONCORDIUM_NETWORK=testnet
```

## Running the Integrated System

### Option 1: Docker Compose (Recommended)
```bash
docker-compose up -d
```

This starts all services:
- PostgreSQL database
- Python backend (port 8000)
- Node.js backend (port 3001)
- Frontend (port 3000)

### Option 2: Manual Startup
```bash
# Start database
# (Ensure PostgreSQL is running)

# Start Python backend
cd python-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000 &

# Start Node.js backend
cd ../node-backend
npm install
npm run dev &

# Start Frontend
cd ../Frontend
npm install
npm start
```

### Option 3: Startup Script
```bash
chmod +x start.sh
./start.sh
```

## Testing the Integration

### 1. Test Wallet Connection
```bash
# Open http://localhost:3000
# Click "Connect Wallet"
# Approve connection in Concordium Wallet extension
# Verify user is registered in backend
```

### 2. Test Deposit
```bash
# In frontend, navigate to Payment section
# Enter deposit amount
# Click "Deposit"
# Verify balance updated
```

### 3. Test Gambling Session
```bash
# Navigate to Horse Racing game
# Select horse and bet amount
# Click "Place Bet"
# Watch race
# If you win, verify winnings are credited
```

### 4. Test Responsible Gambling
```bash
# Navigate to RG Tools
# Set a daily spending limit
# Try to deposit more than limit
# Verify transaction is blocked
```

### 5. Test Self-Exclusion
```bash
# Navigate to RG Tools
# Activate self-exclusion for 1 day
# Try to place a bet
# Verify you are blocked
```

## API Testing

Use the interactive API documentation:
```
http://localhost:8000/docs
```

All endpoints can be tested directly from the Swagger UI.

## Troubleshooting

### Frontend can't connect to backend
- Check backend is running on port 8000
- Verify REACT_APP_API_BASE_URL is correct
- Check CORS settings in Python backend

### Payment operations fail
- Verify database is running and accessible
- Check Node.js backend is running
- Verify Concordium wallet is connected

### Balance not updating
- Check BlockchainIntegrationService configuration
- Verify Node.js backend can connect to Concordium
- Check database connection

### Limits not enforcing
- Verify userId is stored in localStorage
- Check limit records exist in database
- Test limit check API endpoint directly

## Security Considerations

1. **Never expose private keys** in frontend or backend
2. **All transactions require user signature** from wallet
3. **Limits stored in database**, enforced server-side
4. **Self-exclusion is immutable** during active period
5. **Cross-platform enforcement** via Concordium identity
6. **Audit trail** for all transactions

## Next Steps

1. Deploy to production environment
2. Configure production database
3. Set up SSL/TLS certificates
4. Configure production environment variables
5. Deploy smart contracts to mainnet
6. Set up monitoring and logging
7. Implement backup strategy

## Support

For issues or questions:
- Check the main README.md
- Review API documentation at /docs
- Check logs: `docker-compose logs -f`
- Open an issue on GitHub
