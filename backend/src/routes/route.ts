import express from 'express';
import * as routeController from '../controllers/routeController';

const routeRouter = express.Router();

routeRouter.post('/plan', routeController.planRoute);
routeRouter.get('/:trip_id/status', routeController.getRouteStatus);
routeRouter.post('/reroute', routeController.rerouteTrip);

export default routeRouter;
