/**
 * Timetable Service
 * Implements the core timetable generation algorithm
 * 
 * ALGORITHM OVERVIEW:
 * 1. For each class in the given semester:
 *    - Get all courses assigned to that class (from ClassCourse)
 * 2. For each course:
 *    - Find eligible faculty (from CourseFaculty)
 *    - Allocate time slots and classrooms using greedy approach:
 *      * Check faculty availability (max_hours_week not exceeded)
 *      * Find available slots (no clash with class, faculty, or room)
 *      * For LAB courses: allocate consecutive slots on same day
 *      * For THEORY courses: allocate single slots
 *      * Match room type with course type
 * 3. Insert into Timetable and update relationship tables
 */

import { executeQuery, getConnection } from '../config/db.js';
import oracledb from 'oracledb';

/**
 * Generate timetable using Oracle stored procedure with CURSOR
 * Calls: Generate_TimeTable(p_year, p_sem)
 */
export async function generateTimetableAuto(year, sem) {
  let connection;
  try {
    connection = await getConnection();
    
    // Call the stored procedure
    const result = await connection.execute(
      `BEGIN Generate_TimeTable(:year, :sem, :process_id); END;`,
      {
        year: year,
        sem: sem,
        process_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 50 }
      },
      { autoCommit: true }
    );
    
    const processId = result.outBinds.process_id;
    
    // Fetch logs for this process
    const logsResult = await connection.execute(
      `SELECT log_id, msg, log_type, TO_CHAR(log_time, 'YYYY-MM-DD HH24:MI:SS') as log_time
       FROM TimeTable_Log
       WHERE process_id = :process_id
       ORDER BY log_time DESC`,
      { process_id: processId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    // Get generation statistics
    const statsResult = await connection.execute(
      `SELECT COUNT(*) as total_entries
       FROM Timetable t
       JOIN Classes c ON t.class_id = c.class_id
       WHERE c.year = :year AND c.sem = :sem`,
      { year, sem },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    return {
      success: true,
      process_id: processId,
      total_entries: statsResult.rows[0].TOTAL_ENTRIES,
      logs: logsResult.rows,
      message: 'Timetable generated successfully using stored procedure'
    };
    
  } catch (error) {
    console.error('Error in generateTimetableAuto:', error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Get timetable generation logs
 */
export async function getTimetableLogs(processId = null) {
  let sql = `SELECT log_id, msg, log_type, TO_CHAR(log_time, 'YYYY-MM-DD HH24:MI:SS') as log_time, process_id
             FROM TimeTable_Log`;
  const params = [];
  
  if (processId) {
    sql += ` WHERE process_id = :process_id`;
    params.push(processId);
  }
  
  sql += ` ORDER BY log_time DESC`;
  
  const result = await executeQuery(sql, params);
  return result.rows;
}

/**
 * Generate timetable for a given semester and academic year
 * Request body: { sem: number, acadYear: number }
 */
export async function generateTimetable(sem, acadYear) {
  let connection;
  try {
    connection = await getConnection();
    
    // Step 1: Clear existing timetable for this semester
    await connection.execute(
      `DELETE FROM Timetable WHERE class_id IN 
       (SELECT class_id FROM Classes WHERE sem = :sem)`,
      [sem],
      { autoCommit: false }
    );
    
    // Also clear relationship tables
    await connection.execute(
      `DELETE FROM ClassSlot WHERE class_id IN 
       (SELECT class_id FROM Classes WHERE sem = :sem)`,
      [sem],
      { autoCommit: false }
    );
    
    // Step 2: Get all classes for this semester
    const classesResult = await connection.execute(
      `SELECT class_id, sec, year, NOS FROM Classes WHERE sem = :sem ORDER BY class_id`,
      [sem],
      { outFormat: 2 } // Object format
    );
    
    const classes = classesResult.rows;
    console.log(`Generating timetable for ${classes.length} classes in semester ${sem}`);
    
    // Step 3: For each class, schedule its courses
    for (const classItem of classes) {
      await scheduleClassCourses(connection, classItem);
    }
    
    // Commit all changes
    await connection.commit();
    
    console.log('Timetable generation completed successfully');
    return { success: true, message: `Timetable generated for ${classes.length} classes` };
    
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error generating timetable:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
}

/**
 * Schedule all courses for a single class
 */
async function scheduleClassCourses(connection, classItem) {
  const { class_id, NOS } = classItem;
  
  // Get all courses for this class
  const coursesResult = await connection.execute(
    `SELECT cc.course_code, c.course_name, c.course_type, c.hours_week, c.credits
     FROM ClassCourse cc
     JOIN Courses c ON cc.course_code = c.course_code
     WHERE cc.class_id = :class_id
     ORDER BY c.course_type DESC, c.hours_week DESC`, // LABs first, then by hours
    [class_id],
    { outFormat: 2 }
  );
  
  for (const course of coursesResult.rows) {
    await scheduleCourse(connection, class_id, course, NOS);
  }
}

/**
 * Schedule a single course for a class
 * Uses greedy algorithm to find available slots
 */
async function scheduleCourse(connection, class_id, course, nos) {
  const { course_code, course_type, hours_week } = course;
  
  // Find eligible faculty for this course
  const facultyResult = await connection.execute(
    `SELECT f.fac_id, f.fac_name, f.max_hours_week,
            NVL((SELECT SUM(c2.hours_week) 
                 FROM Timetable t2 
                 JOIN Courses c2 ON t2.course_code = c2.course_code 
                 WHERE t2.fac_id = f.fac_id), 0) as current_hours
     FROM CourseFaculty cf
     JOIN Faculty f ON cf.fac_id = f.fac_id
     WHERE cf.course_code = :course_code
     ORDER BY current_hours ASC`, // Pick faculty with least current hours
    [course_code],
    { outFormat: 2 }
  );
  
  if (facultyResult.rows.length === 0) {
    console.warn(`No faculty assigned to course ${course_code}`);
    return;
  }
  
  // Find faculty with available hours
  let selectedFaculty = null;
  for (const fac of facultyResult.rows) {
    if (fac.CURRENT_HOURS + hours_week <= fac.MAX_HOURS_WEEK) {
      selectedFaculty = fac;
      break;
    }
  }
  
  if (!selectedFaculty) {
    console.warn(`No faculty available with sufficient hours for course ${course_code}`);
    return;
  }
  
  // Get appropriate room type
  const roomType = course_type === 'LAB' ? 'LAB' : 'LECTURE';
  
  // Get available rooms
  const roomsResult = await connection.execute(
    `SELECT room_no, capacity FROM Classrooms 
     WHERE room_type = :roomType AND capacity >= :nos
     ORDER BY capacity ASC`, // Pick smallest suitable room
    { roomType, nos },
    { outFormat: 2 }
  );
  
  if (roomsResult.rows.length === 0) {
    console.warn(`No suitable ${roomType} room found for class ${class_id}`);
    return;
  }
  
  // Allocate slots
  if (course_type === 'LAB') {
    // LAB: Try to find consecutive slots on same day
    await allocateLabSlots(connection, class_id, course_code, selectedFaculty.FAC_ID, 
                          roomsResult.rows, hours_week);
  } else {
    // THEORY: Allocate individual slots
    await allocateTheorySlots(connection, class_id, course_code, selectedFaculty.FAC_ID, 
                             roomsResult.rows, hours_week);
  }
}

/**
 * Allocate consecutive slots for LAB courses
 */
async function allocateLabSlots(connection, class_id, course_code, fac_id, rooms, hours_week) {
  // Get available lab slots grouped by day
  const slotsResult = await connection.execute(
    `SELECT slot_id, day_of_week, start_time, end_time 
     FROM TimeSlots 
     WHERE is_break = 0
     ORDER BY day_of_week, start_time`,
    [],
    { outFormat: 2 }
  );
  
  const slots = slotsResult.rows;
  const slotsNeeded = Math.ceil(hours_week / 1); // Assuming 1 hour per slot
  
  // Group slots by day
  const slotsByDay = {};
  for (const slot of slots) {
    const day = slot.DAY_OF_WEEK;
    if (!slotsByDay[day]) slotsByDay[day] = [];
    slotsByDay[day].push(slot);
  }
  
  // Try to find consecutive slots on same day
  for (const day in slotsByDay) {
    const daySlots = slotsByDay[day];
    
    for (let i = 0; i <= daySlots.length - slotsNeeded; i++) {
      const consecutiveSlots = daySlots.slice(i, i + slotsNeeded);
      
      // Check if all slots and room are available
      let allAvailable = true;
      let selectedRoom = null;
      
      for (const room of rooms) {
        let roomAvailable = true;
        
        for (const slot of consecutiveSlots) {
          const available = await checkSlotAvailable(connection, class_id, fac_id, 
                                                     room.ROOM_NO, slot.SLOT_ID);
          if (!available) {
            roomAvailable = false;
            break;
          }
        }
        
        if (roomAvailable) {
          selectedRoom = room;
          break;
        }
      }
      
      if (selectedRoom) {
        // Allocate all consecutive slots
        for (const slot of consecutiveSlots) {
          await insertTimetableEntry(connection, class_id, course_code, fac_id, 
                                    selectedRoom.ROOM_NO, slot.SLOT_ID);
        }
        return; // Successfully allocated
      }
    }
  }
  
  console.warn(`Could not find consecutive slots for LAB course ${course_code}`);
}

/**
 * Allocate individual slots for THEORY courses
 */
async function allocateTheorySlots(connection, class_id, course_code, fac_id, rooms, hours_week) {
  const slotsResult = await connection.execute(
    `SELECT slot_id, day_of_week, start_time FROM TimeSlots 
     WHERE is_break = 0 AND is_lab = 0
     ORDER BY day_of_week, start_time`,
    [],
    { outFormat: 2 }
  );
  
  const slots = slotsResult.rows;
  const slotsNeeded = Math.ceil(hours_week / 1);
  let allocatedCount = 0;
  
  for (const slot of slots) {
    if (allocatedCount >= slotsNeeded) break;
    
    // Try each room until we find an available one
    for (const room of rooms) {
      const available = await checkSlotAvailable(connection, class_id, fac_id, 
                                                room.ROOM_NO, slot.SLOT_ID);
      
      if (available) {
        await insertTimetableEntry(connection, class_id, course_code, fac_id, 
                                  room.ROOM_NO, slot.SLOT_ID);
        allocatedCount++;
        break; // Move to next slot
      }
    }
  }
  
  if (allocatedCount < slotsNeeded) {
    console.warn(`Only allocated ${allocatedCount}/${slotsNeeded} slots for course ${course_code}`);
  }
}

/**
 * Check if a slot is available (no clashes)
 */
async function checkSlotAvailable(connection, class_id, fac_id, room_no, slot_id) {
  // Check class clash
  const classResult = await connection.execute(
    `SELECT COUNT(*) as cnt FROM Timetable 
     WHERE class_id = :class_id AND slot_id = :slot_id`,
    { class_id, slot_id },
    { outFormat: 2 }
  );
  
  if (classResult.rows[0].CNT > 0) return false;
  
  // Check faculty clash
  const facResult = await connection.execute(
    `SELECT COUNT(*) as cnt FROM Timetable 
     WHERE fac_id = :fac_id AND slot_id = :slot_id`,
    { fac_id, slot_id },
    { outFormat: 2 }
  );
  
  if (facResult.rows[0].CNT > 0) return false;
  
  // Check room clash
  const roomResult = await connection.execute(
    `SELECT COUNT(*) as cnt FROM Timetable 
     WHERE room_no = :room_no AND slot_id = :slot_id`,
    { room_no, slot_id },
    { outFormat: 2 }
  );
  
  if (roomResult.rows[0].CNT > 0) return false;
  
  return true; // No clashes
}

/**
 * Insert a timetable entry and update relationship tables
 */
async function insertTimetableEntry(connection, class_id, course_code, fac_id, room_no, slot_id) {
  // Insert into Timetable
  await connection.execute(
    `INSERT INTO Timetable (class_id, course_code, fac_id, room_no, slot_id)
     VALUES (:class_id, :course_code, :fac_id, :room_no, :slot_id)`,
    { class_id, course_code, fac_id, room_no, slot_id },
    { autoCommit: false }
  );
  
  // Update ClassSlot (if not exists)
  await connection.execute(
    `INSERT INTO ClassSlot (class_id, slot_id)
     SELECT :class_id, :slot_id FROM DUAL
     WHERE NOT EXISTS (SELECT 1 FROM ClassSlot WHERE class_id = :class_id AND slot_id = :slot_id)`,
    { class_id, slot_id },
    { autoCommit: false }
  );
  
  // Update FacultySlot (if not exists)
  await connection.execute(
    `INSERT INTO FacultySlot (fac_id, slot_id)
     SELECT :fac_id, :slot_id FROM DUAL
     WHERE NOT EXISTS (SELECT 1 FROM FacultySlot WHERE fac_id = :fac_id AND slot_id = :slot_id)`,
    { fac_id, slot_id },
    { autoCommit: false }
  );
  
  // Update ClassroomSlot (if not exists)
  await connection.execute(
    `INSERT INTO ClassroomSlot (room_no, slot_id)
     SELECT :room_no, :slot_id FROM DUAL
     WHERE NOT EXISTS (SELECT 1 FROM ClassroomSlot WHERE room_no = :room_no AND slot_id = :slot_id)`,
    { room_no, slot_id },
    { autoCommit: false }
  );
}

/**
 * Get timetable for a specific class
 */
export async function getTimetableByClass(class_id) {
  const sql = `SELECT t.id, t.class_id, c.sec, c.year, c.sem,
                      t.course_code, co.course_name, co.course_type,
                      t.fac_id, f.fac_name,
                      t.room_no, r.room_type,
                      t.slot_id, ts.day_of_week, ts.start_time, ts.end_time
               FROM Timetable t
               JOIN Classes c ON t.class_id = c.class_id
               JOIN Courses co ON t.course_code = co.course_code
               JOIN Faculty f ON t.fac_id = f.fac_id
               JOIN Classrooms r ON t.room_no = r.room_no
               JOIN TimeSlots ts ON t.slot_id = ts.slot_id
               WHERE t.class_id = :class_id
               ORDER BY ts.day_of_week, ts.start_time`;
  
  const result = await executeQuery(sql, [class_id]);
  return result.rows;
}

/**
 * Get timetable for a specific faculty
 */
export async function getTimetableByFaculty(fac_id) {
  const sql = `SELECT t.id, t.class_id, c.sec, c.year,
                      t.course_code, co.course_name,
                      t.room_no,
                      t.slot_id, ts.day_of_week, ts.start_time, ts.end_time
               FROM Timetable t
               JOIN Classes c ON t.class_id = c.class_id
               JOIN Courses co ON t.course_code = co.course_code
               JOIN TimeSlots ts ON t.slot_id = ts.slot_id
               WHERE t.fac_id = :fac_id
               ORDER BY ts.day_of_week, ts.start_time`;
  
  const result = await executeQuery(sql, [fac_id]);
  return result.rows;
}

/**
 * Get timetable for a specific room
 */
export async function getTimetableByRoom(room_no) {
  const sql = `SELECT t.id, t.class_id, c.sec,
                      t.course_code, co.course_name,
                      t.fac_id, f.fac_name,
                      t.slot_id, ts.day_of_week, ts.start_time, ts.end_time
               FROM Timetable t
               JOIN Classes c ON t.class_id = c.class_id
               JOIN Courses co ON t.course_code = co.course_code
               JOIN Faculty f ON t.fac_id = f.fac_id
               JOIN TimeSlots ts ON t.slot_id = ts.slot_id
               WHERE t.room_no = :room_no
               ORDER BY ts.day_of_week, ts.start_time`;
  
  const result = await executeQuery(sql, [room_no]);
  return result.rows;
}

export default {
  generateTimetable,
  getTimetableByClass,
  getTimetableByFaculty,
  getTimetableByRoom
};
