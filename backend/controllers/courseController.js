/**
 * Course Controller - Similar to Department controller
 */

import * as courseService from '../services/courseService.js';

export async function getAllCourses(req, res) {
  try {
    const courses = await courseService.getAllCourses();
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve courses', message: error.message });
  }
}

export async function getCourseById(req, res) {
  try {
    const course = await courseService.getCourseById(req.params.code);
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve course', message: error.message });
  }
}

export async function createCourse(req, res) {
  try {
    const { course_code, course_name, credits, course_type, course_cat, hours_week, sem, dept_id } = req.body;
    if (!course_code || !course_name || !credits || !course_type || !course_cat || !hours_week || !sem || !dept_id) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }
    const newCourse = await courseService.createCourse(req.body);
    res.status(201).json({ success: true, message: 'Course created successfully', data: newCourse });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create course', message: error.message });
  }
}

export async function updateCourse(req, res) {
  try {
    const existing = await courseService.getCourseById(req.params.code);
    if (!existing) return res.status(404).json({ success: false, error: 'Course not found' });
    const updated = await courseService.updateCourse(req.params.code, req.body);
    res.json({ success: true, message: 'Course updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update course', message: error.message });
  }
}

export async function deleteCourse(req, res) {
  try {
    const existing = await courseService.getCourseById(req.params.code);
    if (!existing) return res.status(404).json({ success: false, error: 'Course not found' });
    await courseService.deleteCourse(req.params.code);
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete course', message: error.message });
  }
}

export default { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };
