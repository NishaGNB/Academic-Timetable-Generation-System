-- Link existing courses to faculty
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS101', 1);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS101L', 2);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS102', 3);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS102L', 4);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS201', 5);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('AM522I2A', 6);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('AM522I2AL', 7);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('AM522I1A', 8);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('AM522I1AL', 9);

-- Link courses to classes (class_id 1 and 2 exist)
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS101');
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS101L');
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS102');
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS201');

INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'AM522I2A');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'AM522I2AL');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'AM522I1A');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'AM522I1AL');

COMMIT;
exit;
