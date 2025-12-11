-- Test with cursor definitions and loops
CREATE OR REPLACE PROCEDURE Generate_TimeTable (
    p_year IN NUMBER,
    p_sem IN NUMBER,
    p_process_id OUT VARCHAR2
)
AS
    v_process_id VARCHAR2(50);
    v_total_classes NUMBER := 0;
    
    -- Cursor for all classes in the given year and semester
    CURSOR c_classes IS
        SELECT class_id, sec, year, sem, NOS
        FROM Classes
        WHERE year = p_year AND sem = p_sem;
BEGIN
    v_process_id := 'GEN_' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS');
    p_process_id := v_process_id;
    
    -- Test DELETE statement
    DELETE FROM Timetable
    WHERE class_id IN (SELECT class_id FROM Classes WHERE year = p_year AND sem = p_sem);
    
    -- Loop through classes
    FOR rec_class IN c_classes LOOP
        v_total_classes := v_total_classes + 1;
    END LOOP;
    
    -- Test INSERT into TimeTable_Log
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Test message with cursor. Classes: ' || v_total_classes, 'INFO', v_process_id);
    
    COMMIT;
END Generate_TimeTable;
/