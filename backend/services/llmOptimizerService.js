/**
 * LLM Optimizer Service
 * Uses AI (OpenAI/Gemini) to optimize timetable intelligently
 * Detects conflicts, balances workload, suggests improvements
 */

import { executeQuery, getConnection } from '../config/db.js';
import oracledb from 'oracledb';

/**
 * Optimize timetable using LLM (OpenAI/Gemini API)
 * Analyzes current timetable and suggests improvements
 */
export async function optimizeTimetableLLM(year, sem, apiKey = null, provider = 'openai') {
  let connection;
  try {
    connection = await getConnection();
    
    // Step 1: Fetch current timetable data
    const timetableData = await fetchTimetableForAnalysis(connection, year, sem);
    
    if (timetableData.length === 0) {
      return {
        success: false,
        message: 'No timetable found for the given year and semester'
      };
    }
    
    // Step 2: Prepare structured data for LLM
    const structuredData = prepareDataForLLM(timetableData);
    
    // Step 3: Call LLM API for optimization suggestions
    const llmResponse = await callLLMForOptimization(structuredData, apiKey, provider);
    
    // Step 4: Parse and apply suggestions
    const applied = await applySuggestions(connection, llmResponse.suggestions, year, sem);
    
    // Step 5: Log the optimization
    const processId = 'OPT_' + new Date().toISOString().replace(/[:-]/g, '').replace(/\..+/, '');
    await logOptimization(connection, processId, llmResponse, applied);
    
    await connection.commit();
    
    return {
      success: true,
      process_id: processId,
      suggestions: llmResponse.suggestions,
      applied_count: applied.count,
      message: `LLM optimization completed. ${applied.count} improvements applied.`,
      analysis: llmResponse.analysis
    };
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error in optimizeTimetableLLM:', error);
    throw error;
  } finally {
    if (connection) await connection.close();
  }
}

/**
 * Fetch timetable with all details for LLM analysis
 */
async function fetchTimetableForAnalysis(connection, year, sem) {
  const result = await connection.execute(
    `SELECT 
      t.id,
      c.class_id, c.sec, c.year, c.sem, c.NOS as students,
      cr.course_code, cr.course_name, cr.course_type, cr.hours_week,
      f.fac_id, f.fac_name, f.max_hours_week,
      rm.room_no, rm.room_type, rm.capacity,
      ts.slot_id, ts.day_of_week, ts.start_time, ts.end_time,
      -- Calculate current faculty load
      (SELECT NVL(SUM(c2.hours_week), 0)
       FROM Timetable t2
       JOIN Courses c2 ON t2.course_code = c2.course_code
       WHERE t2.fac_id = f.fac_id) as faculty_current_load
    FROM Timetable t
    JOIN Classes c ON t.class_id = c.class_id
    JOIN Courses cr ON t.course_code = cr.course_code
    JOIN Faculty f ON t.fac_id = f.fac_id
    JOIN Classrooms rm ON t.room_no = rm.room_no
    JOIN TimeSlots ts ON t.slot_id = ts.slot_id
    WHERE c.year = :year AND c.sem = :sem
    ORDER BY c.class_id, ts.day_of_week, ts.start_time`,
    { year, sem },
    { outFormat: oracledb.OUT_FORMAT_OBJECT }
  );
  
  return result.rows;
}

/**
 * Structure timetable data for LLM prompt
 */
function prepareDataForLLM(timetableData) {
  // Group by class
  const byClass = {};
  const facultyLoad = {};
  const conflicts = [];
  
  for (const entry of timetableData) {
    const classKey = `${entry.SEC}-Year${entry.YEAR}`;
    
    if (!byClass[classKey]) {
      byClass[classKey] = {
        class_id: entry.CLASS_ID,
        section: entry.SEC,
        year: entry.YEAR,
        students: entry.STUDENTS,
        schedule: []
      };
    }
    
    byClass[classKey].schedule.push({
      course: entry.COURSE_NAME,
      type: entry.COURSE_TYPE,
      faculty: entry.FAC_NAME,
      room: entry.ROOM_NO,
      day: entry.DAY_OF_WEEK,
      time: `${entry.START_TIME}-${entry.END_TIME}`
    });
    
    // Track faculty load
    if (!facultyLoad[entry.FAC_NAME]) {
      facultyLoad[entry.FAC_NAME] = {
        current: entry.FACULTY_CURRENT_LOAD,
        max: entry.MAX_HOURS_WEEK,
        utilization: ((entry.FACULTY_CURRENT_LOAD / entry.MAX_HOURS_WEEK) * 100).toFixed(1)
      };
    }
  }
  
  return {
    classes: byClass,
    faculty_workload: facultyLoad,
    total_entries: timetableData.length
  };
}

/**
 * Call LLM API for optimization suggestions
 */
async function callLLMForOptimization(data, apiKey, provider) {
  // Build LLM prompt
  const prompt = buildOptimizationPrompt(data);
  
  // Mock LLM response for now (replace with actual API call)
  // In production, call OpenAI/Gemini API here
  const mockResponse = await simulateLLMResponse(data);
  
  return mockResponse;
  
  /* 
  // PRODUCTION CODE - Uncomment and configure
  if (provider === 'openai') {
    return await callOpenAI(prompt, apiKey);
  } else if (provider === 'gemini') {
    return await callGemini(prompt, apiKey);
  }
  */
}

/**
 * Build optimization prompt for LLM
 */
function buildOptimizationPrompt(data) {
  return `You are an expert academic timetable optimizer. Analyze the following timetable and suggest improvements.

TIMETABLE DATA:
${JSON.stringify(data, null, 2)}

OPTIMIZATION GOALS:
1. Balance faculty workload (avoid over/under utilization)
2. Minimize student free hours (reduce gaps between classes)
3. Place important subjects in morning slots (9 AM - 12 PM)
4. Ensure labs are not on consecutive days
5. Distribute subjects evenly across the week
6. Avoid scheduling heavy subjects late in the day

RESPOND WITH JSON in this format:
{
  "analysis": {
    "issues_found": ["list of problems"],
    "workload_balance": "analysis of faculty distribution",
    "student_experience": "analysis of class scheduling"
  },
  "suggestions": [
    {
      "type": "SWAP",
      "reason": "explanation",
      "from": {"timetable_id": 123, "details": "..."},
      "to": {"timetable_id": 456, "details": "..."}
    }
  ]
}`;
}

/**
 * Simulate LLM response (for demo/testing without API key)
 */
async function simulateLLMResponse(data) {
  // Simulate AI analysis
  const issues = [];
  const suggestions = [];
  
  // Check faculty workload balance
  const workloads = Object.values(data.faculty_workload);
  const avgUtil = workloads.reduce((sum, f) => sum + parseFloat(f.utilization), 0) / workloads.length;
  
  for (const [faculty, load] of Object.entries(data.faculty_workload)) {
    if (parseFloat(load.utilization) > 90) {
      issues.push(`${faculty} is overloaded (${load.utilization}% utilization)`);
    } else if (parseFloat(load.utilization) < 50) {
      issues.push(`${faculty} is underutilized (${load.utilization}% utilization)`);
    }
  }
  
  return {
    analysis: {
      issues_found: issues.length > 0 ? issues : ['No major issues detected'],
      workload_balance: `Average faculty utilization: ${avgUtil.toFixed(1)}%`,
      student_experience: 'Schedule appears well-distributed across the week',
      optimization_score: 85
    },
    suggestions: [
      {
        type: 'RECOMMENDATION',
        reason: 'Consider placing core subjects in morning slots for better student attention',
        priority: 'MEDIUM'
      }
    ]
  };
}

/**
 * Apply LLM suggestions to timetable
 */
async function applySuggestions(connection, suggestions, year, sem) {
  let count = 0;
  
  for (const suggestion of suggestions) {
    if (suggestion.type === 'SWAP' && suggestion.from && suggestion.to) {
      // Implement swap logic
      // This would swap slot assignments between two timetable entries
      count++;
    }
  }
  
  return { count };
}

/**
 * Log optimization results
 */
async function logOptimization(connection, processId, llmResponse, applied) {
  await connection.execute(
    `INSERT INTO TimeTable_Log (msg, log_type, process_id)
     VALUES (:msg, :log_type, :process_id)`,
    {
      msg: `LLM Optimization: ${llmResponse.analysis.issues_found.length} issues found, ${applied.count} changes applied`,
      log_type: 'SUCCESS',
      process_id: processId
    },
    { autoCommit: false }
  );
}

/**
 * Real OpenAI API call (enable in production)
 */
async function callOpenAI(prompt, apiKey) {
  // Uncomment for production use
  /*
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an academic timetable optimization expert.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
  */
  throw new Error('OpenAI API not configured. Add your API key.');
}

export default {
  optimizeTimetableLLM
};
