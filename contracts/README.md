# Payout Smart Contract

Automated payout smart contract for gambling winnings on Concordium blockchain.

## Overview

This smart contract ensures trustless, transparent, and automated payouts to gambling winners. When a player wins, the contract automatically transfers the winnings to their Concordium wallet.

## Features

- **Automated Payouts**: Automatic transfer of winnings to winners
- **Transparent**: All payouts recorded on blockchain
- **Trustless**: No manual intervention required
- **Secure**: Only authorized platform can trigger payouts
- **Auditable**: Track total payouts processed

## Contract Functions

### Initialize
```rust
init(owner: AccountAddress) -> State
```
Initializes the contract with the platform owner address.

### Payout
```rust
payout(winner: AccountAddress, amount: Amount, game_id: String)
```
Transfers winnings to the winner's address. Only callable by contract owner.

### View
```rust
view() -> Amount
```
Returns total payouts processed by the contract.

## Building

**Important**: This contract requires Rust 1.73.0 for compatibility with Concordium's build tools. The `rust-toolchain` file in this directory ensures the correct version is used.

Install Rust and cargo-concordium:
```bash
# Install rustup if you haven't already
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install cargo-concordium
cargo install --locked cargo-concordium

# The wasm32 target will be automatically installed when you build
```

Build the contract:
```bash
cargo concordium build
```

The built contract will be in `concordium-out/module.wasm.v1`

### Build Output
- **Module size**: ~26 KB
- **Schema size**: 131 B (embedded)
- **Location**: `concordium-out/module.wasm.v1`

### Verifiable Build (Recommended for Production)
```bash
cargo concordium build --verifiable
```

## Testing

Run tests:
```bash
cargo test
```

## Deployment

Deploy to Concordium testnet:
```bash
concordium-client module deploy payout_contract.wasm.v1 --sender <your-account> --name payout_contract
```

Initialize the contract:
```bash
concordium-client contract init <module-hash> --contract payout_contract --sender <your-account>
```

## Integration with Python Backend

The Python backend's `SmartContractService` calls this contract to process winnings:

```python
# In smart_contract_service.py
result = await contract_service.payout_winnings(
    winner_address="3x...abc",
    amount=100.0,
    game_id="game_123"
)
```

## Security Considerations

1. Only the platform owner can trigger payouts
2. All payouts are recorded on-chain for transparency
3. Contract includes error handling for failed transfers
4. Amount validation ensures valid payout amounts

## Frontend Integration

The frontend calls the Python API which triggers the smart contract:

```javascript
// Process winnings
const response = await fetch('/api/v1/payment/winnings', {
  method: 'POST',
  body: JSON.stringify({
    user_id: 'user123',
    amount: 100.0,
    game_id: 'game_abc'
  })
});
```

The Python backend then calls the smart contract to automatically transfer funds.

## License

MIT
