-- Link all courses to Class 2 (Sec A, Year 3, Sem 5)

-- Delete existing links for Class 2 first
DELETE FROM ClassCourse WHERE class_id = 2;

-- Get all course codes and link them to Class 2
INSERT INTO ClassCourse (class_id, course_code)
SELECT 2, course_code FROM Courses;

COMMIT;

-- Verify all courses are linked
SELECT cc.class_id, c.sec, c.year, c.sem, cc.course_code, co.course_name, co.hours_week
FROM ClassCourse cc
JOIN Classes c ON cc.class_id = c.class_id
JOIN Courses co ON cc.course_code = co.course_code
WHERE cc.class_id = 2
ORDER BY cc.course_code;

-- Count total courses linked
SELECT COUNT(*) as total_courses FROM ClassCourse WHERE class_id = 2;

exit;
