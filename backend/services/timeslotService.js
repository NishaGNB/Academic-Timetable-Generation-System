// TimeSlot Service
import { executeQuery, getConnection } from '../config/db.js';
import oracledb from 'oracledb';

export async function getAllTimeslots() {
  const sql = `SELECT slot_id, day_of_week, start_time, end_time, is_lab, is_break 
               FROM TimeSlots 
               ORDER BY 
                 CASE day_of_week
                   WHEN 'Monday' THEN 1
                   WHEN 'Tuesday' THEN 2
                   WHEN 'Wednesday' THEN 3
                   WHEN 'Thursday' THEN 4
                   WHEN 'Friday' THEN 5
                   WHEN 'Saturday' THEN 6
                   ELSE 7
                 END, start_time`;
  const result = await executeQuery(sql);
  return result.rows;
}

export async function getTimeslotById(id) {
  const sql = `SELECT slot_id, day_of_week, start_time, end_time, is_lab, is_break 
               FROM TimeSlots WHERE slot_id = :id`;
  const result = await executeQuery(sql, { id });
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function createTimeslot(slot) {
  let connection;
  try {
    connection = await getConnection();
    
    const insertSql = `INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break)
                       VALUES (:day_of_week, :start_time, :end_time, :is_lab, :is_break)`;
    
    await connection.execute(insertSql, {
      day_of_week: slot.day_of_week,
      start_time: slot.start_time,
      end_time: slot.end_time,
      is_lab: slot.is_lab || 0,
      is_break: slot.is_break || 0
    }, { autoCommit: false });
    
    const selectSql = `SELECT slot_id, day_of_week, start_time, end_time, is_lab, is_break
                       FROM TimeSlots
                       WHERE day_of_week = :day_of_week AND start_time = :start_time`;
    
    const result = await connection.execute(
      selectSql,
      { day_of_week: slot.day_of_week, start_time: slot.start_time },
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

export async function updateTimeslot(id, slot) {
  const sql = `UPDATE TimeSlots 
               SET day_of_week = :day_of_week, start_time = :start_time, 
                   end_time = :end_time, is_lab = :is_lab, is_break = :is_break
               WHERE slot_id = :slot_id`;
  
  await executeQuery(sql, {
    slot_id: id,
    day_of_week: slot.day_of_week,
    start_time: slot.start_time,
    end_time: slot.end_time,
    is_lab: slot.is_lab,
    is_break: slot.is_break
  }, { autoCommit: true });
  
  return getTimeslotById(id);
}

export async function deleteTimeslot(id) {
  let connection;
  try {
    connection = await getConnection();

    // Remove any timetable and relationship rows that reference this slot
    await connection.execute(`DELETE FROM Timetable WHERE slot_id = :id`, { id }, { autoCommit: false });
    await connection.execute(`DELETE FROM ClassSlot WHERE slot_id = :id`, { id }, { autoCommit: false });
    await connection.execute(`DELETE FROM FacultySlot WHERE slot_id = :id`, { id }, { autoCommit: false });
    await connection.execute(`DELETE FROM ClassroomSlot WHERE slot_id = :id`, { id }, { autoCommit: false });

    const result = await connection.execute(`DELETE FROM TimeSlots WHERE slot_id = :id`, { id }, { autoCommit: false });
    await connection.commit();
    return result.rowsAffected > 0;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export default { getAllTimeslots, getTimeslotById, createTimeslot, updateTimeslot, deleteTimeslot };
