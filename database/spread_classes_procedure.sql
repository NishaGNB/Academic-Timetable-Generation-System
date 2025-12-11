CREATE OR REPLACE PROCEDURE Generate_TimeTable (
    p_year IN NUMBER,
    p_sem IN NUMBER,
    p_process_id OUT VARCHAR2
)
AS
    v_process_id VARCHAR2(50);
    v_total_classes NUMBER := 0;
    v_total_courses NUMBER := 0;
    v_total_slots NUMBER := 0;
    v_success_count NUMBER := 0;
    v_error_count NUMBER := 0;
    v_completion_msg VARCHAR2(500);
    v_error_msg VARCHAR2(1000);
    v_error_process_id VARCHAR2(50);
    
    CURSOR c_classes IS
        SELECT class_id, sec, year, sem, NOS
        FROM Classes
        WHERE year = p_year AND sem = p_sem;
        
    CURSOR c_days IS
        SELECT DISTINCT day_of_week
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
            END;
BEGIN
    v_process_id := 'GEN_' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS');
    p_process_id := v_process_id;
    
    DELETE FROM Timetable
    WHERE class_id IN (SELECT class_id FROM Classes WHERE year = p_year AND sem = p_sem);
    
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Starting timetable generation for Year ' || TO_CHAR(p_year) || ', Sem ' || TO_CHAR(p_sem), 'INFO', v_process_id);
    
    -- Loop through each day
    FOR rec_day IN c_days LOOP
        -- Loop through each class
        FOR rec_class IN c_classes LOOP
            v_total_classes := v_total_classes + 1;
            
            -- Get all courses for this class
            FOR rec_course IN (
                SELECT c.course_code, c.course_name, c.course_type, c.hours_week
                FROM ClassCourse cc
                JOIN Courses c ON cc.course_code = c.course_code
                WHERE cc.class_id = rec_class.class_id
            ) LOOP
                v_total_courses := v_total_courses + 1;
                
                DECLARE
                    v_fac_id NUMBER;
                    v_room_no VARCHAR2(20);
                    v_slots_allocated NUMBER := 0;
                BEGIN
                    -- Find faculty
                    BEGIN
                        SELECT fac_id INTO v_fac_id
                        FROM (
                            SELECT cf.fac_id
                            FROM CourseFaculty cf
                            WHERE cf.course_code = rec_course.course_code
                            ORDER BY DBMS_RANDOM.VALUE
                        )
                        WHERE ROWNUM = 1;
                    EXCEPTION
                        WHEN NO_DATA_FOUND THEN
                            v_error_count := v_error_count + 1;
                            CONTINUE;
                    END;
                    
                    -- Find room
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
                            v_error_count := v_error_count + 1;
                            CONTINUE;
                    END;
                    
                    -- Allocate slots for this course on current day
                    FOR rec_slot IN (
                        SELECT slot_id
                        FROM TimeSlots
                        WHERE day_of_week = rec_day.day_of_week
                        AND is_break = 0
                        ORDER BY start_time
                    ) LOOP
                        EXIT WHEN v_slots_allocated >= rec_course.hours_week;
                        
                        DECLARE
                            v_count NUMBER;
                        BEGIN
                            -- Check if slot is available (no class/faculty/room conflict)
                            SELECT COUNT(*) INTO v_count
                            FROM Timetable
                            WHERE slot_id = rec_slot.slot_id
                            AND (class_id = rec_class.class_id OR fac_id = v_fac_id OR room_no = v_room_no);
                            
                            IF v_count = 0 THEN
                                INSERT INTO Timetable (class_id, course_code, fac_id, room_no, slot_id)
                                VALUES (rec_class.class_id, rec_course.course_code, v_fac_id, v_room_no, rec_slot.slot_id);
                                
                                v_slots_allocated := v_slots_allocated + 1;
                                v_total_slots := v_total_slots + 1;
                                v_success_count := v_success_count + 1;
                            END IF;
                        END;
                    END LOOP;
                    
                    -- Log partial allocation
                    IF v_slots_allocated > 0 AND v_slots_allocated < rec_course.hours_week THEN
                        INSERT INTO TimeTable_Log (msg, log_type, process_id)
                        VALUES ('Partial allocation: Class ' || TO_CHAR(rec_class.class_id) || 
                               ', Course ' || rec_course.course_code || ' on ' || rec_day.day_of_week ||
                               ': ' || TO_CHAR(v_slots_allocated) || '/' || TO_CHAR(rec_course.hours_week) || ' slots', 
                               'WARNING', v_process_id);
                    END IF;
                END;
            END LOOP;
        END LOOP;
    END LOOP;
    
    v_completion_msg := 'Timetable generation completed. Slots: ' || TO_CHAR(v_total_slots) || 
       ', Success: ' || TO_CHAR(v_success_count) || ', Errors: ' || TO_CHAR(v_error_count);
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES (v_completion_msg, 'SUCCESS', v_process_id);
    
    COMMIT;
    
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        v_error_msg := 'ERROR: ' || SQLERRM;
        v_error_process_id := NVL(v_process_id, 'ERR_' || TO_CHAR(SYSDATE, 'YYYYMMDDHH24MISS'));
        INSERT INTO TimeTable_Log (msg, log_type, process_id)
        VALUES (v_error_msg, 'ERROR', v_error_process_id);
        COMMIT;
        RAISE;
END Generate_TimeTable;
/
