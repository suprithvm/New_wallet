// Configure dotenv with expanded support
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
dotenvExpand.expand(dotenv.config());

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const { testConnection, initDatabase } = require('./config/database');
const winston = require('winston');
const morgan = require('morgan');
const requestsModel = require('./models/requests');

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'wallet-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Create a stream object for Morgan
const morganStream = {
  write: (message) => logger.info(message.trim())
};

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO for real-time communication
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Make io available globally
global.io = io;

// Socket.IO connection handler
io.on('connection', (socket) => {
  logger.info('New client connected', { socketId: socket.id });
  
  // Handle client disconnect
  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
  
  // Listen for wallet connections
  socket.on('wallet:connect', (address) => {
    logger.info('Wallet connected', { address, socketId: socket.id });
    socket.join(`wallet:${address}`);
  });
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: morganStream }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
    ip: req.ip
  });
  next();
});

// Routes
const addressBookRoutes = require('./routes/addressBook');
const requestsRoutes = require('./routes/requests');
const rpcRoutes = require('./routes/rpc');

// API Routes
app.use('/api/addressbook', addressBookRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/rpc', rpcRoutes);

// Health check route
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  res.status(500).json({ error: 'Internal server error' });
});

// Initialize database before starting server
async function startServer() {
  try {
    logger.info('Starting server initialization');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database');
      process.exit(1);
    }
    logger.info('Database connection successful');
    
    // Initialize database tables
    const dbInitialized = await initDatabase();
    if (!dbInitialized) {
      logger.error('Failed to initialize database tables');
      process.exit(1);
    }
    logger.info('Database initialization successful');
    
    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, { port: PORT });
    });
  } catch (error) {
    logger.error('Error starting server', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

// Start the server
startServer();

// Periodically clean up expired payment requests every hour
setInterval(async () => {
  try {
    const expiredCount = await requestsModel.cleanupExpiredRequests();
    if (expiredCount > 0) {
      logger.info(`Expired ${expiredCount} old pending payment requests.`);
    }
  } catch (err) {
    logger.error('Error cleaning up expired payment requests', { error: err.message });
  }
}, 60 * 60 * 1000); // Every hour

module.exports = { app, logger }; 