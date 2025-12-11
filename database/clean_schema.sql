-- ============================================
-- ACADEMIC TIMETABLE GENERATION SYSTEM
-- Oracle SQL DDL Script
-- ============================================

-- Drop existing tables in reverse dependency order
DROP TABLE Timetable CASCADE CONSTRAINTS;
DROP TABLE ClassSlot CASCADE CONSTRAINTS;
DROP TABLE FacultySlot CASCADE CONSTRAINTS;
DROP TABLE ClassroomSlot CASCADE CONSTRAINTS;
DROP TABLE LabRequirements CASCADE CONSTRAINTS;
DROP TABLE ClassCourse CASCADE CONSTRAINTS;
DROP TABLE CourseFaculty CASCADE CONSTRAINTS;
DROP TABLE TimeTable_Log CASCADE CONSTRAINTS;
DROP TABLE TimeSlots CASCADE CONSTRAINTS;
DROP TABLE Classrooms CASCADE CONSTRAINTS;
DROP TABLE Classes CASCADE CONSTRAINTS;
DROP TABLE Faculty CASCADE CONSTRAINTS;
DROP TABLE Courses CASCADE CONSTRAINTS;
DROP TABLE Department CASCADE CONSTRAINTS;
DROP TABLE Users CASCADE CONSTRAINTS;

-- ============================================
-- CORE ENTITIES
-- ============================================

-- Users: System users for authentication
CREATE TABLE Users (
    user_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username VARCHAR2(50) NOT NULL UNIQUE,
    password VARCHAR2(255) NOT NULL,
    full_name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) NOT NULL UNIQUE,
    role VARCHAR2(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_role_chk CHECK (role IN ('ADMIN', 'USER'))
);

-- Department: Represents academic departments
-- Constraint: Same department name cannot exist twice in the same academic year
CREATE TABLE Department (
    dept_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dept_name VARCHAR2(100) NOT NULL,
    programsOffered VARCHAR2(255),
    AcadYear NUMBER(4) NOT NULL,
    CONSTRAINT dept_name_year_uk UNIQUE (dept_name, AcadYear)
);

-- Courses: Academic courses offered by departments
-- Each course belongs to one department (M:1)
CREATE TABLE Courses (
    course_code VARCHAR2(20) PRIMARY KEY,
    course_name VARCHAR2(150) NOT NULL,
    credits NUMBER NOT NULL,
    course_type VARCHAR2(10) NOT NULL,          -- THEORY or LAB
    course_cat VARCHAR2(15) NOT NULL,           -- CORE or ELECTIVE
    hours_week NUMBER NOT NULL,                 -- Total hours per week
    sem NUMBER NOT NULL,                        -- Semester number
    dept_id NUMBER NOT NULL,
    CONSTRAINT course_type_chk CHECK (course_type IN ('THEORY', 'LAB')),
    CONSTRAINT course_cat_chk CHECK (course_cat IN ('CORE', 'ELECTIVE')),
    CONSTRAINT course_dept_fk FOREIGN KEY (dept_id) REFERENCES Department(dept_id) ON DELETE CASCADE
);

-- Faculty: Teaching staff belonging to departments
-- Each faculty belongs to one department (M:1)
CREATE TABLE Faculty (
    fac_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fac_name VARCHAR2(100) NOT NULL,
    dept_id NUMBER,
    design VARCHAR2(50),                        -- Designation (Professor, Asst. Prof, etc.)
    max_hours_week NUMBER NOT NULL,             -- Maximum teaching hours per week
    CONSTRAINT fac_dept_fk FOREIGN KEY (dept_id) REFERENCES Department(dept_id) ON DELETE SET NULL
);

-- Classes: Student class sections
-- Each class has one faculty advisor/mentor (M:1)
CREATE TABLE Classes (
    class_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sec VARCHAR2(10) NOT NULL,                  -- Section (A, B, C, etc.)
    year NUMBER NOT NULL,                       -- Academic year (1, 2, 3, 4)
    sem NUMBER NOT NULL,                        -- Semester number
    NOS NUMBER NOT NULL,                        -- Number of Students
    programs_offered VARCHAR2(100),
    fac_id NUMBER,                              -- Class advisor/mentor faculty
    CONSTRAINT class_fac_fk FOREIGN KEY (fac_id) REFERENCES Faculty(fac_id) ON DELETE SET NULL
);

-- Classrooms: Physical rooms for conducting classes
CREATE TABLE Classrooms (
    room_no VARCHAR2(20) PRIMARY KEY,
    room_type VARCHAR2(10) NOT NULL,            -- LECTURE or LAB
    capacity NUMBER NOT NULL,                   -- Maximum student capacity
    availability VARCHAR2(20) DEFAULT 'FULL_DAY',
    is_shared NUMBER(1) DEFAULT 0,              -- 0=dedicated, 1=shared
    CONSTRAINT room_type_chk CHECK (room_type IN ('LECTURE', 'LAB')),
    CONSTRAINT is_shared_chk CHECK (is_shared IN (0, 1))
);

-- TimeSlots: Time periods for scheduling classes
-- Unique combination of day and start time
CREATE TABLE TimeSlots (
    slot_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    day_of_week VARCHAR2(15) NOT NULL,          -- Monday, Tuesday, etc.
    start_time VARCHAR2(8) NOT NULL,            -- Format: HH24:MI:SS (e.g., 09:00:00)
    end_time VARCHAR2(8) NOT NULL,              -- Format: HH24:MI:SS (e.g., 10:00:00)
    is_lab NUMBER(1) DEFAULT 0,                 -- 0=regular slot, 1=lab slot (longer duration)
    is_break NUMBER(1) DEFAULT 0,               -- 0=class slot, 1=break slot
    CONSTRAINT is_lab_chk CHECK (is_lab IN (0, 1)),
    CONSTRAINT is_break_chk CHECK (is_break IN (0, 1)),
    CONSTRAINT timeslot_day_start_uk UNIQUE (day_of_week, start_time)
);

-- ============================================
-- RELATIONSHIP TABLES (M:N)
-- ============================================

-- CourseFaculty: Represents "assigned" relationship
-- M:N between Courses and Faculty (a course can be taught by multiple faculty, a faculty can teach multiple courses)
CREATE TABLE CourseFaculty (
    course_code VARCHAR2(20) NOT NULL,
    fac_id NUMBER NOT NULL,
    PRIMARY KEY (course_code, fac_id),
    CONSTRAINT cf_course_fk FOREIGN KEY (course_code) REFERENCES Courses(course_code) ON DELETE CASCADE,
    CONSTRAINT cf_fac_fk FOREIGN KEY (fac_id) REFERENCES Faculty(fac_id) ON DELETE CASCADE
);

-- ClassCourse: Represents "has" relationship
-- M:N between Classes and Courses (a class has multiple courses, a course can be taken by multiple classes)
CREATE TABLE ClassCourse (
    class_id NUMBER NOT NULL,
    course_code VARCHAR2(20) NOT NULL,
    PRIMARY KEY (class_id, course_code),
    CONSTRAINT cc_class_fk FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
    CONSTRAINT cc_course_fk FOREIGN KEY (course_code) REFERENCES Courses(course_code) ON DELETE CASCADE
);

-- LabRequirements: Specifies which courses need consecutive lab slots
CREATE TABLE LabRequirements (
    course_code VARCHAR2(20) PRIMARY KEY,
    requires_consecutive_slots NUMBER(1) DEFAULT 1,  -- 1=yes, 0=no
    min_consecutive_slots NUMBER DEFAULT 2,          -- Minimum number of consecutive slots needed
    CONSTRAINT lr_course_fk FOREIGN KEY (course_code) REFERENCES Courses(course_code) ON DELETE CASCADE,
    CONSTRAINT lr_consecutive_chk CHECK (requires_consecutive_slots IN (0, 1))
);

-- ClassroomSlot: Represents "allocated_to" relationship
-- M:N between Classrooms and TimeSlots (a room can be allocated to multiple slots, a slot can use multiple rooms)
CREATE TABLE ClassroomSlot (
    room_no VARCHAR2(20) NOT NULL,
    slot_id NUMBER NOT NULL,
    PRIMARY KEY (room_no, slot_id),
    CONSTRAINT cs_room_fk FOREIGN KEY (room_no) REFERENCES Classrooms(room_no) ON DELETE CASCADE,
    CONSTRAINT cs_slot_fk FOREIGN KEY (slot_id) REFERENCES TimeSlots(slot_id) ON DELETE CASCADE
);

-- FacultySlot: Represents "occupiedBy" relationship
-- M:N between Faculty and TimeSlots (a faculty can occupy multiple slots, a slot can have multiple faculty across different rooms)
CREATE TABLE FacultySlot (
    fac_id NUMBER NOT NULL,
    slot_id NUMBER NOT NULL,
    PRIMARY KEY (fac_id, slot_id),
    CONSTRAINT fs_fac_fk FOREIGN KEY (fac_id) REFERENCES Faculty(fac_id) ON DELETE CASCADE,
    CONSTRAINT fs_slot_fk FOREIGN KEY (slot_id) REFERENCES TimeSlots(slot_id) ON DELETE CASCADE
);

-- ClassSlot: Represents "scheduled_in" relationship
-- M:N between Classes and TimeSlots (a class is scheduled in multiple slots, a slot can have multiple classes in different rooms)
CREATE TABLE ClassSlot (
    class_id NUMBER NOT NULL,
    slot_id NUMBER NOT NULL,
    PRIMARY KEY (class_id, slot_id),
    CONSTRAINT cls_class_fk FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
    CONSTRAINT cls_slot_fk FOREIGN KEY (slot_id) REFERENCES TimeSlots(slot_id) ON DELETE CASCADE
);

-- ============================================
-- CENTRAL TIMETABLE (FACT TABLE)
-- ============================================

-- Timetable: Central entity tying together Class, Course, Faculty, Classroom, and TimeSlot
-- Represents one scheduled class session
-- Constraints ensure no double-booking:
--   - A class cannot be in two places at the same time (class_id, slot_id unique)
--   - A faculty cannot teach in two places at the same time (fac_id, slot_id unique)
--   - A room cannot be used for two classes at the same time (room_no, slot_id unique)
CREATE TABLE Timetable (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    class_id NUMBER NOT NULL,
    course_code VARCHAR2(20) NOT NULL,
    fac_id NUMBER NOT NULL,
    room_no VARCHAR2(20) NOT NULL,
    slot_id NUMBER NOT NULL,
    CONSTRAINT tt_class_fk FOREIGN KEY (class_id) REFERENCES Classes(class_id) ON DELETE CASCADE,
    CONSTRAINT tt_course_fk FOREIGN KEY (course_code) REFERENCES Courses(course_code) ON DELETE CASCADE,
    CONSTRAINT tt_fac_fk FOREIGN KEY (fac_id) REFERENCES Faculty(fac_id) ON DELETE CASCADE,
    CONSTRAINT tt_room_fk FOREIGN KEY (room_no) REFERENCES Classrooms(room_no) ON DELETE CASCADE,
    CONSTRAINT tt_slot_fk FOREIGN KEY (slot_id) REFERENCES TimeSlots(slot_id) ON DELETE CASCADE,
    CONSTRAINT tt_class_slot_uk UNIQUE (class_id, slot_id),
    CONSTRAINT tt_fac_slot_uk UNIQUE (fac_id, slot_id),
    CONSTRAINT tt_room_slot_uk UNIQUE (room_no, slot_id)
);

-- ============================================
-- LOGGING TABLE FOR TIMETABLE GENERATION
-- ============================================

-- TimeTable_Log: Stores logs and messages from timetable generation process
CREATE TABLE TimeTable_Log (
    log_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    msg VARCHAR2(1000) NOT NULL,
    log_time TIMESTAMP DEFAULT SYSTIMESTAMP,
    log_type VARCHAR2(20) DEFAULT 'INFO',  -- INFO, WARNING, ERROR, SUCCESS
    process_id VARCHAR2(50),               -- To track specific generation runs
    CONSTRAINT log_type_chk CHECK (log_type IN ('INFO', 'WARNING', 'ERROR', 'SUCCESS'))
);

-- ============================================
-- TRIGGER: Validate Faculty Workload
-- ============================================
-- This trigger ensures that when a timetable entry is inserted,
-- the faculty's total teaching hours don't exceed their max_hours_week

CREATE OR REPLACE TRIGGER trg_check_faculty_workload
BEFORE INSERT ON Timetable
FOR EACH ROW
DECLARE
    v_max_hours NUMBER;
    v_current_hours NUMBER;
    v_course_hours NUMBER;
    v_fac_name VARCHAR2(100);
    v_class_id NUMBER;
BEGIN
    -- Store the class_id from the new row
    v_class_id := :NEW.class_id;
    
    -- Get faculty's maximum hours and current assigned hours
    SELECT f.max_hours_week, f.fac_name
    INTO v_max_hours, v_fac_name
    FROM Faculty f
    WHERE f.fac_id = :NEW.fac_id;
    
    -- Get the course hours for the new timetable entry
    SELECT c.hours_week
    INTO v_course_hours
    FROM Courses c
    WHERE c.course_code = :NEW.course_code;
    
    -- Calculate current total hours already assigned to this faculty
    SELECT NVL(SUM(c.hours_week), 0)
    INTO v_current_hours
    FROM Timetable t
    JOIN Courses c ON t.course_code = c.course_code
    WHERE