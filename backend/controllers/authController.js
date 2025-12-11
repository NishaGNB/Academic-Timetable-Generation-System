/**
 * Auth Controller
 * Handles registration and login requests
 */

import * as authService from '../services/authService.js';

/**
 * POST /api/auth/register
 * Register a new user
 */
export async function register(req, res) {
  try {
    const { username, password, full_name, email, role } = req.body;
    
    // Validation
    if (!username || !password || !full_name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Username, password, full name, and email are required'
      });
    }
    
    // Check if username exists
    const usernameExists = await authService.checkUsernameExists(username);
    if (usernameExists) {
      return res.status(409).json({
        success: false,
        error: 'Username already exists'
      });
    }
    
    // Check if email exists
    const emailExists = await authService.checkEmailExists(email);
    if (emailExists) {
      return res.status(409).json({
        success: false,
        error: 'Email already exists'
      });
    }
    
    // Register user
    const newUser = await authService.registerUser({
      username,
      password,
      full_name,
      email,
      role
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: newUser
    });
  } catch (error) {
    console.error('Error in register:', error);
    
    // Handle Oracle unique constraint violations
    if (error.errorNum === 1) {
      if (error.message.includes('USERNAME')) {
        return res.status(409).json({
          success: false,
          error: 'Username already exists'
        });
      }
      if (error.message.includes('EMAIL')) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists'
        });
      }
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to register user',
      message: error.message
    });
  }
}

/**
 * POST /api/auth/login
 * Login user
 */
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    // Login
    const user = await authService.loginUser(username, password);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      data: user
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login',
      message: error.message
    });
  }
}

/**
 * GET /api/auth/users
 * Get all users (for viewing registered users)
 */
export async function getAllUsers(req, res) {
  try {
    const users = await authService.getAllUsers();
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users',
      message: error.message
    });
  }
}

export default {
  register,
  login,
  getAllUsers
};
