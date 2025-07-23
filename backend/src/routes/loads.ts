import express from 'express';
import * as loadsController from '../controllers/loadsController';

const loadsRouter = express.Router();

loadsRouter.get('/available', loadsController.getAvailableLoads);
loadsRouter.post('/:load_id/book', loadsController.bookLoad);
loadsRouter.post('/:load_id/cancel', loadsController.cancelLoad);
loadsRouter.post('/', loadsController.addLoad); // Add new load endpoint

export default loadsRouter;
