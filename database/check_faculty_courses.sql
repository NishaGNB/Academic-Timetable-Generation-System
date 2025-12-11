-- Check which courses have faculty assigned
SELECT co.course_code, co.course_name, 
       CASE WHEN cf.fac_id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_faculty
FROM Courses co
LEFT JOIN CourseFaculty cf ON co.course_code = cf.course_code
ORDER BY co.course_code;

-- Courses WITHOUT faculty
SELECT co.course_code, co.course_name
FROM Courses co
WHERE co.course_code NOT IN (SELECT course_code FROM CourseFaculty)
ORDER BY co.course_code;

-- All faculty available
SELECT fac_id, fac_name, dept_id FROM Faculty ORDER BY fac_id;

exit;
