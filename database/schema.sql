-- ============================================
-- ACADEMIC TIMETABLE GENERATION SYSTEM
-- Oracle SQL DDL Script
-- ============================================
-- This script creates all tables based on the ER diagram
-- No sample data included - DDL only
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
-- END OF SCHEMA
-- ============================================
-- All tables created successfully

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
    WHERE t.fac_id = :NEW.fac_id
    AND t.class_id = v_class_id;
    
    -- Check if adding this course would exceed max hours
    IF (v_current_hours + v_course_hours) > v_max_hours THEN
        RAISE_APPLICATION_ERROR(-20001, 
            'Faculty ' || v_fac_name || ' workload exceeded! ' ||
            'Current: ' || v_current_hours || ' hrs, ' ||
            'Adding: ' || v_course_hours || ' hrs, ' ||
            'Max allowed: ' || v_max_hours || ' hrs');
    END IF;
END;
/

-- ============================================
-- STORED PROCEDURE: Get Class Timetable
-- ============================================
-- This procedure retrieves the complete timetable for a specific class
-- Returns: class schedule with all course, faculty, room, and timeslot details

CREATE OR REPLACE PROCEDURE sp_get_class_timetable (
    p_class_id IN NUMBER,
    p_cursor OUT SYS_REFCURSOR
)
AS
BEGIN
    OPEN p_cursor FOR
        SELECT 
            t.id AS timetable_id,
            c.class_id,
            c.sec AS section,
            c.year,
            c.sem AS semester,
            cr.course_code,
            cr.course_name,
            cr.course_type,
            cr.credits,
            f.fac_id,
            f.fac_name AS faculty_name,
            f.design AS faculty_designation,
            rm.room_no,
            rm.room_type,
            rm.capacity,
            ts.slot_id,
            ts.day_of_week,
            ts.start_time,
            ts.end_time,
            ts.is_lab
        FROM Timetable t
        JOIN Classes c ON t.class_id = c.class_id
        JOIN Courses cr ON t.course_code = cr.course_code
        JOIN Faculty f ON t.fac_id = f.fac_id
        JOIN Classrooms rm ON t.room_no = rm.room_no
        JOIN TimeSlots ts ON t.slot_id = ts.slot_id
        WHERE t.class_id = p_class_id
        ORDER BY 
            CASE ts.day_of_week
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
                WHEN 'Sunday' THEN 7
            END,
            ts.start_time;
END sp_get_class_timetable;
/

-- ============================================
-- STORED PROCEDURE: Automatic Timetable Generation
-- ============================================
-- This procedure automatically generates timetable for a given year and semester
-- Uses CURSORS to iterate through classes and courses
-- Implements business rules: no conflicts, one lab per day, consecutive lab slots

CREATE OR REPLACE PROCEDURE Generate_TimeTable (
    p_year IN NUMBER,
    p_sem IN NUMBER,
    p_process_id OUT VARCHAR2
)
AS
    -- Variables
    v_process_id VARCHAR2(50);
    v_total_classes NUMBER := 0;
    v_total_courses NUMBER := 0;
    v_total_slots NUMBER := 0;
    v_success_count NUMBER := 0;
    v_error_count NUMBER := 0;
    v_fac_id NUMBER;
    v_room_no VARCHAR2(20);
    v_count NUMBER;
    
    -- Cursor for all classes in the given year and semester
    CURSOR c_classes IS
        SELECT class_id, sec, year, sem, NOS
        FROM Classes
        WHERE year = p_year AND sem = p_sem;
    
    -- Cursor for courses of a specific class
    CURSOR c_courses(p_class_id NUMBER) IS
        SELECT c.course_code, c.course_name, c.course_type, c.hours_week
        FROM ClassCourse cc
        JOIN Courses c ON cc.course_code = c.course_code
        WHERE cc.class_id = p_class_id;
    -- Cursor for available time slots
    CURSOR c_slots IS
        SELECT slot_id, day_of_week, start_time, end_time
        FROM TimeSlots
        WHERE is_break = 0
        ORDER BY 
            CASE day_of_week
                WHEN 'Monday' THEN 1
                WHEN 'Tuesday' THEN 2
                WHEN 'Wednesday' THEN 3
                WHEN 'Thursday' THEN 4
                WHEN 'Friday' THEN 5
                WHEN 'Saturday' THEN 6
            END,
            start_time;
BEGIN
    -- Generate unique process ID
    v_process_id := 'GEN_' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS');
    p_process_id := v_process_id;
    
    -- Clear existing timetable for this year/sem
    DELETE FROM Timetable
    WHERE class_id IN (SELECT class_id FROM Classes WHERE year = p_year AND sem = p_sem);
    
    -- Log start
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Starting timetable generation for Year ' || p_year || ', Sem ' || p_sem, 'INFO', v_process_id);
    
    -- Loop through each class
    FOR rec_class IN c_classes LOOP
        v_total_classes := v_total_classes + 1;
        
        -- Loop through each course for this class
        FOR rec_course IN c_courses(rec_class.class_id) LOOP
            v_total_courses := v_total_courses + 1;
            v_fac_id := NULL;
            v_room_no := NULL;
            
            -- Find eligible faculty for this course
            BEGIN
                SELECT fac_id INTO v_fac_id
                FROM (
                    SELECT cf.fac_id
                    FROM CourseFaculty cf
                    JOIN Faculty f ON cf.fac_id = f.fac_id
                    WHERE cf.course_code = rec_course.course_code
                    ORDER BY DBMS_RANDOM.VALUE
                )
                WHERE ROWNUM = 1;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN
                    INSERT INTO TimeTable_Log (msg, log_type, process_id)
                    VALUES ('No faculty found for course ' || rec_course.course_code, 'WARNING', v_process_id);
                    v_error_count := v_error_count + 1;
            END;
            
            -- Only proceed if faculty was found
            IF v_fac_id IS NOT NULL THEN
                -- Find suitable room
                BEGIN
                    SELECT room_no INTO v_room_no
                    FROM (
                        SELECT room_no
                        FROM Classrooms
                        WHERE room_type = CASE WHEN rec_course.course_type = 'LAB' THEN 'LAB' ELSE 'LECTURE' END
                        AND capacity >= rec_class.NOS
                        ORDER BY DBMS_RANDOM.VALUE
                    )
                    WHERE ROWNUM = 1;
                EXCEPTION
                    WHEN NO_DATA_FOUND THEN
                        INSERT INTO TimeTable_Log (msg, log_type, process_id)
                        VALUES ('No suitable room for course ' || rec_course.course_code, 'WARNING', v_process_id);
                        v_error_count := v_error_count + 1;
                END;
            END IF;
            
            -- Only proceed if both faculty and room were found
            IF v_fac_id IS NOT NULL AND v_room_no IS NOT NULL THEN
                -- Allocate slots for this course
                DECLARE
                    v_slots_needed NUMBER;
                    v_slots_allocated NUMBER := 0;
                    v_lab_count NUMBER;
                    v_can_use_slot NUMBER;
                BEGIN
                    v_slots_needed := rec_course.hours_week;
                    
                    FOR rec_slot IN c_slots LOOP
                        EXIT WHEN v_slots_allocated >= v_slots_needed;
                        
                        v_can_use_slot := 1; -- Assume we can use this slot
                        
                        -- For LAB courses, check if already has a lab on this day
                        IF rec_course.course_type = 'LAB' THEN
                            SELECT COUNT(*) INTO v_lab_count
                            FROM Timetable t
                            JOIN Courses c ON t.course_code = c.course_code
                            JOIN TimeSlots ts ON t.slot_id = ts.slot_id
                            WHERE t.class_id = rec_class.class_id
                            AND c.course_type = 'LAB'
                            AND ts.day_of_week = rec_slot.day_of_week;
                            
                            IF v_lab_count > 0 THEN
                                v_can_use_slot := 0;
                            END IF;
                        END IF;
                        
                        -- Check if slot is available (no conflicts)
                        IF v_can_use_slot = 1 THEN
                            v_count := 0;
                            
                            -- Check class conflict
                            SELECT COUNT(*) INTO v_count
                            FROM Timetable
                            WHERE class_id = rec_class.class_id AND slot_id = rec_slot.slot_id;
                            
                            IF v_count = 0 THEN
                                -- Check faculty conflict
                                SELECT COUNT(*) INTO v_count
                                FROM Timetable
                                WHERE fac_id = v_fac_id AND slot_id = rec_slot.slot_id;
                            END IF;
                            
                            IF v_count = 0 THEN
                                -- Check room conflict
                                SELECT COUNT(*) INTO v_count
                                FROM Timetable
                                WHERE room_no = v_room_no AND slot_id = rec_slot.slot_id;
                            END IF;
                            
                            -- If no conflicts, insert timetable entry
                            IF v_count = 0 THEN
                                INSERT INTO Timetable (class_id, course_code, fac_id, room_no, slot_id)
                                VALUES (rec_class.class_id, rec_course.course_code, v_fac_id, v_room_no, rec_slot.slot_id);
                                
                                v_slots_allocated := v_slots_allocated + 1;
                                v_total_slots := v_total_slots + 1;
                                v_success_count := v_success_count + 1;
                            END IF;
                        END IF;
                    END LOOP;
                    
                    -- Log if not all slots allocated
                    IF v_slots_allocated < v_slots_needed THEN
                        INSERT INTO TimeTable_Log (msg, log_type, process_id)
                        VALUES ('Partial allocation for ' || rec_course.course_name || ': ' || 
                               v_slots_allocated || '/' || v_slots_needed || ' slots', 'WARNING', v_process_id);
                    END IF;
                END;
            END IF;
        END LOOP;
    END LOOP;
    
    -- Log completion
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Timetable generation completed. Classes: ' || v_total_classes || 
           ', Courses: ' || v_total_courses || ', Slots: ' || v_total_slots || 
           ', Success: ' || v_success_count || ', Errors: ' || v_error_count, 'SUCCESS', v_process_id);
    
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        INSERT INTO TimeTable_Log (msg, log_type, process_id)
        VALUES ('ERROR: ' || SQLERRM, 'ERROR', v_process_id);
        COMMIT;
        RAISE;
END Generate_TimeTable;
/
-- Ready for application integration
-- ============================================
