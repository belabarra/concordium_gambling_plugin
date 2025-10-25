# Concordium Responsible Gambling Plugin

A comprehensive responsible gambling solution leveraging Concordium blockchain's identity verification and Protocol Level Token (PLT) stablecoin payments.

## 🏗️ Project Architecture

This project consists of two integrated backend services:

### 1. Node.js Backend (Port 3000)
**Purpose**: Concordium blockchain integration layer
- Direct communication with Concordium blockchain
- Identity verification using Concordium IDs
- PLT stablecoin transaction handling
- Smart contract interactions

**Location**: `node-backend/`

### 2. Python Backend (Port 8000)
**Purpose**: Core business logic and responsible gambling features
- User management and authentication
- Session tracking and time limits
- Transaction monitoring and limit enforcement
- Behavioral analytics and risk assessment
- Self-exclusion registry (cross-platform)
- Notification system
- Audit trails and compliance reporting

**Location**: `python-backend/`

## 🔗 Service Integration

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Gambling       │         │  Python Backend  │         │  Node.js        │
│  Platform/User  │ ◄─────► │  (Port 8000)     │ ◄─────► │  Concordium     │
│                 │         │  FastAPI         │         │  Service        │
│                 │         │                  │         │  (Port 3000)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │                            │
                                     │                            │
                                     ▼                            ▼
                            ┌──────────────┐           ┌──────────────────┐
                            │  PostgreSQL/ │           │  Concordium      │
                            │  SQLite DB   │           │  Blockchain      │
                            └──────────────┘           └──────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 16+
- npm or yarn

### Start Both Services

#### 1. Start Node.js Concordium Service

```bash
cd node-backend
npm install
npm run dev
```

Verify: http://localhost:3000/api/health

#### 2. Start Python Backend

```bash
cd python-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Initialize database
python -c "from src.config.database import init_db; init_db()"

# Start server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Verify: http://localhost:8000/api/v1/health

## 📚 API Documentation

- **Python Backend Docs**: http://localhost:8000/docs
- **Python Backend ReDoc**: http://localhost:8000/redoc
- **Node.js Health**: http://localhost:3000/api/health

## 🎯 Key Features

- ✅ Identity-Verified Access (Concordium ID)
- ✅ Spending Limits (Cross-platform)
- ✅ Cool-down Periods
- ✅ Self-Exclusion Registry
- ✅ Secure PLT Payments
- ✅ Real-time Tracking
- ✅ Compliance & Audit
- ✅ Behavioral Analytics
- ✅ Risk Assessment

## 📖 Full Documentation

- Python Backend: See `python-backend/README.md`
- Node.js Backend: See `node-backend/README.md`
- Quick Start: See `python-backend/QUICKSTART.md`

## 🔧 Configuration

See `.env.example` files in each backend directory.

Key settings:
- `CONCORDIUM_SERVICE_URL=http://localhost:3000`
- `DATABASE_URL=sqlite:///./responsible_gambling.db`
- Session limits, cooldown periods, risk thresholds

## 🧪 Testing

```bash
# Python tests
cd python-backend && pytest tests/

# Node.js tests
cd node-backend && npm test
```

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes and add tests
4. Submit a pull request

Built for Concordium Hackathon - Responsible Gambling Challenge 🎰🛡️