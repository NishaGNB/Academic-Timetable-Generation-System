import express from 'express';
import * as timeslotController from '../controllers/timeslotController.js';

const router = express.Router();

router.get('/', timeslotController.getAllTimeslots);
router.get('/:id', timeslotController.getTimeslotById);
router.post('/', timeslotController.createTimeslot);
router.put('/:id', timeslotController.updateTimeslot);
router.delete('/:id', timeslotController.deleteTimeslot);

export default router;
