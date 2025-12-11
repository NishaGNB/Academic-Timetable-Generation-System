-- Test with DELETE statement
CREATE OR REPLACE PROCEDURE Generate_TimeTable (
    p_year IN NUMBER,
    p_sem IN NUMBER,
    p_process_id OUT VARCHAR2
)
AS
    v_process_id VARCHAR2(50);
BEGIN
    v_process_id := 'GEN_' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS');
    p_process_id := v_process_id;
    
    -- Test DELETE statement
    DELETE FROM Timetable
    WHERE class_id IN (SELECT class_id FROM Classes WHERE year = p_year AND sem = p_sem);
    
    -- Test INSERT into TimeTable_Log
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Test message with DELETE', 'INFO', v_process_id);
    
    COMMIT;
END Generate_TimeTable;
/