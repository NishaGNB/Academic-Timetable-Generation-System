/**
 * Timetable Routes
 */

import express from 'express';
import * as timetableController from '../controllers/timetableController.js';

const router = express.Router();

// POST /api/timetable/generate - Generate timetable for a semester
router.post('/generate', timetableController.generateTimetable);

// POST /api/timetable/generate-auto - Generate using stored procedure (CURSOR)
router.post('/generate-auto', timetableController.generateTimetableAuto);

// POST /api/timetable/optimize - Optimize timetable using LLM/AI
router.post('/optimize', timetableController.optimizeTimetable);

// GET /api/timetable/logs - Get generation logs
router.get('/logs', timetableController.getTimetableLogs);

// GET /api/timetable/class/:classId - Get timetable for a class
router.get('/class/:classId', timetableController.getTimetableByClass);

// GET /api/timetable/faculty/:facId - Get timetable for a faculty
router.get('/faculty/:facId', timetableController.getTimetableByFaculty);

// GET /api/timetable/room/:roomNo - Get timetable for a room
router.get('/room/:roomNo', timetableController.getTimetableByRoom);

export default router;
