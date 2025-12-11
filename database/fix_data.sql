-- Fix TimeSlots column size
ALTER TABLE TimeSlots MODIFY start_time VARCHAR2(10);
ALTER TABLE TimeSlots MODIFY end_time VARCHAR2(10);

-- Insert time slots with correct format
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '09:00', '10:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '10:00', '11:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '11:00', '12:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '12:00', '13:00', 0, 1);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '13:00', '14:00', 1, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '14:00', '15:00', 1, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '15:00', '16:00', 0, 0);

INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '09:00', '10:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '10:00', '11:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '11:00', '12:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '12:00', '13:00', 0, 1);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '13:00', '14:00', 1, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '14:00', '15:00', 1, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '15:00', '16:00', 0, 0);

INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '09:00', '10:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '10:00', '11:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '11:00', '12:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '12:00', '13:00', 0, 1);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '13:00', '14:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '14:00', '15:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '15:00', '16:00', 0, 0);

INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '09:00', '10:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '10:00', '11:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '11:00', '12:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '12:00', '13:00', 0, 1);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '13:00', '14:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '14:00', '15:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '15:00', '16:00', 0, 0);

INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Friday', '09:00', '10:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Friday', '10:00', '11:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Friday', '11:00', '12:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Friday', '12:00', '13:00', 0, 1);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Friday', '13:00', '14:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Friday', '14:00', '15:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Friday', '15:00', '16:00', 0, 0);

-- Link courses to faculty
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CSEN101', 1);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CSEN201', 2);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CSEN301', 3);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CSEN401', 4);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CSEN501', 5);

-- Link courses to classes  
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CSEN101');
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CSEN201');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'CSEN301');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'CSEN401');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'CSEN501');

COMMIT;
exit;
