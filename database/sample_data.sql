-- ============================================
-- SAMPLE DATA FOR TESTING
-- Academic Timetable Generation System
-- ============================================
-- This script provides sample data to test the system
-- Run this AFTER creating the schema
-- ============================================

-- Sample Departments
INSERT INTO Department (dept_name, programsOffered, AcadYear) VALUES ('Computer Science', 'B.Tech, M.Tech', 2024);
INSERT INTO Department (dept_name, programsOffered, AcadYear) VALUES ('Electronics', 'B.Tech', 2024);
INSERT INTO Department (dept_name, programsOffered, AcadYear) VALUES ('Mechanical', 'B.Tech', 2024);

-- Sample Faculty
INSERT INTO Faculty (fac_name, dept_id, design, max_hours_week) VALUES ('Dr. John Smith', 1, 'Professor', 20);
INSERT INTO Faculty (fac_name, dept_id, design, max_hours_week) VALUES ('Dr. Sarah Johnson', 1, 'Associate Professor', 18);
INSERT INTO Faculty (fac_name, dept_id, design, max_hours_week) VALUES ('Mr. Mike Davis', 1, 'Assistant Professor', 20);
INSERT INTO Faculty (fac_name, dept_id, design, max_hours_week) VALUES ('Dr. Emily Brown', 2, 'Professor', 18);
INSERT INTO Faculty (fac_name, dept_id, design, max_hours_week) VALUES ('Mr. Robert Wilson', 3, 'Assistant Professor', 20);

-- Sample Courses
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) 
VALUES ('CS101', 'Introduction to Programming', 4, 'THEORY', 'CORE', 4, 1, 1);
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) 
VALUES ('CS101L', 'Programming Lab', 2, 'LAB', 'CORE', 2, 1, 1);
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) 
VALUES ('CS102', 'Data Structures', 4, 'THEORY', 'CORE', 4, 1, 1);
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) 
VALUES ('CS102L', 'Data Structures Lab', 2, 'LAB', 'CORE', 2, 1, 1);
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) 
VALUES ('CS201', 'Database Management', 4, 'THEORY', 'CORE', 4, 3, 1);

-- Sample Classes
INSERT INTO Classes (sec, year, sem, NOS, programs_offered, fac_id) VALUES ('A', 1, 1, 60, 'B.Tech CSE', 1);
INSERT INTO Classes (sec, year, sem, NOS, programs_offered, fac_id) VALUES ('B', 1, 1, 60, 'B.Tech CSE', 2);
INSERT INTO Classes (sec, year, sem, NOS, programs_offered, fac_id) VALUES ('A', 2, 3, 55, 'B.Tech CSE', 3);

-- Sample Classrooms
INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared) VALUES ('101', 'LECTURE', 70, 'FULL_DAY', 0);
INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared) VALUES ('102', 'LECTURE', 70, 'FULL_DAY', 0);
INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared) VALUES ('103', 'LECTURE', 70, 'FULL_DAY', 0);
INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared) VALUES ('LAB1', 'LAB', 30, 'FULL_DAY', 0);
INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared) VALUES ('LAB2', 'LAB', 30, 'FULL_DAY', 0);

-- Sample Time Slots (Monday to Friday, 9 AM to 5 PM)
-- Monday
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '09:00:00', '10:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '10:00:00', '11:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '11:00:00', '12:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '12:00:00', '13:00:00', 0, 1);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '13:00:00', '14:00:00', 1, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Monday', '14:00:00', '15:00:00', 1, 0);

-- Tuesday
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '09:00:00', '10:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '10:00:00', '11:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '11:00:00', '12:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '12:00:00', '13:00:00', 0, 1);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '13:00:00', '14:00:00', 1, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Tuesday', '14:00:00', '15:00:00', 1, 0);

-- Wednesday
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '09:00:00', '10:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '10:00:00', '11:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '11:00:00', '12:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Wednesday', '12:00:00', '13:00:00', 0, 1);

-- Thursday
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '09:00:00', '10:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '10:00:00', '11:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '11:00:00', '12:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Thursday', '12:00:00', '13:00:00', 0, 1);

-- Friday
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Friday', '09:00:00', '10:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Friday', '10:00:00', '11:00:00', 0, 0);
INSERT INTO TimeSlots (day_of_week, start_time, end_time, is_lab, is_break) VALUES ('Friday', '11:00:00', '12:00:00', 0, 0);

-- Link Courses to Faculty (CourseFaculty)
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS101', 1);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS101L', 2);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS102', 2);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS102L', 3);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS201', 1);

-- Link Courses to Classes (ClassCourse)
-- Class 1 (Year 1, Sem 1, Sec A) gets CS101, CS101L, CS102, CS102L
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS101');
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS101L');
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS102');
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS102L');

-- Class 2 (Year 1, Sem 1, Sec B) gets CS101, CS101L, CS102, CS102L
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'CS101');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'CS101L');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'CS102');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'CS102L');

-- Class 3 (Year 2, Sem 3, Sec A) gets CS201
INSERT INTO ClassCourse (class_id, course_code) VALUES (3, 'CS201');

COMMIT;

-- ============================================
-- Sample data inserted successfully!
-- You can now:
-- 1. Register a user account
-- 2. Login to the system
-- 3. View the sample data
-- 4. Generate timetable for Semester 1
-- ============================================
