-- Simple test procedure to check if procedure creation works
CREATE OR REPLACE PROCEDURE TestProcedure (
    p_test IN NUMBER,
    p_result OUT VARCHAR2
)
AS
BEGIN
    p_result := 'Test successful: ' || p_test;
END TestProcedure;
/