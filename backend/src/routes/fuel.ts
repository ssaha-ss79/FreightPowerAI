import express from 'express';
import * as fuelController from '../controllers/fuelController';

const fuelRouter = express.Router();

fuelRouter.get('/:vehicle_id/status', fuelController.getFuelStatus);
fuelRouter.get('/stations/nearby', fuelController.findNearestFuelStation);

export default fuelRouter;
