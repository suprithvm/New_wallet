const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crypto_wallet',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Initialize database by creating tables if they don't exist
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create address_book table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS address_book (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address VARCHAR(255) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_address (address)
      )
    `);
    
    // Create payment_requests table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        from_address VARCHAR(255) NOT NULL,
        to_address VARCHAR(255) NOT NULL,
        amount DECIMAL(18,8) NOT NULL,
        note TEXT,
        status ENUM('pending', 'completed', 'rejected', 'expired') DEFAULT 'pending',
        transaction_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    connection.release();
    console.log('Database tables initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize database tables:', error);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  initDatabase
}; 