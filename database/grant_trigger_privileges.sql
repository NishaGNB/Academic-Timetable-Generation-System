-- Connect as SYSTEM to grant privileges
-- Run this as: sqlplus system/your_system_password@localhost:1521/XEPDB1

-- Grant trigger privileges to timetable_user
GRANT CREATE TRIGGER TO timetable_user;
GRANT ALTER ANY TRIGGER TO timetable_user;
GRANT DROP ANY TRIGGER TO timetable_user;

-- Verify privileges
SELECT * FROM dba_sys_privs WHERE grantee = 'TIMETABLE_USER';

exit;
