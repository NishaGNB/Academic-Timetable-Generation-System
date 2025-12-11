import { Link } from 'react-router-dom';

function Dashboard() {
  const modules = [
    { 
      title: 'Departments', 
      path: '/departments', 
      desc: 'Manage academic departments',
      color: '#4299e1'
    },
    { 
      title: 'Courses', 
      path: '/courses', 
      desc: 'Manage courses and subjects',
      color: '#48bb78'
    },
    { 
      title: 'Faculty', 
      path: '/faculty', 
      desc: 'Manage teaching staff',
      color: '#ed8936'
    },
    { 
      title: 'Classes', 
      path: '/classes', 
      desc: 'Manage student classes and sections',
      color: '#9f7aea'
    },
    { 
      title: 'Classrooms', 
      path: '/classrooms', 
      desc: 'Manage physical rooms',
      color: '#ed64a6'
    },
    { 
      title: 'Time Slots', 
      path: '/timeslots', 
      desc: 'Manage time periods',
      color: '#38b2ac'
    },
    { 
      title: 'Generate Timetable', 
      path: '/generate-timetable', 
      desc: 'Generate schedules automatically',
      color: '#e53e3e',
      highlight: true
    },
    { 
      title: 'View by Class', 
      path: '/timetable/class', 
      desc: 'View class-wise timetable',
      color: '#319795'
    },
    { 
      title: 'View by Faculty', 
      path: '/timetable/faculty', 
      desc: 'View faculty schedule',
      color: '#d69e2e'
    },
    { 
      title: 'View by Room', 
      path: '/timetable/room', 
      desc: 'View room utilization',
      color: '#805ad5'
    },
  ];

  return (
    <div className="dashboard">
      <h2>Academic Timetable System</h2>
      <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>
        Welcome to the Academic Timetable Generation System. 
        Manage all academic scheduling with intelligent automation.
      </p>
      

      
      <div className="dashboard-grid">
        {modules.map((module) => (
          <Link 
            key={module.path} 
            to={module.path} 
            className="dashboard-card"
            style={{
              borderLeft: module.highlight ? `5px solid ${module.color}` : 'none',
              boxShadow: module.highlight ? '0 10px 25px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.1)',
              transform: module.highlight ? 'scale(1.02)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >

            <h3 style={{ 
              color: module.highlight ? module.color : '#333',
              marginBottom: '0.5rem' 
            }}>
              {module.title}
            </h3>
            <p style={{ 
              color: '#666', 
              fontSize: '0.9rem',
              margin: 0 
            }}>
              {module.desc}
            </p>
            {module.highlight && (
              <div style={{ 
                marginTop: '0.5rem', 
                fontSize: '0.8rem', 
                color: module.color,
                fontWeight: 'bold' 
              }}>
                Advanced Feature
              </div>
            )}
          </Link>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#f7fafc', 
        borderRadius: '8px', 
        fontSize: '0.9rem', 
        color: '#4a5568' 
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Quick Tips:</h4>
        <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
          <li>Set up departments, courses, and faculty first</li>
          <li>Link courses to classes and faculty using relationship tables</li>
          <li>Generate timetable using stored procedure</li>
          <li>Review logs for generation details and optimization suggestions</li>
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
