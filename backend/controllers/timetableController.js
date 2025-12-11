/**
 * Timetable Controller
 * Handles timetable generation and retrieval requests
 */

import * as timetableService from '../services/timetableService.js';
import * as llmService from '../services/llmOptimizerService.js';

/**
 * POST /api/timetable/generate
 * Generate timetable for a semester
 * Body: { sem: number, acadYear: number }
 */
export async function generateTimetable(req, res) {
  try {
    const { sem, acadYear } = req.body;
    
    if (!sem) {
      return res.status(400).json({
        success: false,
        error: 'Semester (sem) is required'
      });
    }
    
    console.log(`Generating timetable for semester ${sem}, academic year ${acadYear || 'current'}`);
    
    const result = await timetableService.generateTimetable(sem, acadYear);
    
    res.json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (error) {
    console.error('Error in generateTimetable controller:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate timetable',
      message: error.message
    });
  }
}

/**
 * POST /api/timetable/generate-auto
 * Generate timetable using Oracle stored procedure (with CURSOR)
 * Body: { year: number, sem: number }
 */
export async function generateTimetableAuto(req, res) {
  try {
    const { year, sem } = req.body;
    
    if (!year || !sem) {
      return res.status(400).json({
        success: false,
        error: 'Year and semester are required'
      });
    }
    
    console.log(`Generating timetable using stored procedure for Year ${year}, Sem ${sem}`);
    
    const result = await timetableService.generateTimetableAuto(year, sem);
    
    res.json(result);
  } catch (error) {
    console.error('Error in generateTimetableAuto:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate timetable',
      message: error.message
    });
  }
}

/**
 * POST /api/timetable/optimize
 * Optimize timetable using LLM (AI)
 * Body: { year: number, sem: number, apiKey?: string, provider?: 'openai'|'gemini' }
 */
export async function optimizeTimetable(req, res) {
  try {
    const { year, sem, apiKey, provider } = req.body;
    
    if (!year || !sem) {
      return res.status(400).json({
        success: false,
        error: 'Year and semester are required'
      });
    }
    
    console.log(`Optimizing timetable using LLM for Year ${year}, Sem ${sem}`);
    
    const result = await llmService.optimizeTimetableLLM(year, sem, apiKey, provider || 'openai');
    
    res.json(result);
  } catch (error) {
    console.error('Error in optimizeTimetable:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize timetable',
      message: error.message
    });
  }
}

/**
 * GET /api/timetable/logs
 * Get timetable generation logs
 * Query params: ?processId=xxx
 */
export async function getTimetableLogs(req, res) {
  try {
    const { processId } = req.query;
    
    const logs = await timetableService.getTimetableLogs(processId);
    
    res.json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Error in getTimetableLogs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve logs',
      message: error.message
    });
  }
}

/**
 * GET /api/timetable/class/:classId
 * Get timetable for a specific class
 */
export async function getTimetableByClass(req, res) {
  try {
    const { classId } = req.params;
    
    const timetable = await timetableService.getTimetableByClass(classId);
    
    res.json({
      success: true,
      count: timetable.length,
      data: timetable
    });
  } catch (error) {
    console.error('Error in getTimetableByClass:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve class timetable',
      message: error.message
    });
  }
}

/**
 * GET /api/timetable/faculty/:facId
 * Get timetable for a specific faculty
 */
export async function getTimetableByFaculty(req, res) {
  try {
    const { facId } = req.params;
    
    const timetable = await timetableService.getTimetableByFaculty(facId);
    
    res.json({
      success: true,
      count: timetable.length,
      data: timetable
    });
  } catch (error) {
    console.error('Error in getTimetableByFaculty:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve faculty timetable',
      message: error.message
    });
  }
}

/**
 * GET /api/timetable/room/:roomNo
 * Get timetable for a specific room
 */
export async function getTimetableByRoom(req, res) {
  try {
    const { roomNo } = req.params;
    
    const timetable = await timetableService.getTimetableByRoom(roomNo);
    
    res.json({
      success: true,
      count: timetable.length,
      data: timetable
    });
  } catch (error) {
    console.error('Error in getTimetableByRoom:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve room timetable',
      message: error.message
    });
  }
}

export default {
  generateTimetable,
  generateTimetableAuto,
  optimizeTimetable,
  getTimetableLogs,
  getTimetableByClass,
  getTimetableByFaculty,
  getTimetableByRoom
};
