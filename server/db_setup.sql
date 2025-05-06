-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS crypto_wallet;

-- Use the database
USE crypto_wallet;

-- Create address_book table
CREATE TABLE IF NOT EXISTS address_book (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_address (address)
);

-- Create payment_requests table
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
);

-- Create a user for the application with appropriate permissions
CREATE USER IF NOT EXISTS 'wallet_user'@'localhost' IDENTIFIED BY 'Wallet_Password_123!';
GRANT ALL PRIVILEGES ON crypto_wallet.* TO 'wallet_user'@'localhost';
FLUSH PRIVILEGES;

-- Confirm tables have been created
SHOW TABLES; 