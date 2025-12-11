# Quick Start Guide

## Step 1: Database Setup (5 minutes)

1. Open SQL*Plus, SQL Developer, or any Oracle client
2. Connect to your Oracle database
3. Run the schema creation:
   ```sql
   @database/schema.sql
   ```
4. **(Optional)** Load sample data for testing:
   ```sql
   @database/sample_data.sql
   ```

## Step 2: Backend Setup (2 minutes)

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your Oracle credentials:
   ```env
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_CONNECTION_STRING=localhost:1521/XEPDB1
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Step 3: Frontend Setup (2 minutes)

1. Open a new terminal and navigate to frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Step 4: First Use (3 minutes)

1. Open browser: http://localhost:3000

2. **Register an account:**
   - Click "Register here"
   - Fill in: Full Name, Email, Username, Password
   - Click "Register"

3. **Login:**
   - Enter your username and password
   - Click "Login"

4. **If you loaded sample data:**
   - Navigate to "Generate Timetable"
   - Select "Semester 1"
   - Click "Generate Timetable"
   - View results in "View by Class"

5. **If you want to add your own data:**
   - Add Departments
   - Add Courses (link to departments)
   - Add Faculty (link to departments)
   - Add Classes
   - Add Classrooms
   - Add Time Slots
   - Manually link courses to faculty and classes (see note below)

## Linking Data (For Custom Setup)

Since there's no UI for linking, you need to run SQL queries:

```sql
-- Link course to faculty (who teaches what)
INSERT INTO CourseFaculty (course_code, fac_id) VALUES ('CS101', 1);

-- Link course to class (which class takes which course)
INSERT INTO ClassCourse (class_id, course_code) VALUES (1, 'CS101');

COMMIT;
```

## Troubleshooting

**Backend won't start:**
- Check Oracle database is running
- Verify credentials in `.env`
- Try connecting to Oracle using SQL*Plus

**Frontend shows errors:**
- Ensure backend is running (http://localhost:5000/api/health should work)
- Check browser console for errors

**Can't login after registration:**
- Check backend logs for errors
- Verify Users table exists in database
- Test database connection

## Quick Test Credentials

If you loaded `sample_data.sql`, you can test the system immediately after registering any user account. The sample data includes:
- 3 Departments
- 5 Faculty members
- 5 Courses (including labs)
- 3 Classes
- 5 Classrooms
- Time slots Monday-Friday
- Pre-linked course-faculty and course-class relationships

Just generate a timetable for Semester 1!

## What's Next?

After successful setup:
1. Explore all CRUD pages
2. Add more data
3. Generate timetables for different semesters
4. View timetables by class, faculty, or room
5. Customize the algorithm in `backend/services/timetableService.js`

## Support

Check the main README.md for detailed documentation and troubleshooting.
