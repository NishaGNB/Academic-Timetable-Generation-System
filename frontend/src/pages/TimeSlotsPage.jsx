// TimeSlotsPage.jsx - Similar CRUD pattern
import { useState, useEffect } from 'react';
import { timeslotAPI } from '../api/apiClient';

function TimeSlotsPage() {
  const [timeslots, setTimeslots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    day_of_week: 'Monday', start_time: '09:00:00', end_time: '10:00:00', is_lab: 0, is_break: 0
  });

  useEffect(() => { fetchTimeslots(); }, []);

  const fetchTimeslots = async () => {
    try {
      const res = await timeslotAPI.getAll();
      setTimeslots(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load timeslots' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({ day_of_week: 'Monday', start_time: '09:00:00', end_time: '10:00:00', is_lab: 0, is_break: 0 });
    setShowModal(true);
  };

  const handleEdit = (slot) => {
    setEditing(slot);
    setFormData({
      day_of_week: slot.DAY_OF_WEEK, start_time: slot.START_TIME, end_time: slot.END_TIME,
      is_lab: slot.IS_LAB, is_break: slot.IS_BREAK
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await timeslotAPI.update(editing.SLOT_ID, formData);
        setMessage({ type: 'success', text: 'Timeslot updated' });
      } else {
        await timeslotAPI.create(formData);
        setMessage({ type: 'success', text: 'Timeslot created' });
      }
      setShowModal(false);
      fetchTimeslots();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this timeslot?')) return;
    try {
      await timeslotAPI.delete(id);
      setMessage({ type: 'success', text: 'Timeslot deleted' });
      fetchTimeslots();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Time Slots</h2>
        <button onClick={handleAdd} className="btn btn-primary">Add Time Slot</button>
      </div>
      {message.text && <div className={`message message-${message.type}`}>{message.text}</div>}
      <div className="table-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Day</th><th>Start Time</th><th>End Time</th><th>Lab</th><th>Break</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {timeslots.map(s => (
              <tr key={s.SLOT_ID}>
                <td>{s.SLOT_ID}</td>
                <td>{s.DAY_OF_WEEK}</td>
                <td>{s.START_TIME}</td>
                <td>{s.END_TIME}</td>
                <td>{s.IS_LAB ? 'Yes' : 'No'}</td>
                <td>{s.IS_BREAK ? 'Yes' : 'No'}</td>
                <td>
                  <div className="actions">
                    <button onClick={() => handleEdit(s)} className="btn btn-secondary">Edit</button>
                    <button onClick={() => handleDelete(s.SLOT_ID)} className="btn btn-danger">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? 'Edit' : 'Add'} Time Slot</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Day of Week *</label>
                <select value={formData.day_of_week} onChange={e => setFormData({...formData, day_of_week: e.target.value})} required>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Time * (HH:MM:SS)</label>
                <input type="text" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} 
                       required placeholder="09:00:00" />
              </div>
              <div className="form-group">
                <label>End Time * (HH:MM:SS)</label>
                <input type="text" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} 
                       required placeholder="10:00:00" />
              </div>
              <div className="form-group">
                <label>Lab Slot</label>
                <select value={formData.is_lab} onChange={e => setFormData({...formData, is_lab: parseInt(e.target.value)})}>
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label>Break Slot</label>
                <select value={formData.is_break} onChange={e => setFormData({...formData, is_break: parseInt(e.target.value)})}>
                  <option value={0}>No</option>
                  <option value={1}>Yes</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeSlotsPage;
