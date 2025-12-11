-- Clean version of the Generate_TimeTable procedure
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