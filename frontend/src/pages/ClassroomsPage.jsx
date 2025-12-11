// ClassroomsPage.jsx - Simplified version following same pattern
import { useState, useEffect } from 'react';
import { classroomAPI } from '../api/apiClient';

function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    room_no: '', room_type: 'LECTURE', capacity: 0, availability: 'FULL_DAY', is_shared: 0
  });

  useEffect(() => { fetchClassrooms(); }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await classroomAPI.getAll();
      setClassrooms(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load classrooms' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({ room_no: '', room_type: 'LECTURE', capacity: 0, availability: 'FULL_DAY', is_shared: 0 });
    setShowModal(true);
  };

  const handleEdit = (room) => {
    setEditing(room);
    setFormData({ room_no: room.ROOM_NO, room_type: room.ROOM_TYPE, capacity: room.CAPACITY, 
                  availability: room.AVAILABILITY, is_shared: room.IS_SHARED });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await classroomAPI.update(editing.ROOM_NO, formData);
        setMessage({ type: 'success', text: 'Classroom updated' });
      } else {
        await classroomAPI.create(formData);
        setMessage({ type: 'success', text: 'Classroom created' });
      }
      setShowModal(false);
      fetchClassrooms();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (roomNo) => {
    if (!confirm('Delete this classroom?')) return;
    try {
      await classroomAPI.delete(roomNo);
      setMessage({ type: 'success', text: 'Classroom deleted' });
      fetchClassrooms();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Classrooms</h2>
        <button onClick={handleAdd} className="btn btn-primary">Add Classroom</button>
      </div>
      {message.text && <div className={`message message-${message.type}`}>{message.text}</div>}
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Room No</th><th>Type</th><th>Capacity</th><th>Availability</th><th>Shared</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {classrooms.map(r => (
              <tr key={r.ROOM_NO}>
                <td>{r.ROOM_NO}</td>
                <td>{r.ROOM_TYPE}</td>
                <td>{r.CAPACITY}</td>
                <td>{r.AVAILABILITY}</td>
                <td>{r.IS_SHARED ? 'Yes' : 'No'}</td>
                <td>
                  <div className="actions">
                    <button onClick={() => handleEdit(r)} className="btn btn-secondary">Edit</button>
                    <button onClick={() => handleDelete(r.ROOM_NO)} className="btn btn-danger">Delete</button>
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
            <h3>{editing ? 'Edit' : 'Add'} Classroom</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Room Number *</label>
                <input type="text" value={formData.room_no} onChange={e => setFormData({...formData, room_no: e.target.value})} 
                       required disabled={editing} />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select value={formData.room_type} onChange={e => setFormData({...formData, room_type: e.target.value})} required>
                  <option value="LECTURE">LECTURE</option>
                  <option value="LAB">LAB</option>
                </select>
              </div>
              <div className="form-group">
                <label>Capacity *</label>
                <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} 
                       required min="1" />
              </div>
              <div className="form-group">
                <label>Availability</label>
                <input type="text" value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Shared</label>
                <select value={formData.is_shared} onChange={e => setFormData({...formData, is_shared: parseInt(e.target.value)})}>
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

export default ClassroomsPage;
