import express from 'express';
import * as dispatchController from '../controllers/dispatchController';

const dispatchRouter = express.Router();

dispatchRouter.post('/send-voice-message', dispatchController.sendVoiceMessage);
dispatchRouter.get('/messages', dispatchController.getMessages);
dispatchRouter.get('/messages/driver/:driver_id', dispatchController.getDriverMessages);

export default dispatchRouter;
