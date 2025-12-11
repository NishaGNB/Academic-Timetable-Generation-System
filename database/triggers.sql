-- TRIGGERS FOR TIMETABLE SYSTEM
-- Place this file in: project/database/triggers.sql
-- Execute: sqlplus timetable_user/timetable123@localhost:1521/XEPDB1 @triggers.sql

-- ============================================
-- 1. PREVENT DUPLICATE TIMETABLE ENTRIES
-- ============================================
CREATE OR REPLACE TRIGGER trg_prevent_duplicate_timetable
BEFORE INSERT ON Timetable
FOR EACH ROW
DECLARE
    v_count NUMBER := 0;
BEGIN
    -- Check if this class already has a class at this slot
    SELECT COUNT(*) INTO v_count
    FROM Timetable
    WHERE class_id = :NEW.class_id
    AND slot_id = :NEW.slot_id;
    
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Class already has a class scheduled at this time slot');
    END IF;
    
    -- Check if faculty is already teaching at this slot
    SELECT COUNT(*) INTO v_count
    FROM Timetable
    WHERE fac_id = :NEW.fac_id
    AND slot_id = :NEW.slot_id;
    
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20002, 'Faculty already teaching another class at this time slot');
    END IF;
    
    -- Check if room is already occupied at this slot
    SELECT COUNT(*) INTO v_count
    FROM Timetable
    WHERE room_no = :NEW.room_no
    AND slot_id = :NEW.slot_id;
    
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'Room already occupied at this time slot');
    END IF;
END;
/

-- ============================================
-- 2. AUTO-GENERATE TIMETABLE_ID
-- ============================================
CREATE OR REPLACE TRIGGER trg_timetable_id
BEFORE INSERT ON Timetable
FOR EACH ROW
BEGIN
    IF :NEW.ID IS NULL THEN
        SELECT timetable_seq.NEXTVAL INTO :NEW.ID FROM DUAL;
    END IF;
END;
/

-- ============================================
-- 3. LOG TIMETABLE CHANGES
-- ============================================
CREATE OR REPLACE TRIGGER trg_log_timetable_changes
AFTER INSERT OR UPDATE OR DELETE ON Timetable
FOR EACH ROW
DECLARE
    v_action VARCHAR2(10);
    v_msg VARCHAR2(500);
BEGIN
    IF INSERTING THEN
        v_action := 'INSERT';
        v_msg := 'Added: Class ' || :NEW.class_id || ', Course ' || :NEW.course_code || 
                 ', Faculty ' || :NEW.fac_id || ', Room ' || :NEW.room_no || ', Slot ' || :NEW.slot_id;
    ELSIF UPDATING THEN
        v_action := 'UPDATE';
        v_msg := 'Updated: Timetable ID ' || :NEW.ID;
    ELSIF DELETING THEN
        v_action := 'DELETE';
        v_msg := 'Deleted: Class ' || :OLD.class_id || ', Course ' || :OLD.course_code;
    END IF;
    
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES (v_msg, v_action, 'TRIGGER_' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'));
END;
/

-- ============================================
-- 4. VALIDATE CLASS CAPACITY BEFORE ALLOCATION
-- ============================================
CREATE OR REPLACE TRIGGER trg_validate_room_capacity
BEFORE INSERT ON Timetable
FOR EACH ROW
DECLARE
    v_class_size NUMBER := 0;
    v_room_capacity NUMBER := 0;
BEGIN
    -- Get class size
    BEGIN
        SELECT NOS INTO v_class_size
        FROM Classes
        WHERE class_id = :NEW.class_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20005, 'Invalid class ID: ' || :NEW.class_id);
    END;
    
    -- Get room capacity
    BEGIN
        SELECT capacity INTO v_room_capacity
        FROM Classrooms
        WHERE room_no = :NEW.room_no;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20005, 'Invalid room number: ' || :NEW.room_no);
    END;
    
    -- Validate
    IF v_class_size > v_room_capacity THEN
        RAISE_APPLICATION_ERROR(-20004, 
            'Room capacity (' || v_room_capacity || ') is less than class size (' || v_class_size || ')');
    END IF;
END;
/

-- ============================================
-- 5. PREVENT COURSE REPETITION ON SAME DAY
-- ============================================
CREATE OR REPLACE TRIGGER trg_prevent_course_repetition
BEFORE INSERT ON Timetable
FOR EACH ROW
DECLARE
    v_count NUMBER := 0;
    v_day VARCHAR2(20);
BEGIN
    -- Get day of week for the slot
    BEGIN
        SELECT day_of_week INTO v_day
        FROM TimeSlots
        WHERE slot_id = :NEW.slot_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20007, 'Invalid slot ID: ' || :NEW.slot_id);
    END;
    
    -- Check if this course is already scheduled for this class on this day
    SELECT COUNT(*) INTO v_count
    FROM Timetable t
    JOIN TimeSlots ts ON t.slot_id = ts.slot_id
    WHERE t.class_id = :NEW.class_id
    AND t.course_code = :NEW.course_code
    AND ts.day_of_week = v_day;
    
    IF v_count > 0 THEN
        RAISE_APPLICATION_ERROR(-20006, 
            'Course ' || :NEW.course_code || ' already scheduled for this class on ' || v_day);
    END IF;
END;
/

-- ============================================
-- SHOW ALL TRIGGERS
-- ============================================
SELECT trigger_name, status, trigger_type, triggering_event, table_name
FROM user_triggers
WHERE table_name = 'TIMETABLE'
ORDER BY trigger_name;

-- ============================================
-- TO DISABLE A TRIGGER (if needed):
-- ALTER TRIGGER trigger_name DISABLE;
--
-- TO ENABLE A TRIGGER:
-- ALTER TRIGGER trigger_name ENABLE;
--
-- TO DROP A TRIGGER:
-- DROP TRIGGER trigger_name;
-- ============================================

