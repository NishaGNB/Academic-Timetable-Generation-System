// TimeSlot Controller
import * as timeslotService from '../services/timeslotService.js';

export async function getAllTimeslots(req, res) {
  try {
    const slots = await timeslotService.getAllTimeslots();
    res.json({ success: true, count: slots.length, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve timeslots', message: error.message });
  }
}

export async function getTimeslotById(req, res) {
  try {
    const slot = await timeslotService.getTimeslotById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, error: 'Timeslot not found' });
    res.json({ success: true, data: slot });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to retrieve timeslot', message: error.message });
  }
}

export async function createTimeslot(req, res) {
  try {
    const { day_of_week, start_time, end_time } = req.body;
    if (!day_of_week || !start_time || !end_time) {
      return res.status(400).json({ success: false, error: 'day_of_week, start_time, and end_time are required' });
    }
    const newSlot = await timeslotService.createTimeslot(req.body);
    res.status(201).json({ success: true, message: 'Timeslot created successfully', data: newSlot });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create timeslot', message: error.message });
  }
}

export async function updateTimeslot(req, res) {
  try {
    const existing = await timeslotService.getTimeslotById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Timeslot not found' });
    const updated = await timeslotService.updateTimeslot(req.params.id, req.body);
    res.json({ success: true, message: 'Timeslot updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update timeslot', message: error.message });
  }
}

export async function deleteTimeslot(req, res) {
  try {
    const existing = await timeslotService.getTimeslotById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Timeslot not found' });
    await timeslotService.deleteTimeslot(req.params.id);
    res.json({ success: true, message: 'Timeslot deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete timeslot', message: error.message });
  }
}

export default { getAllTimeslots, getTimeslotById, createTimeslot, updateTimeslot, deleteTimeslot };
