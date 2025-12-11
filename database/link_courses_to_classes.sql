-- Link courses to existing classes
-- Class 2: Year 3, Sem 5
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'AM522I2A');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'AM522I2AL');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'AM522I1A');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'AM522I1AL');

-- Class 4: Year 1, Sem 1
INSERT INTO ClassCourse (class_id, course_code) VALUES (4, 'CS101');
INSERT INTO ClassCourse (class_id, course_code) VALUES (4, 'CS101L');
INSERT INTO ClassCourse (class_id, course_code) VALUES (4, 'CS102');
INSERT INTO ClassCourse (class_id, course_code) VALUES (4, 'CS201');

-- Class 5: Year 1, Sem 1
INSERT INTO ClassCourse (class_id, course_code) VALUES (5, 'CS101');
INSERT INTO ClassCourse (class_id, course_code) VALUES (5, 'CS101L');
INSERT INTO ClassCourse (class_id, course_code) VALUES (5, 'CS102');

COMMIT;
exit;
