-- Check if sequence exists
SELECT sequence_name FROM user_sequences WHERE sequence_name = 'TIMETABLE_SEQ';

-- Create sequence if it doesn't exist
CREATE SEQUENCE timetable_seq
START WITH 1
INCREMENT BY 1
NOCACHE
NOCYCLE;

-- Verify
SELECT sequence_name FROM user_sequences WHERE sequence_name = 'TIMETABLE_SEQ';

exit;
