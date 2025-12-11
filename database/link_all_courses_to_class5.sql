-- First, get all courses
SELECT course_code, course_name FROM Courses ORDER BY course_code;

-- Link all courses to Class 5 (Sec B, Year 1, Sem 1)
-- Note: The output showed Class 5 is actually Sec B, not Sec A

-- Delete existing links for Class 5 first
DELETE FROM ClassCourse WHERE class_id = 5;

-- Get all course codes and link them to Class 5
INSERT INTO ClassCourse (class_id, course_code)
SELECT 5, course_code FROM Courses;

COMMIT;

-- Verify all courses are linked
SELECT cc.class_id, c.sec, c.year, c.sem, cc.course_code, co.course_name
FROM ClassCourse cc
JOIN Classes c ON cc.class_id = c.class_id
JOIN Courses co ON cc.course_code = co.course_code
WHERE cc.class_id = 5
ORDER BY cc.course_code;

exit;
