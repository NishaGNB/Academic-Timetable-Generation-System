# Academic Timetable Generation System

A complete web-based timetable generation system built with Oracle Database, Node.js, Express, and React.

## Features

- **User Authentication**: Register and login functionality
- **Department Management**: CRUD operations for departments
- **Course Management**: Manage courses with types (THEORY/LAB) and categories (CORE/ELECTIVE)
- **Faculty Management**: Track faculty members and their max teaching hours
- **Class Management**: Manage student classes and sections
- **Classroom Management**: Manage lecture halls and labs
- **Time Slot Management**: Define time periods for scheduling
- **Automatic Timetable Generation**: Smart algorithm that:
  - Avoids class, faculty, and room conflicts
  - Respects faculty workload limits
  - Allocates consecutive slots for lab courses
  - Matches room types with course types
- **Timetable Views**: View schedules by class, faculty, or room

## Tech Stack

- **Database**: Oracle SQL
- **Backend**: Node.js + Express + oracledb driver
- **Frontend**: React (Vite) + React Router + Plain CSS

## Setup Instructions

### 1. Database Setup

1. Make sure you have Oracle Database installed and running
2. Connect to your Oracle database using SQL*Plus, SQL Developer, or any Oracle client
3. Run the schema creation script:
   ```sql
   @database/schema.sql
   ```
   This will create all necessary tables with proper constraints

### 2. Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend folder (copy from `.env.example`):
   ```env
   DB_USER=your_oracle_username
   DB_PASSWORD=your_oracle_password
   DB_CONNECTION_STRING=localhost:1521/XEPDB1
   PORT=5000
   ```
   
   **Important**: Update the values with your actual Oracle database credentials

4. Start the backend server:
   ```bash
   npm start
   ```
   
   You should see:
   ```
   ✓ Oracle database connected successfully
   🚀 Server running on port 5000
   ```

### 3. Frontend Setup

1. Navigate to the frontend folder:
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
   
   The application will be available at: http://localhost:3000

## Getting Started

### First Time Usage

1. **Register an Account**:
   - Open http://localhost:3000
   - You'll be redirected to the login page
   - Click "Register here"
   - Fill in your details (username, email, password, full name)
   - Click "Register"

2. **Login**:
   - After registration, you'll be redirected to the login page
   - Enter your username and password
   - Click "Login"

3. **Set Up Basic Data**:
   Before generating timetables, you need to add:
   - Departments
   - Courses (linked to departments)
   - Faculty (linked to departments)
   - Classes (with sections and semesters)
   - Classrooms (lecture halls and labs)
   - Time Slots (define your institution's schedule)

4. **Link Data**:
   You'll need to manually link (using database inserts or a future UI):
   - Courses to Faculty (CourseFaculty table)
   - Courses to Classes (ClassCourse table)

5. **Generate Timetable**:
   - Navigate to "Generate Timetable"
   - Select semester and academic year
   - Click "Generate Timetable"
   - View results in Class, Faculty, or Room views

## Database Schema

### Core Tables
- **Users**: System users (authentication)
- **Department**: Academic departments
- **Courses**: Course details with type and category
- **Faculty**: Teaching staff with workload limits
- **Classes**: Student class sections
- **Classrooms**: Physical rooms
- **TimeSlots**: Time periods

### Relationship Tables
- **CourseFaculty**: Which faculty teaches which course
- **ClassCourse**: Which courses are taken by which class
- **ClassSlot**: Which slots are assigned to which class
- **FacultySlot**: Which slots are occupied by which faculty
- **ClassroomSlot**: Which slots are allocated to which room

### Central Table
- **Timetable**: Final schedule linking class, course, faculty, room, and time slot

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### CRUD Operations
- `GET/POST/PUT/DELETE /api/departments`
- `GET/POST/PUT/DELETE /api/courses`
- `GET/POST/PUT/DELETE /api/faculty`
- `GET/POST/PUT/DELETE /api/classes`
- `GET/POST/PUT/DELETE /api/classrooms`
- `GET/POST/PUT/DELETE /api/timeslots`

### Timetable
- `POST /api/timetable/generate` - Generate timetable
- `GET /api/timetable/class/:classId` - Get class timetable
- `GET /api/timetable/faculty/:facId` - Get faculty schedule
- `GET /api/timetable/room/:roomNo` - Get room utilization

## Timetable Generation Algorithm

The system uses a greedy algorithm with the following logic:

1. For each class in the semester:
   - Get all assigned courses from ClassCourse table
   
2. For each course:
   - Find eligible faculty from CourseFaculty table
   - Select faculty with least current workload
   - Verify faculty doesn't exceed max_hours_week
   
3. For each course allocation:
   - Find appropriate room type (LAB for lab courses, LECTURE for theory)
   - Find available time slots
   - Check for conflicts (class, faculty, room must all be free)
   
4. Special handling:
   - **LAB courses**: Allocate consecutive slots on the same day
   - **THEORY courses**: Allocate individual slots across the week

5. Update tables:
   - Insert into Timetable
   - Update ClassSlot, FacultySlot, ClassroomSlot

## Project Structure

```
project/
├── database/
│   └── schema.sql                    # Oracle DDL script
├── backend/
│   ├── config/
│   │   └── db.js                     # Database connection
│   ├── services/
│   │   ├── authService.js            # Authentication logic
│   │   ├── departmentService.js      # Department operations
│   │   ├── timetableService.js       # Timetable generation
│   │   └── ...                       # Other services
│   ├── controllers/
│   │   ├── authController.js         # Auth request handlers
│   │   └── ...                       # Other controllers
│   ├── routes/
│   │   ├── authRoutes.js             # Auth endpoints
│   │   └── ...                       # Other routes
│   ├── server.js                     # Express server
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── apiClient.js          # API client
    │   ├── components/
    │   │   ├── Navbar.jsx            # Navigation bar
    │   │   └── ProtectedRoute.jsx    # Route guard
    │   ├── pages/
    │   │   ├── Login.jsx             # Login page
    │   │   ├── Register.jsx          # Registration page
    │   │   ├── Dashboard.jsx         # Dashboard
    │   │   ├── Departments.jsx       # Department CRUD
    │   │   ├── GenerateTimetable.jsx # Timetable generation
    │   │   └── ...                   # Other pages
    │   ├── App.jsx                   # Main app component
    │   ├── App.css                   # Styles
    │   └── main.jsx                  # Entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Troubleshooting

### Backend Issues

**Database connection fails:**
- Verify Oracle database is running
- Check credentials in `.env` file
- Ensure connection string format is correct: `hostname:port/service_name`
- Test connection using SQL*Plus or SQL Developer

**Port already in use:**
- Change `PORT=5000` in `.env` to another port
- Update frontend `vite.config.js` proxy target accordingly

### Frontend Issues

**API calls fail:**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify proxy settings in `vite.config.js`

**Can't register/login:**
- Ensure Users table exists (run schema.sql)
- Check backend logs for errors
- Verify database connection is working

## Security Note

⚠️ **Important**: This is a demo/academic project. In production:
- Hash passwords using bcrypt or similar
- Use JWT tokens for authentication
- Add input validation and sanitization
- Implement proper error handling
- Use HTTPS
- Add rate limiting
- Implement proper session management

## License

This project is for educational purposes.

## Support

For issues or questions, please check:
1. Database connectivity
2. Backend server logs
3. Browser console errors
4. API response in Network tab
