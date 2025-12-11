-- Show all courses
SELECT * FROM Courses ORDER BY course_code;

-- Show courses linked to classes
SELECT cc.class_id, c.sec, c.year, c.sem, cc.course_code, co.course_name, co.course_type, co.hours_week
FROM ClassCourse cc
JOIN Classes c ON cc.class_id = c.class_id
JOIN Courses co ON cc.course_code = co.course_code
ORDER BY c.year, c.sem, c.sec, cc.course_code;

-- Show faculty assigned to courses
SELECT cf.course_code, co.course_name, cf.fac_id, f.fac_name
FROM CourseFaculty cf
JOIN Courses co ON cf.course_code = co.course_code
JOIN Faculty f ON cf.fac_id = f.fac_id
ORDER BY cf.course_code;

exit;
