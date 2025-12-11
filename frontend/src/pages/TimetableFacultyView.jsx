import { useState, useEffect } from 'react';
import { timetableAPI, facultyAPI } from '../api/apiClient';

function TimetableFacultyView() {
  const [faculty, setFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await facultyAPI.getAll();
      setFaculty(res.data);
    } catch (error) {
      console.error('Failed to load faculty');
    }
  };

  const selectedFacultyName = selectedFaculty ? 
    faculty.find(f => f.FAC_ID == selectedFaculty)?.FAC_NAME + 
    ' (' + (faculty.find(f => f.FAC_ID == selectedFaculty)?.DEPT_NAME || 'No Dept') + ')' : 
    '';

  return (
    <div>
      <h2>Timetable - Faculty View</h2>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'end' }}>
        <div className="form-group" style={{ marginBottom: 0, minWidth: '300px' }}>
          <label>Select Faculty</label>
          <select value={selectedFaculty} onChange={(e) => setSelectedFaculty(e.target.value)}>
            <option value="">-- Select a faculty --</option>
            {faculty.map(f => (
              <option key={f.FAC_ID} value={f.FAC_ID}>
                {f.FAC_NAME} ({f.DEPT_NAME || 'No Dept'})
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleFetchTimetable} className="btn btn-primary" disabled={!selectedFaculty || loading}>
          {loading ? 'Loading...' : 'View Schedule'}
        </button>
      </div>

      {timetable.length === 0 && !loading && selectedFaculty && (
        <div className="message message-error">No schedule found for this faculty</div>
      )}

      {timetable.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            Teaching Schedule for: {selectedFacultyName}
          </h3>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Day</th>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Time</th>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Course</th>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Class</th>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Room</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((entry, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center' }}>{entry.DAY_OF_WEEK}</td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center' }}>
                      {entry.START_TIME} - {entry.END_TIME}
                    </td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '10px' }}>
                      <div style={{ fontWeight: 'bold' }}>{entry.COURSE_CODE} - {entry.COURSE_NAME}</div>
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                        {entry.COURSE_TYPE} ({entry.CREDITS} credits)
                      </div>
                    </td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center' }}>
                      Year {entry.YEAR} - Sec {entry.SEC}
                    </td>
                    <td style={{ border: '1px solid #e2e8f0', padding: '10px', textAlign: 'center' }}>
                      <div>{entry.ROOM_NO}</div>
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                        {entry.ROOM_TYPE} ({entry.CAPACITY} seats)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#718096' }}>
            Total Teaching Hours: {timetable.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default TimetableFacultyView;
