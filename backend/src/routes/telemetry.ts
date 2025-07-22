import express from 'express';
import * as telemetryController from '../controllers/telemetryController';

const telemetryRouter = express.Router();

telemetryRouter.get('/status/:vehicle_id', telemetryController.getFuelStatus);
telemetryRouter.get('/nearest-station', telemetryController.getNearestStation);

export default telemetryRouter;
