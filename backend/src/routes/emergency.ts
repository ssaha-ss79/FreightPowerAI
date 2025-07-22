import express from 'express';
import * as emergencyController from '../controllers/emergencyController';

const emergencyRouter = express.Router();

emergencyRouter.post('/trigger', emergencyController.triggerEmergency);

export default emergencyRouter;
