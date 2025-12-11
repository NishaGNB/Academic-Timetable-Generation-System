/**
 * Database Configuration Module
 * Handles Oracle database connection using oracledb driver
 */

import oracledb from 'oracledb';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration from environment variables
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING
};

/**
 * Get a new Oracle database connection
 * @returns {Promise<Connection>} Oracle database connection
 */
export async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw error;
  }
}

/**
 * Execute a query and return results
 * @param {string} sql - SQL query string
 * @param {Array} binds - Bind parameters
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Query result
 */
export async function executeQuery(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT, // Return rows as objects
      autoCommit: options.autoCommit !== undefined ? options.autoCommit : false,
      ...options
    });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection() {
  let connection;
  try {
    connection = await getConnection();
    console.log('✓ Oracle database connected successfully');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing test connection:', err);
      }
    }
  }
}

export default { getConnection, executeQuery, testConnection };
