# Responsible Gambling Tool and Services

A comprehensive backend service for responsible gambling using Concordium blockchain's identity verification and Protocol Level Token (PLT) stablecoin payments. This system helps gambling platforms prevent addiction, enforce spending limits, and maintain regulatory compliance across multiple platforms.

## Project Overview

This project is a backend service for a responsible gambling tool designed to help users manage their gambling activities. It includes features for user data storage, transaction tracking, limit enforcement, and self-exclusion management. The service also integrates with an existing Node.js service for Concordium blockchain verification.

## Key Features

### Core Features
- **User Management**: Register, retrieve, and update user data with Concordium identity verification
- **Transaction Tracking**: Record and monitor user transactions across platforms
- **Limit Enforcement**: Enforce spending limits based on user-defined thresholds
- **Cooldown Management**: Manage cool-down periods to restrict gambling activities
- **Self-Exclusion Registry**: Cross-platform self-exclusion system
- **Blockchain Integration**: Verify user identities and transactions with Concordium

### Advanced Features
- **Session Management**: Track gambling sessions with time limits and mandatory breaks
- **Behavioral Analytics**: Analyze user patterns and calculate risk scores
- **Risk Assessment**: Identify users showing concerning gambling patterns
- **Notification System**: Proactive alerts and wellness reminders
- **Reality Checks**: Periodic session summaries during gameplay
- **Audit Trail**: Comprehensive logging for regulatory compliance
- **Operator Dashboard**: Analytics and compliance reporting for platforms
- **Multi-Currency Support**: Handle different Concordium PLT stablecoins

## Project Structure

```
python-backend
├── src
│   ├── main.py                  # Entry point of the application
│   ├── config                   # Configuration settings
│   │   ├── settings.py         # Application settings
│   │   └── database.py         # Database configuration
│   ├── api                      # API routes and middleware
│   │   ├── routes.py           # FastAPI routes
│   │   └── middleware.py       # API middleware
│   ├── services                 # Business logic services
│   │   ├── user_service.py
│   │   ├── transaction_service.py
│   │   ├── limit_enforcement_service.py
│   │   ├── cooldown_service.py
│   │   ├── self_exclusion_service.py
│   │   ├── session_service.py
│   │   ├── notification_service.py
│   │   ├── behavior_analytics_service.py
│   │   ├── audit_service.py
│   │   └── blockchain_integration_service.py
│   ├── models                   # Data models
│   │   ├── user.py
│   │   ├── transaction.py
│   │   ├── limit.py
│   │   ├── cooldown.py
│   │   ├── self_exclusion.py
│   │   ├── session.py
│   │   ├── notification.py
│   │   ├── risk_assessment.py
│   │   ├── audit_log.py
│   │   └── operator.py
│   ├── repositories             # Database interaction
│   │   ├── user_repository.py
│   │   ├── transaction_repository.py
│   │   ├── self_exclusion_repository.py
│   │   ├── session_repository.py
│   │   ├── notification_repository.py
│   │   ├── risk_assessment_repository.py
│   │   ├── audit_log_repository.py
│   │   └── operator_repository.py
│   └── utils                    # Utility functions
│       └── validators.py
├── tests                        # Unit tests for the application
├── requirements.txt             # Project dependencies
├── .env.example                 # Example environment variables
└── README.md                    # Project documentation
```

## API Endpoints

### User Management
- `POST /api/v1/users/register` - Register new user with Concordium identity
- `GET /api/v1/users/{user_id}` - Get user details
- `PUT /api/v1/users/{user_id}` - Update user information

### Session Management
- `POST /api/v1/sessions/start` - Start gambling session
- `POST /api/v1/sessions/{session_id}/end` - End session
- `GET /api/v1/sessions/{session_id}` - Get session summary
- `PUT /api/v1/sessions/{session_id}/stats` - Update session stats
- `GET /api/v1/sessions/{session_id}/check` - Check session duration limits
- `GET /api/v1/users/{user_id}/sessions` - Get user's session history

### Transactions
- `POST /api/v1/transactions` - Record transaction
- `GET /api/v1/transactions/{transaction_id}` - Get transaction details
- `GET /api/v1/users/{user_id}/transactions` - Get user transactions

### Limit Enforcement
- `POST /api/v1/limits/set` - Set spending limit
- `GET /api/v1/limits/{user_id}` - Get user's limits
- `POST /api/v1/limits/check` - Check if transaction exceeds limit

### Self-Exclusion
- `POST /api/v1/self-exclusion` - Add user to self-exclusion registry
- `GET /api/v1/self-exclusion/{user_id}` - Check self-exclusion status
- `DELETE /api/v1/self-exclusion/{user_id}` - Remove from self-exclusion

### Behavioral Analytics
- `GET /api/v1/analytics/risk-score/{user_id}` - Calculate risk score
- `GET /api/v1/analytics/spending-pattern/{user_id}` - Analyze spending patterns
- `GET /api/v1/analytics/time-patterns/{user_id}` - Detect time anomalies
- `GET /api/v1/analytics/wellness-report/{user_id}` - Generate wellness report

### Notifications
- `GET /api/v1/notifications/{user_id}` - Get user notifications
- `PUT /api/v1/notifications/{notification_id}/read` - Mark as read
- `GET /api/v1/notifications/{user_id}/unread-count` - Get unread count

### Audit & Compliance
- `POST /api/v1/audit/log` - Create audit log entry
- `GET /api/v1/audit/user/{user_id}` - Get user audit history
- `GET /api/v1/audit/report/{operator_id}` - Generate regulatory report

### Health Check
- `GET /api/v1/health` - Service health status

## 🔧 Service Documentation

### PaymentService (`services/payment_service.py`)

**Key Methods:**

- **`deposit(user_id: str, amount: float, session_id: str) -> Dict`**
  ```python
  # Records deposit transaction
  # Calls wallet_service to update balance
  # Returns transaction record
  # Raises ValueError if amount is negative or user not found
  ```

- **`withdraw(user_id: str, amount: float) -> Dict`**
  ```python
  # Processes withdrawal request
  # Verifies sufficient balance exists
  # Updates wallet balance
  # Returns transaction details
  ```

- **`process_winnings(user_id: str, session_id: str, amount: float) -> Dict`**
  ```python
  # Handles payout of gambling winnings
  # Retrieves user's wallet address from wallet_service
  # Calls smart_contract_service.payout_winnings() to transfer CCD
  # Records transaction in database
  # Returns payout transaction details including blockchain hash
  ```

- **`get_transaction_history(user_id: str) -> List[Dict]`**
  ```python
  # Retrieves all transactions for a user
  # Includes deposits, withdrawals, bets, winnings
  # Sorted by timestamp (newest first)
  ```

### LimitEnforcementService (`services/limit_enforcement_service.py`)

**Key Methods:**

- **`set_limit(user_id: str, limit_type: str, amount: float) -> Dict`**
  ```python
  # Sets spending limit (daily/weekly/monthly/session)
  # Validates limit_type in ['daily', 'weekly', 'monthly', 'session']
  # Updates or creates limit record in database
  # Returns updated limit configuration
  ```

- **`check_limit(user_id: str, bet_amount: float) -> Dict`**
  ```python
  # Validates bet against all active limits
  # Calculates current spending for each period
  # Returns {"allowed": bool, "reason": str, "limits_status": {...}}
  # If allowed=False, includes which limit was exceeded
  ```

- **`get_current_limits(user_id: str) -> Dict`**
  ```python
  # Retrieves all limits for user
  # Returns dict with daily_limit, weekly_limit, monthly_limit, session_limit
  # Also includes current spending for each period
  ```

- **`calculate_remaining_limit(user_id: str, period: str) -> float`**
  ```python
  # Calculates how much user can still spend in period
  # Returns remaining amount (limit - current_spending)
  ```

### SessionService (`services/session_service.py`)

**Key Methods:**

- **`start_session(user_id: str) -> Dict`**
  ```python
  # Creates new gambling session
  # Checks if user has active session (ends it if found)
  # Records session start time
  # Returns session_id and start_time
  ```

- **`end_session(session_id: str) -> Dict`**
  ```python
  # Terminates gambling session
  # Calculates session duration
  # Records total bets, wins, losses for session
  # Returns session summary statistics
  ```

- **`check_session_duration(session_id: str) -> Dict`**
  ```python
  # Checks if session exceeds time limit
  # Returns {"exceeded": bool, "duration_minutes": int, "limit_minutes": int}
  # Used for mandatory break enforcement
  ```

- **`get_session_stats(session_id: str) -> Dict`**
  ```python
  # Retrieves detailed session statistics
  # Includes total_wagered, total_won, net_profit_loss, bet_count, duration
  ```

### SmartContractService (`services/smart_contract_service.py`)

**Key Methods:**

- **`payout_winnings(wallet_address: str, amount: float) -> Dict`**
  ```python
  # Calls deployed smart contract's payout function
  # Transfers CCD from contract to winner's wallet
  # Currently in MOCK mode (returns simulated transaction)
  # Production mode sends real blockchain transaction via concordium-client
  # Returns {"tx_hash": str, "amount": float, "recipient": str, "status": str}
  ```

- **`get_total_payouts() -> float`**
  ```python
  # Queries smart contract for total CCD paid out
  # Calls contract's view() function
  # Returns total amount distributed to winners
  ```

- **`configure_contract(contract_address: str, contract_name: str) -> None`**
  ```python
  # Updates service configuration with deployed contract details
  # Sets CONTRACT_ADDRESS and CONTRACT_NAME environment variables
  # Required before payout_winnings can execute
  ```

### SelfExclusionService (`services/self_exclusion_service.py`)

**Key Methods:**

- **`request_exclusion(user_id: str, duration_days: int) -> Dict`**
  ```python
  # Adds user to self-exclusion registry
  # Calculates exclusion end date
  # Prevents gambling access across all platforms
  # Returns exclusion record with end_date
  ```

- **`check_exclusion_status(user_id: str) -> Dict`**
  ```python
  # Verifies if user is currently self-excluded
  # Returns {"excluded": bool, "excluded_until": datetime}
  # Called before allowing any gambling activity
  ```

- **`remove_exclusion(user_id: str) -> Dict`**
  ```python
  # Removes user from exclusion registry
  # Only allowed after exclusion period expires
  # Returns confirmation message
  ```

### BehaviorAnalyticsService (`services/behavior_analytics_service.py`)

**Key Methods:**

- **`calculate_risk_score(user_id: str) -> int`**
  ```python
  # Analyzes gambling patterns to compute risk score (0-100)
  # Factors: spending escalation, session frequency, time patterns, limit violations
  # Returns score with risk level (low/medium/high/critical)
  ```

- **`analyze_spending_pattern(user_id: str) -> Dict`**
  ```python
  # Examines spending trends over time
  # Detects escalating behavior
  # Returns trend analysis with warnings if concerning
  ```

- **`detect_time_anomalies(user_id: str) -> List[Dict]`**
  ```python
  # Identifies unusual gambling times (late night, early morning)
  # Flags sessions during abnormal hours
  # Returns list of concerning time patterns
  ```

### WalletService (`services/wallet_service.py`)

**Key Methods:**

- **`get_or_create_wallet(user_id: str, concordium_address: str) -> Dict`**
  ```python
  # Retrieves existing wallet or creates new record
  # Links Concordium blockchain address to user
  # Returns wallet_id and concordium_address
  ```

- **`get_wallet_by_user(user_id: str) -> Dict`**
  ```python
  # Fetches wallet details for user
  # Returns concordium_address and wallet_id
  # Raises ValueError if wallet not found
  ```

- **`update_balance(user_id: str, new_balance: float) -> Dict`**
  ```python
  # Updates tracked wallet balance
  # Note: Actual blockchain balance is authoritative
  # This tracks last known balance for quick reference
  ```

## Setup Instructions

1. Clone the repository:
   ```
   git clone <repository-url>
   cd concordium_gambling_plugin/python-backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Edit `.env` and fill in the necessary values (database URL, API keys, Concordium service URL, etc.)

5. Initialize the database:
   ```bash
   python -c "from src.config.database import init_db; init_db()"
   ```

6. Run the application:
   ```bash
   python src/main.py
   ```
   
   Or with uvicorn directly:
   ```bash
   uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. Access the API documentation:
   - Open your browser and navigate to `http://localhost:8000/docs` for interactive Swagger UI
   - Or `http://localhost:8000/redoc` for ReDoc documentation

## Configuration

Key configuration options in `.env`:

- `DATABASE_URL`: Database connection string
- `CONCORDIUM_SERVICE_URL`: URL of the Node.js Concordium service
- `MAX_SESSION_DURATION`: Maximum gaming session duration (minutes)
- `REALITY_CHECK_INTERVAL`: How often to show reality checks (minutes)
- `COOLDOWN_PERIOD`: Minimum break between sessions (hours)
- `SUPPORTED_CURRENCIES`: Concordium PLT currencies to support

## Integration with Node.js Service

This Python backend calls the Node.js service for:
- Concordium identity verification
- Blockchain transaction verification
- On-chain data retrieval

Configure the Node.js service URL in `.env`:
```
CONCORDIUM_SERVICE_URL=http://localhost:3000
```

## Development

### Running Tests
```bash
pytest tests/
```

### Code Quality
```bash
# Format code
black src/

# Lint
flake8 src/

# Type checking
mypy src/
```

## Architecture

This service follows a layered architecture:

1. **API Layer** (`api/`): FastAPI routes and request handling
2. **Service Layer** (`services/`): Business logic and orchestration
3. **Repository Layer** (`repositories/`): Data access and persistence
4. **Model Layer** (`models/`): Data models and schemas

### Key Design Patterns

- **Repository Pattern**: Separates data access from business logic
- **Service Pattern**: Encapsulates business logic
- **Dependency Injection**: Used throughout for testability
- **Async/Await**: For improved performance

## Responsible Gambling Features

### Risk Scoring System
Users are scored on a 0-100 scale based on:
- Spending patterns and escalation
- Session frequency and duration
- Time-of-day patterns
- Limit violations

### Intervention Levels
- **Low Risk (0-25)**: Regular monitoring
- **Medium Risk (25-50)**: Increased notifications
- **High Risk (50-75)**: Suggested limits and breaks
- **Critical Risk (75-100)**: Strong intervention recommendations

### Cross-Platform Protection
All safeguards (limits, cooldowns, self-exclusion) apply across all registered gambling platforms using Concordium identity verification.

## Usage

## Usage Examples

### Starting a Gambling Session
```bash
curl -X POST "http://localhost:8000/api/v1/sessions/start" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "platform_id": "casino_a",
    "currency": "CCD"
  }'
```

### Recording a Transaction
```bash
curl -X POST "http://localhost:8000/api/v1/transactions" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "amount": 50.0,
    "type": "wager",
    "currency": "CCD"
  }'
```

### Checking Risk Score
```bash
curl -X GET "http://localhost:8000/api/v1/analytics/risk-score/user123"
```

### Setting Spending Limit
```bash
curl -X POST "http://localhost:8000/api/v1/limits/set" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "amount": 500.0,
    "period": "daily"
  }'
```

## Concordium Integration

This system leverages Concordium's unique features:

1. **Identity Verification**: Every user has a verified Concordium identity
   - Privacy-preserving attributes (age, location)
   - Cross-platform user recognition
   - Prevention of multi-account abuse

2. **PLT Stablecoin Payments**: Native on-chain stablecoins
   - Instant settlement
   - No volatility
   - Transparent transaction tracking
   - Programmatic spending limits

3. **Regulatory Compliance**: Built-in accountability
   - Audit trails linked to blockchain
   - GDPR compliance support
   - Regulatory reporting

## Security Considerations

- API key authentication for operator endpoints
- Rate limiting on sensitive endpoints
- Secure storage of user data
- Audit logging of all actions
- GDPR-compliant data handling

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t responsible-gambling-backend .

# Run container
docker run -p 8000:8000 --env-file .env responsible-gambling-backend
```

### Production Checklist
- [ ] Change `SECRET_KEY` in production
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set `DEBUG=False`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS
- [ ] Configure monitoring and logging
- [ ] Set up backup strategy
- [ ] Configure rate limiting

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch and create a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.

## Support & Resources

- Concordium Documentation: https://developer.concordium.software/
- Concordium SDK: https://developer.concordium.software/en/mainnet/net/references/sdks.html
- Responsible Gambling Resources: https://www.begambleaware.org/

## Acknowledgments

Built for the Concordium Hackathon - Responsible Gambling Challenge. This project demonstrates how blockchain technology can be used to promote responsible gambling while maintaining user privacy and regulatory compliance.