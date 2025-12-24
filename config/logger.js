/**
 * Logger Configuration
 * Centralized logging system with multiple transports
 * 
 * @author E-commerce API Team
 * @version 1.0.0
 * @since 2023-12-25
 */

const fs = require('fs');
const path = require('path');
const { config } = require('./environment');

class Logger {
  constructor() {
    this.logDir = path.dirname(config.logging.file);
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @returns {string} Formatted log message
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  /**
   * Write log to file
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  writeToFile(level, message, meta = {}) {
    const logMessage = this.formatMessage(level, message, meta);
    const logFile = config.logging.file;
    
    fs.appendFile(logFile, logMessage + '\n', (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });
  }

  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    console.log(`ℹ️ ${message}`);
    this.writeToFile('info', message, meta);
  }

  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  error(message, meta = {}) {
    console.error(`❌ ${message}`);
    this.writeToFile('error', message, meta);
  }

  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    console.warn(`⚠️ ${message}`);
    this.writeToFile('warn', message, meta);
  }

  /**
   * Log debug message (development only)
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    if (!config.nodeEnv === 'production') {
      console.log(`🐛 ${message}`);
      this.writeToFile('debug', message, meta);
    }
  }

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} duration - Request duration in ms
   */
  logRequest(req, res, duration) {
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`;
    const meta = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.userId
    };
    
    if (res.statusCode >= 400) {
      this.error(message, meta);
    } else {
      this.info(message, meta);
    }
  }
}

// Export singleton instance
const logger = new Logger();

module.exports = logger;