/**
 * Course Service - Similar pattern to Department
 * Handles Courses table operations
 */

import { executeQuery, getConnection } from '../config/db.js';

export async function getAllCourses() {
  const sql = `SELECT c.course_code, c.course_name, c.credits, c.course_type, 
                      c.course_cat, c.hours_week, c.sem, c.dept_id, d.dept_name
               FROM Courses c
               LEFT JOIN Department d ON c.dept_id = d.dept_id
               ORDER BY c.sem, c.course_name`;
  const result = await executeQuery(sql);
  return result.rows;
}

export async function getCourseById(code) {
  const sql = `SELECT c.course_code, c.course_name, c.credits, c.course_type, 
                      c.course_cat, c.hours_week, c.sem, c.dept_id, d.dept_name
               FROM Courses c
               LEFT JOIN Department d ON c.dept_id = d.dept_id
               WHERE c.course_code = :code`;
  const result = await executeQuery(sql, { code });
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function createCourse(course) {
  const sql = `INSERT INTO Courses (course_code, course_name, credits, course_type, 
                                     course_cat, hours_week, sem, dept_id)
               VALUES (:course_code, :course_name, :credits, :course_type, 
                       :course_cat, :hours_week, :sem, :dept_id)`;
  
  await executeQuery(sql, {
    course_code: course.course_code,
    course_name: course.course_name,
    credits: course.credits,
    course_type: course.course_type,
    course_cat: course.course_cat,
    hours_week: course.hours_week,
    sem: course.sem,
    dept_id: course.dept_id
  }, { autoCommit: true });
  
  return getCourseById(course.course_code);
}

export async function updateCourse(code, course) {
  const sql = `UPDATE Courses 
               SET course_name = :course_name, credits = :credits, 
                   course_type = :course_type, course_cat = :course_cat,
                   hours_week = :hours_week, sem = :sem, dept_id = :dept_id
               WHERE course_code = :course_code`;
  
  await executeQuery(sql, {
    course_code: code,
    course_name: course.course_name,
    credits: course.credits,
    course_type: course.course_type,
    course_cat: course.course_cat,
    hours_week: course.hours_week,
    sem: course.sem,
    dept_id: course.dept_id
  }, { autoCommit: true });
  
  return getCourseById(course.course_code);
}

export async function deleteCourse(code) {
  let connection;
  try {
    connection = await getConnection();

    // Remove dependent rows first to avoid FK constraint violations
    await connection.execute(`DELETE FROM ClassCourse WHERE course_code = :code`, { code }, { autoCommit: false });
    await connection.execute(`DELETE FROM CourseFaculty WHERE course_code = :code`, { code }, { autoCommit: false });
    await connection.execute(`DELETE FROM Timetable WHERE course_code = :code`, { code }, { autoCommit: false });

    const result = await connection.execute(`DELETE FROM Courses WHERE course_code = :code`, { code }, { autoCommit: false });

    await connection.commit();
    return result.rowsAffected > 0;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export default { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
