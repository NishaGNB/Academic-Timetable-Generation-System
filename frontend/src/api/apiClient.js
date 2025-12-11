/**
 * API Client
 * Centralized HTTP client for backend API calls
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Generic CRUD methods
export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Department APIs
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Course APIs
export const courseAPI = {
  getAll: () => api.get('/courses'),
  getById: (code) => api.get(`/courses/${code}`),
  create: (data) => api.post('/courses', data),
  update: (code, data) => api.put(`/courses/${code}`, data),
  delete: (code) => api.delete(`/courses/${code}`),
};

// Faculty APIs
export const facultyAPI = {
  getAll: () => api.get('/faculty'),
  getById: (id) => api.get(`/faculty/${id}`),
  create: (data) => api.post('/faculty', data),
  update: (id, data) => api.put(`/faculty/${id}`, data),
  delete: (id) => api.delete(`/faculty/${id}`),
};

// Class APIs
export const classAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
};

// Classroom APIs
export const classroomAPI = {
  getAll: () => api.get('/classrooms'),
  getById: (roomNo) => api.get(`/classrooms/${roomNo}`),
  create: (data) => api.post('/classrooms', data),
  update: (roomNo, data) => api.put(`/classrooms/${roomNo}`, data),
  delete: (roomNo) => api.delete(`/classrooms/${roomNo}`),
};

// TimeSlot APIs
export const timeslotAPI = {
  getAll: () => api.get('/timeslots'),
  getById: (id) => api.get(`/timeslots/${id}`),
  create: (data) => api.post('/timeslots', data),
  update: (id, data) => api.put(`/timeslots/${id}`, data),
  delete: (id) => api.delete(`/timeslots/${id}`),
};

// Timetable APIs
export const timetableAPI = {
  generate: (sem, acadYear) => api.post('/timetable/generate', { sem, acadYear }),
  generateAuto: (year, sem) => api.post('/timetable/generate-auto', { year, sem }),
  optimize: (year, sem, apiKey, provider) => api.post('/timetable/optimize', { year, sem, apiKey, provider }),
  getLogs: (processId) => api.get(`/timetable/logs${processId ? '?processId=' + processId : ''}`),
  getByClass: (classId) => api.get(`/timetable/class/${classId}`),
  getByFaculty: (facId) => api.get(`/timetable/faculty/${facId}`),
  getByRoom: (roomNo) => api.get(`/timetable/room/${roomNo}`),
};

export default api;
