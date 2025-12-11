import { useState, useEffect } from 'react';
import { timetableAPI, classroomAPI } from '../api/apiClient';

function TimetableRoomView() {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await classroomAPI.getAll();
      setClassrooms(res.data);
    } catch (error) {
      console.error('Failed to load classrooms');
    }
  };

  const selectedRoomInfo = selectedRoom ? 
    classrooms.find(r => r.ROOM_NO == selectedRoom)?.ROOM_NO + 
    ' (' + classrooms.find(r => r.ROOM_NO == selectedRoom)?.ROOM_TYPE + 
    ', Capacity: ' + classrooms.find(r => r.ROOM_NO == selectedRoom)?.CAPACITY + ')' : 
    '';

  return (
    <div>
      <h2>Timetable - Room View</h2>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'end' }}>
        <div className="form-group" style={{ marginBottom: 0, minWidth: '300px' }}>
          <label>Select Room</label>
          <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
            <option value="">-- Select a room --</option>
            {classrooms.map(r => (
              <option key={r.ROOM_NO} value={r.ROOM_NO}>
                {r.ROOM_NO} ({r.ROOM_TYPE}, Capacity: {r.CAPACITY})
              </option>
            ))}
          </select>
        </div>
        <button onClick={handleFetchTimetable} className="btn btn-primary" disabled={!selectedRoom || loading}>
          {loading ? 'Loading...' : 'View Utilization'}
        </button>
      </div>

      {timetable.length === 0 && !loading && selectedRoom && (
        <div className="message message-error">No schedule found for this room</div>
      )}

      {timetable.length > 0 && (
        <div>
          <h3 style={{ marginBottom: '1rem', color: '#2d3748' }}>
            Room Utilization: {selectedRoomInfo}
          </h3>
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table style={{ minWidth: '600px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Day</th>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Time</th>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Course</th>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Class</th>
                  <th style={{ background: '#4a5568', color: 'white', padding: '12px', textAlign: 'center' }}>Faculty</th>
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
                      {entry.FAC_NAME}
                      <div style={{ fontSize: '0.85rem', color: '#718096' }}>
                        {entry.DESIGN || 'Not specified'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#718096' }}>
            Total Utilization Hours: {timetable.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default TimetableRoomView;
