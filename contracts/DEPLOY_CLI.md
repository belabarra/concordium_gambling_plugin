# Quick Deployment Guide - Smart Contract

## Problem: Web Tools Not Available

The Concordium testnet web tools (https://sctools.testnet.concordium.software/) are currently unavailable. Here are alternative methods.

## ✅ Recommended: Deploy Using Concordium Client

### Step 1: Install Concordium Client

```bash
# Install via Cargo (requires Rust)
cargo install --locked concordium-client

# Verify installation
concordium-client --version
```

### Step 2: Get Your Account Address

From your Concordium Browser Wallet:
1. Open wallet
2. Click on account
3. Copy account address (e.g., `4Zx7aBcD...`)

### Step 3: Deploy the Module

```bash
cd /Users/isabelabarra/Desktop/Projects💫/concordium_gambling_plugin/contracts

# Deploy to testnet
concordium-client module deploy concordium-out/module.wasm.v1 \
  --sender YOUR_ACCOUNT_ADDRESS \
  --grpc-ip node.testnet.concordium.com \
  --grpc-port 20000
```

**Expected Output:**
```
Module successfully deployed with reference: abc123def456...
Transaction hash: xyz789...
```

**Save the Module Reference!** (e.g., `abc123def456...`)

### Step 4: Initialize Contract

```bash
concordium-client contract init MODULE_REFERENCE \
  --contract payout_contract \
  --sender YOUR_ACCOUNT_ADDRESS \
  --grpc-ip node.testnet.concordium.com \
  --grpc-port 20000 \
  --energy 10000
```

**Expected Output:**
```
Contract successfully initialized with address: <1234,0>
Transaction hash: def456...
```

**Save the Contract Index!** (e.g., `<1234,0>`)

### Step 5: Configure Backend

```bash
cd ../python-backend

# Edit .env file
nano .env  # or use your preferred editor

# Add this line:
SMART_CONTRACT_INDEX=<1234,0>
```

Replace `<1234,0>` with your actual contract index.

### Step 6: Test Contract

```bash
# View total payouts (should be 0 initially)
concordium-client contract invoke <1234,0> \
  --entrypoint view \
  --grpc-ip node.testnet.concordium.com \
  --grpc-port 20000
```

## Alternative Method: Using Browser Wallet

If you prefer signing with your browser wallet:

### 1. Generate Transaction File

```bash
concordium-client module deploy concordium-out/module.wasm.v1 \
  --sender YOUR_ACCOUNT_ADDRESS \
  --grpc-ip node.testnet.concordium.com \
  --grpc-port 20000 \
  --out deploy-transaction.json
```

### 2. Sign in Browser Wallet

1. Open Concordium Browser Wallet
2. Go to Settings → Import Transaction
3. Upload `deploy-transaction.json`
4. Review and sign
5. Note the module reference from confirmation

### 3. Initialize Contract

Repeat the same process for initialization:
```bash
concordium-client contract init MODULE_REFERENCE \
  --contract payout_contract \
  --sender YOUR_ACCOUNT_ADDRESS \
  --grpc-ip node.testnet.concordium.com \
  --grpc-port 20000 \
  --energy 10000 \
  --out init-transaction.json
```

Then import and sign in wallet.

## Testing Without Deploying

Your system already works in **mock mode**! The backend will simulate payouts until you deploy the real contract.

To test everything:

```bash
# Terminal 1: Backend
cd python-backend
python -m uvicorn src.main:app --reload

# Terminal 2: Frontend
cd Frontend
npm run dev
```

Then:
1. Connect wallet
2. Place a bet
3. Win the race
4. Backend processes payout (mock mode)
5. You'll see transaction hash in logs

## When to Deploy for Real

Deploy the actual smart contract when:
- ✅ You've tested the full flow in mock mode
- ✅ You have testnet CCD in your wallet
- ✅ You're ready to test with real blockchain transactions
- ✅ You want to verify the complete integration

## Mainnet Deployment (Production)

For production deployment to mainnet:

```bash
# Use mainnet endpoints
concordium-client module deploy concordium-out/module.wasm.v1 \
  --sender YOUR_ACCOUNT_ADDRESS \
  --grpc-ip node.mainnet.concordium.com \
  --grpc-port 20000
```

**Important for Mainnet:**
- Create verifiable build first: `cargo concordium build --verifiable`
- Audit the contract thoroughly
- Test extensively on testnet
- Have sufficient CCD for deployment and operation
- Consider security review

## Troubleshooting

### "Account not found"
- Ensure you're using testnet account
- Request testnet CCD from wallet's "Request" option

### "Insufficient funds"
- Module deployment costs ~1 CCD
- Contract initialization costs ~0.1 CCD
- Request more testnet CCD from wallet

### "Connection refused"
- Check internet connection
- Verify gRPC endpoint: `node.testnet.concordium.com:20000`
- Try different network

### CLI Not Found
```bash
# Install concordium-client
cargo install --locked concordium-client

# Or download binary from:
# https://developer.concordium.software/concordium-client/
```

## Summary

You don't need the web tools! The CLI method is:
- ✅ More reliable
- ✅ Scriptable
- ✅ Works offline (after install)
- ✅ Professional workflow

Your smart contract is ready to deploy whenever you want. For now, mock mode works perfectly for testing the complete integration!
