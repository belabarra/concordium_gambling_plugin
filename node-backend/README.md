# Concordium Gambling Backend

A simple Node.js backend server for the Concordium gambling plugin built with TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Start the server:
```bash
npm start
```

## Development

For development with auto-reload:
```bash
npm run dev
```

This will watch for changes in TypeScript files and automatically restart the server.

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled JavaScript server
- `npm run dev` - Run development server with hot reload
- `npm run watch` - Watch TypeScript files and recompile on changes
- `npm run clean` - Remove the dist folder

## API Endpoints

- `GET /` - Welcome message and server status
- `GET /api/health` - Health check endpoint
- `GET /api/example` - Example API endpoint

## Configuration

The server runs on port 3000 by default. You can change this by modifying the `PORT` variable in the `.env` file.

## Project Structure

```
node-backend/
├── src/
│   └── server.ts       # Main TypeScript server file
├── dist/               # Compiled JavaScript (generated)
├── .env                # Environment variables
├── tsconfig.json       # TypeScript configuration
├── nodemon.json        # Nodemon configuration
└── package.json        # Project dependencies
```
