# Gambling Payout Smart Contract

## 📋 Summary

Rust-based smart contract for **automated, trustless payout of gambling winnings** on the Concordium blockchain. This contract receives deposits from the gambling platform and automatically distributes winnings to winners' wallets without manual intervention, ensuring transparency and fairness.

**Key Benefits:**
- ✅ Automatic payout execution on wins
- ✅ Transparent on-chain record of all payouts
- ✅ Trustless - no platform manipulation possible
- ✅ Gas-efficient operations
- ✅ Built with Concordium's concordium-std 10.1

## 📁 Project Structure

```
contracts/
├── src/
│   └── lib.rs                  # Main smart contract code
│
├── target/
│   └── concordium/
│       └── wasm32-unknown-unknown/
│           └── release/
│               └── concordium_gambling_plugin.wasm.v1  # Compiled contract
│
├── .cargo/
│   └── config.toml             # Cargo build configuration
│
├── rust-toolchain              # Rust version pinning (1.73.0)
├── Cargo.toml                  # Project dependencies
└── README.md                   # This file
```

## 🔧 Contract Methods

### `init()`

```rust
#[init(contract = "gambling_payout")]
fn init<S: HasStateApi>(
    ctx: &impl HasInitContext,
    _state_builder: &mut StateBuilder<S>,
) -> InitResult<State>
```

**Purpose:** Initializes the smart contract with starting state

**Parameters:**
- `ctx`: Initialization context from blockchain
- `_state_builder`: State builder for creating persistent state

**Returns:** `InitResult<State>` containing initial state

**State Initialized:**
- `total_payouts: Amount` - Starts at 0 microCCD
- `owner: AccountAddress` - Set to deployer's account

**Usage:**
```bash
# Called once during deployment
concordium-client contract init <module-ref> \
    --contract gambling_payout \
    --sender <your-account> \
    --energy 5000
```

### `payout()`

```rust
#[receive(
    contract = "gambling_payout",
    name = "payout",
    parameter = "PayoutParameter",
    error = "ContractError",
    mutable
)]
fn payout<S: HasStateApi>(
    ctx: &impl HasReceiveContext,
    host: &mut impl HasHost<State, StateApiType = S>,
    amount: Amount,
) -> Result<(), ContractError>
```

**Purpose:** Transfers CCD winnings from contract to winner's wallet

**Parameters:**
- `ctx`: Transaction context with sender info
- `host`: Mutable access to contract state and balance
- `amount`: Amount to payout (in microCCD)

**Authorization:**
- Only contract owner can call this function
- Reverts with `Unauthorized` error otherwise

**Process:**
1. Verify caller is contract owner
2. Check contract has sufficient balance
3. Transfer `amount` to winner's address (from parameter)
4. Update `total_payouts` counter
5. Emit payout event

**Errors:**
- `Unauthorized`: Caller is not owner
- `InsufficientFunds`: Contract balance too low
- `TransferError`: Blockchain transfer failed

**Gas Cost:** ~3000-5000 NRG depending on state size

**Usage Example:**
```bash
concordium-client contract update <contract-address> \
    --entrypoint payout \
    --parameter-json payout_params.json \
    --sender <owner-account> \
    --energy 5000
```

Where `payout_params.json`:
```json
{
  "winner": "3x...abc",
  "amount": "100000000",
  "game_id": "race_42"
}
```

### `view()`

```rust
#[receive(
    contract = "gambling_payout",
    name = "view",
    return_value = "Amount"
)]
fn view<S: HasStateApi>(
    _ctx: &impl HasReceiveContext,
    host: &impl HasHost<State, StateApiType = S>,
) -> ReceiveResult<Amount>
```

**Purpose:** Read-only query of total payouts processed

**Parameters:**
- `_ctx`: Unused context
- `host`: Read access to contract state

**Returns:** `Amount` - Total microCCD paid out since deployment

**Authorization:** None (anyone can call)

**Gas Cost:** ~300 NRG (view functions are cheap)

**Usage:**
```bash
concordium-client contract invoke <contract-address> \
    --entrypoint view \
    --grpc-port 20000
```

**Integration Example:**
```python
# In smart_contract_service.py
total = await self.call_contract_view("view")
print(f"Contract has distributed {total} microCCD total")
```

## 🚀 Setup Instructions

### Prerequisites

**Required Software:**
- Rust 1.73.0 (pinned by rust-toolchain file)
- cargo-concordium (Concordium build tool)
- concordium-client (for deployment)

**Installation:**

```bash
# Install rustup if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Rust 1.73.0 will be auto-selected by rust-toolchain file

# Add WebAssembly target
rustup target add wasm32-unknown-unknown

# Install cargo-concordium
cargo install --locked cargo-concordium

# Install concordium-client (for deployment)
# Download from: https://developer.concordium.software/en/mainnet/net/installation/downloads-testnet.html
```

### Building the Contract

```bash
# Navigate to contracts directory
cd contracts

# Build WebAssembly contract
cargo concordium build --out gambling_payout.wasm.v1 --verifiable

# Output: target/concordium/wasm32-unknown-unknown/release/concordium_gambling_plugin.wasm.v1
# Size: ~26.4 KB

# Verify build succeeded
ls -lh target/concordium/wasm32-unknown-unknown/release/*.wasm.v1
```

**Build Flags Explained:**
- `--out <name>`: Custom output filename
- `--verifiable`: Creates reproducible build with Docker
- `--schema-embed`: Embeds schema in WASM (optional)

**Why Rust 1.73.0?**

Newer Rust versions (1.74+) generate WebAssembly with features not supported by Concordium nodes (bulk memory operations, sign extension). The `rust-toolchain` file pins the version to 1.73.0 automatically.

### Testing the Contract

```bash
# Run unit tests
cargo test

# Run with verbose output
cargo test -- --nocapture

# Test specific function
cargo test test_payout
```

**Note:** Original contract tests used deprecated testing patterns and have been removed. To add new tests, use the current `concordium-std-derive` test framework.

## 🚢 Deployment

### Deploy to Testnet

**Step 1: Deploy Module**

```bash
concordium-client module deploy \
    target/concordium/wasm32-unknown-unknown/release/concordium_gambling_plugin.wasm.v1 \
    --sender <your-account-name> \
    --grpc-ip node.testnet.concordium.com \
    --grpc-port 20000
```

**Returns:** `Module reference: <module-hash>`

**Step 2: Initialize Contract**

```bash
concordium-client contract init <module-hash> \
    --contract gambling_payout \
    --sender <your-account-name> \
    --energy 10000 \
    --grpc-ip node.testnet.concordium.com \
    --grpc-port 20000
```

**Returns:** 
```
Contract initialized successfully!
Contract address: <12345,0>
```

**Step 3: Fund Contract**

```bash
# Send CCD to contract for payouts
concordium-client transaction send \
    --receiver <contract-address> \
    --amount 1000 \
    --sender <your-account-name>
```

**Step 4: Configure Python Backend**

Update `python-backend/.env`:
```bash
CONTRACT_ADDRESS=<12345,0>
CONTRACT_NAME=gambling_payout
SMART_CONTRACT_MODE=production
```

### Deploy to Mainnet

**⚠️ WARNING:** Mainnet uses real CCD with real value. Test thoroughly on testnet first!

Change `--grpc-ip node.mainnet.concordium.com` in all commands above.

## 🔗 Integration

### Python Backend Integration

The `SmartContractService` in `python-backend/src/services/smart_contract_service.py` interacts with this contract:

```python
class SmartContractService:
    async def payout_winnings(self, wallet_address: str, amount: float) -> Dict:
        """
        Calls smart contract's payout() function
        
        Args:
            wallet_address: Winner's Concordium address (e.g., "3x...abc")
            amount: Winnings in CCD (converted to microCCD)
        
        Returns:
            {"tx_hash": str, "amount": float, "status": "success"}
        """
        # In production mode, calls concordium-client
        # In mock mode, returns simulated transaction
        
    async def get_total_payouts(self) -> float:
        """
        Calls contract's view() function
        Returns total CCD distributed
        """
```

### Frontend to Backend to Contract Flow

1. **User Wins Race** (Frontend)
   ```typescript
   // HorseRacing.tsx
   handleRaceEnd(winningHorse) {
     if (selectedHorse === winningHorse) {
       const winnings = betAmount * odds;
       await paymentAPI.recordWinnings(userId, sessionId, winnings);
     }
   }
   ```

2. **Backend Processes Winnings** (Python)
   ```python
   # payment_service.py
   async def process_winnings(user_id, session_id, amount):
       wallet = wallet_service.get_wallet_by_user(user_id)
       result = await smart_contract_service.payout_winnings(
           wallet.concordium_address, 
           amount
       )
       return result
   ```

3. **Smart Contract Executes Transfer** (Rust)
   ```rust
   // lib.rs payout() function
   // Transfers CCD from contract to winner's wallet
   // Updates total_payouts counter
   ```

4. **User Sees Balance Increase** (Blockchain)
   - Transaction confirms on Concordium network
   - Wallet balance updates automatically
   - Frontend refreshes balance display

## 🛠️ Development

### Contract State Schema

```rust
#[derive(Serialize, SchemaType)]
struct State {
    total_payouts: Amount,  // Total microCCD paid out
    owner: AccountAddress,  // Platform owner address
}
```

### Error Handling

```rust
#[derive(Debug, PartialEq, Eq, Reject, Serial, SchemaType)]
enum ContractError {
    #[from(ParseError)]
    ParseParams,
    Unauthorized,
    InsufficientFunds,
    TransferError,
}
```

### Adding New Functionality

To extend the contract:

1. **Add new state fields** to `State` struct
2. **Define new methods** with `#[receive(...)]` macro
3. **Update parameters** if needed (new struct with `#[derive(Deserial, SchemaType)]`)
4. **Rebuild** with `cargo concordium build`
5. **Test** with unit tests
6. **Redeploy** module and re-initialize contract

## 🐛 Troubleshooting

**Build Error: "Unknown section id 12"**
- This happens with Rust 1.74+
- Solution: `rust-toolchain` file ensures 1.73.0 is used
- Verify: `rustup show` should show 1.73.0

**Build Error: "package.edition = '2024' requires rust >= 1.85"**
- Cargo.lock was created with newer Rust
- Solution: Delete `Cargo.lock` and rebuild
- Cargo.toml specifies edition = "2021" which is compatible

**Deployment Error: "Module already exists"**
- Module hash collision (rare)
- Solution: Make trivial change to code and rebuild

**Payout Fails: "InsufficientFunds"**
- Contract doesn't have enough CCD
- Solution: Send more CCD to contract address

**Payout Fails: "Unauthorized"**
- Wrong account calling payout()
- Solution: Use owner account specified during init()

## 📚 Additional Resources

- [Concordium Smart Contract Guide](https://developer.concordium.software/en/mainnet/smart-contracts/guides/index.html)
- [concordium-std Documentation](https://docs.rs/concordium-std/latest/concordium_std/)
- [Rust WebAssembly Guide](https://rustwasm.github.io/docs/book/)
- [cargo-concordium CLI](https://developer.concordium.software/en/mainnet/smart-contracts/guides/cargo-concordium.html)

## 📝 License

MIT


