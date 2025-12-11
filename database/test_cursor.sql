-- Test with cursor definitions
CREATE OR REPLACE PROCEDURE Generate_TimeTable (
    p_year IN NUMBER,
    p_sem IN NUMBER,
    p_process_id OUT VARCHAR2
)
AS
    -- Variables
    v_process_id VARCHAR2(50);
    
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
    
    -- Log start
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Test with cursors for Year ' || p_year || ', Sem ' || p_sem, 'INFO', v_process_id);
    
    COMMIT;
END Generate_TimeTable;
/