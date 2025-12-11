import express from 'express';
import * as classroomController from '../controllers/classroomController.js';

const router = express.Router();

router.get('/', classroomController.getAllClassrooms);
router.get('/:roomNo', classroomController.getClassroomById);
router.post('/', classroomController.createClassroom);
router.put('/:roomNo', classroomController.updateClassroom);
router.delete('/:roomNo', classroomController.deleteClassroom);

export default router;
