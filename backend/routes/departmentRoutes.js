/**
 * Department Routes
 * Defines all HTTP routes for Department CRUD operations
 */

import express from 'express';
import * as departmentController from '../controllers/departmentController.js';

const router = express.Router();

// GET /api/departments - Get all departments
router.get('/', departmentController.getAllDepartments);

// GET /api/departments/:id - Get department by ID
router.get('/:id', departmentController.getDepartmentById);

// POST /api/departments - Create new department
router.post('/', departmentController.createDepartment);

// PUT /api/departments/:id - Update department
router.put('/:id', departmentController.updateDepartment);

// DELETE /api/departments/:id - Delete department
router.delete('/:id', departmentController.deleteDepartment);

export default router;
