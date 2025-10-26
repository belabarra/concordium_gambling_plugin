# Quick Start Guide

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **Python** (v3.9+) - [Download](https://www.python.org/)
3. **PostgreSQL** (v14+) - [Download](https://www.postgresql.org/)
4. **Concordium Wallet** - [Chrome Extension](https://chrome.google.com/webstore/detail/concordium-wallet)

## 5-Minute Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone repository
git clone https://github.com/yourusername/concordium_gambling_plugin.git
cd concordium_gambling_plugin

# Install Python backend dependencies
cd python-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Install Node.js backend dependencies
cd node-backend
npm install
cd ..

# Install Frontend dependencies
cd Frontend
npm install
cd ..
```

### Step 2: Configure Environment

```bash
# Python Backend
cd python-backend
cp .env.example .env
# Edit .env with your database credentials

# Frontend
cd ../Frontend
cp .env.example .env
# Defaults should work for local development

cd ..
```

### Step 3: Setup Database

```bash
# Create database
createdb responsible_gambling

# Or using psql:
psql -U postgres -c "CREATE DATABASE responsible_gambling;"
```

### Step 4: Start Services

#### Option A: Automated Script (Recommended)

```bash
chmod +x start.sh
./start.sh
```

#### Option B: Manual Start

Terminal 1 - Python Backend:
```bash
cd python-backend
source venv/bin/activate
uvicorn src.main:app --reload --port 8000
```

Terminal 2 - Node.js Backend:
```bash
cd node-backend
npm run dev
```

Terminal 3 - Frontend:
```bash
cd Frontend
npm start
```

### Step 5: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

### Step 6: Connect Wallet

1. Install Concordium Wallet browser extension
2. Create or import a wallet
3. Switch to TestNet
4. Click "Connect Wallet" in the application
5. Approve the connection

## Verify Installation

Test the integration:

1. **Connect Wallet** ✓
2. **Deposit funds** (test with small amount) ✓
3. **Play a game** ✓
4. **Set a spending limit** ✓
5. **Check payment history** ✓

## Common Issues

### Database Connection Error
```
Solution: Check DATABASE_URL in python-backend/.env
Ensure PostgreSQL is running: pg_ctl status
```

### Frontend Can't Connect to Backend
```
Solution: Verify backend is running on port 8000
Check REACT_APP_API_BASE_URL in Frontend/.env
```

### Wallet Connection Fails
```
Solution: Ensure Concordium Wallet extension is installed
Switch wallet to TestNet
Refresh the page and try again
```

### Port Already in Use
```
Solution: Kill process using the port
# On Mac/Linux:
lsof -ti:8000 | xargs kill -9

# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

## Getting Test Tokens

1. Join [Concordium Discord](https://discord.com/invite/xWmQ5tp)
2. Request TestNet tokens in #faucet channel
3. Provide your wallet address
4. Tokens will be sent within a few minutes

## Next Steps

- Read the [Integration Guide](./INTEGRATION_GUIDE.md)
- Explore the [API Documentation](http://localhost:8000/docs)
- Review [Responsible Gambling Features](./README.md#responsible-gambling-features)
- Check out the [Smart Contract](./contracts/README.md)

## Need Help?

- 📖 Documentation: See README.md
- 🐛 Issues: GitHub Issues
- 💬 Community: Concordium Discord
- 📧 Email: support@example.com

## Quick Commands

```bash
# Start all services
./start.sh

# Stop all services (Docker)
docker-compose down

# View logs (Docker)
docker-compose logs -f

# Restart Python backend
cd python-backend && uvicorn src.main:app --reload

# Run tests
cd python-backend && pytest
cd Frontend && npm test

# Build for production
cd Frontend && npm run build
cd python-backend && docker build -t gambling-backend .
```

---

**Ready to go!** 🚀

Your responsible gambling platform with Concordium integration is now running locally.
