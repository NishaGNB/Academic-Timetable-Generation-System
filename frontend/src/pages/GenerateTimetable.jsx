import { useState, useEffect } from 'react';
import { timetableAPI, classAPI } from '../api/apiClient';

function GenerateTimetable() {
  const [semester, setSemester] = useState(1);
  const [year, setYear] = useState(1);
  const [section, setSection] = useState('');
  const [acadYear, setAcadYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [logs, setLogs] = useState([]);
  const [processId, setProcessId] = useState(null);
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [classes, setClasses] = useState([]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!window.confirm(`Generate timetable for Year ${year}, Semester ${semester}? This will overwrite existing data.`)) {
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      setLogs([]);
      setTimetableEntries([]);
      
      // Call stored procedure version
      const response = await timetableAPI.generateAuto(year, semester);
      
      setMessage({
        type: 'success',
        text: `Timetable generated! Total entries: ${response.total_entries}`
      });
      setLogs(response.logs || []);
      setProcessId(response.process_id);
      
      // Fetch the generated timetable for all classes in this year/semester
      await fetchGeneratedTimetable();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to generate timetable: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneratedTimetable = async () => {
    try {
      // Get all classes for the selected year and semester
      const classesRes = await classAPI.getAll();
      let filteredClasses = classesRes.data.filter(
        c => c.YEAR === year && c.SEM === semester
      );
      
      // If section is specified, filter by section
      if (section) {
        filteredClasses = filteredClasses.filter(c => c.SEC === section);
      }
      
      setClasses(filteredClasses);
      
      // Fetch timetable for each class
      const allEntries = [];
      for (const cls of filteredClasses) {
        try {
          const res = await timetableAPI.getByClass(cls.CLASS_ID);
          allEntries.push(...res.data.map(entry => ({
            ...entry,
            CLASS_SEC: cls.SEC
          })));
        } catch (err) {
          console.error(`Failed to fetch timetable for class ${cls.CLASS_ID}`);
        }
      }
      setTimetableEntries(allEntries);
    } catch (error) {
      console.error('Failed to fetch generated timetable:', error);
    }
  };

  const renderTimetableGrid = () => {
    // Group entries by day and time
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeSlots = {};
    
    // Extract unique time slots
    timetableEntries.forEach(entry => {
      const timeKey = `${entry.START_TIME}-${entry.END_TIME}`;
      if (!timeSlots[timeKey]) {
        timeSlots[timeKey] = entry.START_TIME;
      }
    });
    
    // Sort time slots
    const sortedTimeSlots = Object.keys(timeSlots).sort((a, b) => {
      return timeSlots[a].localeCompare(timeSlots[b]);
    });
    
    // Create grid data structure
    const grid = {};
    days.forEach(day => {
      grid[day] = {};
      sortedTimeSlots.forEach(timeSlot => {
        grid[day][timeSlot] = [];
      });
    });
    
    // Populate grid with entries
    timetableEntries.forEach(entry => {
      const timeKey = `${entry.START_TIME}-${entry.END_TIME}`;
      if (grid[entry.DAY_OF_WEEK] && grid[entry.DAY_OF_WEEK][timeKey]) {
        grid[entry.DAY_OF_WEEK][timeKey].push(entry);
      }
    });
    
    return (
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse',
        border: '2px solid #333'
      }}>
        <thead>
          <tr>
            <th style={{
              border: '1px solid #333',
              padding: '12px',
              background: '#f0f0f0',
              fontWeight: 'bold',
              minWidth: '100px'
            }}>DAY / TIME</th>
            {sortedTimeSlots.map((timeSlot, idx) => (
              <th key={idx} style={{
                border: '1px solid #333',
                padding: '12px',
                background: '#f0f0f0',
                fontWeight: 'bold',
                minWidth: '150px'
              }}>
                {timeSlot}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIdx) => (
            <tr key={dayIdx}>
              <td style={{
                border: '1px solid #333',
                padding: '12px',
                fontWeight: 'bold',
                background: '#f9f9f9'
              }}>{day.toUpperCase().substring(0, 3)}</td>
              {sortedTimeSlots.map((timeSlot, slotIdx) => (
                <td key={slotIdx} style={{
                  border: '1px solid #333',
                  padding: '8px',
                  background: grid[day][timeSlot].length > 0 ? getColorForEntry(grid[day][timeSlot][0]) : 'white',
                  verticalAlign: 'top'
                }}>
                  {grid[day][timeSlot].map((entry, entryIdx) => (
                    <div key={entryIdx} style={{ marginBottom: entryIdx < grid[day][timeSlot].length - 1 ? '8px' : '0' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                        {entry.COURSE_CODE}
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                        Sec {entry.CLASS_SEC} - {entry.ROOM_NO}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#555' }}>
                        {entry.FAC_NAME}
                      </div>
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const getColorForEntry = (entry) => {
    // Generate different colors for different courses
    const colors = [
      '#FFE5E5', '#E5F5FF', '#FFF5E5', '#E5FFE5', 
      '#F5E5FF', '#FFE5F5', '#E5FFFF', '#FFFFE5'
    ];
    const hash = entry.COURSE_CODE.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const handleOptimize = async () => {
    if (!window.confirm('Optimize timetable using AI? This may take a few moments.')) {
      return;
    }

    try {
      setOptimizing(true);
      setMessage({ type: '', text: '' });
      
      const response = await timetableAPI.optimize(year, semester);
      
      setMessage({
        type: 'success',
        text: `AI Optimization completed! ${response.applied_count} improvements applied. Score: ${response.analysis?.optimization_score || 'N/A'}`
      });
      
      if (response.logs) {
        setLogs(prev => [...response.logs, ...prev]);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to optimize: ' + error.message
      });
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div>
      <h2>Generate Timetable</h2>
      <p style={{ marginBottom: '2rem', color: '#666' }}>
        Generate an automatic timetable using Oracle stored procedures with CURSOR.
        Then optimize it for best results.
      </p>

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', maxWidth: '600px' }}>
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label>Academic Year *</label>
            <select 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
              required
              disabled={loading || optimizing}
            >
              <option value={1}>Year 1</option>
              <option value={2}>Year 2</option>
              <option value={3}>Year 3</option>
              <option value={4}>Year 4</option>
            </select>
          </div>

          <div className="form-group">
            <label>Semester *</label>
            <select 
              value={semester} 
              onChange={(e) => setSemester(parseInt(e.target.value))}
              required
              disabled={loading || optimizing}
            >
              <option value={1}>Semester 1</option>
              <option value={2}>Semester 2</option>
              <option value={3}>Semester 3</option>
              <option value={4}>Semester 4</option>
              <option value={5}>Semester 5</option>
              <option value={6}>Semester 6</option>
              <option value={7}>Semester 7</option>
              <option value={8}>Semester 8</option>
            </select>
          </div>

          <div className="form-group">
            <label>Section (Optional)</label>
            <input
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value.toUpperCase())}
              placeholder="e.g., A, B, C (leave empty for all sections)"
              disabled={loading || optimizing}
              maxLength="1"
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-success" 
            disabled={loading || optimizing}
            style={{ width: '100%', marginBottom: '1rem' }}
          >
            {loading ? 'Generating...' : 'Generate Timetable'}
          </button>
        </form>

        {processId && (
          <button 
            onClick={handleOptimize}
            className="btn btn-primary" 
            disabled={loading || optimizing}
            style={{ width: '100%', background: '#8b5cf6' }}
          >
            {optimizing ? 'Optimizing...' : 'Optimize'}
          </button>
        )}

        {logs.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h4>Generation Logs:</h4>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              background: '#1a1a1a', 
              color: '#fff',
              padding: '1rem', 
              borderRadius: '5px',
              fontSize: '0.8rem',
              fontFamily: 'monospace'
            }}>
              {logs.map((log, idx) => (
                <div key={idx} style={{ 
                  marginBottom: '0.5rem',
                  color: log.LOG_TYPE === 'ERROR' ? '#ff6b6b' : 
                         log.LOG_TYPE === 'WARNING' ? '#ffd93d' :
                         log.LOG_TYPE === 'SUCCESS' ? '#51cf66' : '#fff'
                }}>
                  [{log.LOG_TIME}] {log.LOG_TYPE}: {log.MSG}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {timetableEntries.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Generated Timetable</h3>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', overflowX: 'auto' }}>
            {renderTimetableGrid()}
          </div>
        </div>
      )}
    </div>
  );
}

export default GenerateTimetable;
