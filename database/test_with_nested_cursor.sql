-- Test with nested cursor and loop
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
        END LOOP;
    END LOOP;
    
    -- Test INSERT into TimeTable_Log
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Test message with nested cursor. Classes: ' || v_total_classes || ', Courses: ' || v_total_courses, 'INFO', v_process_id);
    
    COMMIT;
END Generate_TimeTable;
/