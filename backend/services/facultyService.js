/**
 * Faculty Service - Follows same pattern
 */

import { executeQuery, getConnection } from '../config/db.js';
import oracledb from 'oracledb';

export async function getAllFaculty() {
  const sql = `SELECT f.fac_id, f.fac_name, f.dept_id, f.design, f.max_hours_week, d.dept_name
               FROM Faculty f
               LEFT JOIN Department d ON f.dept_id = d.dept_id
               ORDER BY f.fac_name`;
  const result = await executeQuery(sql);
  return result.rows;
}

export async function getFacultyById(id) {
  const sql = `SELECT f.fac_id, f.fac_name, f.dept_id, f.design, f.max_hours_week, d.dept_name
               FROM Faculty f
               LEFT JOIN Department d ON f.dept_id = d.dept_id
               WHERE f.fac_id = :id`;
  const result = await executeQuery(sql, { id });
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function createFaculty(faculty) {
  let connection;
  try {
    connection = await getConnection();
    
    const insertSql = `INSERT INTO Faculty (fac_name, dept_id, design, max_hours_week)
                       VALUES (:fac_name, :dept_id, :design, :max_hours_week)`;
    
    await connection.execute(insertSql, {
      fac_name: faculty.fac_name,
      dept_id: faculty.dept_id || null,
      design: faculty.design || null,
      max_hours_week: faculty.max_hours_week
    }, { autoCommit: false });
    
    const selectSql = `SELECT fac_id, fac_name, dept_id, design, max_hours_week
                       FROM Faculty
                       WHERE fac_name = :fac_name
                       ORDER BY fac_id DESC
                       FETCH FIRST 1 ROWS ONLY`;
    
    const result = await connection.execute(
      selectSql,
      { fac_name: faculty.fac_name },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    await connection.commit();
    return result.rows[0];
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export async function updateFaculty(id, faculty) {
  const sql = `UPDATE Faculty 
               SET fac_name = :fac_name, dept_id = :dept_id, design = :design, max_hours_week = :max_hours_week
               WHERE fac_id = :fac_id`;
  
  await executeQuery(sql, {
    fac_id: id,
    fac_name: faculty.fac_name,
    dept_id: faculty.dept_id || null,
    design: faculty.design || null,
    max_hours_week: faculty.max_hours_week
  }, { autoCommit: true });
  
  return getFacultyById(id);
}

export async function deleteFaculty(id) {
  let connection;
  try {
    connection = await getConnection();

    // Remove timetable entries and course-faculty mappings first
    await connection.execute(`DELETE FROM Timetable WHERE fac_id = :id`, { id }, { autoCommit: false });
    await connection.execute(`DELETE FROM CourseFaculty WHERE fac_id = :id`, { id }, { autoCommit: false });
    await connection.execute(`DELETE FROM FacultySlot WHERE fac_id = :id`, { id }, { autoCommit: false });

    const result = await connection.execute(`DELETE FROM Faculty WHERE fac_id = :id`, { id }, { autoCommit: false });
    await connection.commit();
    return result.rowsAffected > 0;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export default { getAllFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty };
