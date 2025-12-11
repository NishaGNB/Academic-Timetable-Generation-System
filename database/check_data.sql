-- Check classes
SELECT * FROM Classes WHERE year = 1 AND sem = 1;

-- Check courses linked to classes
SELECT cc.class_id, c.class_id as cls, c.sec, cc.course_code, co.course_name, co.hours_week
FROM ClassCourse cc
JOIN Classes c ON cc.class_id = c.class_id
JOIN Courses co ON cc.course_code = co.course_code
WHERE c.year = 1 AND c.sem = 1
ORDER BY cc.class_id, cc.course_code;

-- Check faculty linked to courses
SELECT cf.course_code, cf.fac_id, f.fac_name
FROM CourseFaculty cf
JOIN Faculty f ON cf.fac_id = f.fac_id
ORDER BY cf.course_code;

-- Check available rooms
SELECT * FROM Classrooms ORDER BY room_type, capacity;

-- Check time slots
SELECT * FROM TimeSlots WHERE is_break = 0 ORDER BY 
    CASE day_of_week
        WHEN 'Monday' THEN 1
        WHEN 'Tuesday' THEN 2
        WHEN 'Wednesday' THEN 3
        WHEN 'Thursday' THEN 4
        WHEN 'Friday' THEN 5
        WHEN 'Saturday' THEN 6
    END, start_time;

exit;
