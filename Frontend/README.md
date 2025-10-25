# Concordium Gambling dApp Frontend

This is the frontend for the Concordium Gambling dApp with integrated wallet connection functionality.

## Features

- **Browser Wallet Connection**: Connect using the Concordium Browser Wallet extension
- **Mobile Wallet Connection**: Connect using Concordium Mobile Wallet via WalletConnect
- **Account Management**: View connected account and disconnect functionality
- **Modern UI**: Beautiful gradient header with responsive design
- **Zero-Knowledge Proof Support**: Integrated support for ZK proof generation (ready for future use)

## Installation

```bash
# Install dependencies
yarn install

# or using npm
npm install
```

## Running the Application

```bash
# Development mode
yarn dev

# or using npm
npm run dev
```

The application will be available at `http://localhost:5173`

## Prerequisites

Before running the application, ensure you have:

1. **Concordium Browser Wallet Extension** (for browser wallet connection)
   - Install from Chrome Web Store or Firefox Add-ons

2. **Concordium Mobile Wallet** (for mobile wallet connection)
   - Download from App Store or Google Play

3. **At least one identity and account** created in your wallet

## Project Structure

```
Frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # Main header component with wallet connection
│   │   └── Header.css          # Header styles
│   ├── context/
│   │   └── WalletContext.tsx   # Wallet state management
│   ├── wallet-connection.tsx   # Wallet provider implementations
│   ├── App.tsx                 # Main app component
│   ├── App.css                 # App styles
│   └── main.tsx                # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## How It Works

### Header Component

The `Header` component provides:
- A gradient header bar with the app title
- A "Connect Wallet" button when disconnected
- Account address display and disconnect button when connected
- A modal for selecting wallet type (Browser or Mobile)

### Wallet Connection Flow

1. **User clicks "Connect Wallet"** → Modal opens with two options
2. **User selects wallet type**:
   - **Browser Wallet**: Opens browser extension prompt
   - **Mobile Wallet**: Displays QR code for mobile app scanning
3. **User approves connection** → Account address appears in header
4. **User can disconnect** → Click the X button next to account

### Wallet Providers

The application implements two wallet providers:

- **BrowserWalletProvider**: For Concordium Browser Wallet extension
- **WalletConnectProvider**: For Concordium Mobile Wallet via WalletConnect

Both providers extend the abstract `WalletProvider` class and implement:
- `connect()`: Establish wallet connection
- `disconnect()`: End wallet connection
- `requestVerifiablePresentation()`: Generate ZK proofs (for future features)

## Configuration

### WalletConnect Project ID

The application uses WalletConnect for mobile wallet connections. The current project ID is included, but you should create your own:

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your project ID
4. Replace in `src/wallet-connection.tsx`:

```typescript
projectId: "YOUR_PROJECT_ID_HERE"
```

### Network Configuration

The application is configured for **testnet** by default. To switch to mainnet:

1. Update in `src/wallet-connection.tsx`:
   - Line with `chains: ["ccd:testnet"]` → `chains: ["ccd:mainnet"]`
   - Line with `chainId: "ccd:testnet"` → `chainId: "ccd:mainnet"`

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Concordium SDK** - Blockchain interaction
- **WalletConnect v2** - Mobile wallet connection
- **Lucide React** - Icons

## Next Steps

With wallet connection in place, you can now:

1. Add smart contract interactions
2. Implement zero-knowledge proof verification
3. Build gambling features (e.g., dice roll, coin flip)
4. Add transaction signing and sending

## Resources

- [Concordium Documentation](https://docs.concordium.com/)
- [Wallet Connectors Tutorial](https://docs.concordium.com/en/mainnet/tutorials/using-ID-in-dApps/wallet-connectors-tutorial.html)
- [Concordium SDK](https://www.npmjs.com/package/@concordium/web-sdk)
- [WalletConnect Documentation](https://docs.walletconnect.com/)

