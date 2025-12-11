// ClassesPage.jsx - Similar CRUD pattern
import { useState, useEffect } from 'react';
import { classAPI, facultyAPI } from '../api/apiClient';

function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    sec: '', year: 1, sem: 1, NOS: 0, programs_offered: '', fac_id: ''
  });

  useEffect(() => {
    fetchClasses();
    fetchFaculty();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await classAPI.getAll();
      setClasses(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load classes' });
    } finally {
      setLoading(false);
    }
  };

  const fetchFaculty = async () => {
    try {
      const res = await facultyAPI.getAll();
      setFaculty(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({ sec: '', year: 1, sem: 1, NOS: 0, programs_offered: '', fac_id: '' });
    setShowModal(true);
  };

  const handleEdit = (cls) => {
    setEditing(cls);
    setFormData({
      sec: cls.SEC, year: cls.YEAR, sem: cls.SEM, NOS: cls.NOS,
      programs_offered: cls.PROGRAMS_OFFERED || '', fac_id: cls.FAC_ID || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await classAPI.update(editing.CLASS_ID, formData);
        setMessage({ type: 'success', text: 'Class updated' });
      } else {
        await classAPI.create(formData);
        setMessage({ type: 'success', text: 'Class created' });
      }
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this class?')) return;
    try {
      await classAPI.delete(id);
      setMessage({ type: 'success', text: 'Class deleted' });
      fetchClasses();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Classes</h2>
        <button onClick={handleAdd} className="btn btn-primary">Add Class</button>
      </div>
      {message.text && <div className={`message message-${message.type}`}>{message.text}</div>}
      <div className="table-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Section</th><th>Year</th><th>Sem</th><th>Students</th><th>Programs</th><th>Advisor</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {classes.map(c => (
              <tr key={c.CLASS_ID}>
                <td>{c.CLASS_ID}</td>
                <td>{c.SEC}</td>
                <td>{c.YEAR}</td>
                <td>{c.SEM}</td>
                <td>{c.NOS}</td>
                <td>{c.PROGRAMS_OFFERED || '-'}</td>
                <td>{c.FAC_NAME || '-'}</td>
                <td>
                  <div className="actions">
                    <button onClick={() => handleEdit(c)} className="btn btn-secondary">Edit</button>
                    <button onClick={() => handleDelete(c.CLASS_ID)} className="btn btn-danger">Delete</button>
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
            <h3>{editing ? 'Edit' : 'Add'} Class</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Section *</label>
                <input type="text" value={formData.sec} onChange={e => setFormData({...formData, sec: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Year *</label>
                <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} required min="1" max="4" />
              </div>
              <div className="form-group">
                <label>Semester *</label>
                <input type="number" value={formData.sem} onChange={e => setFormData({...formData, sem: parseInt(e.target.value)})} required min="1" max="8" />
              </div>
              <div className="form-group">
                <label>Number of Students *</label>
                <input type="number" value={formData.NOS} onChange={e => setFormData({...formData, NOS: parseInt(e.target.value)})} required min="0" />
              </div>
              <div className="form-group">
                <label>Programs Offered</label>
                <input type="text" value={formData.programs_offered} onChange={e => setFormData({...formData, programs_offered: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Class Advisor</label>
                <select value={formData.fac_id} onChange={e => setFormData({...formData, fac_id: e.target.value})}>
                  <option value="">Select</option>
                  {faculty.map(f => <option key={f.FAC_ID} value={f.FAC_ID}>{f.FAC_NAME}</option>)}
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

export default ClassesPage;
