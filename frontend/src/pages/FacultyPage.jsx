// FacultyPage.jsx - Similar pattern to Departments
import { useState, useEffect } from 'react';
import { facultyAPI, departmentAPI } from '../api/apiClient';

function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    fac_name: '', dept_id: '', design: '', max_hours_week: 18
  });

  useEffect(() => {
    fetchFaculty();
    fetchDepartments();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await facultyAPI.getAll();
      setFaculty(res.data);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load faculty' });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await departmentAPI.getAll();
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = () => {
    setEditing(null);
    setFormData({ fac_name: '', dept_id: '', design: '', max_hours_week: 18 });
    setShowModal(true);
  };

  const handleEdit = (fac) => {
    setEditing(fac);
    setFormData({
      fac_name: fac.FAC_NAME,
      dept_id: fac.DEPT_ID || '',
      design: fac.DESIGN || '',
      max_hours_week: fac.MAX_HOURS_WEEK
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await facultyAPI.update(editing.FAC_ID, formData);
        setMessage({ type: 'success', text: 'Faculty updated' });
      } else {
        await facultyAPI.create(formData);
        setMessage({ type: 'success', text: 'Faculty created' });
      }
      setShowModal(false);
      fetchFaculty();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this faculty?')) return;
    try {
      await facultyAPI.delete(id);
      setMessage({ type: 'success', text: 'Faculty deleted' });
      fetchFaculty();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Faculty</h2>
        <button onClick={handleAdd} className="btn btn-primary">Add Faculty</button>
      </div>
      {message.text && <div className={`message message-${message.type}`}>{message.text}</div>}
      <div className="table-container">
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Department</th><th>Designation</th><th>Max Hours/Week</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {faculty.map(f => (
              <tr key={f.FAC_ID}>
                <td>{f.FAC_ID}</td>
                <td>{f.FAC_NAME}</td>
                <td>{f.DEPT_NAME || '-'}</td>
                <td>{f.DESIGN || '-'}</td>
                <td>{f.MAX_HOURS_WEEK}</td>
                <td>
                  <div className="actions">
                    <button onClick={() => handleEdit(f)} className="btn btn-secondary">Edit</button>
                    <button onClick={() => handleDelete(f.FAC_ID)} className="btn btn-danger">Delete</button>
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
            <h3>{editing ? 'Edit' : 'Add'} Faculty</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input type="text" value={formData.fac_name} onChange={e => setFormData({...formData, fac_name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select value={formData.dept_id} onChange={e => setFormData({...formData, dept_id: e.target.value})}>
                  <option value="">Select</option>
                  {departments.map(d => <option key={d.DEPT_ID} value={d.DEPT_ID}>{d.DEPT_NAME}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Designation</label>
                <input type="text" value={formData.design} onChange={e => setFormData({...formData, design: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Max Hours/Week *</label>
                <input type="number" value={formData.max_hours_week} onChange={e => setFormData({...formData, max_hours_week: parseInt(e.target.value)})} required min="1" max="40" />
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

export default FacultyPage;
