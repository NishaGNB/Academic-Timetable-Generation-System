/**
 * Department Controller
 * Handles HTTP requests and responses for Department endpoints
 */

import * as departmentService from '../services/departmentService.js';

/**
 * GET /api/departments
 * Get all departments
 */
export async function getAllDepartments(req, res) {
  try {
    const departments = await departmentService.getAllDepartments();
    res.json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    console.error('Error in getAllDepartments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve departments',
      message: error.message
    });
  }
}

/**
 * GET /api/departments/:id
 * Get department by ID
 */
export async function getDepartmentById(req, res) {
  try {
    const { id } = req.params;
    const department = await departmentService.getDepartmentById(id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }
    
    res.json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Error in getDepartmentById:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve department',
      message: error.message
    });
  }
}

/**
 * POST /api/departments
 * Create new department
 */
export async function createDepartment(req, res) {
  try {
    const { dept_name, programsOffered, AcadYear } = req.body;
    
    // Validation
    if (!dept_name || !AcadYear) {
      return res.status(400).json({
        success: false,
        error: 'dept_name and AcadYear are required'
      });
    }
    
    const newDepartment = await departmentService.createDepartment({
      dept_name,
      programsOffered,
      AcadYear
    });
    
    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: newDepartment
    });
  } catch (error) {
    console.error('Error in createDepartment:', error);
    
    // Handle unique constraint violation (dept_name, AcadYear)
    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        error: 'Department with this name already exists for the given academic year'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create department',
      message: error.message
    });
  }
}

/**
 * PUT /api/departments/:id
 * Update department
 */
export async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const { dept_name, programsOffered, AcadYear } = req.body;
    
    // Validation
    if (!dept_name || !AcadYear) {
      return res.status(400).json({
        success: false,
        error: 'dept_name and AcadYear are required'
      });
    }
    
    // Check if department exists
    const existing = await departmentService.getDepartmentById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }
    
    const updated = await departmentService.updateDepartment(id, {
      dept_name,
      programsOffered,
      AcadYear
    });
    
    res.json({
      success: true,
      message: 'Department updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    
    // Handle unique constraint violation
    if (error.errorNum === 1) {
      return res.status(409).json({
        success: false,
        error: 'Department with this name already exists for the given academic year'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update department',
      message: error.message
    });
  }
}

/**
 * DELETE /api/departments/:id
 * Delete department
 */
export async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;
    
    // Check if department exists
    const existing = await departmentService.getDepartmentById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Department not found'
      });
    }
    
    const deleted = await departmentService.deleteDepartment(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Department deleted successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to delete department'
      });
    }
  } catch (error) {
    console.error('Error in deleteDepartment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete department',
      message: error.message
    });
  }
}

export default {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
