-- Test with DECLARE block and slot cursor
CREATE OR REPLACE PROCEDURE Generate_TimeTable (
    p_year IN NUMBER,
    p_sem IN NUMBER,
    p_process_id OUT VARCHAR2
)
AS
    v_process_id VARCHAR2(50);
    v_total_classes NUMBER := 0;
    v_total_courses NUMBER := 0;
    
    -- Cursor for all classes in the given year and semester
    CURSOR c_classes IS
        SELECT class_id, sec, year, sem, NOS
        FROM Classes
        WHERE year = p_year AND sem = p_sem;
    
    -- Cursor for courses of a specific class
    CURSOR c_courses(p_class_id NUMBER) IS
        SELECT c.course_code, c.course_name, c.course_type, c.hours_week
        FROM ClassCourse cc
        JOIN Courses c ON cc.course_code = c.course_code
        WHERE cc.class_id = p_class_id;
        
    -- Cursor for available time slots
    CURSOR c_slots IS
        SELECT slot_id, day_of_week, start_time, end_time
        FROM TimeSlots
        WHERE is_break = 0
        ORDER BY 
            CASE day_of_week
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
            END,
            start_time;
BEGIN
    v_process_id := 'GEN_' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS');
    p_process_id := v_process_id;
    
    -- Test DELETE statement
    DELETE FROM Timetable
    WHERE class_id IN (SELECT class_id FROM Classes WHERE year = p_year AND sem = p_sem);
    
    -- Loop through classes
    FOR rec_class IN c_classes LOOP
        v_total_classes := v_total_classes + 1;
        
        -- Loop through courses for this class
        FOR rec_course IN c_courses(rec_class.class_id) LOOP
            v_total_courses := v_total_courses + 1;
            
            -- Test DECLARE block with slot cursor
            DECLARE
                v_slots_needed NUMBER;
                v_slots_allocated NUMBER := 0;
            BEGIN
                v_slots_needed := rec_course.hours_week;
                
                FOR rec_slot IN c_slots LOOP
                    EXIT WHEN v_slots_allocated >= v_slots_needed;
                    v_slots_allocated := v_slots_allocated + 1;
                END LOOP;
            END;
        END LOOP;
    END LOOP;
    
    -- Test INSERT into TimeTable_Log
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Test message with DECLARE block. Classes: ' || v_total_classes || ', Courses: ' || v_total_courses, 'INFO', v_process_id);
    
    COMMIT;
END Generate_TimeTable;
/