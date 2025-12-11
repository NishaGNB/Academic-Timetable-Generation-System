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
    
    -- Loop through each class
    FOR rec_class IN c_classes LOOP
        v_total_classes := v_total_classes + 1;
        
        DECLARE
            v_best_day VARCHAR2(20) := NULL;
            v_max_courses_allocated NUMBER := 0;
            TYPE course_allocation IS RECORD (
                course_code VARCHAR2(20),
                fac_id NUMBER,
                room_no VARCHAR2(20),
                slot_id NUMBER
            );
            TYPE allocation_table IS TABLE OF course_allocation;
            v_best_allocations allocation_table := allocation_table();
        BEGIN
            -- Try each day to find the one that can fit the most courses
            FOR rec_day IN c_days LOOP
                DECLARE
                    v_courses_on_this_day NUMBER := 0;
                    v_current_allocations allocation_table := allocation_table();
                    TYPE slot_array IS TABLE OF NUMBER;
                    v_used_slots slot_array := slot_array();
                BEGIN
                    -- Try to schedule all courses on this day
                    FOR rec_course IN (
                        SELECT c.course_code, c.course_name, c.course_type, c.hours_week
                        FROM ClassCourse cc
                        JOIN Courses c ON cc.course_code = c.course_code
                        WHERE cc.class_id = rec_class.class_id
                        ORDER BY c.hours_week DESC
                    ) LOOP
                        DECLARE
                            v_fac_id NUMBER;
                            v_room_no VARCHAR2(20);
                            v_slots_allocated NUMBER := 0;
                            v_course_fully_allocated NUMBER := 1;
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
                                    CONTINUE;
                            END;
                            
                            -- Try to allocate slots for this course
                            FOR rec_slot IN (
                                SELECT slot_id
                                FROM TimeSlots
                                WHERE day_of_week = rec_day.day_of_week
                                AND is_break = 0
                                ORDER BY start_time
                            ) LOOP
                                EXIT WHEN v_slots_allocated >= rec_course.hours_week;
                                
                                -- Check if slot is already used
                                DECLARE
                                    v_slot_used NUMBER := 0;
                                    v_count NUMBER;
                                BEGIN
                                    FOR i IN 1..v_used_slots.COUNT LOOP
                                        IF v_used_slots(i) = rec_slot.slot_id THEN
                                            v_slot_used := 1;
                                            EXIT;
                                        END IF;
                                    END LOOP;
                                    
                                    IF v_slot_used = 0 THEN
                                        -- Check faculty and room availability
                                        SELECT COUNT(*) INTO v_count
                                        FROM Timetable
                                        WHERE slot_id = rec_slot.slot_id
                                        AND (fac_id = v_fac_id OR room_no = v_room_no);
                                        
                                        IF v_count = 0 THEN
                                            v_current_allocations.EXTEND;
                                            v_current_allocations(v_current_allocations.COUNT).course_code := rec_course.course_code;
                                            v_current_allocations(v_current_allocations.COUNT).fac_id := v_fac_id;
                                            v_current_allocations(v_current_allocations.COUNT).room_no := v_room_no;
                                            v_current_allocations(v_current_allocations.COUNT).slot_id := rec_slot.slot_id;
                                            
                                            v_used_slots.EXTEND;
                                            v_used_slots(v_used_slots.COUNT) := rec_slot.slot_id;
                                            v_slots_allocated := v_slots_allocated + 1;
                                        END IF;
                                    END IF;
                                END;
                            END LOOP;
                            
                            -- If this course was fully allocated, count it
                            IF v_slots_allocated >= rec_course.hours_week THEN
                                v_courses_on_this_day := v_courses_on_this_day + 1;
                            ELSE
                                v_course_fully_allocated := 0;
                            END IF;
                        END;
                    END LOOP;
                    
                    -- If this day allocated more courses than previous best, save it
                    IF v_courses_on_this_day > v_max_courses_allocated THEN
                        v_max_courses_allocated := v_courses_on_this_day;
                        v_best_day := rec_day.day_of_week;
                        v_best_allocations := v_current_allocations;
                    END IF;
                END;
            END LOOP;
            
            -- Insert the best day's allocations
            IF v_best_allocations.COUNT > 0 THEN
                FOR i IN 1..v_best_allocations.COUNT LOOP
                    INSERT INTO Timetable (class_id, course_code, fac_id, room_no, slot_id)
                    VALUES (
                        rec_class.class_id,
                        v_best_allocations(i).course_code,
                        v_best_allocations(i).fac_id,
                        v_best_allocations(i).room_no,
                        v_best_allocations(i).slot_id
                    );
                    v_total_slots := v_total_slots + 1;
                    v_success_count := v_success_count + 1;
                END LOOP;
                
                INSERT INTO TimeTable_Log (msg, log_type, process_id)
                VALUES ('Class ' || TO_CHAR(rec_class.class_id) || ' scheduled on ' || v_best_day || 
                       ' with ' || TO_CHAR(v_max_courses_allocated) || ' courses', 'INFO', v_process_id);
            ELSE
                INSERT INTO TimeTable_Log (msg, log_type, process_id)
                VALUES ('Could not schedule any courses for class ' || TO_CHAR(rec_class.class_id), 'WARNING', v_process_id);
                v_error_count := v_error_count + 1;
            END IF;
        END;
    END LOOP;
    
    v_completion_msg := 'Timetable generation completed. Classes: ' || TO_CHAR(v_total_classes) || 
       ', Slots: ' || TO_CHAR(v_total_slots) || 
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
