-- Test with loop logic
CREATE OR REPLACE PROCEDURE Generate_TimeTable (
    p_year IN NUMBER,
    p_sem IN NUMBER,
    p_process_id OUT VARCHAR2
)
AS
    -- Variables
    v_process_id VARCHAR2(50);
    v_total_classes NUMBER := 0;
    
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
    -- Generate unique process ID
    v_process_id := 'TEST_' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS');
    p_process_id := v_process_id;
    
    -- Clear existing timetable for this year/sem
    DELETE FROM Timetable
    WHERE class_id IN (SELECT class_id FROM Classes WHERE year = p_year AND sem = p_sem);
    
    -- Log start
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Starting timetable generation for Year ' || p_year || ', Sem ' || p_sem, 'INFO', v_process_id);
    
    -- Loop through each class
    FOR rec_class IN c_classes LOOP
        v_total_classes := v_total_classes + 1;
        
        -- Loop through each course for this class
        FOR rec_course IN c_courses(rec_class.class_id) LOOP
            -- Do nothing for now, just test the loop
            NULL;
        END LOOP;
    END LOOP;
    
    -- Log completion
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Test completed. Classes processed: ' || v_total_classes, 'SUCCESS', v_process_id);
    
    COMMIT;
END Generate_TimeTable;
/