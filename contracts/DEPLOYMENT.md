# Smart Contract Deployment Guide

This guide explains how to deploy the payout smart contract to the Concordium blockchain.

## Prerequisites

1. **Concordium Wallet**: Set up a Concordium Browser Wallet or Mobile Wallet
   - Browser Wallet: https://chrome.google.com/webstore/detail/concordium-wallet
   - Mobile Wallet: Available on iOS and App Store

2. **Testnet CCD**: Request testnet CCD from your wallet's "Request" option

3. **Rust and Cargo Concordium**: Already installed if you can build the contract

## Building the Contract

```bash
cd contracts
cargo concordium build
```

This creates `concordium-out/module.wasm.v1` - the compiled smart contract.

## Deployment Steps

### Option 1: Using Concordium Client CLI (Most Reliable)

This method works even if web tools are unavailable.

#### Prerequisites
```bash
# Install concordium-client
cargo install --locked concordium-client

# Or download from: https://developer.concordium.software/concordium-client/
```

#### Deploy Module
```bash
cd contracts

# Deploy to testnet
concordium-client module deploy concordium-out/module.wasm.v1 \
  --sender <your-account-address> \
  --grpc-ip node.testnet.concordium.com \
  --grpc-port 20000

# Note the Module Reference from output (e.g., abc123def456...)
```

#### Initialize Contract
```bash
# Initialize the contract instance
concordium-client contract init <module-reference> \
  --contract payout_contract \
  --sender <your-account-address> \
  --grpc-ip node.testnet.concordium.com \
  --grpc-port 20000 \
  --energy 10000

# Note the Contract Index from output (e.g., <1234,0>)
```

### Option 2: Using Browser Wallet + CLI

If you prefer using your browser wallet for signing:

```bash
# Export transaction for wallet signing
concordium-client module deploy concordium-out/module.wasm.v1 \
  --sender <your-account-address> \
  --grpc-ip node.testnet.concordium.com \
  --grpc-port 20000 \
  --out deploy-tx.json

# Then import deploy-tx.json in your Concordium Browser Wallet to sign
```

### Option 3: Using Smart Contract Deploy Tool (When Available)

If the web tool becomes available again:

1. **Access the Deploy Tool**
   - Testnet: https://sctools.testnet.concordium.software/
   - Mainnet: https://sctools.mainnet.concordium.software/
   - **Alternative**: Use the wallet's built-in deployment feature

2. **Connect Your Wallet**
   - Click "Connect to Browser Wallet"
   - Approve the connection request

3. **Deploy Module (Step 1)**
   - Upload `concordium-out/module.wasm.v1`
   - Click "Deploy Module"
   - Approve the transaction in your wallet
   - Wait for confirmation and note the **Module Reference**

4. **Initialize Contract (Step 2)**
   - Select "Derive from step 1"
   - Contract name: `payout_contract`
   - Click "Initialise Contract"
   - Approve the transaction
   - Note the **Contract Index** (e.g., `<1234,0>`)

5. **Save Contract Details**
   - Module Reference: `<your-module-ref>`
   - Contract Index: `<your-contract-index>`
   - Update your backend configuration with these values

### Option 2: Using Concordium Client

```bash
# Deploy the module
concordium-client module deploy \
  concordium-out/module.wasm.v1 \
  --sender <your-account-address> \
  --grpc-ip node.testnet.concordium.com \
  --grpc-port 20000

# Initialize the contract
concordium-client contract init \
  <module-ref> \
  --contract payout_contract \
  --sender <your-account-address> \
  --grpc-ip node.testnet.concordium.com \
  --grpc-port 20000 \
  --energy 10000
```

## Testing the Contract

### Test Payout Function

You can test the payout function using the Smart Contract Tools:

1. Go to Step 3 in the deploy tool
2. Input your contract index
3. Select "Derive From Smart Contract Index"
4. Entry Point: `payout`
5. Parameters (JSON format):
   ```json
   {
     "winner": "<recipient-account-address>",
     "amount": "1000000",
     "game_id": "test_game_123"
   }
   ```
6. Click "Invoke Smart Contract"

### View Total Payouts

1. Entry Point: `view`
2. Click "Read Smart Contract"
3. This returns the total amount paid out

## Integration with Backend

Update your Python backend configuration:

```python
# In src/config/settings.py or .env
SMART_CONTRACT_INDEX = "<your-contract-index>"
SMART_CONTRACT_MODULE_REF = "<your-module-ref>"
```

Update `src/services/smart_contract_service.py`:

```python
class SmartContractService:
    def __init__(self):
        self.contract_index = settings.SMART_CONTRACT_INDEX
        self.contract_address = f"{self.contract_index},0"
        self.contract_name = "payout_contract"
```

## Mainnet Deployment

⚠️ **Important**: Before deploying to mainnet:

1. Thoroughly test on testnet
2. Audit the smart contract code
3. Ensure you have sufficient CCD for deployment fees
4. Use mainnet endpoints:
   - gRPC: `node.mainnet.concordium.com:20000`
   - Deploy Tool: https://sctools.mainnet.concordium.software/

## Security Considerations

1. **Owner Control**: Only the contract owner (initializer) can trigger payouts
2. **Fund Management**: Ensure the contract has sufficient CCD balance
3. **Gas Limits**: Payouts consume energy - ensure adequate limits
4. **Testing**: Always test with small amounts first

## Troubleshooting

### Contract Out of Funds
```bash
# Send CCD to contract
concordium-client contract update \
  <contract-index> \
  --entrypoint payout_contract \
  --parameter-json '{"winner":"<address>","amount":"1000000","game_id":"test"}' \
  --sender <your-account> \
  --energy 10000 \
  --amount 100
```

### Transaction Fails
- Check contract has sufficient balance
- Verify you're the contract owner
- Ensure parameters are correctly formatted
- Check energy limits

## Next Steps

1. Deploy to testnet first
2. Test all functions thoroughly
3. Integrate contract index with backend
4. Monitor contract balance
5. Plan for mainnet deployment

## Resources

- [Concordium Documentation](https://docs.concordium.com)
- [Smart Contract Examples](https://github.com/Concordium/concordium-rust-smart-contracts)
- [Deploy Tool Guide](https://docs.concordium.com/en/mainnet/tutorials/hello-world/hello-world.html)
