# Supereum Wallet

A web-based wallet application for the Supereum blockchain, built with React and Node.js.

## Features

- Create a new wallet with a secure password
- Import an existing wallet via recovery phrase or private key
- View wallet balance and transaction history
- Send tokens to another address
- Receive tokens with QR code generation
- Request payment from others
- Address book for managing contacts
- Real-time updates via WebSocket

## Technology Stack

### Frontend
- React.js with TypeScript
- React Router for navigation
- Styled Components for styling
- Socket.io for real-time updates
- Axios for API communication

### Backend
- Node.js with Express
- MySQL for database storage
- WebSockets for real-time communication
- JSON-RPC for blockchain interaction

## Prerequisites

- Node.js (v14 or later)
- MySQL Server
- Supereum Blockchain Node running with RPC enabled

## Installation and Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd wallet-app
```

### 2. Set up the database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE crypto_wallet;
```

### 3. Install dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ..
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=crypto_wallet

# Blockchain RPC Configuration
RPC_URL=http://localhost:8545
```

### 5. Start the application

Start the backend server:

```bash
cd server
npm start
```

In a new terminal, start the frontend:

```bash
npm start
```

The application will be available at http://localhost:3000.

## Project Structure

```
wallet-app/
  ├── server/              # Backend Node.js server
  │   ├── config/          # Configuration files
  │   ├── controllers/     # API controllers
  │   ├── models/          # Database models
  │   ├── routes/          # API routes
  │   └── index.js         # Server entry point
  ├── public/              # Public assets
  ├── src/                 # Frontend React application
  │   ├── components/      # Reusable components
  │   ├── contexts/        # React context providers
  │   ├── pages/           # Page components
  │   ├── services/        # API and WebSocket services
  │   ├── styles/          # Global styles and theme
  │   └── App.tsx          # Main application component
  └── package.json         # Project dependencies
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
