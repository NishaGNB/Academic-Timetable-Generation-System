// Classroom Service
import { executeQuery } from '../config/db.js';

export async function getAllClassrooms() {
  const sql = `SELECT room_no, room_type, capacity, availability, is_shared FROM Classrooms ORDER BY room_no`;
  const result = await executeQuery(sql);
  return result.rows;
}

export async function getClassroomById(roomNo) {
  const sql = `SELECT room_no, room_type, capacity, availability, is_shared FROM Classrooms WHERE room_no = :roomNo`;
  const result = await executeQuery(sql, { roomNo });
  return result.rows.length > 0 ? result.rows[0] : null;
}

export async function createClassroom(room) {
  const sql = `INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared)
               VALUES (:room_no, :room_type, :capacity, :availability, :is_shared)`;
  
  await executeQuery(sql, {
    room_no: room.room_no,
    room_type: room.room_type,
    capacity: room.capacity,
    availability: room.availability || 'FULL_DAY',
    is_shared: room.is_shared || 0
  }, { autoCommit: true });
  
  return getClassroomById(room.room_no);
}

export async function updateClassroom(roomNo, room) {
  const sql = `UPDATE Classrooms 
               SET room_type = :room_type, capacity = :capacity, availability = :availability, is_shared = :is_shared
               WHERE room_no = :room_no`;
  
  await executeQuery(sql, {
    room_no: roomNo,
    room_type: room.room_type,
    capacity: room.capacity,
    availability: room.availability,
    is_shared: room.is_shared
  }, { autoCommit: true });
  
  return getClassroomById(roomNo);
}

export async function deleteClassroom(roomNo) {
  let connection;
  try {
    connection = await getConnection();

    // Remove timetable entries and classroom-slot records
    await connection.execute(`DELETE FROM Timetable WHERE room_no = :roomNo`, { roomNo }, { autoCommit: false });
    await connection.execute(`DELETE FROM ClassroomSlot WHERE room_no = :roomNo`, { roomNo }, { autoCommit: false });

    const result = await connection.execute(`DELETE FROM Classrooms WHERE room_no = :roomNo`, { roomNo }, { autoCommit: false });
    await connection.commit();
    return result.rowsAffected > 0;
  } catch (error) {
    if (connection) await connection.rollback();
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

export default { getAllClassrooms, getClassroomById, createClassroom, updateClassroom, deleteClassroom };
