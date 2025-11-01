# Concordium Responsible Gambling Platform

## 📋 Summary

A **full-stack blockchain-powered gambling platform** with comprehensive **responsible gambling features** built on the Concordium blockchain. This project demonstrates how blockchain technology can promote safer gambling through:

- ✅ **Transparent, automated payouts** via smart contracts
- ✅ **Identity verification** using Concordium wallet addresses
- ✅ **Spending limits** (daily/weekly/monthly/session)
- ✅ **Self-exclusion** and cool-down periods
- ✅ **Session management** with time tracking
- ✅ **Behavioral analytics** and risk assessment
- ✅ **Real CCD transactions** with automatic winnings distribution

**Live Features:**
- 🏇 Horse racing betting game with real CCD transactions
- 💰 Automatic payout of winnings to user wallets
- 🛡️ Responsible gambling tools (limits, exclusions, cooldowns)
- 📊 Session tracking and spending analytics
- 🔗 Concordium wallet integration (Browser & Mobile)

## 🏗️ Project Architecture

This is a **4-service architecture** with frontend, backend, blockchain service, and smart contracts:

### 1. Frontend (React + TypeScript) - Port 5173
**Purpose**: User interface for gambling and responsible gambling tools
- React 18 with Vite for fast development
- Concordium wallet integration (Browser & WalletConnect)
- Horse racing game with real-time CCD betting
- Responsible gambling settings interface
- Session management and limit tracking

**Location**: `frontend/`
**Tech Stack**: React, TypeScript, Vite, @concordium/web-sdk, @concordium/react-components

### 2. Python Backend (FastAPI) - Port 8000
**Purpose**: Core business logic and responsible gambling features
- User management and wallet registration
- Payment processing (deposits, withdrawals, winnings)
- Limit enforcement (daily/weekly/monthly/session)
- Session tracking with time limits
- Self-exclusion registry
- Behavioral analytics and risk scoring
- Smart contract integration for payouts

**Location**: `python-backend/`
**Tech Stack**: Python 3.10+, FastAPI, SQLAlchemy, SQLite/PostgreSQL

### 3. Node.js Backend (Express) - Port 3000 [OPTIONAL]
**Purpose**: Advanced Concordium blockchain integration
- Direct blockchain node communication
- Identity verification services
- Smart contract event monitoring
- WebSocket connections for real-time updates

**Location**: `node-backend/`
**Tech Stack**: Node.js 16+, Express, TypeScript
**Note**: Optional service - main functionality works without it

### 4. Smart Contracts (Rust)
**Purpose**: Automated, trustless payout of gambling winnings
- Rust smart contract using concordium-std 10.1
- Automatic CCD transfer to winners
- Transparent on-chain payout records
- Owner-controlled payout function

**Location**: `contracts/`
**Tech Stack**: Rust 1.73.0, cargo-concordium, concordium-std

## � Complete Directory Structure

```
concordium_gambling_plugin/
├── frontend/                        # React frontend application
│   ├── src/
│   │   ├── components/              # UI components
│   │   │   ├── Header.tsx          # Navigation header with wallet
│   │   │   ├── Header.css
│   │   │   ├── HorseRacing.tsx     # Main horse racing game
│   │   │   ├── HorseRacing.css
│   │   │   ├── ResponsibleGamblingTools.tsx  # RG settings
│   │   │   └── ResponsibleGamblingTools.css
│   │   ├── context/                 # React Context providers
│   │   │   ├── WalletContext.tsx   # Wallet connection state
│   │   │   ├── ResponsibleGamblingContext.tsx
│   │   │   └── PaymentContext.tsx
│   │   ├── services/
│   │   │   └── api.ts              # Backend API client
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # Entry point
│   │   └── wallet-connection.tsx    # Wallet providers
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md                    # Frontend documentation
│
├── python-backend/                  # FastAPI backend service
│   ├── src/
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── api/
│   │   │   ├── routes.py           # API endpoints
│   │   │   └── middleware.py
│   │   ├── services/                # Business logic
│   │   │   ├── payment_service.py  # Payment processing
│   │   │   ├── limit_enforcement_service.py  # Limit checks
│   │   │   ├── session_service.py  # Session management
│   │   │   ├── smart_contract_service.py  # Contract calls
│   │   │   ├── self_exclusion_service.py
│   │   │   ├── behavior_analytics_service.py
│   │   │   ├── wallet_service.py
│   │   │   └── user_service.py
│   │   ├── models/                  # Database models
│   │   │   ├── user.py
│   │   │   ├── transaction.py
│   │   │   ├── session.py
│   │   │   ├── limit.py
│   │   │   └── wallet.py
│   │   ├── repositories/            # Data access layer
│   │   │   ├── user_repository.py
│   │   │   ├── transaction_repository.py
│   │   │   └── session_repository.py
│   │   └── config/
│   │       ├── settings.py
│   │       └── database.py
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md                    # Backend documentation
│
├── contracts/                       # Rust smart contracts
│   ├── src/
│   │   └── lib.rs                  # Payout smart contract
│   ├── Cargo.toml
│   ├── rust-toolchain              # Rust 1.73.0 pinning
│   ├── .cargo/
│   │   └── config.toml
│   └── README.md                    # Contract documentation
│
├── node-backend/                    # Optional Node.js service
│   ├── src/
│   │   ├── server.ts               # Express server
│   │   ├── controllers/
│   │   ├── models/
│   │   └── services/
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md                    # Node backend documentation
│
├── docker-compose.yml               # Multi-container orchestration
├── start.sh                         # Quick start script
├── verify-installation.sh           # Setup verification
└── README.md                        # This file
```

## 🔗 Service Integration Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                             │
│                                                                      │
│  Browser → Frontend (React, Port 5173)                              │
│            - Wallet connection                                       │
│            - Place bets with CCD                                     │
│            - Set responsible gambling limits                         │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ HTTP/REST API
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Python Backend (FastAPI, Port 8000)                │
│                                                                      │
│  • User registration & authentication                                │
│  • Bet placement & validation                                        │
│  • Limit enforcement (check before bets)                            │
│  • Session management (start/end/track)                             │
│  • Winnings calculation                                              │
│  • Smart contract integration                                        │
└──────────────┬────────────────────────────┬─────────────────────────┘
               │                            │
               │ SQLAlchemy                 │ concordium-client
               ▼                            ▼
┌──────────────────────────┐    ┌──────────────────────────────────┐
│   SQLite/PostgreSQL      │    │   Smart Contract                 │
│   Database               │    │   (Rust, Concordium Blockchain)  │
│                          │    │                                  │
│  • Users                 │    │  • payout() - Transfer CCD       │
│  • Wallets               │    │  • view() - Query total payouts  │
│  • Transactions          │    │                                  │
│  • Sessions              │    │  Deployed at: <contract_address> │
│  • Limits                │    └──────────────────────────────────┘
│  • Exclusions            │
└──────────────────────────┘

Optional Integration (if advanced features needed):
┌──────────────────────────────────────────────────────────────────────┐
│           Node.js Backend (Express, Port 3000) [OPTIONAL]            │
│                                                                       │
│  • Advanced Concordium SDK operations                                 │
│  • Real-time blockchain event monitoring                              │
│  • WebSocket connections                                              │
│  • Identity verification services                                     │
└───────────────────────────────────────────────────────────────────────┘
```

## 🎮 How It Works - User Journey

1. **User Opens App** → Frontend loads at http://localhost:5173
2. **Connect Wallet** → User connects Concordium Browser Wallet or Mobile Wallet
3. **Age Verification** → User confirms 18+ to unlock gambling features
4. **User Registration** → Frontend calls Python backend to register user & create wallet record
5. **Place Bet** → User selects horse, enters bet amount
   - Frontend checks responsible gambling limits via Python backend
   - If allowed, sends CCD transaction to platform wallet
   - Backend records bet in database
6. **Start Race** → Animation plays, winner determined randomly
7. **Distribute Winnings** → If user wins:
   - Frontend calls Python backend `/api/v1/payment/winnings`
   - Backend calculates winnings (bet × odds)
   - Backend calls smart contract's `payout()` function
   - Smart contract transfers CCD back to user's wallet
   - Blockchain confirms transaction
   - User's wallet balance updates automatically
8. **Set Limits** → User navigates to "Responsible Gambling" tab
   - Set daily/weekly/monthly spending limits
   - Enable cool-down periods between bets
   - Request self-exclusion (locks account for X days)

## 🚀 Quick Start Guide

### Prerequisites

**Required:**
- Python 3.10 or higher
- Node.js 16 or higher
- npm or yarn
- Concordium Browser Wallet extension
- Testnet CCD tokens

**Optional (for smart contract deployment):**
- Rust 1.73.0 (automatically selected by rust-toolchain file)
- cargo-concordium
- concordium-client CLI

### Installation Steps

#### 1. Clone Repository

```bash
git clone <repository-url>
cd concordium_gambling_plugin
```

#### 2. Setup Python Backend

```bash
cd python-backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
nano .env  # Edit configuration as needed

# Initialize database
python -c "from src.config.database import init_db; init_db()"

# Start server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify:** Open http://localhost:8000/docs (should see API documentation)

#### 3. Setup Frontend

```bash
# In a new terminal
cd frontend

# Install dependencies
npm install

# Configure environment (optional, defaults work)
cp .env.example .env

# Start development server
npm run dev
```

**Verify:** Open http://localhost:5173 (should see gambling app)

#### 4. Install Concordium Wallet

1. Install [Concordium Browser Wallet](https://chrome.google.com/webstore/detail/concordium-wallet) extension
2. Create identity and account in wallet
3. Switch to **testnet** in wallet settings
4. Request testnet CCD using wallet's "Request" feature

#### 5. Connect and Play!

1. Open http://localhost:5173
2. Click "Connect Wallet" in header
3. Approve connection in wallet popup
4. Confirm you are 18+ years old
5. Select a horse and place your bet!
6. Watch the race and receive automatic winnings if you win

### Optional: Setup Node.js Backend

```bash
cd node-backend
npm install
npm run dev
```

**Verify:** http://localhost:3000/api/health

### Optional: Build and Deploy Smart Contract

```bash
cd contracts

# Build contract (Rust 1.73.0 auto-selected)
cargo concordium build --out gambling_payout.wasm.v1

# Deploy to testnet
concordium-client module deploy \
    target/concordium/wasm32-unknown-unknown/release/concordium_gambling_plugin.wasm.v1 \
    --sender <your-account> \
    --grpc-ip node.testnet.concordium.com \
    --grpc-port 20000

# Initialize contract
concordium-client contract init <module-hash> \
    --contract gambling_payout \
    --sender <your-account> \
    --energy 10000

# Update python-backend/.env with contract address
CONTRACT_ADDRESS=<12345,0>
CONTRACT_NAME=gambling_payout
SMART_CONTRACT_MODE=production
```

### Quick Start Script

Use the automated startup script (starts Python backend + Frontend):

```bash
# Make executable
chmod +x start.sh

# Run
./start.sh
```

This will:
- Start Python backend on port 8000
- Start frontend on port 5173
- Display all service URLs
- Show process IDs for easy management

## 📚 API Reference

### Python Backend Endpoints (Port 8000)

**User Management:**
- `POST /api/v1/users/register` - Register new user with wallet
- `GET /api/v1/users/{user_id}` - Get user profile
- `PUT /api/v1/users/{user_id}` - Update user information

**Payment & Betting:**
- `POST /api/v1/payment/deposit` - Deposit CCD to platform
- `POST /api/v1/payment/withdraw` - Withdraw CCD from platform
- `POST /api/v1/payment/bet` - Place a bet
- `POST /api/v1/payment/winnings` - Record and payout winnings

**Session Management:**
- `POST /api/v1/sessions/start` - Start gambling session
- `POST /api/v1/sessions/{session_id}/end` - End session
- `GET /api/v1/sessions/{session_id}` - Get session details
- `GET /api/v1/users/{user_id}/sessions` - Get user session history

**Responsible Gambling:**
- `POST /api/v1/limits/set` - Set spending limit (daily/weekly/monthly)
- `GET /api/v1/limits/{user_id}` - Get user's current limits
- `POST /api/v1/limits/check` - Check if bet exceeds limits
- `POST /api/v1/self-exclusion` - Request self-exclusion
- `GET /api/v1/self-exclusion/{user_id}` - Check exclusion status

**Analytics:**
- `GET /api/v1/analytics/risk-score/{user_id}` - Calculate risk score
- `GET /api/v1/analytics/spending-pattern/{user_id}` - Analyze spending
- `GET /api/v1/analytics/wellness-report/{user_id}` - Generate report

**Health:**
- `GET /api/v1/health` - Service health check

**Interactive Documentation:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Smart Contract Methods

**payout(winner: AccountAddress, amount: Amount)**
- Transfers CCD from contract to winner's wallet
- Only callable by contract owner
- Records payout in total_payouts counter

**view() → Amount**
- Returns total CCD paid out since deployment
- Read-only, anyone can call

## ⚙️ Configuration

### Python Backend (.env)

```bash
# Database
DATABASE_URL=sqlite:///./gambling.db
# Use PostgreSQL for production:
# DATABASE_URL=postgresql://user:password@localhost/gambling_db

# Smart Contract
CONTRACT_ADDRESS=<12345,0>
CONTRACT_NAME=gambling_payout
SMART_CONTRACT_MODE=mock  # or 'production'

# Concordium Node
CONCORDIUM_NODE_URL=http://node.testnet.concordium.com
CONCORDIUM_NODE_PORT=20000

# Limits (in CCD)
DEFAULT_DAILY_LIMIT=100.0
DEFAULT_WEEKLY_LIMIT=500.0
DEFAULT_MONTHLY_LIMIT=2000.0

# Session
MAX_SESSION_DURATION=120  # minutes
REALITY_CHECK_INTERVAL=30  # minutes

# Risk Assessment
HIGH_RISK_THRESHOLD=75
CRITICAL_RISK_THRESHOLD=90
```

### Frontend (.env)

```bash
REACT_APP_API_BASE_URL=http://localhost:8000/api/v1
```

### Node Backend (.env) [Optional]

```bash
PORT=3000
NODE_ENV=development
CONCORDIUM_NODE_URL=http://node.testnet.concordium.com
CONCORDIUM_NODE_PORT=20000
```

## 🧪 Testing

### Python Backend Tests

```bash
cd python-backend

# Run all tests
pytest tests/

# Run with coverage
pytest tests/ --cov=src --cov-report=html

# Run specific test file
pytest tests/test_payment_service.py

# Verbose output
pytest tests/ -v
```

### Frontend Tests (if implemented)

```bash
cd frontend
npm test
```

### Manual Testing Checklist

- [ ] Wallet connection (Browser + Mobile)
- [ ] User registration
- [ ] Bet placement with CCD transaction
- [ ] Race execution and winner determination
- [ ] Automatic winnings payout
- [ ] Daily limit enforcement
- [ ] Weekly limit enforcement
- [ ] Monthly limit enforcement
- [ ] Session time limit
- [ ] Cool-down period
- [ ] Self-exclusion
- [ ] Balance update after transactions

## 🐛 Troubleshooting

### Frontend Issues

**Wallet won't connect:**
- Ensure Concordium Browser Wallet extension is installed and unlocked
- Check you're on testnet in wallet settings
- Try refreshing page and reconnecting

**Balance shows 0:**
- Request testnet CCD from wallet
- Wait for transaction confirmation (~1-2 minutes)
- Refresh wallet in app

**Bet placement fails:**
- Check sufficient CCD balance in wallet
- Verify limits not exceeded (check RG tools)
- Ensure Python backend is running
- Check browser console for errors

### Backend Issues

**Database initialization fails:**
```bash
# Delete and recreate database
rm gambling.db
python -c "from src.config.database import init_db; init_db()"
```

**Smart contract mode error:**
- If CONTRACT_ADDRESS not set, ensure `SMART_CONTRACT_MODE=mock` in .env
- For production mode, deploy contract first and set CONTRACT_ADDRESS

**CORS errors:**
- Verify CORS middleware is configured in `src/main.py`
- Check `allow_origins` includes frontend URL (http://localhost:5173)

### Smart Contract Issues

**Build fails with "Unknown section id 12":**
- This happens with Rust 1.74+
- Solution: `rust-toolchain` file ensures 1.73.0 is used automatically
- Verify: `rustup show` should show 1.73.0

**Deployment fails:**
- Check concordium-client is installed
- Verify you have sufficient CCD for deployment fees
- Ensure account name exists in concordium-client

**Payout fails:**
- Contract needs CCD balance - send CCD to contract address
- Verify correct owner account is calling payout()
- Check transaction in blockchain explorer

## 🚢 Deployment

### Production Deployment

**Python Backend:**

```bash
# Use production database
export DATABASE_URL="postgresql://user:pass@host/db"

# Deploy to cloud (example with Heroku)
heroku create concordium-gambling-backend
git push heroku main

# Or use Docker
docker build -t gambling-backend python-backend/
docker run -p 8000:8000 --env-file .env gambling-backend
```

**Frontend:**

```bash
cd frontend

# Build for production
npm run build

# Deploy to Vercel/Netlify/etc
npm install -g vercel
vercel deploy

# Or use Docker
docker build -t gambling-frontend .
docker run -p 80:80 gambling-frontend
```

**Smart Contract:**

Deploy to mainnet (⚠️ uses real CCD):

```bash
concordium-client module deploy \
    target/concordium/wasm32-unknown-unknown/release/concordium_gambling_plugin.wasm.v1 \
    --sender <your-account> \
    --grpc-ip node.mainnet.concordium.com \
    --grpc-port 20000
```

### Docker Compose (All Services)

```bash
# Start all services with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## 📖 Detailed Documentation

For comprehensive documentation on each component:

- **Frontend**: See [`frontend/README.md`](frontend/README.md) for React components, wallet integration, and UI details
- **Python Backend**: See [`python-backend/README.md`](python-backend/README.md) for API services, database models, and business logic
- **Smart Contracts**: See [`contracts/README.md`](contracts/README.md) for contract methods, deployment, and Rust details
- **Node Backend**: See [`node-backend/README.md`](node-backend/README.md) for optional blockchain service features

## 🎯 Key Technologies

- **Frontend**: React 18, TypeScript, Vite, @concordium/web-sdk
- **Backend**: Python 3.10+, FastAPI, SQLAlchemy, Uvicorn
- **Smart Contracts**: Rust 1.73.0, concordium-std 10.1, cargo-concordium
- **Blockchain**: Concordium testnet/mainnet, CCD token
- **Database**: SQLite (dev), PostgreSQL (production)
- **Optional**: Node.js 16+, Express, TypeScript

## 🛡️ Security Considerations

- All CCD transactions require wallet approval
- Spending limits enforced before blockchain submission
- Session data tracked server-side (not client-modifiable)
- Smart contract owner-only payout function
- Database uses parameterized queries (SQLAlchemy)
- CORS configured for specific origins
- Environment variables for sensitive configuration

## � Support

- **Concordium Docs**: https://developer.concordium.software/

---

**⚠️ Responsible Gambling Disclaimer:**

This is a demonstration project for educational and hackathon purposes. Gambling can be addictive. If you or someone you know has a gambling problem, please seek help:
- BeGambleAware: https://www.begambleaware.org/
- National Council on Problem Gambling: https://www.ncpgambling.org/