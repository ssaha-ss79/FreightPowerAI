import express from 'express';
import * as emergencyController from '../controllers/emergencyController';

const emergencyRouter = express.Router();

emergencyRouter.post('/trigger', emergencyController.triggerEmergency);
emergencyRouter.get('/:emergency_id/status', emergencyController.getEmergencyStatus);

export default emergencyRouter;
