-- Check courses without faculty
SELECT course_code, course_name FROM Courses 
WHERE course_code NOT IN (SELECT course_code FROM CourseFaculty)
ORDER BY course_code;

-- Add faculty assignments
INSERT INTO CourseFaculty (course_code, fac_id) 
SELECT 'AM522I6AD', 1 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CourseFaculty WHERE course_code = 'AM522I6AD');

INSERT INTO CourseFaculty (course_code, fac_id) 
SELECT 'AM522L5A', 2 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CourseFaculty WHERE course_code = 'AM522L5A');

INSERT INTO CourseFaculty (course_code, fac_id) 
SELECT 'AM522P7A', 3 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CourseFaculty WHERE course_code = 'AM522P7A');

INSERT INTO CourseFaculty (course_code, fac_id) 
SELECT 'AM522T4A', 4 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CourseFaculty WHERE course_code = 'AM522T4A');

INSERT INTO CourseFaculty (course_code, fac_id) 
SELECT 'BS52298X', 5 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CourseFaculty WHERE course_code = 'BS52298X');

INSERT INTO CourseFaculty (course_code, fac_id) 
SELECT 'BS52299X', 10 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CourseFaculty WHERE course_code = 'BS52299X');

INSERT INTO CourseFaculty (course_code, fac_id) 
SELECT 'CS522T3C', 11 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM CourseFaculty WHERE course_code = 'CS522T3C');

COMMIT;

-- Verify
SELECT co.course_code, co.course_name, cf.fac_id, f.fac_name
FROM Courses co
JOIN CourseFaculty cf ON co.course_code = cf.course_code
JOIN Faculty f ON cf.fac_id = f.fac_id
ORDER BY co.course_code;

exit;
