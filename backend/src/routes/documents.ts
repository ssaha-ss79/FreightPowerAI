import express from 'express';
import * as documentsController from '../controllers/documentsController';

const documentsRouter = express.Router();

documentsRouter.post('/upload', documentsController.uploadDocument);
documentsRouter.get('/driver/:driver_id', documentsController.listDocuments);

export default documentsRouter;
