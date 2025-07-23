import express from 'express';
import * as fuelController from '../controllers/fuelController';

const fuelRouter = express.Router();

fuelRouter.get('/status', fuelController.getFuelStatus);
fuelRouter.get('/nearest-station', fuelController.findNearestFuelStation);

export default fuelRouter;
