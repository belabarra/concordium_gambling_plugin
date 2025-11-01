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

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # React components
│   │   ├── Header.tsx          # Main navigation header with wallet
│   │   ├── Header.css          # Header styles
│   │   ├── HorseRacing.tsx     # Main horse racing game component
│   │   ├── HorseRacing.css     # Racing game styles
│   │   ├── ResponsibleGamblingTools.tsx  # RG settings interface
│   │   └── ResponsibleGamblingTools.css  # RG tools styles
│   │
│   ├── context/                 # React Context providers
│   │   ├── WalletContext.tsx   # Wallet state management
│   │   ├── ResponsibleGamblingContext.tsx  # RG state management
│   │   └── PaymentContext.tsx  # Payment state (if used)
│   │
│   ├── services/                # API client services
│   │   └── api.ts              # Backend API methods
│   │
│   ├── App.tsx                  # Main app with navigation
│   ├── App.css                  # Global app styles
│   ├── main.tsx                 # Entry point
│   ├── wallet-connection.tsx    # Wallet provider implementations
│   └── vite-env.d.ts           # TypeScript definitions
│
├── public/                      # Static assets
├── index.html                   # HTML template
├── package.json                 # Dependencies
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
└── README.md                    # This file
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

## 🔧 Component Documentation

### HorseRacing.tsx - Main Game Component

**Key Methods:**

- **`initializeUser()`**
  ```typescript
  // Registers user in backend, creates wallet record
  // Called when user first accesses with wallet connected
  // Stores user_id in localStorage for subsequent sessions
  ```

- **`placeBet(horseIndex: number, betAmount: number)`**
  ```typescript
  // 1. Checks responsible gambling limits via API
  // 2. Sends CCD transaction to backend wallet
  // 3. Records bet in database
  // 4. Updates local state
  // Throws error if limits exceeded or insufficient balance
  ```

- **`startRace()`**
  ```typescript
  // Initiates animation where horses move randomly
  // Determines winner based on fastest to finish
  // Calls handleRaceEnd() when complete
  ```

- **`handleRaceEnd(winningHorse: number)`**
  ```typescript
  // 1. Checks if user's bet matches winner
  // 2. Calculates winnings (bet_amount * odds)
  // 3. Calls recordWinnings API to transfer CCD back to user wallet
  // 4. Updates UI with result message
  // 5. Resets game state
  ```

- **`sendTransaction(amount: bigint)`**
  ```typescript
  // Sends CCD transaction to backend wallet using Concordium SDK
  // Returns transaction hash on success
  // Handles wallet approval process
  ```

**State Management:**
- `horses`: Array of race participants with positions
- `selectedHorse`: User's bet selection
- `raceInProgress`: Boolean for race animation
- `winner`: Index of winning horse
- `balance`: User's current CCD balance from blockchain

### ResponsibleGamblingTools.tsx - RG Settings

**Key Methods:**

- **`loadCurrentLimits()`**
  ```typescript
  // Fetches user's current limits from backend
  // Populates form with existing values
  // Shows error if backend unreachable
  ```

- **`handleSetLimit(limitType: string)`**
  ```typescript
  // Updates a specific limit (daily/weekly/monthly/session)
  // Validates amount is positive
  // Calls backend API to persist change
  // Updates local state on success
  ```

- **`handleCooldownToggle()`**
  ```typescript
  // Enables/disables cool-down period between bets
  // Calls backend to update user preferences
  // Shows confirmation message
  ```

- **`handleRequestExclusion(duration: number)`**
  ```typescript
  // Initiates self-exclusion for specified days
  // Locks user out of gambling features
  // Requires confirmation dialog
  // Calls backend exclusion API
  ```

**State Management:**
- `dailyLimit, weeklyLimit, monthlyLimit`: Spending limits
- `sessionTimeLimit`: Max session duration in minutes
- `cooldownEnabled`: Whether to enforce waiting between bets
- `excludedUntil`: Date when self-exclusion ends

### WalletContext.tsx - Wallet State

**Key Methods:**

- **`connect()`**
  ```typescript
  // Initiates wallet connection flow
  // Requests account access from browser wallet
  // Stores connected account in state
  // Triggers balance update
  ```

- **`disconnect()`**
  ```typescript
  // Clears wallet connection
  // Resets account and balance state
  // Returns to disconnected UI state
  ```

- **`updateBalance()`**
  ```typescript
  // Queries blockchain for current account balance
  // Updates balance state with live data
  // Called after transactions complete
  ```

**State Provided:**
- `account`: Connected Concordium account address
- `balance`: Current CCD balance (microCCD units)
- `isConnected`: Boolean connection status
- `network`: Current network (mainnet/testnet)

### ResponsibleGamblingContext.tsx - RG State

**State Provided:**
- `limits`: Object containing all limit values
- `currentSpending`: Tracked spending for current period
- `sessionStartTime`: When current session began
- `isExcluded`: Boolean if self-excluded
- `updateLimit()`: Method to change limits
- `checkLimit()`: Method to validate bet against limits

## 🛠️ Technology Stack

- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **@concordium/web-sdk** - Blockchain interactions
- **@concordium/react-components** - Pre-built wallet components
- **WalletConnect v2** - Mobile wallet connection
- **Lucide React** - Icon library
- **CSS3** - Custom styling (no framework)

## 🌐 API Integration

All backend calls are in `src/services/api.ts`:

```typescript
// User management
registerUser(walletAddress, name, email)
getUserProfile(userId)

// Betting
placeBet(userId, horseIndex, betAmount)
recordWinnings(userId, sessionId, winnings)

// Responsible gambling
setLimit(userId, limitType, amount)
checkLimit(userId, betAmount)
requestExclusion(userId, duration)
```

API base URL: `http://localhost:8000/api/v1`

## ⚙️ Configuration

### WalletConnect Project ID

For mobile wallet connections, create your own WalletConnect project:

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
   - `chains: ["ccd:testnet"]` → `chains: ["ccd:mainnet"]`
   - `chainId: "ccd:testnet"` → `chainId: "ccd:mainnet"`

## 🐛 Troubleshooting

**Wallet won't connect:**
- Ensure browser wallet extension is installed
- Check wallet is unlocked
- Try refreshing page and reconnecting

**Balance shows as 0:**
- Verify you're on testnet
- Request testnet CCD from wallet
- Check blockchain explorer for transactions

**Bet placement fails:**
- Check you have sufficient CCD balance
- Verify limits haven't been exceeded (check RG tools)
- Ensure backend is running on port 8000
- Check browser console for specific errors

**Backend connection error:**
- Verify Python backend is running (`uvicorn src.main:app --reload`)
- Check CORS settings in backend allow localhost:5173
- Verify API_BASE_URL in .env matches backend port

**Transaction pending forever:**
- Check Concordium network status
- Verify transaction in wallet history
- Transaction may need 1-2 minutes for blockchain confirmation

## 🚢 Building and Deployment

### Production Build

```bash
# Create optimized production bundle
npm run build

# Output will be in build/ directory
# Contains minified HTML, CSS, JS, and assets
```

### Docker Deployment

```bash
# Build Docker image
docker build -t concordium-gambling-frontend .

# Run container
docker run -p 80:80 concordium-gambling-frontend

# Access at http://localhost
```

### Environment Variables for Production

```bash
# .env.production
REACT_APP_API_BASE_URL=https://your-backend-domain.com/api/v1
```

## 📝 Development Notes

- All CCD amounts are in microCCD (1 CCD = 1,000,000 microCCD)
- Transactions require user approval in wallet
- Balance updates happen after blockchain confirmation
- Session management is automatic (starts on first bet)
- Limits are enforced before transaction submission
- Race animations use requestAnimationFrame for smooth rendering
- Wallet state persists in React Context across component rerenders

## 📚 Resources

- [Concordium Documentation](https://docs.concordium.com/)
- [Wallet Connectors Tutorial](https://docs.concordium.com/en/mainnet/tutorials/using-ID-in-dApps/wallet-connectors-tutorial.html)
- [Concordium Web SDK](https://www.npmjs.com/package/@concordium/web-sdk)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
- [React Context API](https://react.dev/reference/react/useContext)

