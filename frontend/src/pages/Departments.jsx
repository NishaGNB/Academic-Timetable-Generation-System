import { useState, useEffect } from 'react';
import { departmentAPI } from '../api/apiClient';

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    dept_name: '',
    programsOffered: '',
    AcadYear: new Date().getFullYear()
  });

  // Fetch departments on component mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      showMessage('error', 'Failed to load departments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'AcadYear' ? parseInt(value) : value
    }));
  };

  const handleAdd = () => {
    setEditingDept(null);
    setFormData({
      dept_name: '',
      programsOffered: '',
      AcadYear: new Date().getFullYear()
    });
    setShowModal(true);
  };

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      dept_name: dept.DEPT_NAME,
      programsOffered: dept.PROGRAMSOFFERED || '',
      AcadYear: dept.ACADYEAR
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingDept) {
        await departmentAPI.update(editingDept.DEPT_ID, formData);
        showMessage('success', 'Department updated successfully');
      } else {
        await departmentAPI.create(formData);
        showMessage('success', 'Department created successfully');
      }
      
      setShowModal(false);
      fetchDepartments();
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      await departmentAPI.delete(id);
      showMessage('success', 'Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      showMessage('error', 'Failed to delete department: ' + error.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading departments...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Departments</h2>
        <button onClick={handleAdd} className="btn btn-primary">
          Add Department
        </button>
      </div>

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Department Name</th>
              <th>Programs Offered</th>
              <th>Academic Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  No departments found. Click "Add Department" to create one.
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.DEPT_ID}>
                  <td>{dept.DEPT_ID}</td>
                  <td>{dept.DEPT_NAME}</td>
                  <td>{dept.PROGRAMSOFFERED || '-'}</td>
                  <td>{dept.ACADYEAR}</td>
                  <td>
                    <div className="actions">
                      <button 
                        onClick={() => handleEdit(dept)} 
                        className="btn btn-secondary"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(dept.DEPT_ID)} 
                        className="btn btn-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingDept ? 'Edit Department' : 'Add Department'}</h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  name="dept_name"
                  value={formData.dept_name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div className="form-group">
                <label>Programs Offered</label>
                <input
                  type="text"
                  name="programsOffered"
                  value={formData.programsOffered}
                  onChange={handleInputChange}
                  placeholder="e.g., B.Tech, M.Tech, PhD"
                />
              </div>

              <div className="form-group">
                <label>Academic Year *</label>
                <input
                  type="number"
                  name="AcadYear"
                  value={formData.AcadYear}
                  onChange={handleInputChange}
                  required
                  min="2000"
                  max="2100"
                />
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingDept ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Departments;
