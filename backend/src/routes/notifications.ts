import express from 'express';
import * as notificationsController from '../controllers/notificationsController';

const notificationsRouter = express.Router();

notificationsRouter.get('/driver/:driver_id', notificationsController.getDriverNotifications);
notificationsRouter.post('/:notification_id/read', notificationsController.markAsRead);
notificationsRouter.post('/ingest', notificationsController.ingestNotification);

export default notificationsRouter;
