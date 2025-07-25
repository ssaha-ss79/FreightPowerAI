import express from 'express';
import * as tripsController from '../controllers/tripsController';

const tripsRouter = express.Router();

tripsRouter.post('/plan', tripsController.planRoute);
tripsRouter.post('/', tripsController.planRoute);
tripsRouter.get('/status/:trip_id', tripsController.getRouteStatus);
tripsRouter.post('/reroute/:trip_id', tripsController.rerouteTrip);

export default tripsRouter;
