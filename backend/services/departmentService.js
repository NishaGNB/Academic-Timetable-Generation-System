/**
 * Department Service
 * Database operations for Department entity
 * Uses parameterized queries to prevent SQL injection
 */

import { executeQuery, getConnection } from '../config/db.js';
import oracledb from 'oracledb';

/**
 * Get all departments
 * @returns {Promise<Array>} Array of department objects
 */
export async function getAllDepartments() {
  const sql = `SELECT dept_id, dept_name, programsOffered, AcadYear 
               FROM Department 
               ORDER BY AcadYear DESC, dept_name`;
  const result = await executeQuery(sql);
  return result.rows;
}

/**
 * Get department by ID
 * @param {number} id - Department ID
 * @returns {Promise<Object>} Department object or null
 */
export async function getDepartmentById(id) {
  const sql = `SELECT dept_id, dept_name, programsOffered, AcadYear 
               FROM Department 
               WHERE dept_id = :id`;
  const result = await executeQuery(sql, { id });
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Create new department
 * @param {Object} dept - Department data {dept_name, programsOffered, AcadYear}
 * @returns {Promise<Object>} Created department with ID
 */
export async function createDepartment(dept) {
  let connection;
  try {
    connection = await getConnection();
    
    // Insert the department
    const insertSql = `INSERT INTO Department (dept_name, programsOffered, AcadYear) 
                       VALUES (:dept_name, :programsOffered, :AcadYear)`;
    
    await connection.execute(
      insertSql,
      {
        dept_name: dept.dept_name,
        programsOffered: dept.programsOffered || null,
        AcadYear: dept.AcadYear
      },
      { autoCommit: false }
    );
    
    // Get the generated dept_id
    const selectSql = `SELECT dept_id, dept_name, programsOffered, AcadYear
                       FROM Department
                       WHERE dept_name = :dept_name AND AcadYear = :AcadYear`;
    
    const result = await connection.execute(
      selectSql,
      { dept_name: dept.dept_name, AcadYear: dept.AcadYear },
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
    if (connection) {
      await connection.close();
    }
  }
}

/**
 * Update department
 * @param {number} id - Department ID
 * @param {Object} dept - Updated department data
 * @returns {Promise<Object>} Updated department
 */
export async function updateDepartment(id, dept) {
  const sql = `UPDATE Department 
               SET dept_name = :dept_name, 
                   programsOffered = :programsOffered, 
                   AcadYear = :AcadYear 
               WHERE dept_id = :dept_id`;
  
  await executeQuery(
    sql,
    {
      dept_id: id,
      dept_name: dept.dept_name,
      programsOffered: dept.programsOffered || null,
      AcadYear: dept.AcadYear
    },
    { autoCommit: true }
  );
  
  return getDepartmentById(id);
}

/**
 * Delete department
 * @param {number} id - Department ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteDepartment(id) {
  let connection;
  try {
    connection = await getConnection();

    // Delete dependent data: courses and related mappings, timetables
    await connection.execute(
      `DELETE FROM ClassCourse WHERE course_code IN (SELECT course_code FROM Courses WHERE dept_id = :id)`,
      { id },
      { autoCommit: false }
    );

    await connection.execute(
      `DELETE FROM CourseFaculty WHERE course_code IN (SELECT course_code FROM Courses WHERE dept_id = :id)`,
      { id },
      { autoCommit: false }
    );

    await connection.execute(
      `DELETE FROM Timetable WHERE course_code IN (SELECT course_code FROM Courses WHERE dept_id = :id)`,
      { id },
      { autoCommit: false }
    );

    // Delete courses belonging to department
    await connection.execute(
      `DELETE FROM Courses WHERE dept_id = :id`,
      { id },
      { autoCommit: false }
    );

    // Finally delete department
    const result = await connection.execute(
      `DELETE FROM Department WHERE dept_id = :id`,
      { id },
      { autoCommit: false }
    );

    await connection.commit();
    return result.rowsAffected > 0;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export default {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
