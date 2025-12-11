# 🎓 Academic Timetable Generation System

A complete, modern, and intelligent **web‑based academic timetable generator** built with **Oracle Database**, **Node.js + Express**, and **React (Vite)**.
The system automatically allocates **conflict‑free** schedules for **classes, faculty, and rooms**, supports lab constraints, avoids overload, and provides a clean UI for CRUD operations.

---

## 🚀 Features

* 🔐 **User Authentication** (Register/Login)
* 🏛️ **Department, Courses, Faculty & Classroom Management**
* 🧑‍🏫 **Faculty Workload Constraints** (with triggers)
* 🏫 **Class & TimeSlot Management**
* ⚙️ **Automatic Timetable Generation Algorithm**

  * Avoids faculty conflicts
  * Avoids class conflicts
  * Avoids room collisions
  * Allocates lab courses in **consecutive slots**
  * Matches classroom types (Lecture/Lab)
* 🤖 **AI Optimization (Optional)**
* 👀 **View Timetables:** By Class, Faculty, or Room
* 🗄️ **Oracle Stored Procedures** for generation
* 🔒 Logging system for debugging & analytics

---

## 🧱 Tech Stack

| Layer           | Technology                                |
| --------------- | ----------------------------------------- |
| **Frontend**    | React (Vite), CSS, React Router           |
| **Backend**     | Node.js, Express, oracledb driver         |
| **Database**    | Oracle SQL + Stored Procedures + Triggers |
| **Optional AI** | LLM-based optimization service            |

---

## 📁 Project Structure

```
project/
├── database/
│   ├── schema.sql
│   ├── sample_data.sql
│   └── sample_data_enhanced.sql
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   ├── index.html
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start

### 🧩 Prerequisites

* Node.js LTS
* npm
* Oracle Database (XE or Full)
* SQL*Plus / SQL Developer
* Git

---

## 🗄️ Database Setup (5 minutes)

1. Connect to Oracle:

```sql
sqlplus your_user/your_password@localhost:1521/XEPDB1
```

2. Run schema:

```sql
@database/schema.sql
```

3. (Optional) Load sample data:

```sql
@database/sample_data.sql
```

---

## 🖥️ Backend Setup (Node.js)

```bash
cd backend
npm install
```

Create `.env` file:

```
DB_USER=your_username
DB_PASSWORD=your_password
DB_CONNECTION_STRING=localhost:1521/XEPDB1
PORT=5000
```

Start backend:

```bash
npm start
```

Expected output:

```
✓ Oracle database connected successfully
🚀 Server running on port 5000
```

---

## 🌐 Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Launch browser → **[http://localhost:3000](http://localhost:3000)**

---

## 🧠 Timetable Generation Algorithm (Summary)

### Steps:

1. For each class in the selected semester:

   * Fetch assigned courses (ClassCourse)
2. For each course in class:

   * Identify eligible faculty
   * Select lowest-workload faculty
3. For each allocation:

   * Find appropriate room type
   * Find available time slots
   * Ensure:

     * No **faculty clash**
     * No **class clash**
     * No **room clash**
4. Lab courses:

   * Must be placed in **consecutive slots**
5. Insert into:

   * `Timetable`
   * `ClassSlot`
   * `FacultySlot`
   * `ClassroomSlot`
6. Final log stored in `TimeTable_Log`.

---

## 📡 API Endpoints (Overview)

### 🔐 Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`

### 🏛️ CRUD Modules

* `/api/departments`
* `/api/courses`
* `/api/faculty`
* `/api/classes`
* `/api/classrooms`
* `/api/timeslots`

### 🕒 Timetable

* `POST /api/timetable/generate`
* `POST /api/timetable/generate-auto`
* `POST /api/timetable/optimize` (AI)
* `GET /api/timetable/class/:id`
* `GET /api/timetable/faculty/:id`
* `GET /api/timetable/room/:roomNo`

---

## 🧪 Testing Guide

### Basic Workflow

1. Login (admin/admin or your registered account)
2. Create:

   * Department → Courses → Faculty → Classes → Classrooms → TimeSlots
3. Link Data:

```sql
INSERT INTO CourseFaculty VALUES ('CS101', 1);
INSERT INTO ClassCourse VALUES (1, 'CS101');
COMMIT;
```

4. Generate Timetable
5. View timetable using Class/Faculty/Room perspectives

---

## 🛠 Troubleshooting

### Backend not starting

* Oracle DB not running
* Incorrect `.env` values
* Missing dependencies → run `npm install`

### Frontend not loading

* Backend might not be running
* Check console for CORS issues

### Timetable generation issues

* Missing Course ↔ Faculty links
* Missing Class ↔ Course links
* No available rooms/slots

---

## 🤝 Contributing

1. Fork the repo
2. Create branch:

```bash
git checkout -b feature/new-feature
```

3. Commit:

```bash
git commit -m "Added new feature"
```

4. Push & PR:

```bash
git push origin feature/new-feature
```

---

## 📄 License

This project is for educational purposes only.

---

## 📬 Contact

For support, troubleshooting, or enhancements:
Open an Issue in the repository or contact the maintainer.
