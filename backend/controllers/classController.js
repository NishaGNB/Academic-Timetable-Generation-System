// Classes Controller - Same pattern
import * as classService from '../services/classService.js';

export async function getAllClasses(req, res) {
  try {
    const classes = await classService.getAllClasses();
    res.json({ success: true, count: classes.length, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve classes', message: error.message });
  }
}

export async function getClassById(req, res) {
  try {
    const classData = await classService.getClassById(req.params.id);
    if (!classData) return res.status(404).json({ success: false, error: 'Class not found' });
    res.json({ success: true, data: classData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve class', message: error.message });
  }
}

export async function createClass(req, res) {
  try {
    const { sec, year, sem, NOS } = req.body;
    if (!sec || !year || !sem || !NOS) {
      return res.status(400).json({ success: false, error: 'sec, year, sem, and NOS are required' });
    }
    const newClass = await classService.createClass(req.body);
    res.status(201).json({ success: true, message: 'Class created successfully', data: newClass });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create class', message: error.message });
  }
}

export async function updateClass(req, res) {
  try {
    const existing = await classService.getClassById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Class not found' });
    const updated = await classService.updateClass(req.params.id, req.body);
    res.json({ success: true, message: 'Class updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update class', message: error.message });
  }
}

export async function deleteClass(req, res) {
  try {
    const existing = await classService.getClassById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Class not found' });
    await classService.deleteClass(req.params.id);
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete class', message: error.message });
  }
}

export default { getAllClasses, getClassById, createClass, updateClass, deleteClass };
