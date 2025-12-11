/**
 * Faculty Controller
 */

import * as facultyService from '../services/facultyService.js';

export async function getAllFaculty(req, res) {
  try {
    const faculty = await facultyService.getAllFaculty();
    res.json({ success: true, count: faculty.length, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve faculty', message: error.message });
  }
}

export async function getFacultyById(req, res) {
  try {
    const faculty = await facultyService.getFacultyById(req.params.id);
    if (!faculty) return res.status(404).json({ success: false, error: 'Faculty not found' });
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve faculty', message: error.message });
  }
}

export async function createFaculty(req, res) {
  try {
    const { fac_name, max_hours_week } = req.body;
    if (!fac_name || !max_hours_week) {
      return res.status(400).json({ success: false, error: 'fac_name and max_hours_week are required' });
    }
    const newFaculty = await facultyService.createFaculty(req.body);
    res.status(201).json({ success: true, message: 'Faculty created successfully', data: newFaculty });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create faculty', message: error.message });
  }
}

export async function updateFaculty(req, res) {
  try {
    const existing = await facultyService.getFacultyById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Faculty not found' });
    const updated = await facultyService.updateFaculty(req.params.id, req.body);
    res.json({ success: true, message: 'Faculty updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update faculty', message: error.message });
  }
}

export async function deleteFaculty(req, res) {
  try {
    const existing = await facultyService.getFacultyById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Faculty not found' });
    await facultyService.deleteFaculty(req.params.id);
    res.json({ success: true, message: 'Faculty deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete faculty', message: error.message });
  }
}

export default { getAllFaculty, getFacultyById, createFaculty, updateFaculty, deleteFaculty };
