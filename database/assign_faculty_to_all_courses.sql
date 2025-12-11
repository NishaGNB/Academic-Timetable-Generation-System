-- Assign faculty to all courses that don't have faculty yet

-- AM522I6AD - SNA
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('AM522I6AD', 1);  -- Dr. Pushpalatha K

-- AM522L5A - ML LAB
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('AM522L5A', 2);  -- Mrs Chaithrika Adithya

-- AM522P7A - MINI PROJECT
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('AM522P7A', 3);  -- Ms Deeksha J S

-- AM522T4A - ML
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('AM522T4A', 4);  -- Dr. Duddella Sai Prashanth

-- BS52298X - IPR
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('BS52298X', 5);  -- Ms Sandra Jeyes

-- BS52299X - EVS
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('BS52299X', 10);  -- Ms Shreekshitha

-- CS522T3C - ATC
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS522T3C', 11);  -- Mr Sharathchandra

COMMIT;

-- Verify all courses now have faculty
SELECT co.course_code, co.course_name, cf.fac_id, f.fac_name
FROM Courses co
JOIN CourseFaculty cf ON co.course_code = cf.course_code
JOIN Faculty f ON cf.fac_id = f.fac_id
ORDER BY co.course_code;

-- Count
SELECT COUNT(DISTINCT co.course_code) as courses_with_faculty FROM Courses co
JOIN CourseFaculty cf ON co.course_code = cf.course_code;

exit;
