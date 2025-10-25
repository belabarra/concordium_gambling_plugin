# Concordium Gambling Backend

A simple Node.js backend server for the Concordium gambling plugin.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## API Endpoints

- `GET /` - Welcome message and server status
- `GET /api/health` - Health check endpoint
- `GET /api/example` - Example API endpoint

## Configuration

The server runs on port 3000 by default. You can change this by modifying the `PORT` variable in the `.env` file.

