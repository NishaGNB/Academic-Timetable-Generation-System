/**
 * Course Routes
 */

import express from 'express';
import * as courseController from '../controllers/courseController.js';

const router = express.Router();

router.get('/', courseController.getAllCourses);
router.get('/:code', courseController.getCourseById);
router.post('/', courseController.createCourse);
router.put('/:code', courseController.updateCourse);
router.delete('/:code', courseController.deleteCourse);

export default router;
