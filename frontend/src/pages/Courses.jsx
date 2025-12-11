import { useState, useEffect } from 'react';
import { courseAPI, departmentAPI } from '../api/apiClient';

// Similar pattern to Departments.jsx
function Courses() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    credits: 3,
    course_type: 'THEORY',
    course_cat: 'CORE',
    hours_week: 3,
    sem: 1,
    dept_id: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getAll();
      setCourses(response.data);
    } catch (error) {
      showMessage('error', 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to load departments');
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
      [name]: ['credits', 'hours_week', 'sem', 'dept_id'].includes(name) ? parseInt(value) : value
    }));
  };

  const handleAdd = () => {
    setEditingCourse(null);
    setFormData({
      course_code: '',
      course_name: '',
      credits: 3,
      course_type: 'THEORY',
      course_cat: 'CORE',
      hours_week: 3,
      sem: 1,
      dept_id: ''
    });
    setShowModal(true);
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      course_code: course.COURSE_CODE,
      course_name: course.COURSE_NAME,
      credits: course.CREDITS,
      course_type: course.COURSE_TYPE,
      course_cat: course.COURSE_CAT,
      hours_week: course.HOURS_WEEK,
      sem: course.SEM,
      dept_id: course.DEPT_ID
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await courseAPI.update(editingCourse.COURSE_CODE, formData);
        showMessage('success', 'Course updated successfully');
      } else {
        await courseAPI.create(formData);
        showMessage('success', 'Course created successfully');
      }
      setShowModal(false);
      fetchCourses();
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await courseAPI.delete(code);
      showMessage('success', 'Course deleted successfully');
      fetchCourses();
    } catch (error) {
      showMessage('error', error.message);
    }
  };

  if (loading) return <div className="loading">Loading courses...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Courses</h2>
        <button onClick={handleAdd} className="btn btn-primary">Add Course</button>
      </div>

      {message.text && <div className={`message message-${message.type}`}>{message.text}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Type</th>
              <th>Category</th>
              <th>Hours/Week</th>
              <th>Semester</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No courses found</td></tr>
            ) : (
              courses.map((course) => (
                <tr key={course.COURSE_CODE}>
                  <td>{course.COURSE_CODE}</td>
                  <td>{course.COURSE_NAME}</td>
                  <td>{course.CREDITS}</td>
                  <td>{course.COURSE_TYPE}</td>
                  <td>{course.COURSE_CAT}</td>
                  <td>{course.HOURS_WEEK}</td>
                  <td>{course.SEM}</td>
                  <td>{course.DEPT_NAME || '-'}</td>
                  <td>
                    <div className="actions">
                      <button onClick={() => handleEdit(course)} className="btn btn-secondary">Edit</button>
                      <button onClick={() => handleDelete(course.COURSE_CODE)} className="btn btn-danger">Delete</button>
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
            <h3>{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Course Code *</label>
                <input type="text" name="course_code" value={formData.course_code} onChange={handleInputChange} 
                       required disabled={editingCourse} />
              </div>
              <div className="form-group">
                <label>Course Name *</label>
                <input type="text" name="course_name" value={formData.course_name} onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Credits *</label>
                <input type="number" name="credits" value={formData.credits} onChange={handleInputChange} required min="1" max="10" />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <select name="course_type" value={formData.course_type} onChange={handleInputChange} required>
                  <option value="THEORY">THEORY</option>
                  <option value="LAB">LAB</option>
                </select>
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select name="course_cat" value={formData.course_cat} onChange={handleInputChange} required>
                  <option value="CORE">CORE</option>
                  <option value="ELECTIVE">ELECTIVE</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hours per Week *</label>
                <input type="number" name="hours_week" value={formData.hours_week} onChange={handleInputChange} required min="1" max="10" />
              </div>
              <div className="form-group">
                <label>Semester *</label>
                <input type="number" name="sem" value={formData.sem} onChange={handleInputChange} required min="1" max="8" />
              </div>
              <div className="form-group">
                <label>Department *</label>
                <select name="dept_id" value={formData.dept_id} onChange={handleInputChange} required>
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.DEPT_ID} value={dept.DEPT_ID}>{dept.DEPT_NAME}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingCourse ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
