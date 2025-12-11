-- Simple version of the procedure to isolate the issue
CREATE OR REPLACE PROCEDURE Generate_TimeTable (
    p_year IN NUMBER,
    p_sem IN NUMBER,
    p_process_id OUT VARCHAR2
)
AS
BEGIN
    p_process_id := 'TEST_' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS');
    
    -- Simple test - just log the start
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Test procedure called with Year ' || p_year || ', Sem ' || p_sem, 'INFO', p_process_id);
    
    COMMIT;
END Generate_TimeTable;
/