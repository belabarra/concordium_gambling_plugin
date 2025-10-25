# Gambling Prevention Tool

This project is a backend service for a gambling prevention tool designed to help users manage their gambling activities. It includes features for user data storage, transaction tracking, limit enforcement, and self-exclusion management. The service also integrates with an existing Node.js service for blockchain verification.

## Project Structure

```
gambling-prevention-backend
├── src
│   ├── main.py                  # Entry point of the application
│   ├── config                   # Configuration settings
│   ├── api                      # API routes and middleware
│   ├── services                 # Business logic services
│   ├── models                   # Data models
│   ├── repositories             # Database interaction
│   └── utils                    # Utility functions
├── tests                        # Unit tests for the application
├── requirements.txt             # Project dependencies
├── .env.example                 # Example environment variables
├── .gitignore                   # Files to ignore in version control
└── README.md                    # Project documentation
```

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
   cd gambling-prevention-backend
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
   - Copy `.env.example` to `.env` and fill in the necessary values.

5. Run the application:
   ```
   python src/main.py
   ```

## Usage

- The API provides endpoints for user registration, transaction tracking, limit enforcement, and self-exclusion.
- Refer to the API documentation for detailed usage instructions.

## Contribution Guidelines

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them.
4. Push your branch and create a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.