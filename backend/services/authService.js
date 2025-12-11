/**
 * Auth Service
 * Handles user registration and login
 */

import { executeQuery, getConnection } from '../config/db.js';
import oracledb from 'oracledb';

/**
 * Register a new user
 */
export async function registerUser(userData) {
  const { username, password, full_name, email, role } = userData;
  
  let connection;
  try {
    connection = await getConnection();
    
    // Insert the user
    const insertSql = `INSERT INTO Users (username, password, full_name, email, role)
                       VALUES (:username, :password, :full_name, :email, :role)`;
    
    await connection.execute(
      insertSql,
      {
        username,
        password, // In production, hash the password!
        full_name,
        email,
        role: role || 'USER'
      },
      { autoCommit: false }
    );
    
    // Get the generated user_id
    const selectSql = `SELECT user_id, username, full_name, email, role
                       FROM Users
                       WHERE username = :username`;
    
    const result = await connection.execute(
      selectSql,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    await connection.commit();
    
    return result.rows[0];
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Login user
 */
export async function loginUser(username, password) {
  const sql = `SELECT user_id, username, full_name, email, role
               FROM Users
               WHERE username = :username AND password = :password`;
  
  const result = await executeQuery(sql, { username, password });
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

/**
 * Check if username exists
 */
export async function checkUsernameExists(username) {
  const sql = `SELECT COUNT(*) as cnt FROM Users WHERE username = :username`;
  const result = await executeQuery(sql, { username });
  return result.rows[0].CNT > 0;
}

/**
 * Check if email exists
 */
export async function checkEmailExists(email) {
  const sql = `SELECT COUNT(*) as cnt FROM Users WHERE email = :email`;
  const result = await executeQuery(sql, { email });
  return result.rows[0].CNT > 0;
}

/**
 * Get all users (for admin)
 */
export async function getAllUsers() {
  const sql = `SELECT user_id, username, full_name, email, role, created_at
               FROM Users
               ORDER BY created_at DESC`;
  const result = await executeQuery(sql);
  return result.rows;
}

export default {
  registerUser,
  loginUser,
  checkUsernameExists,
  checkEmailExists,
  getAllUsers
};
