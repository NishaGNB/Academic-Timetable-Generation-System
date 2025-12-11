import { NavLink, Outlet, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-header">
          <h1>Academic Timetable System</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
        <ul className="navbar-links">
          <li><NavLink to="/dashboard">Dashboard</NavLink></li>
          <li><NavLink to="/departments">Departments</NavLink></li>
          <li><NavLink to="/courses">Courses</NavLink></li>
          <li><NavLink to="/faculty">Faculty</NavLink></li>
          <li><NavLink to="/classes">Classes</NavLink></li>
          <li><NavLink to="/classrooms">Classrooms</NavLink></li>
          <li><NavLink to="/timeslots">Time Slots</NavLink></li>
          <li><NavLink to="/generate-timetable">Generate Timetable</NavLink></li>
          <li><NavLink to="/timetable/class">View by Class</NavLink></li>
          <li><NavLink to="/timetable/faculty">View by Faculty</NavLink></li>
          <li><NavLink to="/timetable/room">View by Room</NavLink></li>
        </ul>
      </nav>
      <div className="main-content">
        <Outlet />
      </div>
    </>
  );
}

export default Navbar;
