-- ============================================
-- SAMPLE DATA FOR ACADEMIC TIMETABLE SYSTEM
-- Pre-configured with realistic academic data
-- ============================================

-- Clear existing data (in reverse dependency order)
DELETE FROM Timetable;
DELETE FROM ClassSlot;
DELETE FROM FacultySlot;
DELETE FROM ClassroomSlot;
DELETE FROM LabRequirements;
DELETE FROM ClassCourse;
DELETE FROM CourseFaculty;
DELETE FROM TimeSlots;
DELETE FROM Classrooms;
DELETE FROM Classes;
DELETE FROM Faculty;
DELETE FROM Courses;
DELETE FROM Department;

-- Reset identity columns
DROP SEQUENCE dept_seq;
DROP SEQUENCE fac_seq;
DROP SEQUENCE class_seq;
CREATE SEQUENCE dept_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE fac_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE class_seq START WITH 1 INCREMENT BY 1;

-- ============================================
-- DEPARTMENTS
-- ============================================
INSERT INTO Department (dept_id, dept_name, programsOffered, AcadYear) VALUES 
(dept_seq.NEXTVAL, 'Computer Science & Engineering', 'B.Tech, M.Tech', 2024);
INSERT INTO Department (dept_id, dept_name, programsOffered, AcadYear) VALUES 
(dept_seq.NEXTVAL, 'Electronics & Communication', 'B.Tech, M.Tech', 2024);
INSERT INTO Department (dept_id, dept_name, programsOffered, AcadYear) VALUES 
(dept_seq.NEXTVAL, 'Mechanical Engineering', 'B.Tech, M.Tech', 2024);

-- ============================================
-- COURSES
-- ============================================
-- CSE Courses
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) VALUES 
('CS101', 'Programming Fundamentals', 4, 'THEORY', 'CORE', 4, 1, 1);
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) VALUES 
('CS101L', 'Programming Lab', 2, 'LAB', 'CORE', 4, 1, 1);
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) VALUES 
('CS201', 'Data Structures', 4, 'THEORY', 'CORE', 4, 2, 1);
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) VALUES 
('CS201L', 'Data Structures Lab', 2, 'LAB', 'CORE', 4, 2, 1);
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) VALUES 
('CS301', 'Database Systems', 4, 'THEORY', 'CORE', 4, 3, 1);
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) VALUES 
('CS301L', 'Database Lab', 2, 'LAB', 'CORE', 4, 3, 1);

-- ECE Courses
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) VALUES 
('EC101', 'Basic Electronics', 4, 'THEORY', 'CORE', 4, 1, 2);
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) VALUES 
('EC101L', 'Electronics Lab', 2, 'LAB', 'CORE', 4, 1, 2);

-- ME Courses
INSERT INTO Courses (course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id) VALUES 
('ME101', 'Engineering Mechanics', 4, 'THEORY', 'CORE', 4, 1, 3);

-- ============================================
-- FACULTY
-- ============================================
INSERT INTO Faculty (fac_id, fac_name, dept_id, design, max_hours_week) VALUES 
(fac_seq.NEXTVAL, 'Dr. Alice Johnson', 1, 'Professor', 20);
INSERT INTO Faculty (fac_id, fac_name, dept_id, design, max_hours_week) VALUES 
(fac_seq.NEXTVAL, 'Prof. Bob Smith', 1, 'Associate Professor', 18);
INSERT INTO Faculty (fac_id, fac_name, dept_id, design, max_hours_week) VALUES 
(fac_seq.NEXTVAL, 'Dr. Carol Davis', 2, 'Professor', 20);
INSERT INTO Faculty (fac_id, fac_name, dept_id, design, max_hours_week) VALUES 
(fac_seq.NEXTVAL, 'Prof. David Wilson', 3, 'Associate Professor', 18);
INSERT INTO Faculty (fac_id, fac_name, dept_id, design, max_hours_week) VALUES 
(fac_seq.NEXTVAL, 'Dr. Emma Brown', 1, 'Assistant Professor', 16);

-- ============================================
-- CLASSES
-- ============================================
INSERT INTO Classes (class_id, sec, year, sem, NOS, programs_offered, fac_id) VALUES 
(class_seq.NEXTVAL, 'A', 1, 1, 60, 'B.Tech CSE', 1);
INSERT INTO Classes (class_id, sec, year, sem, NOS, programs_offered, fac_id) VALUES 
(class_seq.NEXTVAL, 'B', 1, 1, 60, 'B.Tech CSE', 2);
INSERT INTO Classes (class_id, sec, year, sem, NOS, programs_offered, fac_id) VALUES 
(class_seq.NEXTVAL, 'A', 2, 3, 55, 'B.Tech CSE', 1);

-- ============================================
-- CLASSROOMS
-- ============================================
INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared) VALUES 
('LH-101', 'LECTURE', 100, 'FULL_DAY', 0);
INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared) VALUES 
('LH-102', 'LECTURE', 80, 'FULL_DAY', 0);
INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared) VALUES 
('LAB-201', 'LAB', 30, 'FULL_DAY', 1);
INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared) VALUES 
('LAB-202', 'LAB', 30, 'FULL_DAY', 1);
INSERT INTO Classrooms (room_no, room_type, capacity, availability, is_shared) VALUES 
('LAB-301', 'LAB', 60, 'FULL_DAY', 0);

-- ============================================
-- TIMESLOTS
-- ============================================
-- Monday
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(1, 'Monday', '09:00:00', '10:00:00', 0, 0);
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(2, 'Monday', '10:00:00', '11:00:00', 0, 0);
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(3, 'Monday', '11:00:00', '12:00:00', 0, 0);
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(4, 'Monday', '12:00:00', '13:00:00', 0, 1); -- Break
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(5, 'Monday', '13:00:00', '14:00:00', 0, 0);
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(6, 'Monday', '14:00:00', '15:00:00', 0, 0);
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(7, 'Monday', '15:00:00', '16:00:00', 0, 0);
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(8, 'Monday', '16:00:00', '17:00:00', 0, 0);

-- Tuesday
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(9, 'Tuesday', '09:00:00', '10:00:00', 0, 0);
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(10, 'Tuesday', '10:00:00', '11:00:00', 0, 0);
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(11, 'Tuesday', '11:00:00', '12:00:00', 0, 0);
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(12, 'Tuesday', '12:00:00', '13:00:00', 0, 1); -- Break
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(13, 'Tuesday', '13:00:00', '15:00:00', 1, 0); -- 2-hour LAB slot
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(14, 'Tuesday', '15:00:00', '16:00:00', 0, 0);
INSERT INTO TimeSlots (slot_id, day_of_week, start_time, end_time, is_lab, is_break) VALUES 
(15, 'Tuesday', '16:00:00', '17:00:00', 0, 0);

-- Wednesday to Saturday (similar pattern)
-- (For brevity, only showing key slots)

-- ============================================
-- RELATIONSHIP TABLES
-- ============================================

-- CourseFaculty - Who teaches what
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS101', 1);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS101', 5);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS101L', 1);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS201', 2);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS201L', 2);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS301', 1);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS301L', 5);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('EC101', 3);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('EC101L', 3);
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('ME101', 4);

-- ClassCourse - What class studies what
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS101');
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS101L');
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'EC101');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'CS101');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'CS101L');
INSERT INTO ClassCourse (class_id, course_code) VALUES (2, 'ME101');
INSERT INTO ClassCourse (class_id, course_code) VALUES (3, 'CS201');
INSERT INTO ClassCourse (class_id, course_code) VALUES (3, 'CS201L');
INSERT INTO ClassCourse (class_id, course_code) VALUES (3, 'CS301');

-- LabRequirements - Which courses need consecutive slots
INSERT INTO LabRequirements (course_code, requires_consecutive_slots, min_consecutive_slots) VALUES 
('CS101L', 1, 2);
INSERT INTO LabRequirements (course_code, requires_consecutive_slots, min_consecutive_slots) VALUES 
('CS201L', 1, 2);
INSERT INTO LabRequirements (course_code, requires_consecutive_slots, min_consecutive_slots) VALUES 
('CS301L', 1, 2);
INSERT INTO LabRequirements (course_code, requires_consecutive_slots, min_consecutive_slots) VALUES 
('EC101L', 1, 2);

-- ============================================
-- COMMIT ALL CHANGES
-- ============================================
COMMIT;

-- ============================================
-- USAGE INSTRUCTIONS
-- ============================================
-- After running this script:
-- 1. Go to frontend: http://localhost:3000
-- 2. Login with admin/admin
-- 3. Navigate to "Generate Timetable"
-- 4. Select Year 1, Semester 1
-- 5. Click "Generate Timetable"
-- 6. Click "Optimize with AI" for intelligent improvements
-- 7. View results in Class/Faculty/Room views
-- ============================================

PROMPT Sample data loaded successfully!
PROMPT Ready to generate timetables with AI optimization.