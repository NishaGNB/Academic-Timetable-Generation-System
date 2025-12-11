import { useState, useEffect } from 'react';
import { timetableAPI, classAPI } from '../api/apiClient';

function TimetableClassView() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getAll();
      setClasses(res.data);
    } catch (error) {
      console.error('Failed to load classes');
    }
  };

  const handleFetchTimetable = async () => {
    if (!selectedClass) return;
    
    try {
      setLoading(true);
      const res = await timetableAPI.getByClass(selectedClass);
      setTimetable(res.data);
    } catch (error) {
      alert('Failed to load timetable: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Group timetable by day and slot
  const groupByDayAndTime = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped = {};
    
    // Initialize all days with empty objects
    days.forEach(day => {
      grouped[day] = {};
    });

    // Fill with timetable entries
    timetable.forEach(entry => {
      const day = entry.DAY_OF_WEEK;
      const time = entry.START_TIME;
      if (!grouped[day]) {
        grouped[day] = {};
      }
      if (!grouped[day][time]) {
        grouped[day][time] = [];
      }
      grouped[day][time].push(entry);
    });

    return grouped;
  };

  const getUniqueTimeSlots = () => {
    const times = [...new Set(timetable.map(e => e.START_TIME))];
    return times.sort((a, b) => {
      // Sort times chronologically
      const [aHours, aMinutes] = a.split(':').map(Number);
      const [bHours, bMinutes] = b.split(':').map(Number);
      return aHours * 60 + aMinutes - (bHours * 60 + bMinutes);
    });
  };

  const grouped = timetable.length > 0 ? groupByDayAndTime() : {};
  const timeSlots = getUniqueTimeSlots();
  
  // Get class name for display
  const selectedClassName = selectedClass ? 
    classes.find(c => c.CLASS_ID == selectedClass)?.SEC + 
    ' (Year ' + classes.find(c => c.CLASS_ID == selectedClass)?.YEAR + 
    ', Sem ' + classes.find(c => c.CLASS_ID == selectedClass)?.SEM + ')' : 
    '';

  return (
    <div>
      <h2>Timetable - Class View</h2>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'end' }}>
        <div className="form-group" style={{ marginBottom: 0, minWidth: '300px' }}>
          <label>Select Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            <option value="">-- Select a class --</option>
            {classes.map(c => (
              <option key={c.CLASS_ID} value={c.CLASS_ID}>
                Year {c.YEAR} - Sem {c.SEM} - Section {c.SEC}
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleFetchTimetable} className="btn btn-primary" disabled={!selectedClass || loading}>
          {loading ? 'Loading...' : 'View Timetable'}
        </button>
      </div>

      {timetable.length === 0 && !loading && selectedClass && (
        <div className="message message-error">No timetable found for this class</div>
      )}

      {timetable.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            Timetable for Class: {selectedClassName}
          </h3>
          <div className="timetable-grid" style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '800px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Time</th>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                    <th key={day} style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center', minWidth: '150px' }}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(time => (
                  <tr key={time}>
                    <td style={{ fontWeight: 'bold', background: '#f7fafc', padding: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>{time}</td>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <td key={day} style={{ border: '1px solid #e2e8f0', padding: '8px', verticalAlign: 'top', minHeight: '80px' }}>
                        {grouped[day]?.[time] && grouped[day][time].map((entry, idx) => (
                          <div key={idx} className="timetable-cell" 
                               style={{ 
                                 background: entry.COURSE_TYPE === 'LAB' ? '#fed7d7' : '#e6fffa',
                                 border: '1px solid #e2e8f0',
                                 borderRadius: '4px',
                                 padding: '8px',
                                 marginBottom: '4px',
                                 fontSize: '0.85rem'
                               }}>
                            <div className="timetable-cell-course" style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                              {entry.COURSE_CODE} - {entry.COURSE_NAME}
                            </div>
                            <div className="timetable-cell-details" style={{ color: '#4a5568' }}>
                              <div>👨‍🏫 {entry.FAC_NAME}</div>
                              <div>🏫 Room: {entry.ROOM_NO}</div>
                              <div style={{ 
                                fontWeight: 'bold', 
                                color: entry.COURSE_TYPE === 'LAB' ? '#e53e3e' : '#38a169',
                                fontSize: '0.8rem'
                              }}>
                                {entry.COURSE_TYPE}
                              </div>
                            </div>
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#718096' }}>
            <strong>Legend:</strong> 
            <span style={{ background: '#fed7d7', padding: '2px 6px', borderRadius: '3px', marginLeft: '8px' }}>LAB</span>
            <span style={{ background: '#e6fffa', padding: '2px 6px', borderRadius: '3px', marginLeft: '8px' }}>THEORY</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimetableClassView;
