-- Link courses to Class 4 (Year 1, Sem 1, Sec A)
INSERT INTO ClassCourse (class_id, course_code) VALUES (4, 'AM522I1A');
INSERT INTO ClassCourse (class_id, course_code) VALUES (4, 'AM522I1AL');
INSERT INTO ClassCourse (class_id, course_code) VALUES (4, 'AM522I2A');
INSERT INTO ClassCourse (class_id, course_code) VALUES (4, 'AM522I2AL');

-- Link courses to Class 5 (Year 1, Sem 1, Sec B)
INSERT INTO ClassCourse (class_id, course_code) VALUES (5, 'AM522I1A');
INSERT INTO ClassCourse (class_id, course_code) VALUES (5, 'AM522I1AL');
INSERT INTO ClassCourse (class_id, course_code) VALUES (5, 'AM522I2A');
INSERT INTO ClassCourse (class_id, course_code) VALUES (5, 'AM522I2AL');

COMMIT;

-- Verify
SELECT cc.class_id, c.sec, cc.course_code, co.course_name
FROM ClassCourse cc
JOIN Classes c ON cc.class_id = c.class_id
JOIN Courses co ON cc.course_code = co.course_code
WHERE c.year = 1 AND c.sem = 1
ORDER BY cc.class_id, cc.course_code;

exit;
