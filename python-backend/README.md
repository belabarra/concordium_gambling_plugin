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

## Features

- **User Management**: Register, retrieve, and update user data.
- **Transaction Tracking**: Record and monitor user transactions.
- **Limit Enforcement**: Enforce spending limits based on user data.
- **Cooldown Management**: Manage cool-down periods to restrict gambling activities.
- **Self-Exclusion Registry**: Allow users to opt-out of gambling across platforms.
- **Blockchain Integration**: Verify user identities and transactions with a Node.js service.

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