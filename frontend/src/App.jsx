import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Courses from './pages/Courses';
import FacultyPage from './pages/FacultyPage';
import ClassesPage from './pages/ClassesPage';
import ClassroomsPage from './pages/ClassroomsPage';
import TimeSlotsPage from './pages/TimeSlotsPage';
import GenerateTimetable from './pages/GenerateTimetable';
import TimetableClassView from './pages/TimetableClassView';
import TimetableFacultyView from './pages/TimetableFacultyView';
import TimetableRoomView from './pages/TimetableRoomView';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute><Navbar /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="departments" element={<Departments />} />
            <Route path="courses" element={<Courses />} />
            <Route path="faculty" element={<FacultyPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="classrooms" element={<ClassroomsPage />} />
            <Route path="timeslots" element={<TimeSlotsPage />} />
            <Route path="generate-timetable" element={<GenerateTimetable />} />
            <Route path="timetable/class" element={<TimetableClassView />} />
            <Route path="timetable/faculty" element={<TimetableFacultyView />} />
            <Route path="timetable/room" element={<TimetableRoomView />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
