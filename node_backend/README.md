# Node.js Backend - Concordium Blockchain Service

## 📋 Summary

**Optional** Node.js/TypeScript backend server for advanced Concordium blockchain integration. This service provides supplementary blockchain functionality that complements the Python backend. It can handle:

- Advanced Concordium identity verification
- Direct blockchain node interactions
- Transaction monitoring and webhooks
- Smart contract event subscriptions
- Custom RPC method implementations

**Note:** This backend is **optional**. The main Python backend (`python_backend/`) handles all core application logic. Use this Node.js service only if you need advanced blockchain features not available in the Python backend.

## 🎯 When to Use This Backend

Use this Node.js backend if you need:

- Real-time blockchain event listening
- Complex smart contract interactions requiring Node.js libraries
- Integration with Node.js-specific Concordium tools
- Microservices architecture with dedicated blockchain service
- WebSocket connections for live blockchain updates

**Skip this backend if:**
- You only need basic wallet connections (Frontend handles this)
- Standard payment processing is sufficient (Python backend has this)
- You want simpler deployment (fewer services to manage)

## 📁 Project Structure

```
node_backend/
├── src/
│   ├── server.ts                 # Express server entry point
│   ├── controllers/              # Request handlers
│   │   ├── blockchainController.ts   # Blockchain operations
│   │   ├── identityController.ts     # Identity verification
│   │   └── contractController.ts     # Smart contract calls
│   │
│   ├── models/                   # TypeScript interfaces
│   │   ├── Transaction.ts
│   │   ├── Identity.ts
│   │   └── Contract.ts
│   │
│   ├── services/                 # Business logic
│   │   ├── concordiumService.ts  # Concordium SDK wrapper
│   │   ├── eventListener.ts      # Blockchain event monitoring
│   │   └── webhookService.ts     # Webhook notifications
│   │
│   └── view/                     # Response formatters
│       └── responseFormatter.ts
│
├── dist/                         # Compiled JavaScript (generated)
├── .env                          # Environment configuration
├── tsconfig.json                 # TypeScript configuration
├── nodemon.json                  # Dev server config
├── Dockerfile                    # Container definition
└── package.json                  # Dependencies
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 16+ and npm
- TypeScript knowledge (for development)
- Concordium node access (optional: use public node)
- Python backend running (for full system functionality)

### Installation

```bash
# Navigate to node_backend directory
cd node_backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### Environment Configuration

Create `.env` file:

```bash
# Server
PORT=3000
NODE_ENV=development

# Concordium
CONCORDIUM_NODE_URL=http://node.testnet.concordium.com
CONCORDIUM_NODE_PORT=20000
CONCORDIUM_NETWORK=testnet

# Smart Contract (if deployed)
CONTRACT_ADDRESS=<your_contract_address>
CONTRACT_NAME=gambling_payout

# Integration
PYTHON_BACKEND_URL=http://localhost:8000
WEBHOOK_SECRET=your_webhook_secret_here

# Logging
LOG_LEVEL=info
```

### Running the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
# Build TypeScript
npm run build

# Start server
npm start
```

**With Docker:**
```bash
# Build image
docker build -t concordium-node-backend .

# Run container
docker run -p 3000:3000 --env-file .env concordium-node-backend
```

## 📡 API Endpoints

### Health & Status
- `GET /` - Welcome message and server status
- `GET /api/health` - Health check with blockchain connection status

### Blockchain Operations (if implemented)
- `GET /api/blockchain/block/:height` - Get block details
- `GET /api/blockchain/transaction/:hash` - Get transaction details
- `POST /api/blockchain/verify-transaction` - Verify transaction on-chain

### Identity Verification (if implemented)
- `POST /api/identity/verify` - Verify Concordium identity attributes
- `GET /api/identity/:address` - Get identity information

### Smart Contract Integration (if implemented)
- `POST /api/contract/invoke` - Invoke contract method
- `GET /api/contract/view/:method` - Call contract view function
- `POST /api/contract/subscribe` - Subscribe to contract events

## 🔧 Server Documentation

### server.ts - Main Express Application

**Key Components:**

- **`app: Express`**
  ```typescript
  // Express application instance
  // Configures middleware: CORS, JSON parsing, logging
  // Mounts route handlers
  ```

- **`setupMiddleware()`**
  ```typescript
  // Configures Express middleware
  // - CORS for cross-origin requests
  // - JSON body parser
  // - Request logging
  // - Error handling
  ```

- **`setupRoutes()`**
  ```typescript
  // Registers API route handlers
  // - Health check routes
  // - Blockchain operation routes
  // - Identity verification routes
  // - Contract interaction routes
  ```

- **`startServer(port: number)`**
  ```typescript
  // Starts HTTP server on specified port
  // Initializes Concordium connection
  // Sets up graceful shutdown handlers
  ```

### concordiumService.ts - Blockchain Client (if implemented)

**Key Methods:**

- **`connectToNode()`**
  ```typescript
  // Establishes connection to Concordium gRPC node
  // Verifies node reachability
  // Returns client instance
  ```

- **`getAccountBalance(address: string)`**
  ```typescript
  // Queries blockchain for account balance
  // Returns balance in microCCD
  ```

- **`sendTransaction(params: TxParams)`**
  ```typescript
  // Submits transaction to blockchain
  // Signs with provided keys
  // Returns transaction hash
  ```

- **`getTransactionStatus(hash: string)`**
  ```typescript
  // Checks if transaction is finalized
  // Returns status: pending/finalized/rejected
  ```

### eventListener.ts - Event Monitoring (if implemented)

**Key Methods:**

- **`subscribeToContractEvents(contractAddress: string)`**
  ```typescript
  // Listens for smart contract events
  // Calls webhook when events detected
  // Returns subscription handle
  ```

- **`monitorAccountActivity(address: string)`**
  ```typescript
  // Watches for transactions to/from address
  // Notifies Python backend of activity
  ```

## 🛠️ Technology Stack

- **Node.js 16+** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **@concordium/web-sdk** - Concordium blockchain SDK
- **nodemon** - Development auto-reload
- **winston** - Logging (if implemented)

## 🔗 Integration with Python Backend

This Node.js service can complement the Python backend:

**Python Backend Handles:**
- User management and authentication
- Payment processing and wallet management
- Responsible gambling logic and limits
- Database operations
- REST API for frontend

**Node.js Backend Handles:**
- Real-time blockchain monitoring
- Complex Concordium SDK operations
- WebSocket connections
- Event-driven updates

**Communication:**
- Node.js calls Python backend REST API for user data
- Python backend can call Node.js for blockchain queries
- Both services can publish events to shared message queue (future)

## 📝 Development Notes

- This service is **optional** and can be omitted for simpler deployments
- All TypeScript code compiles to JavaScript in `dist/` folder
- Use `nodemon` for automatic reloading during development
- Implement controllers as needed for specific blockchain features
- Add tests in `tests/` directory (not yet created)

## 🐛 Troubleshooting

**Server won't start:**
- Check PORT is not already in use (`lsof -i :3000`)
- Verify Node.js version is 16+ (`node --version`)
- Check TypeScript compiled successfully (`npm run build`)

**Cannot connect to Concordium node:**
- Verify CONCORDIUM_NODE_URL is correct
- Check network connectivity to node
- Try using public node: `http://node.testnet.concordium.com:20000`

**TypeScript compilation errors:**
- Run `npm install` to ensure dependencies are installed
- Check `tsconfig.json` for correct settings
- Verify TypeScript version (`npx tsc --version`)

## 🚢 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production` in environment
- [ ] Use environment variables for all secrets
- [ ] Configure proper logging level
- [ ] Set up reverse proxy (nginx/Apache)
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Set up monitoring and health checks
- [ ] Configure process manager (PM2 recommended)

### Using PM2 for Production

```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start dist/server.js --name concordium-node_backend

# Configure auto-restart on crashes
pm2 startup
pm2 save
```

## 📚 Scripts Reference

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled server (production)
- `npm run dev` - Run with hot reload (development)
- `npm run watch` - Watch TypeScript files and recompile
- `npm run clean` - Remove dist folder
- `npm test` - Run tests (if implemented)

## 📖 Additional Resources

- [Concordium Node SDK](https://www.npmjs.com/package/@concordium/web-sdk)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Concordium Developer Portal](https://developer.concordium.software/)
