import express from 'express';
import * as checkinController from '../controllers/checkinController';

const checkinRouter = express.Router();

checkinRouter.post('/checkin', checkinController.checkin);
checkinRouter.post('/checkout', checkinController.checkout);
checkinRouter.post('/dropoff', checkinController.dropoff);

export default checkinRouter;
