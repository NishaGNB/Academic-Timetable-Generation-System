// Classroom Controller
import * as classroomService from '../services/classroomService.js';

export async function getAllClassrooms(req, res) {
  try {
    const classrooms = await classroomService.getAllClassrooms();
    res.json({ success: true, count: classrooms.length, data: classrooms });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve classrooms', message: error.message });
  }
}

export async function getClassroomById(req, res) {
  try {
    const classroom = await classroomService.getClassroomById(req.params.roomNo);
    if (!classroom) return res.status(404).json({ success: false, error: 'Classroom not found' });
    res.json({ success: true, data: classroom });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve classroom', message: error.message });
  }
}

export async function createClassroom(req, res) {
  try {
    const { room_no, room_type, capacity } = req.body;
    if (!room_no || !room_type || !capacity) {
      return res.status(400).json({ success: false, error: 'room_no, room_type, and capacity are required' });
    }
    const newRoom = await classroomService.createClassroom(req.body);
    res.status(201).json({ success: true, message: 'Classroom created successfully', data: newRoom });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create classroom', message: error.message });
  }
}

export async function updateClassroom(req, res) {
  try {
    const existing = await classroomService.getClassroomById(req.params.roomNo);
    if (!existing) return res.status(404).json({ success: false, error: 'Classroom not found' });
    const updated = await classroomService.updateClassroom(req.params.roomNo, req.body);
    res.json({ success: true, message: 'Classroom updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update classroom', message: error.message });
  }
}

export async function deleteClassroom(req, res) {
  try {
    const existing = await classroomService.getClassroomById(req.params.roomNo);
    if (!existing) return res.status(404).json({ success: false, error: 'Classroom not found' });
    await classroomService.deleteClassroom(req.params.roomNo);
    res.json({ success: true, message: 'Classroom deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete classroom', message: error.message });
  }
}

export default { getAllClassrooms, getClassroomById, createClassroom, updateClassroom, deleteClassroom };
