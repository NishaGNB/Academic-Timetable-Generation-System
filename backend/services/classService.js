// Classes Service - Same CRUD pattern as above
import { executeQuery, getConnection } from '../config/db.js';
import oracledb from 'oracledb';

export async function getAllClasses() {
  const sql = `SELECT c.class_id, c.sec, c.year, c.sem, c.NOS, c.programs_offered, c.fac_id, f.fac_name
               FROM Classes c
               LEFT JOIN Faculty f ON c.fac_id = f.fac_id
               ORDER BY c.year, c.sem, c.sec`;
  const result = await executeQuery(sql);
  return result.rows;
}

export async function getClassById(id) {
  const sql = `SELECT c.class_id, c.sec, c.year, c.sem, c.NOS, c.programs_offered, c.fac_id, f.fac_name
               FROM Classes c
               LEFT JOIN Faculty f ON c.fac_id = f.fac_id
               WHERE c.class_id = :id`;
  const result = await executeQuery(sql, { id });
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function createClass(classData) {
  let connection;
  try {
    connection = await getConnection();
    
    const insertSql = `INSERT INTO Classes (sec, year, sem, NOS, programs_offered, fac_id)
                       VALUES (:sec, :year, :sem, :NOS, :programs_offered, :fac_id)`;
    
    await connection.execute(insertSql, {
      sec: classData.sec,
      year: classData.year,
      sem: classData.sem,
      NOS: classData.NOS,
      programs_offered: classData.programs_offered || null,
      fac_id: classData.fac_id || null
    }, { autoCommit: false });
    
    const selectSql = `SELECT class_id, sec, year, sem, NOS, programs_offered, fac_id
                       FROM Classes
                       WHERE sec = :sec AND year = :year AND sem = :sem
                       ORDER BY class_id DESC
                       FETCH FIRST 1 ROWS ONLY`;
    
    const result = await connection.execute(
      selectSql,
      { sec: classData.sec, year: classData.year, sem: classData.sem },
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

export async function updateClass(id, classData) {
  const sql = `UPDATE Classes 
               SET sec = :sec, year = :year, sem = :sem, NOS = :NOS, 
                   programs_offered = :programs_offered, fac_id = :fac_id
               WHERE class_id = :class_id`;
  
  await executeQuery(sql, {
    class_id: id,
    sec: classData.sec,
    year: classData.year,
    sem: classData.sem,
    NOS: classData.NOS,
    programs_offered: classData.programs_offered || null,
    fac_id: classData.fac_id || null
  }, { autoCommit: true });
  
  return getClassById(id);
}

export async function deleteClass(id) {
  let connection;
  try {
    connection = await getConnection();

    // Remove timetable entries, class-slot and class-course mappings
    await connection.execute(`DELETE FROM Timetable WHERE class_id = :id`, { id }, { autoCommit: false });
    await connection.execute(`DELETE FROM ClassSlot WHERE class_id = :id`, { id }, { autoCommit: false });
    await connection.execute(`DELETE FROM ClassCourse WHERE class_id = :id`, { id }, { autoCommit: false });

    const result = await connection.execute(`DELETE FROM Classes WHERE class_id = :id`, { id }, { autoCommit: false });
    await connection.commit();
    return result.rowsAffected > 0;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export default { getAllClasses, getClassById, createClass, updateClass, deleteClass };
