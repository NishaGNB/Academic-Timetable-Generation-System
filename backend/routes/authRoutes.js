/**
 * Auth Routes
 */

import express from 'express';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', authController.register);

// POST /api/auth/login - Login user
router.post('/login', authController.login);

// GET /api/auth/users - Get all users
router.get('/users', authController.getAllUsers);

export default router;
