CREATE OR REPLACE PROCEDURE Generate_TimeTable (
    p_year IN NUMBER,
    p_sem IN NUMBER,
    p_process_id OUT VARCHAR2
)
AS
    v_process_id VARCHAR2(50);
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
    
    -- Clear existing timetable for this year/semester
    DELETE FROM Timetable
    WHERE class_id IN (SELECT class_id FROM Classes WHERE year = p_year AND sem = p_sem);
    
    INSERT INTO TimeTable_Log (msg, log_type, process_id)
    VALUES ('Starting random timetable generation for Year ' || TO_CHAR(p_year) || ', Sem ' || TO_CHAR(p_sem), 'INFO', v_process_id);
    
    -- Loop through each day first
    FOR rec_day IN c_days LOOP
        -- Loop through each time slot for this day
        FOR rec_slot IN (
            SELECT slot_id, start_time, end_time
            FROM TimeSlots
            WHERE day_of_week = rec_day.day_of_week
            AND is_break = 0
            ORDER BY start_time
        ) LOOP
            -- Try to schedule all classes in this time slot
            FOR rec_class IN c_classes LOOP
                DECLARE
                    v_course_code VARCHAR2(20);
                    v_fac_id NUMBER;
                    v_room_no VARCHAR2(20);
                    v_count NUMBER;
                BEGIN
                    -- Try to pick a random course that hasn't been used today for this class
                    BEGIN
                        -- Get a random course for this class that hasn't been scheduled today
                        SELECT course_code INTO v_course_code
                        FROM (
                            SELECT c.course_code
                            FROM ClassCourse cc
                            JOIN Courses c ON cc.course_code = c.course_code
                            WHERE cc.class_id = rec_class.class_id
                            AND c.course_code NOT IN (
                                -- Get courses already scheduled today for this class
                                SELECT DISTINCT t.course_code
                                FROM Timetable t
                                JOIN TimeSlots ts ON t.slot_id = ts.slot_id
                                WHERE t.class_id = rec_class.class_id
                                AND ts.day_of_week = rec_day.day_of_week
                            )
                            ORDER BY DBMS_RANDOM.VALUE
                        )
                        WHERE ROWNUM = 1;
                    EXCEPTION
                        WHEN NO_DATA_FOUND THEN
                            -- No more courses available for this class today, try next class
                            CONTINUE;
                    END;
                    
                    -- Find faculty for this course
                    BEGIN
                        SELECT fac_id INTO v_fac_id
                        FROM (
                            SELECT cf.fac_id
                            FROM CourseFaculty cf
                            WHERE cf.course_code = v_course_code
                            ORDER BY DBMS_RANDOM.VALUE
                        )
                        WHERE ROWNUM = 1;
                    EXCEPTION
                        WHEN NO_DATA_FOUND THEN
                            v_error_count := v_error_count + 1;
                            CONTINUE;
                    END;
                    
                    -- Find room for this course
                    BEGIN
                        SELECT cr.room_no INTO v_room_no
                        FROM (
                            SELECT room_no
                            FROM Classrooms
                            WHERE room_type = (
                                SELECT CASE WHEN course_type = 'LAB' THEN 'LAB' ELSE 'LECTURE' END
                                FROM Courses
                                WHERE course_code = v_course_code
                            )
                            AND capacity >= rec_class.NOS
                            ORDER BY DBMS_RANDOM.VALUE
                        ) cr
                        WHERE ROWNUM = 1;
                    EXCEPTION
                        WHEN NO_DATA_FOUND THEN
                            v_error_count := v_error_count + 1;
                            CONTINUE;
                    END;
                    
                    -- Check if slot is available (no faculty/room conflict)
                    SELECT COUNT(*) INTO v_count
                    FROM Timetable
                    WHERE slot_id = rec_slot.slot_id
                    AND (fac_id = v_fac_id OR room_no = v_room_no);
                    
                    IF v_count = 0 THEN
                        -- Allocate this one-hour slot
                        INSERT INTO Timetable (class_id, course_code, fac_id, room_no, slot_id)
                        VALUES (rec_class.class_id, v_course_code, v_fac_id, v_room_no, rec_slot.slot_id);
                        
                        v_total_slots := v_total_slots + 1;
                        v_success_count := v_success_count + 1;
                        
                        -- Log successful allocation
                        INSERT INTO TimeTable_Log (msg, log_type, process_id)
                        VALUES ('Allocated: Class ' || TO_CHAR(rec_class.class_id) || 
                               ' - ' || v_course_code || ' on ' || rec_day.day_of_week ||
                               ' at ' || rec_slot.start_time || '-' || rec_slot.end_time, 
                               'INFO', v_process_id);
                    END IF;
                END;
            END LOOP;
        END LOOP;
    END LOOP;
    
    v_completion_msg := 'Timetable generation completed. Total slots allocated: ' || TO_CHAR(v_total_slots) || 
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
