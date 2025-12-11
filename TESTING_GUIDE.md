# 🧪 Academic Timetable System - Testing Guide

## 🚀 Quick Start Testing

### 1. Load Sample Data
```sql
-- Connect to Oracle
sqlplus timetable_user/timetable123@localhost:1521/XEPDB1

-- Load enhanced sample data
@c:\Desktop\DBMS_MINI_M_S\project\database\sample_data_enhanced.sql
```

### 2. Start Backend Server
```bash
cd c:\Desktop\DBMS_MINI_M_S\project\backend
npm start
```

Expected output:
```
Testing Oracle database connection...
✓ Oracle database connected successfully

========================================
🚀 Server running on port 5000
📊 API Base URL: http://localhost:5000/api
========================================
```

### 3. Start Frontend Server
```bash
cd c:\Desktop\DBMS_MINI_M_S\project\frontend
npm run dev
```

Expected output:
```
  VITE v4.x.x  ready in 1234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://your-ip:3000/
```

## 🧪 Testing Scenarios

### ✅ Scenario 1: Basic CRUD Operations

1. **Login**
   - Open http://localhost:3000
   - Username: `admin`
   - Password: `admin`

2. **Test Department CRUD**
   - Navigate to "Departments"
   - Create: "Information Technology" department
   - Edit: Change "Computer Science" to "CSE"
   - Delete: Remove newly created department
   - View: Check department list

3. **Test Course CRUD**
   - Navigate to "Courses"
   - Create: "CS102 - Advanced Programming" (THEORY, CORE, 4 credits, 4 hrs/week)
   - Edit: Change hours from 4 to 3
   - Delete: Remove CS102
   - View: Check course list

4. **Test Faculty CRUD**
   - Navigate to "Faculty"
   - Create: "Dr. John Doe" (CSE, Professor, 20 hrs/week)
   - Edit: Change max hours to 18
   - Delete: Remove Dr. John Doe
   - View: Check faculty list

### ✅ Scenario 2: Relationship Management

1. **Assign Courses to Faculty**
   - Go to "Courses" → Edit CS101
   - Add "Dr. Alice Johnson" as faculty
   - Verify in CourseFaculty relationship table

2. **Assign Courses to Classes**
   - Go to "Classes" → Edit Class 1A
   - Add CS201 to the class
   - Verify in ClassCourse relationship table

### ✅ Scenario 3: Timetable Generation

1. **Generate Using Stored Procedure**
   - Navigate to "⚡ Generate Timetable"
   - Select: Year 1, Semester 1
   - Click "Generate Timetable"
   - Observe:
     - ✅ Process ID generated
     - ✅ Generation logs displayed
     - ✅ Entries created in Timetable table

2. **View Generated Timetable**
   - Go to "View by Class" → Select Class 1A
   - Verify timetable grid shows:
     - ✅ Courses scheduled
     - ✅ Faculty assigned
     - ✅ Rooms allocated
     - ✅ Time slots filled

3. **Check Faculty Schedule**
   - Go to "View by Faculty" → Select "Dr. Alice Johnson"
   - Verify teaching schedule shows all her classes

4. **Check Room Utilization**
   - Go to "View by Room" → Select "LH-101"
   - Verify room usage across time slots

### ✅ Scenario 4: AI Optimization

1. **Optimize Generated Timetable**
   - After generating timetable, click "Optimize with AI"
   - Observe:
     - ✅ AI analysis performed
     - ✅ Optimization suggestions generated
     - ✅ Logs updated with AI insights

2. **Verify Optimization Results**
   - Compare before/after timetables
   - Check:
     - ✅ Faculty workload balanced
     - ✅ Student gaps minimized
     - ✅ Core subjects in morning slots

### ✅ Scenario 5: Database Features

1. **Test Trigger**
   - Try to assign too many hours to a faculty
   - Verify trigger prevents overloading:
     ```
     Faculty workload exceeded! Current: 18 hrs, Adding: 4 hrs, Max allowed: 20 hrs
     ```

2. **Test Stored Procedures**
   - Call `sp_get_class_timetable(1)` in SQL*Plus
   - Verify complete timetable returned

3. **Check Logs**
   - Query TimeTable_Log table
   - Verify all operations logged with timestamps

## 🐛 Common Issues & Solutions

### Issue 1: "Failed to fetch" on Registration/Login
**Solution:**
- Ensure backend server is running on port 5000
- Check if frontend can access http://localhost:5000/api/health

### Issue 2: "ORA-00942: table or view does not exist"
**Solution:**
- Run schema.sql first
- Verify all tables created successfully

### Issue 3: "No faculty found for course"
**Solution:**
- Ensure CourseFaculty relationships exist
- Check that faculty are assigned to courses

### Issue 4: "No suitable room for course"
**Solution:**
- Ensure Classrooms table has appropriate rooms
- Verify room capacity matches class size
- Check room_type matches course_type (LAB/LECTURE)

## 📊 Performance Testing

### Test Large Dataset
1. Load 50+ courses
2. Load 30+ faculty members
3. Load 20+ classes
4. Generate timetable for all
5. Verify generation completes in < 30 seconds

### Test Concurrent Users
1. Open multiple browser tabs
2. Simultaneously generate timetables
3. Verify no data corruption or conflicts

## 🧪 API Testing with curl

### Test Health Endpoint
```bash
curl http://localhost:5000/api/health
```

### Test Department APIs
```bash
# Get all departments
curl http://localhost:5000/api/departments

# Create department
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -d '{"dept_name":"Mathematics","programsOffered":"B.Sc, M.Sc","AcadYear":2024}'

# Update department
curl -X PUT http://localhost:5000/api/departments/1 \
  -H "Content-Type: application/json" \
  -d '{"dept_name":"Applied Mathematics","programsOffered":"B.Sc, M.Sc, Ph.D","AcadYear":2024}'

# Delete department
curl -X DELETE http://localhost:5000/api/departments/1
```

### Test Timetable Generation
```bash
# Generate timetable
curl -X POST http://localhost:5000/api/timetable/generate-auto \
  -H "Content-Type: application/json" \
  -d '{"year":1,"sem":1}'

# Get class timetable
curl http://localhost:5000/api/timetable/class/1

# Get faculty timetable
curl http://localhost:5000/api/timetable/faculty/1

# Get room timetable
curl http://localhost:5000/api/timetable/room/LH-101
```

## ✅ Success Criteria

### Database Requirements ✅
- [ ] 6+ core tables created
- [ ] Relationship tables for M:N mappings
- [ ] Constraints enforced (FK, CHECK, UNIQUE)
- [ ] Trigger prevents faculty overloading
- [ ] Stored procedure generates timetable
- [ ] Log table tracks all operations

### Backend Requirements ✅
- [ ] RESTful APIs for all entities
- [ ] Oracle stored procedure integration
- [ ] LLM optimization service
- [ ] Proper error handling
- [ ] Transaction management

### Frontend Requirements ✅
- [ ] Login/Registration system
- [ ] CRUD interfaces for all entities
- [ ] Timetable generation UI
- [ ] AI optimization button
- [ ] 3 timetable views (Class, Faculty, Room)
- [ ] Real-time logs display

### AI/ML Requirements ✅
- [ ] Automatic timetable generation
- [ ] Conflict detection
- [ ] Workload balancing
- [ ] Optimization suggestions
- [ ] Detailed logging

## 🎯 Final Verification

1. **Complete System Flow**
   - [ ] Create academic structure (Dept → Courses → Faculty → Classes)
   - [ ] Establish relationships (CourseFaculty, ClassCourse)
   - [ ] Generate timetable using stored procedure
   - [ ] Optimize with AI
   - [ ] View results in all 3 perspectives
   - [ ] Verify database integrity

2. **Performance Metrics**
   - [ ] Timetable generation < 30 seconds for 20 classes
   - [ ] UI responsive (< 2 seconds for API calls)
   - [ ] Database queries optimized
   - [ ] No memory leaks in backend

3. **Error Handling**
   - [ ] Graceful handling of database errors
   - [ ] User-friendly error messages
   - [ ] Rollback on failed operations
   - [ ] Input validation on all forms

---

